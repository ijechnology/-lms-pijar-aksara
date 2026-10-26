# LMS Pijar Aksara Landing Page Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperbarui landing page LMS Pijar Aksara (`/`) dengan desain modern, terstruktur, dan berkonversi tinggi ala Ruangguru dan Zenius, tetap 100% dalam satu halaman tunggal dengan tema visual yang selaras dan bebas elemen AI-slop.

**Architecture:** Memecah komponen beranda menjadi modul-modul independen dan reusable di `src/components/landing/` (Hero, ValueProposition, CourseCatalog, MentorShowcase, Testimonial, Faq), diorkestrasi langsung di `src/app/page.tsx` yang menangani *data fetching* Supabase secara efisien dengan fallback lokal.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React Icons, Supabase JS Client.

**Spec:** `docs/superpowers/specs/2026-10-26-landing-page-upgrade-design.md`

## Global Constraints
- **Single-Page Scope**: Tidak ada penambahan halaman/rute baru. Semua elemen hidup di `src/app/page.tsx`.
- **Detail Kursus Tetap Dapat Diklik**: Seluruh kartu kursus harus tetap menavigasikan ke `/kursus/[slug]`.
- **Palet Tema Konsisten**: Menggunakan `brand` (biru indigo 50–950), `accent` (amber 50–900), dan `slate` (50–900).
- **Anti-AI-Slop**: Tidak ada gradien neon ungu mencolok, tanpa mesh blob mengambang acak, tanpa ilustrasi kartun generik artifisial, dan tanpa jargon berlebihan.
- **Testimoni Terkurasi**: Hanya menampilkan ulasan dari Pelaku UMKM, Wirausaha Mandiri, dan Pencari Kerja (tanpa staf administrasi).
- **Tanpa Floating CTA**: Halaman tetap bersih tanpa tombol bantuan melayang.

## Review Focus
- **Klik Detail Kursus**: Memastikan klik judul, gambar, maupun tombol "Lihat Detail" mengarah ke `/kursus/[slug]`.
- **Filter Kategori & Pencarian**: Memastikan peralihan tab pill kategori dan input search menyaring data kursus secara instan.
- **Accordion FAQ Interaktif**: Memastikan klik pertanyaan membuka/menutup jawaban dengan transisi halus tanpa flicker.
- **Responsivitas Mobile**: Memastikan grid kartu (1 kolom di mobile, 2 di tablet, 3 di desktop) dan padding tidak overflow.
- **Ketahanan Data**: Memastikan fallback `INITIAL_COURSES` tetap berjalan jika query Supabase lambat/offline.

---

### Task 1: Membuat Komponen `ValueProposition.tsx`
**Files:**
- Create: `src/components/landing/ValueProposition.tsx`

- [x] Buat file `src/components/landing/ValueProposition.tsx` yang memuat 4 kartu benefit utama:
  - Kurikulum Praktis & Aplikatif (Ikon `Target` / `Briefcase`)
  - Instruktur Praktisi Berpengalaman (Ikon `GraduationCap` / `Users`)
  - Ujian Evaluasi & Sertifikat Resmi (Ikon `Award` / `FileCheck`)
  - Kuota Terjadwal Anti-Bentrok (Ikon `Clock` / `CalendarCheck`)
- [x] Terapkan desain kartu bersih (`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:border-brand-300 transition`).
- [x] Pastikan responsif pada mobile (grid-cols-1) hingga desktop (grid-cols-2 atau grid-cols-4).
- [x] Verifikasi tidak ada error sintaks TypeScript.

---

### Task 2: Membuat Komponen `HeroSection.tsx`
**Files:**
- Create: `src/components/landing/HeroSection.tsx`

- [x] Buat file `src/components/landing/HeroSection.tsx`.
- [x] Pasang badge *"Lembaga Kursus Resmi di Depok"* dengan border kaca lembut (`bg-white/10 backdrop-blur-md border border-white/20 text-accent-300`).
- [x] Buat Headline dan Subheadline yang tajam, percaya diri, dan membumi (fokus vokasi & karier praktis).
- [x] Sediakan 2 CTA:
  - Tombol Utama: *"Eksplorasi Katalog Kursus"* (smooth scroll ke elemen `#katalog`).
  - Tombol Sekunder: *"Daftar Akun"* (link ke `/register`).
- [x] Tambahkan checklist 3 poin keunggulan cepat dengan centang hijau (`CheckCircle2`).
- [x] Pastikan palet warna konsisten (`from-brand-950 via-brand-900 to-slate-900`) tanpa warna neon artifisial.

---

### Task 3: Membuat Komponen `MentorShowcase.tsx`
**Files:**
- Create: `src/components/landing/MentorShowcase.tsx`

