# Panduan Arsitektur Teknis dan Skema Database
## LMS Lembaga Kursus Pijar Aksara

**Tujuan:** Panduan teknis arsitektur sistem, aturan keamanan RLS, kebijakan storage privat, dan spesifikasi 5 database functions atomik.

---

## 1. Arsitektur Sistem dan Tumpukan Teknologi

* **Frontend & Server Engine:** Next.js (App Router, Node.js v18+, TypeScript).
* **Styling & UI Components:** Tailwind CSS, Lucide React, Shadcn UI, Recharts untuk dasbor.
* **Database & BaaS:** Supabase PostgreSQL, Supabase Auth (`@supabase/ssr`), Row Level Security, Supabase Storage (Private Bucket).
* **Hosting & CDN:** Netlify dengan integrasi Git Deployment & Environment Variables.
* **Integrasi Pihak Ketiga (Fitur Nilai Tambah C5):** Mayar API V2 Sandbox (`https://api.mayar.io/hl/v2`) untuk pembayaran online.

---

## 2. Invariant Sistem (Integritas Data Mutlak)

* **INV-01 (Integritas Kuota Kursi):** Jumlah pendaftaran yang sah (berstatus `aktif`, `selesai`, dan `menunggu_bayar` dengan `batas_bayar > NOW()`) tidak boleh melampaui `kursus.kuota`.
* **INV-02 (Keunikan Pendaftaran Tunggal):** Satu akun peserta hanya dapat memiliki tepat 1 pendaftaran yang sedang berlaku (`menunggu_bayar`, `aktif`, `selesai`) pada satu kursus yang sama.
* **INV-03 (Imutabilitas Materi Terbit):** Tabel `modul` dan `soal` hanya dapat ditambah, diubah, atau dihapus saat `kursus.status = 'draf'`. Ketika kursus berstatus `ditinjau`, `terbit`, atau `ditutup`, kurikulum terkunci mutlak.
* **INV-04 (Batas Evaluasi Kuis):** Maksimal 3 kali percobaan kuis per pendaftaran per modul. Modul yang sudah berstatus lulus (`lulus = true`) dilarang keras diuji ulang.
* **INV-05 (Isolasi Kunci Jawaban):** Kolom `soal.kunci_jawaban` tidak boleh pernah terbaca oleh peran peserta (`authenticated`) melalui kueri klien langsung. Penilaian kuis murni dieksekusi di database server via RPC.
* **INV-06 (Urutan Sertifikat):** Kolom `sertifikat.nomor_sertifikat` berformat `PA-TAHUN-NOMOR` (contoh: `PA-2026-0001`) dan wajib memiliki nomor urut yang berurutan tanpa lompatan per tahun terbit.
* **INV-07 (Append-Only Audit Log):** Tabel `audit_log` tidak memiliki kebijakan modifikasi (`UPDATE`) maupun penghapusan (`DELETE`) untuk peran apa pun.

---

## 3. Spesifikasi Database Functions Atomik (SECURITY DEFINER)

Seluruh fungsi atomik wajib menyertakan klausa `SECURITY DEFINER` dan `SET search_path = ''`.

### 3.1. `daftar_kursus(p_kursus_id uuid, p_metode_bayar text)`
* Mengunci baris `kursus` dengan klausa `FOR UPDATE`.
* Memeriksa peran pemanggil (`auth.uid()`) pada tabel `profiles`. Wajib berstatus `peserta` dan akun aktif.
* Menghitung kursi terpakai:
  $$\text{kursi\_terpakai} = \text{COUNT}(\text{status} \in \{\text{'aktif'}, \text{'selesai'}\} \lor (\text{status} = \text{'menunggu\_bayar'} \land \text{batas\_bayar} > \text{NOW}()))$$
* Jika $\text{kursi\_terpakai} \ge \text{kuota}$, transaksi dibatalkan dengan galat: `"Pendaftaran gagal: kuota kursus sudah penuh."`.
* Memeriksa INV-02: peserta belum memiliki pendaftaran aktif/menunggu/selesai pada kursus tersebut.
* Jika `harga = 0`: masukkan ke `pendaftaran` dengan `status = 'aktif'`, `nominal = 0`, `metode_bayar = 'gratis'`, `dibayar_pada = NOW()`.
* Jika `harga > 0`: masukkan dengan `status = 'menunggu_bayar'`, `nominal = harga`, `batas_bayar = NOW() + INTERVAL '24 hours'`.

