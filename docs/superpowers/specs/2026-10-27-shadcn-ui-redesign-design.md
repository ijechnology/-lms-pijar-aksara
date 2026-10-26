# Spesifikasi Desain: Redesign UI dengan Design System shadcn-style

# LMS Lembaga Kursus Pijar Aksara

**Tanggal:** 2026-10-27
**Status:** Menunggu review
**Tipe Perubahan:** Architectural (design system + redesign seluruh halaman)
**Preset acuan:** `b5KJfcjLs` (sky / mist / small radius / Inter / style mira)

---

## 1. Ringkasan & Tujuan

Merombak tampilan seluruh aplikasi agar konsisten dengan bahasa visual shadcn UI, tanpa mengubah fondasi Tailwind v3 dan tanpa mengubah alur bisnis. Hasil yang diharapkan:

1. Satu design system yang dipakai semua peran (publik, peserta, instruktur, admin).
2. Tampilan terasa shadcn: border-first, radius kecil, netral `mist`, primary `sky`, aksen `amber` terbatas.
3. State kosong, loading, error, dan konfirmasi konsisten di seluruh aplikasi.
4. Filter dan tab dapat dibagikan lewat URL, termasuk untuk pengunjung yang belum login pada halaman publik.
5. Tidak ada regresi fungsi, route, aturan peran, maupun gaya cetak sertifikat.

### 1.1 Keputusan yang sudah disetujui

| Topik                    | Keputusan                                                                |
| ------------------------ | ------------------------------------------------------------------------ |
| Arah visual              | Hybrid: sky/mist/amber, Inter untuk semua heading dan body, radius kecil |
| Dark mode                | Tidak ada                                                                |
| Ikon                     | Lucide, termasuk komponen baru                                           |
| Fondasi                  | Tetap Tailwind v3; komponen shadcn di-port manual (Pendekatan B)         |
| Landing page             | Layout dirombak dengan block shadcn; maskot interaktif dipertahankan     |
| Daftar kursus instruktur | Kartu, bukan tabel                                                       |
| Navigasi mobile          | Navbar ringkas + `Sheet`; tanpa bottom bar; tamu memakai nav atas      |
| Urutan kerja             | Dua gelombang: (1) fondasi + publik/auth/peserta, (2) instruktur/admin   |
| Perubahan UX             | Hanya yang tercantum di §6 dan sudah disetujui                          |

---

## 2. Non-Goals

Hal berikut **tidak** dikerjakan dalam perubahan ini:

- Upgrade Tailwind v3 → v4.
- Menjalankan `shadcn init`/`shadcn apply` atau menambah `components.json`.
- Dark mode atau toggle tema.
- Mengganti Lucide ke Remix Icon.
- Menambah font display/serif baru.
- Mengubah skema database, RPC, RLS, atau aturan bisnis.
- Menambah fitur bisnis baru (waitlist, kupon, verifikasi sertifikat publik, dsb.).
- Menulis ulang logika data fetching atau autentikasi.

---

## 3. Design System

### 3.1 Token warna

Nilai disimpan sebagai CSS variable HSL di `src/app/globals.css`, lalu dipetakan di `tailwind.config.ts` dengan `hsl(var(--token))`.

| Token                                            | Nilai HSL                       | Peran                                                 |
| ------------------------------------------------ | ------------------------------- | ----------------------------------------------------- |
| `--background`                                 | `0 0% 100%`                   | kanvas halaman                                        |
| `--foreground`                                 | `240 6% 10%`                  | teks utama                                            |
| `--card` / `--card-foreground`               | `0 0% 100%` / `240 6% 10%`  | permukaan kartu                                       |
| `--popover` / `--popover-foreground`         | `0 0% 100%` / `240 6% 10%`  | dropdown, tooltip                                     |
| `--primary` / `--primary-foreground`         | `201 96% 39%` / `0 0% 100%` | aksi utama (sky-600)                                  |
| `--secondary` / `--secondary-foreground`     | `240 5% 96%` / `240 6% 10%` | tombol sekunder (mist-100)                            |
| `--muted` / `--muted-foreground`             | `240 5% 96%` / `240 4% 46%` | area & teks sekunder                                  |
| `--accent` / `--accent-foreground`           | `240 5% 96%` / `240 6% 10%` | hover/fokus item di komponen shadcn (netral)          |
| `--highlight` / `--highlight-foreground`     | `48 96% 89%` / `26 83% 14%` | sorotan brand amber (badge, seal sertifikat, penanda) |
| `--destructive` / `--destructive-foreground` | `0 72% 51%` / `0 0% 100%`   | aksi destruktif                                       |
| `--border` / `--input`                       | `240 6% 90%`                  | garis & field                                         |
| `--ring`                                       | `199 89% 48%`                 | fokus keyboard (sky-500)                              |
| `--radius`                                     | `0.375rem`                    | radius dasar (small)                                  |

