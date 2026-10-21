# Petunjuk Lengkap Pengerjaan Capstone Project
## LMS Lembaga Kursus Pijar Aksara

**Tujuan:** Panduan pelaksanaan langkah demi langkah dan checklist pengumpulan capstone.

---

## 1. Berkas Pengumpulan Akhir Capstone

1. **URL Aplikasi Netlify:** Tautan aplikasi produksi yang dapat dibuka stabil dari peramban desktop maupun ponsel.
2. **URL Repositori GitHub Publik:** Repositori yang memuat riwayat commit bertahap, berkas `docs/test-plan.md`, dan panduan `README.md`.
3. **Daftar Akun Uji Login:** Tiga akun latihan (`peserta`, `instruktur`, `admin`) dengan kata sandi seragam.
4. **Tautan Video Demo:** Video rekaman layar 3–5 menit dengan narasi suara sendiri yang diunggah ke Google Drive (akses publik) atau YouTube Unlisted.
5. **Daftar Peningkatan Fitur Nilai Tambah (C5):** Rincian integrasi payment gateway Mayar sandbox atau fitur ekspor laporan yang aktif di URL produksi.

---

## 2. Checklist Verifikasi Akhir

- [ ] URL Netlify aktif dan dapat dibuka stabil dari peramban ponsel.
- [ ] Tiga akun uji login (`peserta`, `instruktur`, `admin`) dapat masuk di URL Netlify.
- [ ] Pembatasan hak akses terjaga di perutean (Middleware) dan RLS database.
- [ ] Penguncian kuota kursi dan percobaan kuis aman dari submit serentak (`FOR UPDATE`).
- [ ] Kunci jawaban kuis tidak pernah bocor di tab Network browser.
- [ ] Penanganan tiga state (loading, empty, error) terpasang di semua halaman data.
- [ ] Fitur nilai tambah (Mayar Sandbox / Ekspor Laporan) berjalan normal di produksi.
- [ ] Repositori GitHub berstatus publik, memiliki commit bertahap, dan tidak ada kredensial yang bocor.
- [ ] Video demo 3–5 menit dapat diakses publik tanpa hambatan izin tautan.
