# Product Requirement Document (PRD)
## Aplikasi LMS Lembaga Kursus Pijar Aksara

**Status:** Disetujui  
**Target Pengguna:** Pengunjung Umum, Peserta Kursus, Instruktur, Admin Lembaga  
**Lokasi Proyek:** `lms-pijar-aksara/`

---

## 1. Latar Belakang & Masalah
Lembaga Kursus Pijar Aksara di Depok menyelenggarakan kursus singkat untuk pekerja kantor dan pelaku UMKM (misal: Excel, desain konten, bahasa Inggris kerja, dan pembukuan). Sebelumnya operasional berjalan lewat grup WhatsApp dan Google Drive, yang menyebabkan:
1. Calon peserta sulit menemukan info kursus, harga, dan sisa kursi.
2. Jumlah peserta melebihi kuota kelas karena pendaftaran manual.
3. Berkas materi tercecer dan dapat dibagikan kepada yang tidak membayar.
4. Kuis dikerjakan lewat Google Form, kunci jawaban mudah bocor, dan nilai direkap manual.
5. Sertifikat dibuat manual satu per satu sehingga nomor sering ganda.

LMS ini menggantikan sistem manual tersebut dengan katalog kursus publik, pendaftaran online dengan kuota atomik, materi per modul, kuis pilihan ganda yang dinilai otomatis di server, progres belajar bertingkat, dan sertifikat digital bernomor unik.

---

## 2. Pengguna dan Peran

| Peran | Deskripsi | Hak Akses |
| :--- | :--- | :--- |
| **Pengunjung (Tamu)** | Publik yang belum login | Melihat Katalog Kursus terbit, filter/pencarian, dan halaman Detail Kursus. |
| **Peserta** | Akun pendaftar baru | Mendaftar kursus, membayar, membaca materi berurutan, mengerjakan kuis, melihat progres belajar, dan mengunduh sertifikat digital miliknya sendiri. |
| **Instruktur** | Pengajar yang ditunjuk Admin | Mengelola kursus miliknya (modul, materi, soal kuis), mengajukan kursus untuk ditinjau, dan melihat daftar peserta serta nilai kuis di kursus miliknya saja. |
| **Admin** | Staf pengelola lembaga | Meninjau, menerbitkan, mengembalikan ke draf, menutup, dan membuka kembali kursus; mengubah kuota dan harga; mengonfirmasi pembayaran; membatalkan pendaftaran; mengelola peran pengguna; melihat dasbor analitik dan riwayat audit log. |

---

## 3. Aturan Bisnis (Business Rules)

* **BR-01 (Katalog Publik):** Hanya kursus berstatus `terbit` yang tampil di katalog publik dan dapat diakses langsung via URL slug. Kursus `draf`, `ditinjau`, dan `ditutup` tidak tampil dan mengembalikan HTTP 404 jika diakses tamu.
* **BR-02 (Siklus Status Kursus):** Perpindahan status kursus:
  - `(baru)` $\rightarrow$ `draf` (Instruktur)
  - `draf` $\rightarrow$ `ditinjau` (Instruktur pemilik, wajib memenuhi BR-03)
  - `ditinjau` $\rightarrow$ `terbit` (Admin)
  - `ditinjau` $\rightarrow$ `draf` (Admin, wajib menyertakan catatan penolakan $\ge 10$ karakter)
  - `terbit` $\rightarrow$ `ditutup` (Admin)
  - `ditutup` $\rightarrow$ `terbit` (Admin)
  - Perpindahan lain ditolak sistem.
