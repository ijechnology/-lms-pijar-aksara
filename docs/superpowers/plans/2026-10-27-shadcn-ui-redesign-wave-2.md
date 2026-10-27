# Redesign UI shadcn-style — Wave 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the second wave of the shadcn-style UI redesign for the Instruktur and Admin areas of LMS Pijar Aksara, including the dedicated Admin sidebar shell, route splitting, card-based course catalog for instructors, curriculum editor improvements, and slide-over detail panels, with zero regressions in business logic.

**Architecture:** Builds on the Wave 1 shadcn foundation (Radix UI, CVA, semantic HSL tokens, Sonner, and shared UI primitives in `src/components/ui/`). Adds a fixed 240px `AdminSidebar` shell with mobile `Sheet` fallback, splits `/admin` tabs into first-class URL routes (`/admin/dashboard`, `/admin/tinjauan`, `/admin/pendaftaran`, `/admin/pengguna`, `/admin/audit`), converts the instructor course list into responsive cards, enhances the curriculum editor with an `Accordion` layout and unsaved-changes protection (U10), and upgrades all destructive actions to `AlertDialog` (U12).

**Tech Stack:** Next.js 14.2 App Router, React 18.3, TypeScript 5.7, Tailwind CSS 3.4.17, Radix primitives (`@radix-ui/react-*`), class-variance-authority, sonner, Lucide icons, Recharts.

**Spec:** `docs/superpowers/specs/2026-10-27-shadcn-ui-redesign-design.md`

## Global Constraints

- Keep Tailwind **3.4.17**; do not upgrade to v4, do not run `shadcn init/apply`, do not add `components.json`.
- Light mode only. No dark-mode classes, toggle, or `dark:` variants.
- Icons: `lucide-react` only. No Remix Icon, no emoji as icons.
- Typography: Inter for every heading and body (`--font-sans`).
- Copy stays in Indonesian and maintains existing meaning and validation rules.
- Do not change Supabase queries, RPC calls, auth flow, middleware, RLS, migrations, `api/*`, `lib/mayar.ts`, or `lib/email.ts`.
- Preserve every existing role permission and route guard. Guest/Peserta cannot access `/instruktur/*` or `/admin/*`.
- Root `/admin` route redirects to `/admin/dashboard` while preserving existing links.
- Destructive actions (reject course, cancel registration, delete draft course, deactivate user) must use `AlertDialog` with mandatory reason validation where required.
- Repo has no test runner. Each task's verification is `npx tsc --noEmit` plus manual scenario validation; run `npm run build` in Task 10.

## Review Focus

1. **Admin Sidebar & Shell Navigation** — on desktop (≥1024px), fixed 240px sidebar with groups (Utama, Operasional, Sistem); on mobile (<1024px), 52px bar with Sheet toggle. Pinned in Task 4.
2. **First-class Admin Routes** — `/admin/dashboard`, `/admin/tinjauan`, `/admin/pendaftaran`, `/admin/pengguna`, `/admin/audit` can be directly accessed, bookmarked, and reloaded. Pinned in Tasks 5–9.
3. **Instruktur Course Cards** — on all viewports, courses display as cards with status badge, module count, and student count; status filter syncs to URL `?status=`. Pinned in Task 1.
4. **Unsaved Changes Warning (U10)** — navigating away from dirty draft course editor prompts warning before discarding edits. Pinned in Task 2.
5. **Slide-over Detail Panels (U11)** — student roster in instructor and audit log in admin open details in slide-over `Sheet` (`?detail=...`). Pinned in Tasks 3 and 9.

---

## Task 1: Instruktur Course List Redesign (`/instruktur/kursus`)

**Files:**
- Modify: `src/app/(instruktur)/instruktur/kursus/page.tsx`
- Create / Modify: `src/components/instruktur/KursusCardInstruktur.tsx`
- Create / Modify: `src/components/instruktur/ModalTambahKursus.tsx`

**Interfaces:**
- Consumes: `Card`, `Badge`, `Button`, `Input`, `Select`, `DropdownMenu`, `AlertDialog`, `PageHeader` from `src/components/ui/` and `src/components/layout/`.
- Produces: Card-based responsive instructor course catalog with status badges, URL filter `?status=`, and "Kursus Baru" dialog.

