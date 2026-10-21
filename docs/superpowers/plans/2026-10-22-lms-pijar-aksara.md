# LMS Pijar Aksara Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web LMS Lembaga Kursus Pijar Aksara secara utuh dari nol di dalam folder `lms-pijar-aksara` dengan Next.js App Router, Supabase (Auth, RLS, Storage, Database Functions atomik), integrasi Mayar Sandbox, dan deployment produksi di Netlify.

**Architecture:** Database-first dengan stored procedures atomik PostgreSQL (`SECURITY DEFINER` + `FOR UPDATE`) di Supabase untuk menjamin invariant kuota kursi, isolasi kunci jawaban kuis, dan keunikan sertifikat. Frontend menggunakan Next.js App Router dengan Tailwind CSS, autentikasi berbasis cookie `@supabase/ssr`, proteksi rute middleware 3 peran, dan render halaman publik SEO-friendly.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Lucide React, Recharts, Supabase PostgreSQL & Auth & Storage, Netlify.

**Spec:** [docs/superpowers/specs/2026-10-22-lms-pijar-aksara-design.md](file:///d:/Bootcamp%20Plan%20Internasional/CAPSTONE-PROJECT/project/docs/superpowers/specs/2026-10-22-lms-pijar-aksara-design.md)

## Global Constraints

* Seluruh file kode sumber, konfigurasi, migrasi, dan script harus diletakkan di dalam folder `lms-pijar-aksara/`.
* Kursi terpakai dihitung dari status `aktif`, `selesai`, dan `menunggu_bayar` dengan `batas_bayar > NOW()` (BR-06).
* Satu peserta hanya boleh memiliki 1 pendaftaran berlaku per kursus (INV-02).
* Kurikulum (`modul` dan `soal`) terkunci mutlak saat status kursus bukan `draf` (INV-03).
* Kuis maksimal 3 kali percobaan per modul, dinilai server-side, dan kunci jawaban tidak pernah dikirim ke browser (INV-04, INV-05).
* Sertifikat diterbitkan otomatis berformat `PA-TAHUN-NOMOR` terurut tanpa lompatan saat semua modul lulus (INV-06).
* Tabel `audit_log` bersifat append-only tanpa izin `UPDATE` atau `DELETE` (INV-07).
* Seluruh halaman internal berstatus `noindex` dan tidak masuk ke `sitemap.xml`.

## Review Focus

* **Kondisi 1 (Kuota Terakhir Rebutan):** Dua peserta mendaftar serentak saat kuota sisa 1 kursi — hanya 1 yang berhasil, yang lain ditolak dengan pesan kuota penuh.
* **Kondisi 2 (Percobaan Kuis Keempat):** Peserta melakukan kiriman kuis ganda serentak pada percobaan ke-3 — server menolak kiriman percobaan ke-4 secara mutlak.
* **Kondisi 3 (Kebocoran Kunci Jawaban):** Inspeksi Network Tab saat kuis dibuka — hanya ada `pertanyaan`, `pilihan_a` s/d `pilihan_d`, tanpa field `kunci_jawaban`.
* **Kondisi 4 (Idempotensi Webhook Mayar):** Webhook `payment.received` dikirimkan dua kali untuk invoice yang sama — status pendaftaran tidak diproses ulang dan data tidak korup.
* **Kondisi 5 (Proteksi Hak Akses Rute & RLS):** Peserta mencoba membuka rute `/admin` atau membaca langsung tabel `audit_log` via kueri klien — dicegat 403 Akses Ditolak dan kueri mengembalikan 0 baris.

---

### Task 1: Inisialisasi Proyek Next.js & Konfigurasi Dasar

**Files:**
- Create: `lms-pijar-aksara/package.json`
- Create: `lms-pijar-aksara/tsconfig.json`
- Create: `lms-pijar-aksara/tailwind.config.ts`
- Create: `lms-pijar-aksara/postcss.config.js`
- Create: `lms-pijar-aksara/src/app/globals.css`
- Create: `lms-pijar-aksara/src/app/layout.tsx`
- Create: `lms-pijar-aksara/.env.local.example`

**Interfaces:**
- Produces: Basis aplikasi Next.js TypeScript dengan dependensi `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `recharts`, `clsx`, `tailwind-merge`.

- [x] **Step 1: Inisialisasi struktur Next.js di dalam folder `lms-pijar-aksara`**
- [x] **Step 2: Pasang dependensi utama (`@supabase/ssr`, `@supabase/supabase-js`, `lucide-react`, `recharts`)**
- [x] **Step 3: Konfigurasi Tailwind CSS dan tokens tema Pijar Aksara**
- [x] **Step 4: Buat berkas `.env.local.example` berisi variabel kredensial Supabase & Mayar**
- [x] **Step 5: Verifikasi build Next.js (`npm run build`) berjalan sukses**
- [x] **Step 6: Commit perubahan**
```bash
git add lms-pijar-aksara/
git commit -m "feat: inisialisasi proyek Next.js lms-pijar-aksara"
```

---

### Task 2: Skrip Migrasi SQL Skema Database & RLS

**Files:**
- Create: `lms-pijar-aksara/supabase/migrations/01_schema.sql`
- Create: `lms-pijar-aksara/supabase/migrations/02_rls.sql`
- Create: `lms-pijar-aksara/supabase/migrations/03_storage.sql`

**Interfaces:**
- Produces: 9 tabel relasional (`profiles`, `kursus`, `modul`, `soal`, `pendaftaran`, `progres_modul`, `percobaan_kuis`, `sertifikat`, `audit_log`), enum status, aturan integritas foreign key, kebijakan RLS, serta konfigurasi bucket storage privat `modul-lampiran`.

- [x] **Step 1: Tulis berkas migrasi `01_schema.sql` untuk pembuatan tabel, enum, dan indeks relasional**
- [x] **Step 2: Tulis berkas migrasi `02_rls.sql` untuk seluruh kebijakan Row Level Security pada 9 tabel**
- [x] **Step 3: Tulis berkas migrasi `03_storage.sql` untuk konfigurasi bucket privat `modul-lampiran` dan kebijakan download/upload PDF**
- [x] **Step 4: Commit berkas migrasi**
```bash
git add lms-pijar-aksara/supabase/migrations/
git commit -m "feat(db): skrip migrasi skema tabel, RLS, dan storage Supabase"
```

---

### Task 3: Skrip Database Functions Atomik (Stored Procedures)

**Files:**
- Create: `lms-pijar-aksara/supabase/migrations/04_functions.sql`

**Interfaces:**
- Produces: 5 fungsi atomik database `SECURITY DEFINER`:
  - `daftar_kursus(p_kursus_id uuid, p_metode_bayar text) -> jsonb`
  - `kirim_jawaban_kuis(p_pendaftaran_id uuid, p_modul_id uuid, p_jawaban jsonb) -> jsonb`
  - `ajukan_kursus(p_kursus_id uuid) -> jsonb`
  - `putuskan_tinjauan_kursus(p_kursus_id uuid, p_keputusan text, p_catatan text) -> jsonb`
  - `konfirmasi_pembayaran_manual(p_pendaftaran_id uuid) -> jsonb`

- [x] **Step 1: Tulis implementasi RPC `daftar_kursus` dengan `FOR UPDATE` dan validasi kuota**
- [x] **Step 2: Tulis implementasi RPC `kirim_jawaban_kuis` dengan evaluasi nilai rahasia dan penerbitan sertifikat otomatis**
- [x] **Step 3: Tulis implementasi RPC `ajukan_kursus` dan `putuskan_tinjauan_kursus` dengan audit log**
- [x] **Step 4: Tulis implementasi RPC `konfirmasi_pembayaran_manual`**
- [x] **Step 5: Commit berkas fungsi SQL**
```bash
git add lms-pijar-aksara/supabase/migrations/04_functions.sql
git commit -m "feat(db): fungsi database atomik RPC daftar, kuis, moderasi, dan bayar"
```

---

### Task 4: Skrip Seed Data & Akun Uji dari Excel

**Files:**
- Create: `lms-pijar-aksara/scripts/seed.py` (atau `seed.ts`)
- Create: `lms-pijar-aksara/supabase/seed.sql`

**Interfaces:**
- Consumes: `docs-lms/Data_Contoh_LMS.xlsx`
- Produces: Skrip seeding terurut yang mengisi 35 akun Auth & profiles, 7 kursus, 18 modul, 70 soal, 61 pendaftaran, progres, kuis, sertifikat, dan audit log dengan kasus batas utuh.

- [x] **Step 1: Buat skrip pembaca Excel yang mengekstrak data dari `docs-lms/Data_Contoh_LMS.xlsx`**
- [x] **Step 2: Tulis skrip pembuat pengguna Supabase Auth dan sinkronisasi ID ke tabel `profiles`**
- [x] **Step 3: Hasilkan berkas `supabase/seed.sql` dengan urutan impor sesuai aturan PRD**
- [x] **Step 4: Commit skrip dan berkas seed**
```bash
git add lms-pijar-aksara/scripts/ lms-pijar-aksara/supabase/seed.sql
git commit -m "feat(seed): skrip seed data contoh dan akun uji dari Excel"
```

---

### Task 5: Supabase Client, Auth Context, & Next.js Middleware Route Guard

**Files:**
- Create: `lms-pijar-aksara/src/lib/supabase/client.ts`
- Create: `lms-pijar-aksara/src/lib/supabase/server.ts`
- Create: `lms-pijar-aksara/src/lib/supabase/middleware.ts`
- Create: `lms-pijar-aksara/src/middleware.ts`
- Create: `lms-pijar-aksara/src/context/AuthContext.tsx`
- Create: `lms-pijar-aksara/src/app/(auth)/masuk/page.tsx`
- Create: `lms-pijar-aksara/src/app/(auth)/daftar/page.tsx`
- Create: `lms-pijar-aksara/src/app/akses-ditolak/page.tsx`
- Create: `lms-pijar-aksara/src/components/layout/Navbar.tsx`

**Interfaces:**
- Produces: Client helper Supabase SSR, penanganan sesi pengguna, route protection 3 peran, dan header navigasi responsif dinamis.

- [ ] **Step 1: Implementasikan helper Supabase SSR (`createBrowserClient`, `createServerClient`)**
- [ ] **Step 2: Buat Next.js `middleware.ts` untuk route guarding dan penambahan header noindex pada halaman internal**
- [ ] **Step 3: Buat `AuthContext` untuk membagikan status profil & peran pengguna**
- [ ] **Step 4: Bangun UI halaman masuk di `/masuk` dan daftar akun di `/daftar`**
- [ ] **Step 5: Bangun UI halaman `/akses-ditolak` (HTTP 403)**
- [ ] **Step 6: Bangun komponen `Navbar` dengan menu kondisional sesuai peran (`tamu`, `peserta`, `instruktur`, `admin`)**
- [ ] **Step 7: Commit implementasi otentikasi dan route guard**
```bash
git add lms-pijar-aksara/src/lib/ lms-pijar-aksara/src/middleware.ts lms-pijar-aksara/src/app/(auth)/ lms-pijar-aksara/src/components/layout/
git commit -m "feat(auth): supabase auth, middleware route guard, dan halaman login/register"
```

---

### Task 6: Halaman Publik (Katalog & Detail Kursus) dan SEO Sitemap

**Files:**
- Create: `lms-pijar-aksara/src/app/(public)/page.tsx`
- Create: `lms-pijar-aksara/src/app/(public)/kursus/[slug]/page.tsx`
- Create: `lms-pijar-aksara/src/app/sitemap.ts`
- Create: `lms-pijar-aksara/src/components/kursus/KursusCard.tsx`
- Create: `lms-pijar-aksara/src/components/kursus/KursusFilter.tsx`

**Interfaces:**
- Produces: Katalog kursus terbit publik, filter kategori & pencarian via URL search params, detail kursus SSR dengan metadata dinamis, dan sitemap dinamis (`/sitemap.xml`).

- [ ] **Step 1: Bangun komponen `KursusCard` dan `KursusFilter` dengan tampilan sisa kursi dan status harga**
- [ ] **Step 2: Bangun halaman katalog publik di `/` dengan SSR, kalkulasi kuota, dan LCP $\le$ 2.5s**
- [ ] **Step 3: Bangun halaman detail kursus `/kursus/[slug]` dengan silabus modul, tombol daftar, dan fallback HTTP 404 jika non-terbit**
- [ ] **Step 4: Tambahkan `generateMetadata` dinamis untuk SEO per kursus**
- [ ] **Step 5: Buat rute sitemap `/sitemap.xml` yang hanya mengekspor kursus berstatus `terbit`**
- [ ] **Step 6: Commit fitur halaman publik dan SEO**
```bash
git add lms-pijar-aksara/src/app/(public)/ lms-pijar-aksara/src/components/kursus/ lms-pijar-aksara/src/app/sitemap.ts
git commit -m "feat(public): katalog kursus publik, detail kursus, dan sitemap dinamis"
```

---

### Task 7: Ruang Belajar Peserta, Kuis Server-Side, & Cetak Sertifikat

**Files:**
- Create: `lms-pijar-aksara/src/app/(peserta)/kursus-saya/page.tsx`
- Create: `lms-pijar-aksara/src/app/(peserta)/kursus-saya/[pendaftaranId]/modul/[urutan]/page.tsx`
- Create: `lms-pijar-aksara/src/app/(peserta)/kursus-saya/[pendaftaranId]/sertifikat/page.tsx`
- Create: `lms-pijar-aksara/src/components/peserta/SidebarModul.tsx`
- Create: `lms-pijar-aksara/src/components/peserta/FormKuis.tsx`
- Create: `lms-pijar-aksara/src/components/peserta/SertifikatView.tsx`

**Interfaces:**
- Produces: Dasbor kursus peserta, ruang belajar navigasi bertahap, sematan video YouTube, unduh PDF via signed URL (60 menit), kuis pilihan ganda aman, dan halaman sertifikat cetak `@media print`.

- [ ] **Step 1: Bangun halaman `/kursus-saya` dengan daftar kursus, status bayar, progres %, dan tombol aksi**
- [ ] **Step 2: Bangun komponen `SidebarModul` dengan status modul (lulus, sedang dipelajari, terkunci)**
- [ ] **Step 3: Bangun komponen baca materi, sematan video, tombol tanda baca materi, dan tombol unduh PDF privat via signed URL**
- [ ] **Step 4: Bangun komponen `FormKuis` (pilihan A–D, tombol kirim anti-dobel, riwayat percobaan, sisa kuota, evaluasi via RPC `kirim_jawaban_kuis`)**
- [ ] **Step 5: Bangun halaman sertifikat `/sertifikat` berformat `PA-TAHUN-NOMOR` dengan styling cetak `@media print`**
- [ ] **Step 6: Commit fitur ruang belajar dan sertifikat**
```bash
git add lms-pijar-aksara/src/app/(peserta)/ lms-pijar-aksara/src/components/peserta/
git commit -m "feat(peserta): ruang belajar modul, kuis server-side, dan cetak sertifikat"
```

---

### Task 8: Panel Instruktur (Kelola Kursus, Modul, Soal, & Rekap Nilai)

**Files:**
- Create: `lms-pijar-aksara/src/app/(instruktur)/instruktur/kursus/page.tsx`
- Create: `lms-pijar-aksara/src/app/(instruktur)/instruktur/kursus/[id]/page.tsx`
- Create: `lms-pijar-aksara/src/app/(instruktur)/instruktur/kursus/[id]/peserta/page.tsx`
- Create: `lms-pijar-aksara/src/components/instruktur/EditorModul.tsx`
- Create: `lms-pijar-aksara/src/components/instruktur/EditorSoal.tsx`

**Interfaces:**
- Produces: Manajemen kursus instruktur, kurikulum modul & soal (terkunci jika bukan draf), tombol pengajuan kursus (validasi BR-03), dan tabel rekap nilai peserta.

- [ ] **Step 1: Bangun halaman `/instruktur/kursus` dengan daftar kursus milik instruktur dan catatan penolakan admin**
- [ ] **Step 2: Bangun halaman `/instruktur/kursus/[id]` dengan editor kurikulum, upload PDF, dan editor soal pilihan ganda**
- [ ] **Step 3: Terapkan status terkunci (*read-only*) pada editor saat kursus berstatus `ditinjau`, `terbit`, atau `ditutup`**
- [ ] **Step 4: Pasang tombol aksi "Ajukan Kursus" yang memanggil RPC `ajukan_kursus` dengan validasi BR-03**
- [ ] **Step 5: Bangun halaman `/instruktur/kursus/[id]/peserta` yang menampilkan tabel progres dan nilai kuis peserta**
- [ ] **Step 6: Commit panel instruktur**
```bash
git add lms-pijar-aksara/src/app/(instruktur)/ lms-pijar-aksara/src/components/instruktur/
git commit -m "feat(instruktur): kelola kursus, modul, soal, ajukan review, dan rekap nilai peserta"
```

---

### Task 9: Panel Admin & Dasbor Analitik

**Files:**
- Create: `lms-pijar-aksara/src/app/(admin)/admin/page.tsx`
- Create: `lms-pijar-aksara/src/app/(admin)/admin/dashboard/page.tsx`
- Create: `lms-pijar-aksara/src/components/admin/TabTinjauanKursus.tsx`
- Create: `lms-pijar-aksara/src/components/admin/TabPendaftaranBayar.tsx`
- Create: `lms-pijar-aksara/src/components/admin/TabPengguna.tsx`
- Create: `lms-pijar-aksara/src/components/admin/TabAuditLog.tsx`
- Create: `lms-pijar-aksara/src/components/admin/GrafikPendaftaran.tsx`
- Create: `lms-pijar-aksara/src/components/admin/GrafikPendapatan.tsx`

**Interfaces:**
- Produces: Panel moderasi kursus (alasan $\ge 10$ char), konfirmasi bayar & batal pendaftaran, kelola peran (proteksi ubah akun sendiri), audit log read-only, serta 4 KPI dasbor dan grafik Recharts.

- [ ] **Step 1: Bangun Tab Tinjauan Kursus (tombol Terbitkan, Kembalikan ke Draf wajib alasan $\ge 10$ karakter, Tutup Kursus)**
- [ ] **Step 2: Bangun Tab Pendaftaran & Pembayaran (konfirmasi pembayaran manual, batalkan pendaftaran aktif wajib alasan $\ge 10$ karakter)**
- [ ] **Step 3: Bangun Tab Pengguna (ubah peran, aktif/nonaktifkan akun, cegah admin mengubah akun sendiri)**
- [ ] **Step 4: Bangun Tab Audit Log (tabel riwayat audit log lengkap dan read-only)**
- [ ] **Step 5: Bangun Dasbor Analitik di `/admin/dashboard` (filter 8 minggu, 4 kartu KPI, grafik Recharts pendaftaran & pendapatan mingguan, tabel kelulusan terendah & kursi hampir penuh)**
- [ ] **Step 6: Commit panel admin dan dasbor**
```bash
git add lms-pijar-aksara/src/app/(admin)/ lms-pijar-aksara/src/components/admin/
git commit -m "feat(admin): panel moderasi kursus, konfirmasi bayar, kelola peran, audit log, dan dasbor analitik"
```

---

### Task 10: Integrasi Pembayaran Mayar Sandbox & Webhook

**Files:**
- Create: `lms-pijar-aksara/src/app/api/pembayaran/mayar/route.ts`
- Create: `lms-pijar-aksara/src/app/api/webhook/mayar/route.ts`
- Create: `lms-pijar-aksara/src/lib/mayar.ts`

**Interfaces:**
- Produces: Route handler untuk membuat invoice tagihan Mayar Sandbox (`POST /invoices/create`) dan webhook callback handler yang memvalidasi ulang ke Mayar (`GET /invoices/{id}`) sebelum mengaktifkan pendaftaran dengan sifat idempotent.

- [ ] **Step 1: Tulis helper `src/lib/mayar.ts` untuk komunikasi dengan Mayar API Sandbox**
- [ ] **Step 2: Bangun endpoint API `/api/pembayaran/mayar` untuk membuat tagihan dan mengembalikan payment URL**
- [ ] **Step 3: Bangun endpoint API `/api/webhook/mayar` untuk menerima event `payment.received`, verifikasi ulang server-side, dan pembaruan pendaftaran secara aman**
- [ ] **Step 4: Commit integrasi pembayaran Mayar**
```bash
git add lms-pijar-aksara/src/app/api/ lms-pijar-aksara/src/lib/mayar.ts
git commit -m "feat(payment): integrasi mayar sandbox invoice dan webhook handler idempotent"
```

---

### Task 11: Deployment Netlify & Verifikasi 17 Skenario Uji

**Files:**
- Create: `lms-pijar-aksara/netlify.toml`
- Create: `lms-pijar-aksara/docs/test-plan.md`

**Interfaces:**
- Produces: Konfigurasi build Netlify dan laporan eksekusi 17 skenario test case (TC-01 s/d TC-17).

- [ ] **Step 1: Buat berkas `netlify.toml` dengan konfigurasi Next.js runtime plugin dan build command**
- [ ] **Step 2: Lakukan build verifikasi akhir secara lokal (`npm run build`)**
- [ ] **Step 3: Tulis berkas `docs/test-plan.md` yang memetakan seluruh 17 skenario uji bisnis (TC-01 s/d TC-17) dengan langkah pengujian dan kriteria kelulusan**
- [ ] **Step 4: Commit konfigurasi Netlify dan berkas rencana pengujian**
```bash
git add lms-pijar-aksara/netlify.toml lms-pijar-aksara/docs/test-plan.md
git commit -m "chore(deploy): netlify configuration dan dokumentasi 17 test case"
```