Turunan radius: `sm = calc(var(--radius) - 2px)`, `md = var(--radius)`, `lg = calc(var(--radius) + 2px)`.
Warna grafik: sky-500, amber-500, emerald-500, violet-500, rose-500.

**Koeksistensi:** token lama (`brand-*`, `accent-*`, `slate-*`) tetap tersedia sampai Wave 2 selesai. Penghapusan hanya dilakukan setelah tidak ada referensi tersisa.

Karena `accent` sudah dipakai sebagai skala warna lama, mapping di Tailwind memakai bentuk objek: `accent.DEFAULT` dan `accent.foreground` untuk token semantik, sementara `accent-50` sampai `accent-900` tetap dipertahankan. Token amber baru memakai nama `highlight` agar tidak bertabrakan.

### 3.2 Tipografi

- Body dan heading: Inter (sudah dimuat lewat `next/font`).
- Skala: `text-xs` 12, `sm` 14, `base` 16, `lg` 18, `xl` 20, `2xl` 24, `3xl` 30, `4xl` 36.
- Heading memakai `font-semibold tracking-tight`; paragraf `leading-relaxed text-muted-foreground`.
- Tidak ada font tambahan.

### 3.3 Bentuk, bayangan, dan gerak

- Border-first: kartu memakai `border` + `shadow-sm`; hindari bayangan besar.
- Radius kecil konsisten di semua komponen.
- Fokus: `outline-none ring-2 ring-ring ring-offset-2`.
- Gerak: 150–200 ms `ease-out`; hormati `prefers-reduced-motion`.
- Kontainer: `max-w-7xl`, padding `px-4 sm:px-6 lg:px-8`.

---

## 4. Arsitektur Komponen

### 4.1 Struktur berkas

```
src/
  lib/utils.ts                     # cn()
  components/
    ui/                            # primitif shadcn (port Tailwind v3)
      button.tsx  input.tsx  label.tsx  textarea.tsx  select.tsx
      checkbox.tsx  switch.tsx  card.tsx  badge.tsx  alert.tsx
      dialog.tsx  alert-dialog.tsx  dropdown-menu.tsx  tabs.tsx
      table.tsx  tooltip.tsx  popover.tsx  sheet.tsx  avatar.tsx
      progress.tsx  skeleton.tsx  separator.tsx  accordion.tsx
      pagination.tsx  sonner.tsx  breadcrumb.tsx
    layout/
      Navbar.tsx  AdminSidebar.tsx  Footer.tsx  PageHeader.tsx
```

Komponen lama (`AlertModal`, `ConfirmModal`, `Pagination` kustom) tetap dipakai sampai halamannya dimigrasi, lalu dihapus.

### 4.2 Dependensi baru

- Radix: `@radix-ui/react-accordion`, `alert-dialog`, `avatar`, `checkbox`, `dialog`, `dropdown-menu`, `label`, `popover`, `progress`, `select`, `separator`, `slot`, `switch`, `tabs`, `tooltip`.
- `class-variance-authority`, `tailwindcss-animate`, `sonner`.
- Ikon tetap `lucide-react`.

### 4.3 Aturan implementasi

- Semua komponen `ui/*` menerima `className` dan menggunakan `cn()`.
- Varian memakai CVA; tidak ada styling ad-hoc di halaman untuk elemen yang sudah punya primitif.
- Komponen tidak mengakses data; data tetap dari halaman/komponen fitur.
- Tidak ada perubahan pada file `api/*`, `lib/mayar.ts`, `lib/email.ts`, atau migration.

---

## 5. Layout & Navigasi

**Tidak ada bottom bar di peran mana pun.** Navigasi mobile memakai Navbar ringkas + `Sheet`.

### 5.1 Shell per area

Shell ditentukan oleh layout grup rute, bukan impor per halaman.