- [x] Buat file `src/components/landing/MentorShowcase.tsx`.
- [x] Tampilkan 3 instruktur praktisi resmi:
  - **Yudha Pratama** (Praktisi Akuntansi & Microsoft Excel Perkantoran)
  - **Laras Wulandari** (Kreator Konten & Desainer Canva UMKM)
  - **Michael Sitorus** (Instruktur Bahasa Inggris Komunikasi Kerja)
- [x] Gunakan badge keahlian, avatar inisial/foto berkelas dengan aksen brand, dan ringkasan pengalaman praktisi.
- [x] Berikan heading seksi yang humanis: *"Belajar Langsung dari Praktisi Berpengalaman"*.

---

### Task 4: Membuat Komponen `TestimonialSection.tsx`
**Files:**
- Create: `src/components/landing/TestimonialSection.tsx`

- [x] Buat file `src/components/landing/TestimonialSection.tsx`.
- [x] Tampilkan 3 testimoni dari persona yang telah disetujui:
  - **Budi Santoso** — Pemilik Usaha Kuliner Sukmajaya, Depok (kursus Pembukuan & Excel).
  - **Siti Rahmawati** — Pelaku Toko Online & Kreator Konten (kursus Desain Canva).
  - **Rizky Firmansyah** — Fresh Graduate / Pencari Kerja (kursus Bahasa Inggris Komunikasi Kerja & Excel).
- [x] Sertakan rating 5 bintang (`Star`), kutipan cerita nyata, dan badge lokasi/status persona.
- [x] Pastikan tidak ada persona staf administrasi sesuai instruksi pengguna.

---

### Task 5: Membuat Komponen `FaqSection.tsx`
**Files:**
- Create: `src/components/landing/FaqSection.tsx`

- [x] Buat file `src/components/landing/FaqSection.tsx` dengan state interaktif (`openIndex`).
- [x] Sediakan 4 pertanyaan esensial:
  1. *Apakah sertifikat dari LMS Pijar Aksara resmi dan terverifikasi?*
  2. *Bagaimana jika kuota kelas sudah penuh?*
  3. *Apakah materi kursus bisa diakses fleksibel?*
  4. *Metode pembayaran apa saja yang didukung? (QRIS & Virtual Account).*
- [x] Tambahkan ikon `ChevronDown` yang berputar (`rotate-180`) saat item aktif.
- [x] Pastikan teks jawaban mudah dibaca dengan warna `text-slate-600` dan background `bg-white`.

---

### Task 6: Membuat Komponen `CourseCatalogSection.tsx`
**Files:**
- Create: `src/components/landing/CourseCatalogSection.tsx`

- [x] Buat file `src/components/landing/CourseCatalogSection.tsx` yang menerima properti:
  - `courses: KursusItem[]`
  - `searchQuery`, `onSearchChange`
  - `selectedCategory`, `onCategoryChange`, `categories`
  - `selectedPrice`, `onPriceChange`
- [x] Terapkan desain tab *pill chips* modern untuk kategori (`Semua`, `Administrasi`, `Bisnis & Keuangan`, dsb) yang dapat digulir horizontal di perangkat mobile.
- [x] Integrasikan input pencarian dengan ikon `Search` dan pembersih pencarian.
- [x] Render kartu kursus menggunakan `KursusCard`, memastikan tautan `/kursus/${kursus.slug}` pada judul dan tombol *"Lihat Detail"* aktif 100%.
- [x] Tampilkan kondisi kosong (*empty state*) yang elegan bila tidak ada kursus yang cocok beserta tombol reset filter.

---

### Task 7: Integrasi Komponen ke `src/app/page.tsx`
**Files:**
- Modify: `src/app/page.tsx`

- [x] Impor komponen baru (`HeroSection`, `ValueProposition`, `CourseCatalogSection`, `MentorShowcase`, `TestimonialSection`, `FaqSection`).
- [x] Susun urutan seksi secara logis dari atas ke bawah:
  1. `Navbar`
  2. `HeroSection`
  3. `ValueProposition`
  4. `CourseCatalogSection` (dengan `id="katalog"`)
  5. `MentorShowcase`
  6. `TestimonialSection`
  7. `FaqSection`
  8. `Footer`
- [x] Pertahankan logika pengambilan data Supabase dan penghitungan `kursi_terpakai` secara utuh.
- [x] Bersihkan kode lama yang berulang atau tidak digunakan lagi.

---

### Task 8: Pengujian & Verifikasi Akhir
**Files:**
- Test & Verification: terminal commands & code inspections

- [x] Jalankan pengecekan tipe / build Next.js (`npm run build` atau `npx tsc --noEmit`) untuk memastikan tidak ada error kompilasi.
- [x] Verifikasi bahwa tautan detail kursus bekerja dengan format `/kursus/[slug]`.
- [x] Pastikan filter pill kategori dan pencarian bekerja secara real-time.
- [x] Pastikan tampilan bebas dari elemen AI-slop dan selaras dengan tema web secara keseluruhan.
- [x] Lakukan commit perubahan ke git.
