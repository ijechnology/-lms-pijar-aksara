# Spesifikasi Desain: Peningkatan Landing Page LMS Pijar Aksara

**Tanggal:** 26 Oktober 2026  
**Status:** Disetujui (Approved)  
**Tipe Perubahan:** Architectural (Peningkatan Struktur & Tampilan Komponen Beranda)

---

## 1. Ringkasan & Tujuan Proyek
Meningkatkan kualitas visual, keterbacaan, dan konversi pendaftaran pada landing page utama LMS Pijar Aksara (`/` di `src/app/page.tsx`) dengan mengadopsi standar modern EdTech dari referensi **Ruangguru** dan **Zenius**, dengan tetap mematuhi batasan bahwa seluruh konten tersaji dalam **satu halaman tunggal tanpa penambahan rute/halaman baru**.

### Batasan Utama & Keputusan Desain:
1. **Single-Page Architecture**: Semua bagian (Hero, Keunggulan, Katalog, Profil Instruktur, Testimoni, FAQ) berada dalam rute `/`.
2. **Preservasi Navigasi Detail Kursus**: Seluruh kartu kursus tetap dapat diklik menuju halaman detail kursus (`/kursus/[slug]`) dengan membawa status kuota *real-time*, harga/gratis, nama instruktur, dan jumlah modul.
3. **Value Proposition Lebih Kuat**: Menggunakan kartu keunggulan ("Kenapa Belajar di Pijar Aksara?") yang aplikatif, bukan bar statistik angka statis.
4. **Fokus Testimoni yang Tepat**: Menghilangkan persona staf administrasi; testimoni difokuskan secara kredibel pada Pelaku UMKM lokal Depok, Wirausahawan Mandiri/Freelancer, dan Pencari Kerja/Fresh Graduate.
5. **Clean UI & Tanpa Floating CTA**: Tidak menggunakan floating button agar tampilan bersih dan fokus.
6. **Konsistensi Tema & Anti-AI-Slop (Belajar dari Ruangguru & Zenius)**:
   - **Palet Warna Selaras**: Menggunakan palet resmi sistem aplikasi: `brand` (biru indigo Pijar Aksara: 50–950), `accent` (amber/emas hangat), dan netral `slate-50` hingga `slate-900`.
   - **Bebas AI-Slop**: Menghindari elemen generik klise (seperti gradien ungu neon acak, mesh blobs mengambang tanpa makna, ilustrasi robotik artifisial, atau buzzword berlebihan).
   - **Tipografi & Spacing Manusiawi**: Hierarki judul yang tajam, font sans bawaan aplikasi, whitespace yang proporsional dan terstruktur rapi.
   - **Konteks Nyata & Membumi**: Copywriting Indonesia yang natural, lugas, dan relevan dengan realitas vokasi pekerja dan UMKM di Kota Depok.

---

## 2. Struktur Komponen Modular
Komponen-komponen baru ditempatkan di direktori `src/components/landing/` untuk menjaga kode tetap bersih, modular, dan mudah dipelihara:

```
src/
├── app/
│   └── page.tsx                      # Halaman utama (orchestrator & data fetcher Supabase)
└── components/
    └── landing/
        ├── HeroSection.tsx           # Banner utama inspiratif, trust badge, dan CTA scroll
        ├── ValueProposition.tsx      # 4 Pilar keunggulan Pijar Aksara
        ├── CourseCatalogSection.tsx  # Search bar, pill category tabs, & grid KursusCard
        ├── MentorShowcase.tsx        # Kartu profil instruktur praktisi resmi
        ├── TestimonialSection.tsx    # Testimoni pelaku UMKM & pencari kerja
        └── FaqSection.tsx            # Accordion tanya-jawab interaktif
```

---

## 3. Rincian Desain & Spesifikasi Komponen

### A. HeroSection (`src/components/landing/HeroSection.tsx`)
- **Tampilan Visual**: Background gradien elegan (`from-brand-950 via-brand-900 to-slate-900`) dengan aksen radial glow halus.
- **Badge Kepercayaan**: `"Lembaga Kursus Resmi di Kota Depok"` dengan border glassmorphism (`bg-white/10 backdrop-blur-md`).
- **Headline**: `"Tingkatkan Keahlian Praktis, Kembangkan Karier & Usaha Anda"`.
- **Subheadline**: Penjelasan ringkas pelatihan intensif langsung ke inti praktik: Excel Perkantoran, Pembukuan UMKM, Desain Canva, dan Bahasa Inggris Komunikasi Kerja.
- **CTA Actions**:
  - Tombol Utama: `"Eksplorasi Katalog Kursus"` (smooth scroll menuju `#katalog`).
  - Tombol Sekunder: `"Daftar Akun Gratis"` (link ke `/register` untuk pengguna belum login).
- **Keunggulan Cepat**: 3 poin checklist (*Kurikulum Berurutan*, *Kuis & Sertifikat Terverifikasi*, *Kuota Terbatas Anti-Bentrok*).

### B. ValueProposition (`src/components/landing/ValueProposition.tsx`)
Menampilkan 4 kartu benefit utama dengan layout 2x2 grid (desktop) atau 1 kolom (mobile):
1. **Kurikulum Praktis & Aplikatif**: Fokus pada studi kasus harian dunia kerja dan toko/usaha UMKM, bukan sekadar teori hafalan.
2. **Instruktur Praktisi Ahli**: Pengajar berlatar belakang praktisi industri yang memberikan panduan langkah demi langkah.
3. **Ujian Evaluasi & Sertifikat Resmi**: Memiliki kuis evaluasi pemahaman dan penerbitan sertifikat digital resmi lembaga kursus.
4. **Kuota Terjadwal Anti-Bentrok**: Sistem kuota peserta otomatis mencegah kelas kelebihan kapasitas demi kenyamanan belajar.

