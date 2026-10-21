# Test Plan dan Panduan Verifikasi Kesiapan Rilis
## LMS Lembaga Kursus Pijar Aksara

**Tujuan:** Matriks pengujian 17 skenario aturan bisnis, kasus batas (edge cases), pengujian negatif hak akses, serta prosedur verifikasi sebelum pengumpulan capstone.

---

## 1. Ketentuan Pelaksanaan Uji

1. Pengujian wajib dijalankan langsung pada lingkungan target (termasuk verifikasi Netlify Produksi).
2. Menggunakan 3 peramban terpisah atau jendela penyamaran (*incognito*) untuk peran Peserta, Instruktur, dan Admin.
3. Seluruh hasil uji dicatat pada tabel di bawah ini.

---

## 2. Matriks Pengujian Aturan Bisnis & Kasus Batas (17 Test Case)

| Kode TC | Rujukan BR / US | Akun Penguji | Skenario dan Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | BR-01, US-01 | Publik (Tamu) | Buka katalog utama dan coba akses langsung URL `/kursus/word-surat-dinas` (draf) atau `/kursus/public-speaking-presentasi-kantor` (ditinjau). | Kursus draf/ditinjau tidak tampil di katalog; akses langsung URL menghasilkan halaman HTTP 404. | Lulus |
| **TC-02** | BR-03, US-06 | Yudha (Instruktur) | Ajukan kursus "Microsoft Word untuk Surat Dinas" ke tinjauan padahal Modul 2 baru memiliki 2 butir soal. | Pengajuan ditolak dengan pesan galat: "Setiap modul wajib memiliki minimal 3 butir soal". | Lulus |
| **TC-03** | BR-04, US-06 | Michael (Instruktur) | Coba menambah atau mengedit materi modul pada kursus "Bahasa Inggris untuk Percakapan Kerja" yang berstatus `terbit`. | Tombol edit dinonaktifkan; pemanggilan mutasi database ditolak karena status terkunci. | Lulus |
| **TC-04** | BR-02, US-08 | Ratna (Admin) | Kembalikan kursus berstatus `ditinjau` ke `draf` dengan catatan alasan kurang dari 10 karakter. | Sistem menolak aksi dan memunculkan validasi: "Catatan penolakan minimal 10 karakter". | Lulus |
| **TC-05** | BR-06, US-02 | Galih (Peserta) | Melakukan pendaftaran pada kursus berbayar "Dasar Pembukuan UMKM" yang tersisa 1 kursi. | Pendaftaran berhasil, status pendaftaran menjadi `menunggu_bayar`, sisa kursi menjadi 0. | Lulus |
| **TC-06** | BR-06, US-02 | Citra (Peserta) | Melakukan pendaftaran pada kursus "Dasar Pembukuan UMKM" sesaat setelah kuota kursi habis di TC-05. | Pendaftaran ditolak oleh fungsi database atomik dengan pesan: "Kuota kursus sudah penuh". | Lulus |
| **TC-07** | BR-05, US-02 | Putri (Peserta) | Mencoba mendaftar kembali ke kursus yang sama padahal masih memiliki pendaftaran aktif/menunggu bayar. | Sistem menolak dengan pesan bahwa peserta telah terdaftar pada kursus ini. | Lulus |
| **TC-08** | BR-07, US-09 | Ratna (Admin) | Membatalkan pendaftaran peserta berstatus `aktif` tanpa menyertakan alasan pembatalan. | Tombol/RPC menolak aksi hingga alasan pembatalan minimal 10 karakter diisi. | Lulus |
| **TC-09** | BR-08, US-03 | Zaki (Peserta) | Membuka tab kuis modul 1 sebelum menekan tombol "Tandai materi sudah dibaca". | Komponen kuis terkunci dan menampilkan petunjuk untuk menyelesaikan materi bacaan terlebih dahulu. | Lulus |
| **TC-10** | BR-08, US-03 | Peserta Baru | Mencoba membuka Modul 2 langsung melalui manipulasi URL `/modul/2` padahal kuis Modul 1 belum lulus. | Route guard mencegat akses dan mengarahkan kembali ke Modul 1 dengan pesan peringatan. | Lulus |
| **TC-11** | BR-09, US-04 | Peserta Uji | Periksa Network Tab pada Developer Tools peramban saat kuis dimuat. | Data respons kuis hanya memuat pertanyaan dan opsi A–D; kolom kunci jawaban tidak pernah terkirim ke klien. | Lulus |
| **TC-12** | BR-10, US-04 | Rizky (Peserta) | Mengirimkan kuis pada modul yang catatan riwayat percobaannya sudah mencapai 3 kali gagal. | Tombol kirim nonaktif; jika ditembak lewat RPC, server menolak percobaan ke-4 secara mutlak. | Lulus |
| **TC-13** | BR-10, US-04 | Lina (Peserta) | Mengerjakan kuis percobaan ke-3 (sisa 1x) dan memperoleh nilai $\ge 70$. | Modul dinyatakan lulus, modul berikutnya terbuka, dan formulir kuis modul tersebut terkunci. | Lulus |
| **TC-14** | BR-11, US-05 | Peserta Uji | Menyelesaikan modul terakhir pada suatu kursus hingga seluruh modul berstatus lulus. | Status pendaftaran otomatis berubah menjadi `selesai` dan baris sertifikat bernomor urut resmi terbit seketika. | Lulus |
| **TC-15** | BR-12, C3 | Peserta Uji | Mengetikkan langsung alamat URL `/admin` atau `/admin/dashboard` di kolom alamat browser. | Pengguna dicegat oleh route guard dan diarahkan ke layar `/akses-ditolak` (HTTP 403). | Lulus |
| **TC-16** | BR-12, C3 | Peserta Uji | Mencoba membaca baris tabel `audit_log` melalui kueri klien Supabase. | Kueri mengembalikan 0 baris data karena terlindungi kebijakan RLS khusus admin. | Lulus |
| **TC-17** | BR-12, US-09 | Ratna (Admin) | Admin mencoba menonaktifkan akunnya sendiri atau menurunkan perannya sendiri menjadi peserta. | Sistem menolak aksi tersebut: Admin dilarang menonaktifkan atau menurunkan perannya sendiri. | Lulus |

---

## 3. Checklist Verifikasi Demo
- [ ] Tiga akun uji login (`peserta`, `instruktur`, `admin`) dapat login tanpa galat.
- [ ] Penguncian kuota kursi dan kuis aman dari submit serentak (`FOR UPDATE`).
- [ ] Kunci jawaban kuis tidak pernah bocor di tab Network browser.
- [ ] Penanganan tiga state (loading, empty, error) terpasang di semua halaman data.
- [ ] Fitur nilai tambah (Mayar Sandbox / Ekspor Laporan) berjalan normal.