### 3.2. `kirim_jawaban_kuis(p_pendaftaran_id uuid, p_modul_id uuid, p_jawaban jsonb)`
* Mengunci baris `pendaftaran` dan memeriksa pemilik adalah `auth.uid()`.
* Memeriksa apakah `progres_modul.materi_dibaca_pada` tidak kosong.
* Memeriksa jumlah percobaan kuis yang sudah tercatat pada tabel `percobaan_kuis` dengan `FOR UPDATE`.
* Jika jumlah percobaan $\ge 3$ atau modul sudah berstatus lulus, transaksi dibatalkan dengan galat: `"Batas percobaan kuis modul ini telah habis atau modul sudah lulus."`.
* Mengambil kunci jawaban asli dari tabel `soal` di internal database, mencocokkan tiap jawaban peserta, dan menghitung `jumlah_benar`.
* Menghitung nilai:
  $$\text{nilai} = \left\lfloor \frac{\text{jumlah\_benar}}{\text{jumlah\_soal}} \times 100 \right\rfloor$$
* Menentukan kelulusan: $\text{lulus} = (\text{nilai} \ge \text{kursus.nilai\_lulus})$.
* Memasukkan data ke `percobaan_kuis`.
* Jika lulus: perbarui `progres_modul.lulus_pada = NOW()`.
* Memeriksa apakah seluruh modul pada kursus telah lulus. Jika seluruh modul lulus:
  - Perbarui `pendaftaran.status = 'selesai'`, `selesai_pada = NOW()`.
  - Hitung nomor urut sertifikat tahun berjalan secara terurut atomik (`MAX(nomor_urut) + 1`).
  - Terbitkan baris pada tabel `sertifikat` dengan nomor format `PA-YYYY-XXXX`.

### 3.3. `ajukan_kursus(p_kursus_id uuid)`
* Khusus peran `instruktur` pemilik kursus.
* Validasi syarat kurikulum (BR-03):
  - Jumlah modul antara 2 sampai 10, nomor urut tanpa lompatan.
  - Setiap modul memiliki minimal 3 dan maksimal 20 soal pilihan ganda.
* Perbarui `kursus.status = 'ditinjau'`, `diajukan_pada = NOW()`.
* Catat aktivitas ke tabel `audit_log`.

### 3.4. `putuskan_tinjauan_kursus(p_kursus_id uuid, p_keputusan text, p_catatan text)`
* Khusus peran `admin`.
* Keputusan `terbit`: ubah status menjadi `terbit`, isi `diterbitkan_pada = NOW()`.
* Keputusan `draf`: wajib menyertakan `p_catatan` minimal 10 karakter. Ubah status menjadi `draf`, isi `catatan_tinjauan = p_catatan`.
* Catat aktivitas ke tabel `audit_log`.

### 3.5. `konfirmasi_pembayaran_manual(p_pendaftaran_id uuid)`
* Khusus peran `admin`.
* Mengubah status pendaftaran `menunggu_bayar` menjadi `aktif`, mengisi `dibayar_pada = NOW()`, `dikonfirmasi_oleh = auth.uid()`.
* Catat aktivitas ke tabel `audit_log`.

---

## 4. Kebijakan Keamanan Berkas (Supabase Storage)

* Nama Bucket: `modul-lampiran`
* Visibilitas: **Private** (Akses publik dinonaktifkan).
* Aturan RLS Storage:
  - **SELECT / Download:** Hanya diizinkan bagi pengguna dengan peran `admin`, instruktur pemilik kursus, atau peserta yang memiliki pendaftaran berstatus `aktif` atau `selesai` pada kursus terkait.
  - **INSERT / Upload:** Hanya diizinkan bagi instruktur pemilik kursus (hanya saat status kursus `draf`) atau peran `admin`.
* Seluruh berkas PDF materi diunduh melalui *Signed URL* sementara dengan batas kedaluwarsa maksimal 60 menit.