| Area          | Desktop                                        | Mobile (<768px)                                     |
| ------------- | ---------------------------------------------- | --------------------------------------------------- |
| Publik (tamu) | Navbar penuh: logo, Kursus, FAQ, Masuk, Daftar      | Navbar ringkas + `Sheet` menu                     |
| Peserta       | Navbar: logo, Kursus, Kursus Saya, avatar      | Navbar ringkas (logo + avatar) + `Sheet`          |
| Instruktur    | Navbar: logo, Katalog, Kursus Saya, avatar     | Navbar ringkas (logo + avatar) + `Sheet`          |
| Admin         | Sidebar 240px + konten; **tanpa topbar** | Bar ringkas 52px (menu + logo + avatar) + `Sheet` |

### 5.2 Navbar publik, peserta, dan instruktur

Desktop (≥768px):

- Tinggi 64px, `sticky top-0`, `bg-white/80 backdrop-blur`, border bawah, `z-40`.
- Kiri: logo + wordmark menuju `/`. Tengah/kanan: tautan sesuai peran.
- Tautan aktif: teks `primary` + garis bawah 2px; lainnya `muted-foreground`.
- Kanan: `DropdownMenu` avatar berisi nama, email, badge peran, Profil, tautan panel sesuai peran, pemisah, dan Keluar.
- Tamu: tombol Masuk (ghost) + Daftar (primary).
- Target sentuh ≥44px; `aria-current="page"` pada tautan aktif.

Mobile (<768px):

- Tinggi 56px, logo + tombol avatar (membuka `Sheet` kanan) atau tombol menu ikon untuk tamu.
- `Sheet` tamu: Kursus, FAQ, Masuk, Daftar. `Sheet` pengguna: Profil, tautan panel, Keluar.
- Tidak ada hamburger terpisah untuk pengguna yang sudah login; avatar adalah pemicunya.
- Tidak memuat pencarian, notifikasi, atau toggle tema.

### 5.3 Sidebar admin (desktop ≥1024px)

- Lebar 240px, `fixed`, tinggi penuh, `border-r`, latar `mist-50`.
- Susunan: blok logo 56px di atas; navigasi di tengah; akun + “Lihat situs” di footer sidebar.
- Item: ikon 18px + label, tinggi 36px, radius kecil. Aktif: `bg-secondary`, teks `primary`, indikator kiri 2px, `aria-current="page"`.
- Kelompok: **Utama** (Dashboard), **Operasional** (Tinjauan, Pendaftaran), **Sistem** (Pengguna, Audit Log).
- Footer: avatar + nama + peran (`DropdownMenu`: Profil, Keluar) dan tautan “Lihat situs”.
- **Tanpa topbar desktop.** Breadcrumb, judul, deskripsi, dan aksi halaman berada di `PageHeader` dalam konten.
- Konten: `max-w-7xl`, padding 24px (mobile) / 32px (desktop).

Tablet/mobile admin (<1024px):

- Sidebar disembunyikan; muncul bar ringkas 52px berisi tombol menu, logo, dan avatar.
- Tombol menu membuka `Sheet` dari kiri dengan item navigasi yang sama.
- Avatar membuka `Sheet` akun berisi Profil dan Keluar.
- Admin tidak merender footer publik.

### 5.4 Navigasi mobile

- `Sheet` kanan untuk akun (semua peran) dan `Sheet` kiri untuk navigasi admin.
- Lebar 280–320px, focus trap, Esc, fokus kembali ke pemicu (bawaan Radix), dan menutup otomatis saat rute berubah.
- Tidak ada bar bawah; konten tidak memerlukan padding bawah khusus.
- Semua item menu tetap dapat dijangkau keyboard dan memiliki label teks.

### 5.5 Footer

- Hanya dirender di landing page `/`.
- Berisi identitas lembaga, tautan cepat, kontak, dan copyright.

### 5.6 Pola halaman

- `PageHeader`: breadcrumb (halaman dalam), judul, deskripsi opsional, area aksi.
- State standar: `Skeleton` untuk daftar/tabel, `Alert` untuk error, `EmptyState` (komponen lokal) untuk data kosong.

---

## 6. Perubahan UX yang Disetujui