- [ ] **Step 1: Create `KursusCardInstruktur.tsx`**
  Renders course item in a shadcn `Card`: title, category badge, status badge (`draf`, `ditinjau`, `terbit`, `ditolak`, `ditutup`), module count, enrolled student count, price, and actions dropdown menu (`DropdownMenu`: Kelola Kurikulum, Pratinjau, Hapus Draf). Hapus Draf triggers `AlertDialog`.

- [ ] **Step 2: Update `ModalTambahKursus.tsx` using shadcn `Dialog`**
  Port creation modal to Radix `Dialog` with `Label`, `Input`, `Textarea`, `Select` (kategori), price, and quota validation.

- [ ] **Step 3: Refactor `/instruktur/kursus/page.tsx`**
  - Add `PageHeader` with title "Kelola Kursus Saya" and description.
  - Add search bar (`Input`) and status filter tab/select syncing with `?status=`.
  - Render responsive grid of `KursusCardInstruktur`.
  - Render `Skeleton` loading state and `EmptyState` when empty.

- [ ] **Step 4: Verify**
  Run: `npx tsc --noEmit` (expect exit code 0).
  Manual: Open `/instruktur/kursus` as Yudha (`yudha@pijaraksara.test`), verify cards render with badges, filter `?status=draf` works, and "Kursus Baru" dialog opens.

- [ ] **Step 5: Commit**
  ```powershell
  git add src/app/(instruktur)/instruktur/kursus/page.tsx src/components/instruktur/
  git commit -m "feat(ui): redesign instruktur course list with responsive cards"
  ```

---

## Task 2: Instruktur Course Curriculum Editor Redesign (`/instruktur/kursus/[id]`)

**Files:**
- Modify: `src/app/(instruktur)/instruktur/kursus/[id]/page.tsx`
- Modify: `src/components/instruktur/EditorModul.tsx`
- Modify: `src/components/instruktur/EditorSoal.tsx`

**Interfaces:**
- Consumes: `Tabs`, `Accordion`, `Card`, `Badge`, `Button`, `Input`, `Textarea`, `Alert`, `AlertDialog`, `toast`.
- Produces: Tabbed curriculum editor (Info Dasar, Modul Materi, Soal Kuis), accordion module view, locked view for non-draft status, and U10 dirty-state protection.

- [ ] **Step 1: Refactor `EditorModul.tsx` with Radix `Accordion`**
  Wrap module list in `Accordion`. Each module accordion item contains title input, duration input, video URL input, and text/PDF attachment dropzone.

- [ ] **Step 2: Refactor `EditorSoal.tsx` with shadcn form primitives**
  Display questions per module with choice options (A, B, C, D) and radio selector for correct option.

- [ ] **Step 3: Update `src/app/(instruktur)/instruktur/kursus/[id]/page.tsx`**
  - Sticky header with status badge, "Simpan Cepat" button, and "Ajukan Tinjauan" button.
  - Implement U10 dirty-state warning before unload/navigation if changes are unsaved.
  - Display informative `Alert` banner when course is not in `draf` status explaining that edits are locked.
  - Replace legacy alert/confirm with Sonner `toast` and `AlertDialog`.

- [ ] **Step 4: Verify**
  Run: `npx tsc --noEmit` (expect exit code 0).
  Manual: Open a draft course, test adding module via Accordion, verify lock alert on published course.

- [ ] **Step 5: Commit**
  ```powershell
  git add "src/app/(instruktur)/instruktur/kursus/[id]/page.tsx" src/components/instruktur/
  git commit -m "feat(ui): redesign instruktur course editor with accordion and dirty state warning"
  ```

---

## Task 3: Instruktur Student Roster & Recap (`/instruktur/kursus/[id]/peserta`)

**Files:**
- Modify: `src/app/(instruktur)/instruktur/kursus/[id]/peserta/page.tsx`

**Interfaces:**
- Consumes: `Table`, `Badge`, `Sheet`, `PageHeader`, `Input`, `Select`, `Button`.
- Produces: Student list table with completion status and slide-over `Sheet` detail view.

- [ ] **Step 1: Refactor student list into shadcn `Table`**
  Columns: Nama Peserta, Email, Tanggal Daftar, Status Pembayaran, Progres Modul, Skor Kuis Terakhir, Status Kelulusan, Aksi.

