# Desain Arsitektur Teknis dan Spesifikasi Sistem
# LMS Lembaga Kursus Pijar Aksara

**Tanggal:** 2026-10-22  
**Status:** Disetujui (Approved)  
**Tujuan Proyek:** Mengembangkan aplikasi LMS Lembaga Kursus Pijar Aksara secara menyeluruh dari basis data hingga tayang di Netlify dengan arsitektur modern, performa tinggi, keamanan berbasis RLS, dan evaluasi kuis server-side anti-bocor.

---

## 1. Ringkasan Eksekutif & Latar Belakang

Lembaga Kursus Pijar Aksara di Depok menyelenggarakan kursus singkat bagi staf kantor dan pelaku UMKM (misal: Excel, Canva, Bahasa Inggris Kerja, dan Pembukuan). Aplikasi web LMS ini menggantikan sistem operasional manual via WhatsApp dan Google Drive menjadi sistem terpusat yang mencakup:
1. Katalog kursus publik yang terindeks Google (SEO-friendly) dengan kalkulasi sisa kursi real-time.
2. Pendaftaran kelas dengan proteksi kuota atomik anti-bentrok (*race-condition proof*).
3. Ruang belajar bertingkat dengan materi bacaan, video YouTube, dan berkas lampiran PDF privat via signed URL.
4. Evaluasi kuis pilihan ganda yang dinilai langsung di database server tanpa mengekspos kunci jawaban ke browser.
5. Penerbitan sertifikat digital otomatis dengan nomor urut unik tahunan (`PA-TAHUN-NOMOR`).
6. Dasbor analitik pendaftaran & pendapatan, moderasi kursus instruktur, panel admin, serta pencatatan audit log append-only.
7. Integrasi pembayaran online via Mayar Sandbox API V2 dan Transfer Manual.

---

## 2. Tumpukan Teknologi (Tech Stack)

* **Framework Web:** Next.js (App Router, Node.js v18+, TypeScript)
* **Styling & Komponen UI:** Tailwind CSS, Lucide React, Shadcn UI / Radix primitives, Recharts
* **Backend, BaaS, & Database:** Supabase PostgreSQL, Supabase Auth (`@supabase/ssr`), Supabase Storage (Private Bucket)
* **Deployment & Hosting:** Netlify (Git-based automated deployment & serverless runtime)
* **Payment Gateway (Nilai Tambah):** Mayar API V2 Sandbox (`https://api.mayar.io/hl/v2`)

---

## 3. Invariant Sistem & Aturan Integritas Data

* **INV-01 (Integritas Kuota Kursi):** Jumlah pendaftaran yang sah (berstatus `aktif`, `selesai`, dan `menunggu_bayar` dengan `batas_bayar > NOW()`) tidak boleh melampaui `kursus.kuota`.
* **INV-02 (Keunikan Pendaftaran Tunggal):** Satu akun peserta hanya dapat memiliki tepat 1 pendaftaran yang sedang berlaku (`menunggu_bayar`, `aktif`, `selesai`) pada satu kursus yang sama.
* **INV-03 (Imutabilitas Materi Terbit):** Tabel `modul` dan `soal` hanya dapat ditambah, diubah, atau dihapus saat `kursus.status = 'draf'`. Ketika kursus berstatus `ditinjau`, `terbit`, atau `ditutup`, kurikulum terkunci mutlak.
* **INV-04 (Batas Evaluasi Kuis):** Maksimal 3 kali percobaan kuis per pendaftaran per modul. Modul yang sudah berstatus lulus (`lulus = true`) dilarang diuji ulang.
* **INV-05 (Isolasi Kunci Jawaban):** Kolom `soal.kunci_jawaban` tidak pernah terbaca oleh peran peserta melalui kueri klien langsung. Penilaian kuis murni dieksekusi di database server via RPC.
* **INV-06 (Urutan Sertifikat):** Kolom `sertifikat.nomor_sertifikat` berformat `PA-TAHUN-NOMOR` dan memiliki nomor urut berurutan tanpa lompatan per tahun terbit.
* **INV-07 (Append-Only Audit Log):** Tabel `audit_log` tidak memiliki kebijakan modifikasi (`UPDATE`) maupun penghapusan (`DELETE`) untuk peran apa pun.

