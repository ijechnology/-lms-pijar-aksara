# Test Plan dan Panduan Verifikasi Kesiapan Rilis
## LMS Lembaga Kursus Pijar Aksara

**Tujuan:** Matriks pengujian komprehensif 17 skenario aturan bisnis, kasus batas (*edge cases*), pengujian negatif hak akses, serta prosedur verifikasi sebelum pengumpulan capstone.

---

## 1. Ketentuan Pelaksanaan Uji

1. Pengujian wajib dijalankan langsung pada lingkungan target (termasuk verifikasi Netlify Produksi).
2. Menggunakan 3 peramban terpisah atau jendela penyamaran (*incognito*) untuk peran Peserta, Instruktur, dan Admin:
   - **Peserta Uji:** `galih@pijaraksara.id` / `citra@pijaraksara.id` (Password: `PijarAksara2026!`)
   - **Instruktur Uji:** `michael@pijaraksara.id` / `yudha@pijaraksara.id` (Password: `PijarAksara2026!`)
   - **Admin Uji:** `ratna@pijaraksara.id` (Password: `PijarAksara2026!`)
3. Seluruh hasil uji diverifikasi terhadap aturan bisnis (BR-01 s/d BR-06) dan invarian arsitektur (INV-01 s/d INV-07).

---

## 2. Matriks Pengujian Aturan Bisnis & Kasus Batas (17 Test Case)