- [ ] **Step 2: Implement slide-over `Sheet` for student details (U11)**
  Clicking "Detail" or opening `?detail=[pesertaId]` opens a side `Sheet` displaying module-by-module completion timestamps and quiz attempt history.

- [ ] **Step 3: Verify**
  Run: `npx tsc --noEmit` (expect exit code 0).
  Manual: Open `/instruktur/kursus/[id]/peserta`, search by student name, click detail to open `Sheet`.

- [ ] **Step 4: Commit**
  ```powershell
  git add "src/app/(instruktur)/instruktur/kursus/[id]/peserta/page.tsx"
  git commit -m "feat(ui): redesign student roster with table and slide-over detail sheet"
  ```

---

## Task 4: Admin Shell & Sidebar Navigation (`AdminSidebar.tsx` & Layout)

**Files:**
- Create: `src/components/layout/AdminSidebar.tsx`
- Create / Modify: `src/app/(admin)/layout.tsx`
- Modify: `src/app/(admin)/admin/page.tsx` (redirect logic)

**Interfaces:**
- Consumes: `Sheet`, `Button`, `Avatar`, `DropdownMenu`, `Separator`.
- Produces: Dedicated 240px fixed left sidebar for desktop, 52px top bar with Sheet for mobile, and redirects `/admin` to `/admin/dashboard`.

- [ ] **Step 1: Create `src/components/layout/AdminSidebar.tsx`**
  - Desktop: 240px fixed width, height full, border-r, mist background.
  - Top: Logo + wordmark linking to `/admin/dashboard`.
  - Navigation grouped into:
    * **Utama**: Dashboard (`/admin/dashboard`)
    * **Operasional**: Tinjauan Kursus (`/admin/tinjauan`), Pendaftaran & Bayar (`/admin/pendaftaran`)
    * **Sistem**: Pengguna (`/admin/pengguna`), Audit Log (`/admin/audit`)
  - Active state: `bg-secondary text-primary font-medium border-l-2 border-primary`.
  - Footer: Admin avatar, name, role badge, "Lihat Situs", and "Keluar".

- [ ] **Step 2: Create mobile header & `Sheet` inside `src/app/(admin)/layout.tsx`**
  At `<1024px`, render 52px bar with menu icon triggering left `Sheet` (AdminSidebar) and right avatar triggering user `Sheet`.
  Desktop (≥1024px) renders fixed sidebar and offsets content by `pl-60`.

- [ ] **Step 3: Set `/admin/page.tsx` to redirect to `/admin/dashboard`**
  Use `redirect("/admin/dashboard")` with Next.js navigation for seamless URL routing.

- [ ] **Step 4: Verify**
  Run: `npx tsc --noEmit` (expect exit code 0).
  Manual: Log in as Ratna (`ratna@pijaraksara.test`), open `/admin`, verify redirect to `/admin/dashboard` and sidebar renders cleanly. Resize to mobile (<1024px) to verify Sheet toggle.

- [ ] **Step 5: Commit**
  ```powershell
  git add src/components/layout/AdminSidebar.tsx "src/app/(admin)/layout.tsx" "src/app/(admin)/admin/page.tsx"
  git commit -m "feat(ui): add admin sidebar shell with responsive mobile sheet"
  ```

---

