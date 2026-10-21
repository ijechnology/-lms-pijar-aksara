# Peta Route, Matriks Akses, dan Peta State
## LMS Lembaga Kursus Pijar Aksara

**Tujuan:** Acuan arsitektur antarmuka, penjagaan rute, dan penempatan state sebelum kode ditulis di Next.js App Router.

---

## 1. Matriks Hak Akses Pengguna

* `✓` : Memiliki akses penuh.
* `✓ milik sendiri` : Akses terbatas hanya pada data yang terasosiasi langsung dengan ID pengguna login.
* `✕` : Akses ditolak secara mutlak oleh sistem.

| Modul / Fitur Aplikasi | Tamu / Publik | Peserta | Instruktur | Admin Lembaga | Rujukan PRD |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Katalog Kursus Terbit** | ✓ | ✓ | ✓ | ✓ | BR-01, US-01 |
| **Detail Kursus & Silabus** | ✓ | ✓ | ✓ | ✓ | BR-01, US-01 |
| **Pendaftaran Kursus Baru** | ✕ | ✓ | ✕ | ✕ | BR-05, BR-06, US-02 |
| **Batal Pendaftaran (Belum Bayar)** | ✕ | ✓ milik sendiri | ✕ | ✓ (Semua) | BR-07, US-02, US-09 |
| **Konfirmasi Pembayaran Manual** | ✕ | ✕ | ✕ | ✓ | BR-07, US-09 |
| **Batal Pendaftaran Aktif** | ✕ | ✕ | ✕ | ✓ (Wajib alasan $\ge 10$ char) | BR-07, US-09 |
| **Baca Materi Bacaan Modul** | ✕ | ✓ (Aktif/Selesai) | ✓ (Pemilik Kursus) | ✓ | BR-08, US-03 |
| **Unduh Lampiran PDF Privat** | ✕ | ✓ (Signed URL 60m) | ✓ (Pemilik Kursus) | ✓ | BR-08, Bab 10 |
| **Kerjakan Kuis Pilihan Ganda** | ✕ | ✓ (Maks 3x, materi dibaca) | ✕ | ✕ | BR-09, BR-10, US-04 |
| **Unduh & Cetak Sertifikat Digital** | ✕ | ✓ milik sendiri | ✕ | ✓ | BR-11, US-05 |
| **Kelola Kursus, Modul, & Soal** | ✕ | ✕ | ✓ milik sendiri (Draf saja) | ✕ (Terkunci jika bukan draf) | BR-02, BR-04, US-06 |
| **Ajukan Kursus ke Tinjauan** | ✕ | ✕ | ✓ milik sendiri (Syarat lengkap) | ✕ | BR-02, BR-03, US-06 |
| **Moderasi Status Kursus (Terbit/Tolak)** | ✕ | ✕ | ✕ | ✓ (Alasan tolak $\ge 10$ char) | BR-02, US-08 |
| **Lihat Progres, Peserta, & Nilai Kuis** | ✕ | ✓ milik sendiri | ✓ milik kursusnya | ✓ (Semua) | BR-12, US-07, US-09 |
| **Dasbor Metrik & Analitik Kursus** | ✕ | ✕ | ✕ | ✓ | BR-12, US-10 |
| **Baca Catatan Audit Log** | ✕ | ✕ | ✕ | ✓ (Read-only) | BR-12, Bab 8 |
| **Ubah Peran & Status Akun Pengguna** | ✕ | ✕ | ✕ | ✓ (Dilarang ubah diri sendiri) | BR-12, US-09 |

---

## 2. Peta Perutean (Route Map) & Penjagaan (Route Guard)

| Nama Halaman | Alamat / Path | Status Proteksi | Cek Pemilik? | Perilaku Saat Akses Ditolak | Indeks Mesin Pencari |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Katalog Kursus** | `/` atau `/kursus` | Publik | Tidak | - | Index, Follow (LCP $\le$ 2.5s) |
| **Detail Kursus** | `/kursus/:slug` | Publik | Tidak | Jika status bukan terbit: HTTP 404 | Index, Follow (Metadata Dinamis) |
| **Masuk / Login** | `/masuk` | Publik (Tamu) | Tidak | Jika sudah masuk: redirect sesuai peran | noindex |
| **Daftar Akun** | `/daftar` | Publik (Tamu) | Tidak | Jika sudah masuk: redirect sesuai peran | noindex |
| **Akses Ditolak** | `/akses-ditolak` | Terautentikasi | Tidak | - | noindex |
| **Kursus Saya** | `/kursus-saya` | Khusus Peserta | Ya | 401: ke `/masuk?kembali=/kursus-saya` | noindex |
| **Ruang Belajar** | `/kursus-saya/:pendaftaranId/modul/:urutan` | Khusus Peserta | Ya | 401: ke `/masuk`. Bukan peserta aktif/selesai: 403 Akses Ditolak | noindex (Direct link PDF dicegah) |
| **Sertifikat** | `/kursus-saya/:pendaftaranId/sertifikat` | Peserta / Admin | Ya | Status pendaftaran belum selesai: 403 Akses Ditolak | noindex (Print Mode) |
| **Kelola Kursus** | `/instruktur/kursus` | Khusus Instruktur | Ya | Bukan instruktur: 403 Akses Ditolak | noindex |
| **Editor Kursus** | `/instruktur/kursus/:id` | Khusus Instruktur | Ya | Bukan pemilik: 403. Status bukan draf: Read-Only | noindex |
| **Peserta & Nilai** | `/instruktur/kursus/:id/peserta` | Instruktur / Admin | Ya | Bukan pemilik kursus & bukan admin: 403 Akses Ditolak | noindex |
| **Panel Admin** | `/admin` | Khusus Admin | Tidak | Bukan admin: 403 Akses Ditolak | noindex (Tab Tinjauan, Bayar, User, Audit) |
| **Dasbor Analitik** | `/admin/dashboard` | Khusus Admin | Tidak | Bukan admin: 403 Akses Ditolak | noindex (Kartu KPI, Recharts, Laporan) |

---

## 3. Peta State Aplikasi

1. **Database:** Data permanen multi-perangkat (kursus, modul, soal, pendaftaran, progres baca, kuis, sertifikat, audit log).
2. **Alamat (URL Search Params / Dynamic Path):**
   - Modul aktif yang dibuka: Path URL `/modul/:urutan`
   - Filter & search katalog: `?kategori=desain&q=excel`
   - Tab aktif panel admin: `?tab=bayar`
   - Filter periode dasbor: `?rentang=8w`
3. **Shared State (Auth Context):**
   - Profil pengguna login & peran aktif (`peserta`/`instruktur`/`admin`) untuk kendali menu navigasi dinamis.
4. **State Lokal Komponen:**
   - Isian jawaban kuis (`{ [id_soal]: 'A' | 'B' | 'C' | 'D' }`)
   - `isSubmitting` untuk mencegah double submission seketika tombol ditekan.
   - Status pemuatan komponen (Loading, Empty, Error).