| Kode | Perubahan                                                            | Cakupan                                     |
| ---- | -------------------------------------------------------------------- | ------------------------------------------- |
| U1   | Filter/tab di URL (`?q=`, `?kategori=`, `?tab=`, `?detail=`) | Publik & area role                          |
| U2   | Skeleton untuk daftar/tabel                                          | Semua halaman data                          |
| U3   | Toast (sonner) untuk sukses/gagal                                    | Semua aksi                                  |
| U4   | `Sheet` untuk navigasi mobile (menggantikan bottom bar)            | Semua role                                  |
| U5   | Toggle kata sandi & validasi inline                                  | Sudah ada; tidak dikerjakan ulang           |
| U6   | Breadcrumb                                                           | Halaman detail & panel                      |
| U7   | Footer khusus landing                                                | `/`                                       |
| U8   | Strip statistik di hero                                              | `/`, jika data tersedia tanpa query mahal |
| U9   | Shell admin dengan sidebar + URL per area                            | `/admin/*`                                |
| U10  | Peringatan perubahan belum tersimpan                                 | Editor kursus                               |
| U11  | Detail baris di `Sheet` + `?detail=`                             | Tinjauan, pengguna, rekap peserta, audit    |
| U12  | `AlertDialog` untuk aksi destruktif                                | Semua role                                  |

**Aturan U1:** parameter dibaca tanpa syarat login pada halaman publik; middleware dan aturan peran tidak diubah. Nilai default tidak ditulis ke URL; perubahan filter memakai `router.replace(..., { scroll: false })` agar riwayat tidak penuh.

---

## 7. Desain Halaman — Wave 1

Urutan: fondasi → shell → auth → landing → katalog/detail → peserta.

### 7.1 Fondasi

Token, `cn()`, dan seluruh komponen `ui/*`. Tidak ada perubahan tampilan halaman sampai langkah ini selesai dan build lulus.

### 7.2 Auth

- `/masuk`, `/daftar`, `/lupa-password`, `/atur-ulang-kata-sandi`: layout split — panel brand (sky/mist) di kiri, `Card` form di kanan; mobile satu kolom.
- Field memakai `Label` + `Input`; error inline; tombol loading; pemisah "atau" untuk Google.
- `/akses-ditolak`: kartu terpusat dengan alasan dan aksi keluar/masuk.
- Perilaku autentikasi tidak berubah.

### 7.3 Landing `/`

- Layout dirombak dengan block shadcn; maskot interaktif tetap di hero.
- Urutan bagian: hero (dua kolom + CTA + strip statistik U8) → value proposition → katalog (toolbar filter di `Card`, grid kartu) → mentor → testimoni → FAQ (`Accordion`) → CTA → footer.
- Aturan anti-slop dari spec landing 2026-10-26 tetap berlaku; palet `brand`/`slate` digantikan token baru.
- Filter katalog memakai URL (U1) dan tetap berfungsi untuk tamu.
- Strip statistik (U8) hanya menampilkan dua angka: jumlah kursus terbit dan jumlah peserta aktif. Keduanya dihitung dengan dua count `head: true` ringan yang dijalankan paralel. Jika query tidak tersedia atau menambah beban muat halaman, bagian ini dihilangkan.

### 7.4 Katalog & detail

- `/kursus`: header, toolbar pencarian/filter (`Input`, `Select`, `Badge`), grid kartu responsif, `EmptyState`.
- `/kursus/[slug]`: breadcrumb; kolom utama (ringkasan, silabus `Accordion`, instruktur, FAQ); kolom kanan kartu sticky berisi harga, progress sisa kursi, status, dan CTA yang menjelaskan alasan saat nonaktif (belum login/penuh/ditutup).

### 7.5 Peserta

- `/kursus-saya`: sapaan + ringkasan angka; filter status (`Tabs`, URL U1); kartu kursus dengan progress, badge, hitung mundur, dan aksi kontekstual; semua modal memakai `Dialog`.
- Ruang belajar: sidebar modul (Sheet di mobile), video + materi + unduh PDF dalam `Card`, penanda dibaca, kuis terpisah; modul terkunci menampilkan alasan.
- `/sertifikat`: tampilan layar dengan bingkai, seal amber, aksi Cetak/Unduh; gaya cetak dipertahankan.
- `/profil`: kartu identitas + form; transkrip nilai memakai `Table` + `Badge`.

---

## 8. Desain Halaman — Wave 2

### 8.1 Instruktur

- **Daftar kursus:** kartu untuk semua lebar layar (bukan tabel); header + aksi "Kursus baru"; filter status (URL); kartu memuat judul, kategori, badge status, jumlah modul/peserta, dan menu aksi.
- **Editor kursus:** header lengket (badge status, Simpan, Ajukan Tinjauan), navigasi bagian Info/Modul/Soal; form dengan validasi inline; modul dalam `Accordion` (video, PDF dropzone, durasi); soal per modul. Status bukan draf → form terkunci + `Alert`. U10 diterapkan.
- **Rekap peserta:** `Table` + pencarian/filter; detail peserta di `Sheet` (`?detail=`).

### 8.2 Admin