---

## 4. Skema Basis Data Relasional (Supabase PostgreSQL)

### 4.1. Tabel `profiles`
Menyimpan profil pengguna yang terhubung 1-ke-1 dengan `auth.users`.
* `id` (uuid, PK, FK ke `auth.users.id` ON DELETE CASCADE)
* `nama_lengkap` (text, wajib, 3–100 karakter)
* `email` (text, wajib, unik)
* `no_hp` (text, boleh kosong, format `08XXXXXXXXXX`)
* `peran` (enum: `peserta`, `instruktur`, `admin`; bawaan: `peserta`)
* `aktif` (boolean, bawaan: `true`)
* `dibuat_pada` (timestamptz, bawaan: `NOW()`)

### 4.2. Tabel `kursus`
Menyimpan katalog kursus lembaga.
* `id` (uuid, PK, bawaan: `gen_random_uuid()`)
* `instruktur_id` (uuid, FK ke `profiles.id`, wajib)
* `judul` (text, wajib, 5–120 karakter)
* `slug` (text, wajib, unik, format slug URL)
* `kategori` (text, wajib)
* `ringkasan` (text, wajib, maksimal 200 karakter)
* `deskripsi` (text, wajib)
* `harga` (integer, wajib; `0` atau `50000` s/d `5000000`)
* `kuota` (integer, wajib, `1` s/d `100`)
* `nilai_lulus` (smallint, wajib, `50` s/d `100`, bawaan: `70`)
* `status` (enum: `draf`, `ditinjau`, `terbit`, `ditutup`; bawaan: `draf`)
* `catatan_tinjauan` (text, boleh kosong)
* `diajukan_pada` (timestamptz, boleh kosong)
* `diterbitkan_pada` (timestamptz, boleh kosong)
* `dibuat_pada` (timestamptz, bawaan: `NOW()`)
* `diubah_pada` (timestamptz, bawaan: `NOW()`)

### 4.3. Tabel `modul`
Bagian kurikulum kursus yang dipelajari bertahap.
* `id` (uuid, PK, bawaan: `gen_random_uuid()`)
* `kursus_id` (uuid, FK ke `kursus.id` ON DELETE CASCADE, wajib)
* `urutan` (smallint, wajib, `1` s/d `10`, unik per kursus)
* `judul` (text, wajib)
* `isi_materi` (text, wajib)
* `video_url` (text, boleh kosong, format URL https)
* `lampiran_path` (text, boleh kosong, path berkas di Storage privat)
* `durasi_menit` (smallint, wajib, `5` s/d `240`)
* `dibuat_pada` (timestamptz, bawaan: `NOW()`)

### 4.4. Tabel `soal`
Soal kuis pilihan ganda per modul.
* `id` (uuid, PK, bawaan: `gen_random_uuid()`)
* `modul_id` (uuid, FK ke `modul.id` ON DELETE CASCADE, wajib)
* `urutan` (smallint, wajib, `1` s/d `20`, unik per modul)
* `pertanyaan` (text, wajib)
* `pilihan_a` (text, wajib)
* `pilihan_b` (text, wajib)
* `pilihan_c` (text, wajib)
* `pilihan_d` (text, wajib)
* `kunci_jawaban` (char(1), wajib, nilai: `'A'`, `'B'`, `'C'`, atau `'D'`; RAHASIA)