| Kode TC | Rujukan Aturan / Invarian | Aktor Penguji | Skenario dan Langkah Pengujian | Hasil yang Diharapkan | Status Verifikasi |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | BR-01, INV-01 | Publik (Tamu) | Buka katalog utama dan coba akses langsung URL `/kursus/word-surat-dinas` (draf) atau `/kursus/public-speaking-presentasi-kantor` (ditinjau). | Kursus non-terbit tidak muncul di katalog; akses langsung URL menghasilkan HTTP 404 (Not Found). | **LULUS (PASS)** |
| **TC-02** | BR-03 | Instruktur (Yudha) | Ajukan kursus "Microsoft Word untuk Surat Dinas" ke tinjauan admin padahal salah satu modul baru memiliki 2 butir soal. | Pengajuan ditolak oleh database RPC `ajukan_kursus` dengan pesan: *"Setiap modul wajib memiliki minimal 3 butir soal"*. | **LULUS (PASS)** |
| **TC-03** | BR-04, INV-03 | Instruktur (Michael) | Coba menambah atau mengedit materi modul pada kursus "Bahasa Inggris untuk Percakapan Kerja" yang berstatus `terbit`. | Tombol edit dinonaktifkan di UI; mutasi database ditolak oleh RLS / trigger karena status bukan `draf`. | **LULUS (PASS)** |
| **TC-04** | BR-04 | Admin (Ratna) | Kembalikan kursus berstatus `ditinjau` ke `draf` dengan catatan alasan kurang dari 10 karakter. | Sistem menolak aksi dan memunculkan validasi: *"Alasan penolakan wajib minimal 10 karakter"*. | **LULUS (PASS)** |
| **TC-05** | BR-06, INV-02 | Peserta (Galih) | Melakukan pendaftaran pada kursus berbayar "Dasar Pembukuan UMKM" yang tersisa 1 kursi. | Pendaftaran berhasil, status pendaftaran menjadi `menunggu_bayar`, sisa kursi menjadi 0. | **LULUS (PASS)** |
| **TC-06** | BR-06, INV-02 | Peserta (Citra) | Melakukan pendaftaran pada kursus "Dasar Pembukuan UMKM" sesaat setelah kuota kursi habis di TC-05. | Pendaftaran ditolak secara atomik (`FOR UPDATE`) dengan galat: *"Kuota kursus sudah penuh"*. | **LULUS (PASS)** |
| **TC-07** | BR-05, INV-02 | Peserta (Putri) | Mencoba mendaftar kembali ke kursus yang sama padahal masih memiliki pendaftaran aktif/menunggu bayar. | Sistem menolak dengan pesan bahwa peserta telah terdaftar pada kursus ini (`INV-02`). | **LULUS (PASS)** |
| **TC-08** | BR-04, INV-07 | Admin (Ratna) | Membatalkan pendaftaran peserta berstatus `aktif` tanpa menyertakan alasan pembatalan minimal 10 karakter. | UI & RPC menolak aksi hingga alasan pembatalan $\ge 10$ karakter diisi, kemudian aksi dicatat ke `audit_log`. | **LULUS (PASS)** |
| **TC-09** | BR-03, US-03 | Peserta (Zaki) | Membuka tab kuis Modul 1 sebelum menekan tombol "Tandai materi sudah dibaca". | Komponen kuis terkunci dan menampilkan instruksi untuk menandai bacaan selesai terlebih dahulu. | **LULUS (PASS)** |
| **TC-10** | BR-03, US-03 | Peserta Baru | Mencoba membuka Modul 2 langsung melalui manipulasi URL `/kursus-saya/.../modul/2` padahal kuis Modul 1 belum lulus. | Sistem mencegat navigasi modul bertingkat dan mengarahkan kembali ke Modul 1 dengan pesan peringatan. | **LULUS (PASS)** |
| **TC-11** | INV-05 | Peserta Uji | Periksa Network Tab pada Developer Tools peramban saat kuis dimuat via RPC `get_soal_kuis`. | Respons JSON kuis hanya memuat pertanyaan dan opsi A–D; kolom `kunci_jawaban` terisolasi 100% di server. | **LULUS (PASS)** |
| **TC-12** | INV-04 | Peserta (Rizky) | Mengirimkan kuis pada modul yang catatan riwayat percobaannya sudah mencapai 3 kali gagal. | Tombol kirim nonaktif; jika ditembak lewat API/RPC, server menolak percobaan ke-4 secara mutlak. | **LULUS (PASS)** |
| **TC-13** | INV-04, US-04 | Peserta (Lina) | Mengerjakan kuis percobaan ke-3 (sisa 1x) dan memperoleh nilai $\ge 70$. | Modul dinyatakan lulus, modul berikutnya terbuka, dan formulir kuis modul tersebut terkunci. | **LULUS (PASS)** |
| **TC-14** | INV-06 | Peserta Uji | Menyelesaikan modul terakhir pada suatu kursus hingga seluruh modul berstatus lulus. | Status pendaftaran otomatis menjadi `selesai` dan sertifikat resmi format `PA-TAHUN-NOMOR` terbit seketika. | **LULUS (PASS)** |
| **TC-15** | BR-02, INV-01 | Peserta Uji | Mengetikkan langsung alamat URL `/admin` atau `/admin/dashboard` di kolom alamat browser. | Pengguna dicegat oleh middleware route guard dan diarahkan ke layar `/akses-ditolak` (HTTP 403). | **LULUS (PASS)** |
| **TC-16** | INV-07 | Peserta Uji | Mencoba membaca baris tabel `audit_log` melalui kueri klien Supabase. | Kueri mengembalikan 0 baris data karena terlindungi kebijakan RLS eksklusif peran `admin`. | **LULUS (PASS)** |
| **TC-17** | BR-02 | Admin (Ratna) | Admin mencoba menonaktifkan akunnya sendiri atau menurunkan perannya sendiri menjadi peserta. | Sistem menolak aksi tersebut: Admin dilarang menonaktifkan atau mendemosi akun sendiri demi keamanan sistem. | **LULUS (PASS)** |

---

## 3. Checklist Kesiapan Produksi (Production Readiness)

- [x] Seluruh 14 rute Next.js App Router terkompilasi hijau tanpa peringatan atau *type error* (`npm run build` exit code 0).
- [x] Inisialisasi `@supabase/ssr` memiliki nilai *fallback dummy* untuk fase *static page export*.
- [x] Database Functions atomik `SECURITY DEFINER` menangani *race condition* pendaftaran & evaluasi kuis.
- [x] File `netlify.toml` dikonfigurasi dengan plugin Next.js, environment Node.js 20, dan security headers (`X-Frame-Options`, `X-Robots-Tag: noindex` pada panel internal).
- [x] Webhook handler Mayar Sandbox mendukung verifikasi ulang *anti-spoofing* dan *idempotensi mutlak*.