- **Shell:** sidebar 240px dengan logo, navigasi, dan akun di footer; tanpa topbar desktop. Di <1024px, bar ringkas + `Sheet`. Rute: `/admin/dashboard`, `/admin/tinjauan`, `/admin/pendaftaran`, `/admin/pengguna`, `/admin/audit`. `/admin` mengarah ke dashboard; tautan lama tetap berfungsi.
- **Dashboard:** kartu KPI, grafik mingguan (Recharts, gaya konsisten), tabel kelulusan terendah dan kursi hampir penuh, filter rentang 3 opsi.
- **Tinjauan:** tabel + filter; detail di `Sheet` dengan pratinjau kurikulum; `Dialog` setujui/tolak (alasan wajib); tutup/buka kembali; `Dialog` ubah kuota/harga.
- **Pendaftaran & Bayar:** tabel + pencarian/filter; `Dialog` konfirmasi dan pembatalan (alasan wajib); penampil bukti pembayaran mengikuti fitur yang sedang dikerjakan.
- **Pengguna:** tabel; `Select` peran dan `Switch` aktif; penanda proteksi akun sendiri.
- **Audit Log:** tabel + filter; detail entri di `Sheet`.

---

## 9. Aksesibilitas

- Fokus terlihat di semua elemen interaktif (`ring-2 ring-ring`).
- `skip to content` di layout.
- `aria-label` pada tombol ikon; navigasi memakai `nav` + label.
- Dialog/Sheet: focus trap, Esc, dan pengembalian fokus (bawaan Radix).
- Kontras teks minimal AA.
- Target sentuh ≥44px.
- `prefers-reduced-motion` menonaktifkan animasi maskot dan transisi.

---

## 10. Verifikasi & Definition of Done

### 10.1 Verifikasi teknis

- `npm run build` lulus.
- `npx tsc --noEmit` lulus.
- Tidak ada warning hidrasi baru di console.

### 10.2 Verifikasi manual per kelompok halaman

- Peran: tamu, peserta, instruktur, admin.
- Lebar: 375, 768, 1280.
- State: kosong, loading, error, sukses.
- Cetak sertifikat: layout dan ukuran tetap benar.
- Screenshot sebelum/sesudah disimpan untuk review.

### 10.3 DoD Wave 1

Token dan komponen dasar aktif; auth, landing, katalog, detail, dan seluruh halaman peserta memakai primitif baru; filter URL berfungsi untuk tamu; build dan tsc lulus; tidak ada regresi fungsi.

### 10.4 DoD Wave 2

Daftar kursus instruktur memakai kartu; editor memenuhi U10; shell admin dan lima area berjalan; `Sheet` + `?detail=` berfungsi; aksi destruktif memakai `AlertDialog`; build dan tsc lulus.

---

## 11. Risiko & Mitigasi

| Risiko                                                         | Mitigasi                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| CSS rusak seperti insiden sebelumnya                           | Tanpa upgrade Tailwind; verifikasi build; cek visual tiap kelompok |
| Bentrok dengan pekerjaan bukti pembayaran yang belum di-commit | Implementasi dimulai hanya setelah pekerjaan tersebut di-commit    |
| Duplikasi komponen modal lama vs baru                          | Migrasi per halaman; hapus komponen lama di akhir                  |
| Maskot landing berat                                           | Pertahankan; hormati `prefers-reduced-motion`; ukur dampak       |
| Scope melebar                                                  | Hanya UX yang disetujui; fitur baru di luar scope                  |
| Route admin berubah                                            | Redirect `/admin`; tautan lama dipertahankan                     |

---

## 12. Alur Kerja Git

- Tunggu working tree bersih (pekerjaan bukti pembayaran selesai di-commit).
- Branch `redesign/shadcn-ui` dari `main`.
- Commit per kelompok halaman dengan pesan `feat(ui): ...` atau `refactor(ui): ...`.
- `main` tidak disentuh sampai Wave 1 disetujui.
- Tidak ada perubahan database.

---

## 13. Kriteria Penerimaan

1. Seluruh halaman memakai token dan primitif yang sama; tidak ada campuran gaya lama pada halaman yang sudah dimigrasi.
2. Tidak ada perubahan perilaku bisnis, route yang diizinkan, maupun data.
3. Filter/tab URL dapat dibagikan; halaman publik tetap dapat diakses tanpa login.
4. Light mode konsisten; tidak ada sisa gaya dark mode.
5. Build, typecheck, dan matriks manual lulus.
6. Review visual Anda disetujui per gelombang.