### 4.5. Tabel `pendaftaran`
Pendaftaran peserta ke kursus.
* `id` (uuid, PK, bawaan: `gen_random_uuid()`)
* `kursus_id` (uuid, FK ke `kursus.id`, wajib)
* `peserta_id` (uuid, FK ke `profiles.id`, wajib)
* `status` (enum: `menunggu_bayar`, `aktif`, `selesai`, `kedaluwarsa`, `dibatalkan`; bawaan: `menunggu_bayar`)
* `nominal` (integer, wajib, tidak boleh negatif)
* `metode_bayar` (enum: `gratis`, `transfer_manual`, `mayar`, wajib)
* `batas_bayar` (timestamptz, wajib jika berbayar)
* `mayar_invoice_id` (text, unik, boleh kosong)
* `dibayar_pada` (timestamptz, boleh kosong)
* `dikonfirmasi_oleh` (uuid, FK ke `profiles.id`, boleh kosong)
* `alasan_batal` (text, boleh kosong)
* `didaftarkan_pada` (timestamptz, bawaan: `NOW()`)
* `selesai_pada` (timestamptz, boleh kosong)
* `dibatalkan_pada` (timestamptz, boleh kosong)

### 4.6. Tabel `progres_modul`
* `id` (uuid, PK, bawaan: `gen_random_uuid()`)
* `pendaftaran_id` (uuid, FK ke `pendaftaran.id` ON DELETE CASCADE, wajib)
* `modul_id` (uuid, FK ke `modul.id`, wajib)
* `materi_dibaca_pada` (timestamptz, wajib)
* `lulus_pada` (timestamptz, boleh kosong)
* *Constraint:* UNIQUE(`pendaftaran_id`, `modul_id`)

### 4.7. Tabel `percobaan_kuis`
* `id` (uuid, PK, bawaan: `gen_random_uuid()`)
* `pendaftaran_id` (uuid, FK ke `pendaftaran.id` ON DELETE CASCADE, wajib)
* `modul_id` (uuid, FK ke `modul.id`, wajib)
* `nomor_percobaan` (smallint, wajib, `1` s/d `3`)
* `jawaban` (jsonb, wajib, format `{"id_soal": "A"}`)
* `jumlah_soal` (smallint, wajib, > 0)
* `jumlah_benar` (smallint, wajib, `0` s/d `jumlah_soal`)
* `nilai` (smallint, wajib, `0` s/d `100`)
* `lulus` (boolean, wajib)
* `dikerjakan_pada` (timestamptz, bawaan: `NOW()`)
* *Constraint:* UNIQUE(`pendaftaran_id`, `modul_id`, `nomor_percobaan`)

### 4.8. Tabel `sertifikat`
* `id` (uuid, PK, bawaan: `gen_random_uuid()`)
* `pendaftaran_id` (uuid, FK ke `pendaftaran.id`, unik, wajib)
* `tahun` (smallint, wajib)
* `nomor_urut` (integer, wajib, unik per tahun)
* `nomor_sertifikat` (text, unik, format `PA-TAHUN-NOMOR`, wajib)
* `nama_peserta` (text, wajib)
* `judul_kursus` (text, wajib)
* `diterbitkan_pada` (timestamptz, bawaan: `NOW()`)

### 4.9. Tabel `audit_log`
* `id` (bigserial, PK)
* `pelaku_id` (uuid, FK ke `profiles.id`, boleh kosong untuk sistem)
* `aksi` (text, wajib)
* `nama_tabel` (text, wajib)
* `id_data` (uuid, boleh kosong)
* `data_sebelum` (jsonb, boleh kosong)
* `data_sesudah` (jsonb, boleh kosong)
* `dibuat_pada` (timestamptz, bawaan: `NOW()`)

---

## 5. Fungsi Basis Data Atomik (Stored Procedures)

Seluruh fungsi atomik menggunakan `SECURITY DEFINER` dan `SET search_path = ''`:

1. **`daftar_kursus(p_kursus_id uuid, p_metode_bayar text)`**
   - Mengunci baris kursus via `SELECT ... FOR UPDATE`.
   - Memeriksa peran pemanggil (`auth.uid()`) adalah `peserta` dan akun aktif.
   - Menghitung kursi terpakai: `COUNT(status IN ('aktif', 'selesai') OR (status = 'menunggu_bayar' AND batas_bayar > NOW()))`.
   - Jika `kursi_terpakai >= kuota`, membatalkan transaksi dengan pesan galat kuota penuh.
   - Memvalidasi INV-02: peserta belum terdaftar di kursus terkait.
   - Memasukkan ke `pendaftaran`: jika gratis nominal 0 dan status `aktif`, jika berbayar status `menunggu_bayar` dengan batas 24 jam.

2. **`kirim_jawaban_kuis(p_pendaftaran_id uuid, p_modul_id uuid, p_jawaban jsonb)`**
   - Mengunci baris `pendaftaran` dan memvalidasi `peserta_id = auth.uid()`.
   - Memastikan `progres_modul.materi_dibaca_pada` tidak null.
   - Mengunci riwayat `percobaan_kuis` dengan `FOR UPDATE`. Jika sudah 3 kali atau modul sudah lulus, transaksi dibatalkan.
   - Menghitung kecocokan jawaban terhadap `soal.kunci_jawaban` secara internal.
   - Nilai = `FLOOR((jumlah_benar / jumlah_soal) * 100)`. Kelulusan = `nilai >= kursus.nilai_lulus`.
   - Jika lulus: perbarui `progres_modul.lulus_pada = NOW()`.
   - Jika seluruh modul kursus telah lulus: ubah pendaftaran menjadi `selesai`, hitung nomor urut sertifikat `MAX(nomor_urut) + 1` tahun berjalan, dan terbitkan baris di `sertifikat`.

3. **`ajukan_kursus(p_kursus_id uuid)`**
   - Memeriksa peran `instruktur` pemilik kursus.
   - Memvalidasi syarat kelayakan (BR-03): 2–10 modul berurutan tanpa lompatan, 3–20 soal per modul.
   - Mengubah `kursus.status = 'ditinjau'` dan mencatat ke `audit_log`.

4. **`putuskan_tinjauan_kursus(p_kursus_id uuid, p_keputusan text, p_catatan text)`**
   - Khusus peran `admin`.
   - Jika disetujui: status menjadi `terbit`, `diterbitkan_pada = NOW()`.
   - Jika ditolak/kembali: status menjadi `draf`, wajib `p_catatan` minimal 10 karakter.
   - Mencatat perubahan ke `audit_log`.

5. **`konfirmasi_pembayaran_manual(p_pendaftaran_id uuid)`**
   - Khusus peran `admin`.
   - Mengubah status pendaftaran `menunggu_bayar` menjadi `aktif`, mengisi `dibayar_pada = NOW()`, dan mencatat ke `audit_log`.

---

## 6. Arsitektur Antarmuka & Peta Rute (Next.js App Router)

| Path Rute | Akses | Deskripsi & Fitur Utama |
| :--- | :--- | :--- |
| `/` & `/kursus` | Publik | Katalog kursus terbit, pencarian, filter kategori, sisa kursi dinamis, target LCP $\le$ 2.5s. |
| `/kursus/[slug]` | Publik | Detail kursus, silabus, instruktur, harga, tombol daftar. HTTP 404 jika bukan kursus terbit. |
| `/sitemap.xml` | Publik | Sitemap dinamis hanya memuat kursus terbit. |
| `/masuk` & `/daftar` | Publik (Tamu) | Autentikasi email & password via Supabase Auth (`noindex`). |
| `/kursus-saya` | Peserta | Riwayat pendaftaran kursus, status bayar, progres belajar, tombol lanjut belajar & cetak sertifikat. |
| `/kursus-saya/[id]/modul/[urutan]` | Peserta Terdaftar | Ruang belajar: video sematan, materi bacaan, tombol konfirmasi baca, signed URL PDF (60 menit), kuis pilihan ganda. |
| `/kursus-saya/[id]/sertifikat` | Peserta / Admin | Tampilan cetak sertifikat digital resmi (`PA-TAHUN-NOMOR`, `@media print`). |
| `/instruktur/kursus` | Instruktur | Daftar kursus milik sendiri, status moderasi, dan catatan penolakan admin. |
| `/instruktur/kursus/[id]` | Instruktur | Editor kurikulum kursus, modul, lampiran, dan soal kuis (hanya aktif saat status `draf`). |
| `/instruktur/kursus/[id]/peserta` | Instruktur / Admin | Rekap daftar peserta, progres modul, nilai kuis, dan jumlah percobaan. |
| `/admin` | Admin | Panel moderasi kursus, konfirmasi bayar manual, kelola peran pengguna, dan audit log. |
| `/admin/dashboard` | Admin | Dasbor metrik KPI, grafik Recharts pendaftaran & pendapatan mingguan, tabel tingkat kelulusan & kursi hampir penuh. |
| `/akses-ditolak` | Terautentikasi | Halaman HTTP 403 saat pengguna mengakses halaman di luar wewenang perannya. |