## Task 5: Admin Dashboard Redesign (`/admin/dashboard`)

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`
- Modify: `src/components/admin/GrafikPendaftaranMingguan.tsx`

**Interfaces:**
- Consumes: `Card`, `Badge`, `Button`, `Table`, `Select`, Recharts, Sonner `toast`.
- Produces: Modern KPI dashboard with theme-styled charts and compact cron test button.

- [ ] **Step 1: Update KPI cards & header**
  Replace dark cards with shadcn `Card` primitives with subtle borders, muted subtitles, and primary KPI figures.
  Keep compact "Uji Cron (3 Jam)" trigger button in header.

- [ ] **Step 2: Restyle Recharts in `GrafikPendaftaranMingguan.tsx`**
  Use semantic theme tokens (sky-500, border-slate-200, muted tooltips).

- [ ] **Step 3: Refactor summary tables**
  Convert lowest quiz passing modules and nearly-full courses to shadcn `Table` format.

- [ ] **Step 4: Verify**
  Run: `npx tsc --noEmit` (expect exit code 0).
  Manual: Open `/admin/dashboard`, verify cards, chart hover, and "Uji Cron" trigger button.

- [ ] **Step 5: Commit**
  ```powershell
  git add "src/app/(admin)/admin/dashboard/page.tsx" src/components/admin/GrafikPendaftaranMingguan.tsx
  git commit -m "feat(ui): redesign admin dashboard with shadcn cards and styled charts"
  ```

---

## Task 6: Admin Course Review Route (`/admin/tinjauan`)

**Files:**
- Create: `src/app/(admin)/admin/tinjauan/page.tsx`
- Refactor / Port: `src/components/admin/TabTinjauanKursus.tsx`

**Interfaces:**
- Consumes: `Table`, `Badge`, `Button`, `Sheet`, `Dialog`, `AlertDialog`, `Textarea`, `PageHeader`.
- Produces: Dedicated `/admin/tinjauan` route with syllabus preview sheet and reject/approve dialogs.

- [ ] **Step 1: Create `/admin/tinjauan/page.tsx`**
  Render `PageHeader` with title "Tinjauan & Penerbitan Kursus".
  Render filter tabs: Semua, Ditinjau, Terbit, Ditolak.
  Display queue in shadcn `Table`.

- [ ] **Step 2: Slide-over curriculum preview `Sheet`**
  Clicking "Pratinjau" opens side `Sheet` displaying course metadata, instructors, modules, and quiz questions.

- [ ] **Step 3: Approval and Rejection Dialogs**
  - "Terbitkan": `AlertDialog` confirmation.
  - "Tolak": `AlertDialog` requiring mandatory rejection reason textarea before submission.
  - "Ubah Kuota / Harga": `Dialog` with number inputs.

- [ ] **Step 4: Verify**
  Run: `npx tsc --noEmit` (expect exit code 0).
  Manual: Open `/admin/tinjauan`, test filter tabs, open syllabus preview sheet.

- [ ] **Step 5: Commit**
  ```powershell
  git add "src/app/(admin)/admin/tinjauan/page.tsx" src/components/admin/
  git commit -m "feat(ui): create dedicated admin course review route with sheet preview"
  ```

---

## Task 7: Admin Enrollment & Payment Verification Route (`/admin/pendaftaran`)

**Files:**
- Create: `src/app/(admin)/admin/pendaftaran/page.tsx`
- Refactor / Port: `src/components/admin/TabPendaftaranBayar.tsx`

**Interfaces:**
- Consumes: `Table`, `Badge`, `Button`, `Dialog`, `AlertDialog`, `PageHeader`, `Input`, `Select`.
- Produces: Dedicated `/admin/pendaftaran` route with bank transfer proof modal and payment confirmation.

- [ ] **Step 1: Create `/admin/pendaftaran/page.tsx`**
  Render `PageHeader` with title "Pendaftaran & Pembayaran".
  Search input (nama / email) + status filter (`menunggu_bayar`, `aktif`, `selesai`, `dibatalkan`, `kedaluwarsa`).

- [ ] **Step 2: Table & Transfer Proof Dialog**
  Display transactions in shadcn `Table`.
  "Lihat Bukti Transfer" opens `Dialog` with uploaded image preview and transfer timestamp.

- [ ] **Step 3: Confirm and Cancel Dialogs (U12)**
  "Konfirmasi Bayar" triggers `AlertDialog`.
  "Batalkan Tagihan" triggers `AlertDialog` requiring mandatory cancellation reason.

- [ ] **Step 4: Verify**
  Run: `npx tsc --noEmit` (expect exit code 0).
  Manual: Open `/admin/pendaftaran`, verify search, filters, and proof modal.

- [ ] **Step 5: Commit**
  ```powershell
  git add "src/app/(admin)/admin/pendaftaran/page.tsx" src/components/admin/
  git commit -m "feat(ui): create dedicated admin enrollment and payment verification route"
  ```

---

## Task 8: Admin User Management Route (`/admin/pengguna`)

**Files:**
- Create: `src/app/(admin)/admin/pengguna/page.tsx`
- Refactor / Port: `src/components/admin/TabPengguna.tsx`

**Interfaces:**
- Consumes: `Table`, `Badge`, `Select`, `Switch`, `AlertDialog`, `PageHeader`, `Input`.
- Produces: Dedicated `/admin/pengguna` route with role change and status switch.

- [ ] **Step 1: Create `/admin/pengguna/page.tsx`**
  Render `PageHeader` with title "Manajemen Pengguna".
  Search by name/email and filter by role (`semua`, `peserta`, `instruktur`, `admin`).

- [ ] **Step 2: Table with Role Selector & Active Switch**
  - Role column uses shadcn `Select` (peserta, instruktur, admin) with confirmation dialog on change.
  - Status column uses shadcn `Switch` for active/inactive.
  - Self-protection: Current logged-in admin user cannot change their own role or deactivate their own account.

- [ ] **Step 3: Verify**
  Run: `npx tsc --noEmit` (expect exit code 0).
  Manual: Open `/admin/pengguna`, search users, verify own account actions are safely disabled.

- [ ] **Step 4: Commit**
  ```powershell
  git add "src/app/(admin)/admin/pengguna/page.tsx" src/components/admin/
  git commit -m "feat(ui): create dedicated admin user management route"
  ```

---

## Task 9: Admin Audit Log Route (`/admin/audit`)

**Files:**
- Create: `src/app/(admin)/admin/audit/page.tsx`
- Refactor / Port: `src/components/admin/TabAuditLog.tsx`

**Interfaces:**
- Consumes: `Table`, `Badge`, `Sheet`, `PageHeader`, `Select`, `Pagination`.
- Produces: Dedicated `/admin/audit` route with slide-over JSON payload viewer (`?detail=[auditId]`).

- [ ] **Step 1: Create `/admin/audit/page.tsx`**
  Render `PageHeader` with title "Log Audit Sistem".
  Filter by table (`semua`, `pendaftaran`, `kursus`, `profiles`) and search query.
  Render log entries in shadcn `Table` with pagination.

- [ ] **Step 2: Slide-over Payload `Sheet` (U11)**
  Clicking log row or eye icon opens `Sheet` (`?detail=[auditId]`) showing formatted JSON `data_sebelum` and `data_sesudah`.

- [ ] **Step 3: Verify**
  Run: `npx tsc --noEmit` (expect exit code 0).
  Manual: Open `/admin/audit`, test filters, verify clicking log opens slide-over `Sheet`.

- [ ] **Step 4: Commit**
  ```powershell
  git add "src/app/(admin)/admin/audit/page.tsx" src/components/admin/
  git commit -m "feat(ui): create dedicated admin audit log route with slide-over payload sheet"
  ```

---

## Task 10: Wave 2 Verification, Legacy Cleanup, & Production Build

**Files:**
- Remove / Clean unused legacy components: `TabTinjauanKursus.tsx`, `TabPendaftaranBayar.tsx`, `TabPengguna.tsx`, `TabAuditLog.tsx` if completely replaced.
- Verification across full application.

**Interfaces:**
- Consumes: All Wave 1 and Wave 2 pages and components.
- Produces: Fully green production build and deployment-ready state.

- [ ] **Step 1: Check for leftover legacy components**
  Ensure no obsolete modal imports or broken links remain across `(admin)` and `(instruktur)`.

- [ ] **Step 2: Static type check**
  Run: `npx tsc --noEmit`
  Expected: exit code 0.

- [ ] **Step 3: Production bundle build**
  Run: `npm run build`
  Expected: all static & dynamic routes compile cleanly with zero errors.

- [ ] **Step 4: Cross-role manual check**
  Test Instruktur flow (`/instruktur/kursus`) and Admin flow (`/admin/dashboard`, `/admin/tinjauan`, etc.) on both desktop (1280px) and mobile (375px).

- [ ] **Step 5: Commit**
  ```powershell
  git add -A
  git commit -m "chore(ui): complete wave 2 migration and cleanup legacy admin components"
  ```

---

## Wave 2 Definition of Done

- All 5 admin routes (`/admin/dashboard`, `/admin/tinjauan`, `/admin/pendaftaran`, `/admin/pengguna`, `/admin/audit`) exist as dedicated, reloadable pages.
- Desktop Admin layout features a fixed 240px `AdminSidebar`; mobile features a responsive `Sheet`.
- Instruktur course catalog renders responsive cards instead of a raw table.
- Instruktur curriculum editor features `Accordion` module view and dirty-state warning (U10).
- Destructive actions across both roles require confirmation with `AlertDialog` (U12).
- Slide-over `Sheet` displays student details and audit log details (U11).
- `npx tsc --noEmit` and `npm run build` pass with exit code 0.