* **BR-03 (Syarat Pengajuan Kursus):** Kursus hanya dapat diajukan jika memiliki 2 sampai 10 modul berurutan tanpa lompatan (`1, 2, 3, ...`), setiap modul memiliki 3 sampai 20 butir soal kuis, harga Rp0 (gratis) atau Rp50.000 s/d Rp5.000.000, kuota 1 sampai 100 peserta, nilai lulus 50 sampai 100 (bawaan: 70).
* **BR-04 (Penguncian Konten):** Modul, materi bacaan, tautan video, lampiran PDF, dan butir soal kuis hanya dapat ditambah, diubah, atau dihapus saat kursus berstatus `draf`. Setelah diajukan, kurikulum terkunci mutlak (*read-only*), termasuk bagi admin.
* **BR-05 (Aturan Pendaftaran Peserta):** Hanya akun berperan `peserta` yang dapat mendaftar kursus terbit. Satu peserta hanya boleh memiliki 1 pendaftaran yang sedang berlaku (`menunggu_bayar`, `aktif`, atau `selesai`) per kursus. Peserta boleh mendaftar kembali jika pendaftaran sebelumnya berstatus `kedaluwarsa` atau `dibatalkan`.
* **BR-06 (Kalkulasi Kuota Kursi Anti-Bentrok):** Kursi terpakai dihitung dari pendaftaran `aktif`, `selesai`, dan `menunggu_bayar` dengan batas bayar belum lewat (`batas_bayar > NOW()`). Pendaftaran ditolak seketika jika kursi terpakai sudah sama dengan kuota. Dua orang yang mendaftar bersamaan pada kursi terakhir tidak boleh sama-sama berhasil (wajib penguncian `FOR UPDATE`). Admin boleh mengubah kuota kursus terbit, tetapi tidak boleh lebih kecil dari kursi terpakai.
* **BR-07 (Alur Pembayaran):** Kursus gratis langsung berstatus `aktif`. Kursus berbayar berstatus `menunggu_bayar` dengan batas bayar 24 jam. Pendaftaran menjadi aktif setelah admin mengonfirmasi pembayaran atau sistem pembayaran (Mayar) mengonfirmasi via webhook terverifikasi. Lewat 24 jam, pendaftaran kedaluwarsa dan kursi kembali. Peserta hanya boleh membatalkan pendaftaran yang belum dibayar. Admin boleh membatalkan pendaftaran aktif dengan alasan minimal 10 karakter.
* **BR-08 (Membuka Modul Bertingkat):** Materi hanya bisa dibuka peserta berstatus `aktif` atau `selesai`. Modul 1 langsung terbuka. Modul berikutnya terbuka hanya setelah kuis modul sebelumnya lulus. Kuis suatu modul baru bisa dibuka setelah peserta menekan tombol "Tandai materi sudah dibaca" pada modul tersebut.
* **BR-09 (Penilaian Kuis Server-Side):** Kuis berupa pilihan ganda A sampai D dan semua soal wajib dijawab. Nilai dihitung di server: $\lfloor(\text{jumlah benar} / \text{jumlah soal}) \times 100\rfloor$. Lulus jika nilai $\ge$ nilai lulus kursus. Kunci jawaban tidak pernah dikirim ke browser peserta (baik sebelum maupun sesudah submit). Peserta hanya melihat nilai, jumlah benar, dan status kelulusan.
* **BR-10 (Batas Percobaan Kuis):** Setiap modul maksimal 3 kali percobaan kuis per pendaftaran. Modul yang sudah lulus tidak bisa dikerjakan lagi. Dua kiriman kuis bersamaan tidak boleh menghasilkan percobaan ke-4.
* **BR-11 (Penerbitan Sertifikat Otomatis):** Progres = $(\text{modul lulus} / \text{jumlah modul}) \times 100\%$. Saat seluruh modul lulus, status pendaftaran otomatis menjadi `selesai` dan sertifikat terbit otomatis. Nomor sertifikat berformat `PA-TAHUN-NOMOR` (contoh: `PA-2026-0001`), terurut per tahun tanpa lompatan atau nomor ganda.
* **BR-12 (Isolasi Data & Audit Log):** Nilai kuis dan data sensitif peserta (nama, email, no HP, progres) hanya boleh dilihat oleh peserta bersangkutan, instruktur pemilik kursus terkait, dan admin. Setiap perubahan status kursus, kuota/harga, konfirmasi bayar, pembatalan pendaftaran, dan perubahan peran wajib tercatat di `audit_log`. Admin dilarang menurunkan peran atau menonaktifkan akunnya sendiri.

---

## 4. Kebutuhan Non-Fungsional & SEO
* **Kecepatan & LCP:** Halaman publik (Katalog dan Detail) dioptimasi dengan target LCP $\le 2.5$ detik di ponsel.
* **SEO & Metadata:** Judul, ringkasan meta deskripsi per kursus, slug ramah URL, dan sitemap dinamis (`/sitemap.xml`) yang hanya memuat kursus terbit.
* **Privasi Rute:** Seluruh halaman internal berstatus `<meta name="robots" content="noindex, nofollow" />`.
* **Keamanan Berkas:** Lampiran PDF disimpan di Supabase Storage privat dan diunduh peserta berhak lewat *Signed URL* sementara (berlaku maksimal 60 menit). Maksimal berkas 10 MB.