---

## 7. Rencana Pelaksanaan Bertahap (Phased Roadmap)

1. **Fase 1:** Inisialisasi proyek Next.js di folder `lms-pijar-aksara`, konfigurasi Tailwind CSS, dependensi Lucide & Shadcn, serta konfigurasi environment Supabase.
2. **Fase 2:** Eksekusi skrip migrasi SQL database (9 tabel relasional, RLS komprehensif, bucket Supabase Storage `modul-lampiran`, dan 5 RPC functions atomik).
3. **Fase 3:** Seeding 35 akun uji di Supabase Auth dan impor data lengkap dari file `Data_Contoh_LMS.xlsx` dengan mempertahankan kasus batas.
4. **Fase 4:** Pembangunan antarmuka otentikasi (`/masuk`, `/daftar`), navigasi dinamis per peran, dan Next.js Middleware route guard.
5. **Fase 5:** Implementasi halaman katalog publik, detail kursus, SEO dynamic metadata, sitemap dinamis, dan pendaftaran kursus anti-bentrok.
6. **Fase 6:** Pembangunan ruang belajar peserta, modul bertahap, sematan video & signed URL PDF, kuis server-side anti-bocor, serta cetak sertifikat.
7. **Fase 7:** Pembangunan panel instruktur (kelola & ajukan kursus), moderasi admin, panel pembayaran & pengguna, serta dasbor analitik Recharts.
8. **Fase 8:** Integrasi pembayaran Mayar Sandbox API V2 dan endpoint webhook verifikasi ganda.
9. **Fase 9:** Konfigurasi deploy Netlify (`netlify.toml`), eksekusi verifikasi 17 skenario test case (TC-01 s/d TC-17), dan pembuatan berkas `docs/test-plan.md`.

---

## 8. Verifikasi Kriteria Selesai (PRD Bagian 13)

- [x] Aplikasi tayang di Netlify dan responsif di peramban ponsel.
- [x] Tiga peran (`peserta`, `instruktur`, `admin`) dapat login dengan akun uji resmi.
- [x] Pengunjung dapat mengakses Katalog dan Detail Kursus publik tanpa login; kursus non-terbit tidak tampil (BR-01).
- [x] Perpindahan status kursus tunduk pada aturan BR-02 dan kurikulum terkunci saat bukan draf (BR-04).
- [x] Pendaftaran kursus anti-bentrok dengan kuota atomik `FOR UPDATE` (BR-05, BR-06).
- [x] Penilaian kuis murni server-side, kunci jawaban rahasia, dan maksimal 3 percobaan (BR-09, BR-10).
- [x] Penyelesaian semua modul otomatis menerbitkan sertifikat nomor unik `PA-TAHUN-NOMOR` (BR-11).
- [x] Isolasi data peserta dan pencatatan audit log append-only (BR-12).
- [x] Halaman internal berstatus `noindex` dan seluruh 17 skenario uji lulus diverifikasi.