### C. CourseCatalogSection (`src/components/landing/CourseCatalogSection.tsx`)
- Menggantikan tampilan katalog statis dengan desain bergaya pill modern ala Ruangguru & Zenius:
  - **Kategori Tabs (Pills)**: Tombol chips horizontal dengan opsi: *Semua*, *Administrasi*, *Bisnis & Keuangan*, *Desain Konten*, *Bahasa Asing*. Kategori aktif ditandai dengan warna kontras `bg-brand-600 text-white`.
  - **Pencarian Real-Time**: Input teks dengan ikon pencarian untuk memfilter judul, ringkasan, atau instruktur.
  - **Filter Harga Cepat**: Toggle *Semua*, *Gratis*, *Berbayar*.
  - **Grid Kursus**: Menggunakan komponen `KursusCard` yang sudah teruji, memastikan kartu, judul, dan tombol *"Lihat Detail"* tetap mengarah ke `/kursus/[slug]`.

### D. MentorShowcase (`src/components/landing/MentorShowcase.tsx`)
Menampilkan profil instruktur resmi untuk membangun rasa percaya (kredibilitas):
1. **Yudha Pratama** — *Instruktur Praktisi Akuntansi & Microsoft Excel* (Berpengalaman menangani laporan keuangan dan administrasi bisnis).
2. **Laras Wulandari** — *Instruktur Desain Kreatif & Canva* (Spesialis konten media sosial dan promosi visual UMKM).
3. **Michael Sitorus** — *Instruktur Bahasa Inggris Bisnis* (Praktisi komunikasi profesional dan korespondensi kantor).

### E. TestimonialSection (`src/components/landing/TestimonialSection.tsx`)
Menampilkan ulasan peserta yang relevan (tanpa staf administrasi):
1. **Budi Santoso (Pemilik Usaha Kuliner di Sukmajaya, Depok)**:  
   *"Pelatihan pembukuan UMKM di Pijar Aksara sangat mudah dipahami. Sekarang pencatatan uang pribadi dan uang warung tidak lagi campur aduk."*
2. **Siti Rahmawati (Pelaku Toko Online & Wirausaha Kreatif)**:  
   *"Belajar Canva di sini langsung praktik buat flyer dan katalog promo WhatsApp. Hasil desain toko saya terlihat jauh lebih profesional!"*
3. **Rizky Firmansyah (Fresh Graduate / Pencari Kerja)**:  
   *"Sertifikat resmi dan materi Excel praktisnya sangat membantu portofolio saya saat melamar kerja. Pembelajarannya terstruktur dan kuisnya menguji pemahaman nyata."*

### F. FaqSection (`src/components/landing/FaqSection.tsx`)
Accordion interaktif dengan state buka/tutup halus:
1. *Apakah sertifikat dari LMS Pijar Aksara resmi dan terverifikasi?*
   - Ya, setiap peserta yang lulus nilai batas minimal akan menerima sertifikat digital resmi bernomor unik dari Lembaga Kursus Pijar Aksara Depok.
2. *Bagaimana jika kuota kelas sudah penuh?*
   - Pendaftaran akan ditutup otomatis ketika kuota habis demi menjaga kualitas pembelajaran. Anda dapat memantau ketersediaan kursi secara real-time di katalog.
3. *Apakah materi kursus bisa diakses fleksibel?*
   - Ya, materi video dan modul dapat dipelajari secara berurutan sesuai ritme belajar Anda masing-masing.
4. *Metode pembayaran apa saja yang didukung?*
   - Pembayaran kursus berbayar terhubung otomatis dengan Mayar, mendukung QRIS, Virtual Account berbagai bank, dan e-wallet.

---

## 4. Aliran Data & Integrasi Supabase
- Query data kursus pada `src/app/page.tsx` tetap mengambil kursus berstatus `terbit` dari tabel `kursus` Supabase beserta relasi profil instruktur dan modul.
- Perhitungan `kursi_terpakai` dari tabel `pendaftaran` tetap dihitung secara tepat guna menampilkan sisa kursi *real-time*.
- Jika koneksi Supabase offline/lambat, sistem secara otomatis fallback ke data contoh `INITIAL_COURSES` sehingga tampilan landing page tidak pernah kosong atau rusak.

---

## 5. Rencana Verifikasi & Pengujian
1. **Navigasi Detail Kursus**: Pastikan setiap kartu kursus dapat diklik dan mengarah ke `/kursus/[slug]` tanpa error.
2. **Interaktivitas Filter**: Pastikan pill tab kategori dan filter pencarian menyaring daftar kursus dengan tepat.
3. **Responsivitas Mobile**: Uji tampilan pada ukuran layar smartphone, tablet, dan desktop (grid responsif, tidak ada elemen meluap/overflow).
4. **Accordion FAQ**: Pastikan interaksi klik pada pertanyaan FAQ membuka dan menutup jawaban dengan lancar.
5. **Build & Lint Verification**: Memastikan tidak ada kesalahan TypeScript atau compile error pada Next.js.
