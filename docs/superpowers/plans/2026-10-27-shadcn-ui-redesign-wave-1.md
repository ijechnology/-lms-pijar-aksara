# Redesign UI shadcn-style — Wave 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current visual layer of the public, auth, and peserta areas with a shadcn-style design system on Tailwind v3, without changing business logic, routes, or database behavior.

**Architecture:** Manual shadcn port (Radix + CVA + `tailwindcss-animate` + sonner) into `src/components/ui`, semantic HSL tokens in `globals.css`, and route-group layouts that own the Navbar/Footer instead of per-page imports. Wave 2 (instruktur/admin) is a separate plan that builds on these primitives.

**Tech Stack:** Next.js 14.2 App Router, React 18.3, TypeScript 5.7, Tailwind CSS 3.4.17, Radix primitives, class-variance-authority, tailwindcss-animate, sonner, Lucide icons, recharts (untouched in Wave 1).

**Spec:** `docs/superpowers/specs/2026-10-27-shadcn-ui-redesign-design.md`

**Scope note:** This plan is Wave 1 only. Wave 2 (instruktur cards/editor, admin shell and five areas, U9–U11, admin destructive actions) gets its own plan after this branch is approved. U12 is covered here for the peserta cancel action.

## Global Constraints

- Keep Tailwind **3.4.17**; do not upgrade to v4, do not run `shadcn init/apply`, do not add `components.json`.
- Light mode only. No dark-mode classes, toggle, or `dark:` variants.
- Icons: `lucide-react` only. No Remix Icon, no emoji as icons.
- Typography: Inter for every heading and body (`--font-sans`). No new display/serif font. The certificate's existing serif print typography is preserved.
- Copy stays in Indonesian and keeps existing meaning; do not invent testimonials, stats, contacts, or prices.
- Do not change Supabase queries, RPC calls, auth flow, middleware, RLS, migrations, `api/*`, `lib/mayar.ts`, or `lib/email.ts`.
- Preserve every existing route and role rule. `/admin` routing changes are Wave 2 only.
- Footer renders only on `/`. `/kursus` and `/kursus/[slug]` must not render it.
- No bottom bar anywhere. Mobile navigation uses Navbar + `Sheet`.
- Repo has no test runner. Do not add one in this plan. Each task's verification is `npx tsc --noEmit` plus the listed manual scenario; run `npm run build` in Task 1 and Task 13.
- Token values come from spec §3.1 verbatim. `--accent` is the neutral shadcn hover token; amber is `--highlight`.
- Print CSS in `globals.css` and `SertifikatView.tsx` must survive unchanged in behavior.
- Migrated pages must not keep `bg-slate-50`/`text-slate-900`/`brand-*` on their outer wrappers; the layout owns background/foreground. Legacy classes may remain only in files deferred to Wave 2 and in the certificate's print palette.

## Review Focus

1. **Anonymous URL filters** — a guest opening `/kursus?q=excel&kategori=Administrasi&harga=gratis` sees filtered results and can share the URL; no login redirect. Pinned in Task 7.
2. **Mobile navigation** — at 375px, guest and logged-in menus open in a `Sheet`, close on route change/Esc, and never overflow horizontally. Pinned in Tasks 5, 10, 11.
3. **Data failure** — when Supabase is unreachable, catalog and landing show fallback data/skeletons without crashing. Pinned in Tasks 7–8.
4. **Certificate print** — print preview contains only the certificate sheet, on one A4 page, with no navbar/buttons. Pinned in Task 12.
5. **Keyboard overlays** — Tab stays inside Dialog/Sheet, Esc closes, focus returns to the trigger, and focus rings are visible. Pinned in Tasks 4, 9, 10.

---

## Task 0: Pre-flight branch and baseline

**Files:** none.

**Interfaces:**
- Consumes: clean `main` at `7357406` or later.
- Produces: branch `redesign/shadcn-ui` with a recorded green baseline.

- [ ] **Step 1: Confirm clean tree**

Run: `git status --short`
Expected: no output.

- [ ] **Step 2: Create the working branch**

```powershell
git checkout main
git checkout -b redesign/shadcn-ui
```

- [ ] **Step 3: Record the baseline**

Run: `npx tsc --noEmit`
Expected: exit code 0.

Run: `npm run build`
Expected: successful build. If it fails for an environment-only reason (missing env var), record the exact error in the task notes and continue; do not change env files.

---

## Task 1: Foundation — dependencies, tokens, `cn`, global styles

**Files:**
- Modify: `package.json`
- Create: `src/lib/utils.ts`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Create: `src/components/ui/sonner.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `cn(...inputs: ClassValue[]): string`; CSS variables `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--highlight`, `--highlight-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--radius`; `<Toaster />`.

- [ ] **Step 1: Install dependencies**

```powershell
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-tooltip class-variance-authority tailwindcss-animate sonner
```

Do not install `@radix-ui/react-radio-group`, Tailwind v4, or any shadcn CLI package.

- [ ] **Step 2: Create `src/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Replace `src/app/globals.css`**

Keep the existing print block. Replace the RGB body styles with tokens:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 6% 10%;
    --card: 0 0% 100%;
    --card-foreground: 240 6% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 6% 10%;
    --primary: 201 96% 39%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 5% 96%;
    --secondary-foreground: 240 6% 10%;
    --muted: 240 5% 96%;
    --muted-foreground: 240 4% 46%;
    --accent: 240 5% 96%;
    --accent-foreground: 240 6% 10%;
    --highlight: 48 96% 89%;
    --highlight-foreground: 26 83% 14%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 240 6% 90%;
    --input: 240 6% 90%;
    --ring: 199 89% 48%;
    --radius: 0.375rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    min-height: 100vh;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Keep the existing certificate print rules below this line unchanged. */
```

The `@media print` block must remain exactly equivalent to the current one (`.no-print`, `.print-only`, white body).

- [ ] **Step 4: Extend `tailwind.config.ts`**

Merge the semantic colors into the existing `accent` object (keep `accent-50..900`), remove the serif `display` entry, and add the animation plugin:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        highlight: { DEFAULT: "hsl(var(--highlight))", foreground: "hsl(var(--highlight-foreground))" },
        brand: {
          50: "#eef4ff", 100: "#d9e5ff", 200: "#bcd2fe", 300: "#8eb6fd",
          400: "#5a8ff9", 500: "#3468f3", 600: "#214be7", 700: "#1a39cc",
          800: "#1b31a5", 900: "#1c2e82", 950: "#111c50",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
          400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309",
          800: "#92400e", 900: "#78350f",
        },
      },
      borderRadius: {
        lg: "calc(var(--radius) + 2px)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

Copy the `brand` scale values from the current file. Do not add a `darkMode` key.

- [ ] **Step 5: Create `src/components/ui/sonner.tsx`**

```tsx
"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return <Sonner theme="light" position="top-right" richColors closeButton {...props} />;
}
```

- [ ] **Step 6: Update the root layout**

In `src/app/layout.tsx`:
- Replace the body classes with `className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}`.
- Keep `AuthProvider`.
- Add `<Toaster />` after `{children}`.
- Add a skip link as the first body child:

```tsx
<a
  href="#konten"
  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
>
  Lewati ke konten
</a>
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit`
Expected: exit code 0.

Run: `npm run build`
Expected: successful build.

- [ ] **Step 8: Commit**

```powershell
git add package.json package-lock.json src/lib/utils.ts src/app/globals.css tailwind.config.ts src/components/ui/sonner.tsx src/app/layout.tsx
git commit -m "feat(ui): add design tokens, cn helper, and shadcn foundation"
```

---

## Task 2: Form primitives

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/label.tsx`
- Create: `src/components/ui/textarea.tsx`
- Create: `src/components/ui/checkbox.tsx`
- Create: `src/components/ui/switch.tsx`
- Create: `src/components/ui/select.tsx`

**Interfaces:**
- Consumes: `cn` from Task 1; Radix packages from Task 1.
- Produces: `Button`, `buttonVariants` (variants `default | destructive | outline | secondary | ghost | link`, sizes `default | sm | lg | icon`, `asChild`), `Input`, `Label`, `Textarea`, `Checkbox`, `Switch`, and `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem` plus group/separator helpers.

- [ ] **Step 1: Port the seven primitives**

Use the canonical shadcn/ui Tailwind-v3 source for each file, with these project decisions:
- Import `cn` from `@/lib/utils`.
- `Button` base: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`.
- Default height `h-10 px-4 py-2`; `sm` `h-9 px-3`; `lg` `h-11 px-8`; `icon` `h-10 w-10`.
- Use `Slot` from `@radix-ui/react-slot` for `asChild`.
- `SelectContent` uses `bg-popover text-popover-foreground` and `border-border`.
- No `dark:` classes anywhere.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```powershell
git add src/components/ui/button.tsx src/components/ui/input.tsx src/components/ui/label.tsx src/components/ui/textarea.tsx src/components/ui/checkbox.tsx src/components/ui/switch.tsx src/components/ui/select.tsx
git commit -m "feat(ui): add form primitives"
```

---

## Task 3: Surface and display primitives

**Files:**
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/alert.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/components/ui/avatar.tsx`
- Create: `src/components/ui/progress.tsx`

**Interfaces:**
- Consumes: `cn`, Radix avatar/separator/progress.
- Produces: `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`; `Badge` (`default | secondary | destructive | outline`); `Alert`/`AlertTitle`/`AlertDescription`; `Skeleton`; `Separator`; `Avatar`/`AvatarImage`/`AvatarFallback`; `Progress`.

- [ ] **Step 1: Port the seven primitives**

Use the canonical shadcn/ui Tailwind-v3 source. Project decisions:
- `Card`: `rounded-lg border bg-card text-card-foreground shadow-sm` (no large shadows).
- `Badge`: `rounded-md border px-2.5 py-0.5 text-xs font-semibold`; use `bg-highlight text-highlight-foreground` only when a caller explicitly needs the amber emphasis, not as the default variant.
- `Alert`: `rounded-lg border p-4`; destructive variant uses `text-destructive`.
- `Progress`: `h-2 w-full overflow-hidden rounded-full bg-secondary`.
- No `dark:` classes.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```powershell
git add src/components/ui/card.tsx src/components/ui/badge.tsx src/components/ui/alert.tsx src/components/ui/skeleton.tsx src/components/ui/separator.tsx src/components/ui/avatar.tsx src/components/ui/progress.tsx
git commit -m "feat(ui): add surface and display primitives"
```

---

## Task 4: Overlay, navigation, and data primitives

**Files:**
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/alert-dialog.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/tooltip.tsx`
- Create: `src/components/ui/popover.tsx`
- Create: `src/components/ui/accordion.tsx`
- Create: `src/components/ui/table.tsx`
- Create: `src/components/ui/breadcrumb.tsx`
- Create: `src/components/ui/confirm-dialog.tsx`
- Modify: `src/components/ui/Pagination.tsx`

**Interfaces:**
- Consumes: Radix dialog/alert-dialog/dropdown-menu/tabs/tooltip/popover/accordion; `Button`; `buttonVariants`.
- Produces: all standard shadcn exports for Dialog, AlertDialog, Sheet, DropdownMenu, Tabs, Tooltip, Popover, Accordion, Table, Breadcrumb; `ConfirmDialog`; `Pagination`.

`ConfirmDialog` keeps the old `ConfirmModal` API so pages can swap imports without rewriting state:

```ts
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary" | "success";
  loading?: boolean;
}
```

`Pagination` keeps its current API:

```ts
interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}
```

- [ ] **Step 1: Port Dialog, AlertDialog, Sheet, DropdownMenu, Tabs, Tooltip, Popover, Accordion, Table, Breadcrumb**

Use the canonical shadcn Tailwind-v3 source. Project decisions:
- Overlay: `bg-black/60 backdrop-blur-sm`; content: `bg-background`, `border`, `shadow-lg`, `rounded-lg`.
- `Sheet` side variants `top | right | bottom | left`, default `right`; width `w-3/4 sm:max-w-sm`.
- `TabsList`: `bg-muted`; active trigger: `bg-background text-foreground shadow-sm`.
- `Accordion` animations use the keyframes from Task 1.
- `Table` header uses `text-muted-foreground`, rows use `border-b`.
- No `dark:` classes.

- [ ] **Step 2: Create `ConfirmDialog`**

Render an `AlertDialog` with the variant mapped to button styles:
- `danger` → destructive button.
- `warning` → default button with `bg-highlight text-highlight-foreground`.
- `success` → default button with `bg-emerald-600 text-white`.
- `primary` → default button.

Show a spinner (`Loader2` from Lucide) inside the confirm button when `loading`. Export it as the default export so page imports swap from `ConfirmModal` to `ConfirmDialog` without changing the call site.

- [ ] **Step 3: Rewrite `Pagination`**

Replace custom `<button>` classes with `Button variant="outline" size="icon"` and `Button variant={isActive ? "default" : "outline"} size="sm"`. Keep the same page-number calculation, Indonesian labels, and default export.

- [ ] **Step 4: Verify overlay keyboard behavior**

Run `npx tsc --noEmit` (expect 0). Then manually verify on a scratch page or Storybook-free local route:
- Open a Dialog, press Tab repeatedly: focus stays inside.
- Press Esc: closes and returns focus to the trigger.
No commit for manual checks.

- [ ] **Step 5: Commit**

```powershell
git add src/components/ui/dialog.tsx src/components/ui/alert-dialog.tsx src/components/ui/sheet.tsx src/components/ui/dropdown-menu.tsx src/components/ui/tabs.tsx src/components/ui/tooltip.tsx src/components/ui/popover.tsx src/components/ui/accordion.tsx src/components/ui/table.tsx src/components/ui/breadcrumb.tsx src/components/ui/confirm-dialog.tsx src/components/ui/Pagination.tsx
git commit -m "feat(ui): add overlay, navigation, and table primitives"
```

---

## Task 5: App shells, Navbar, Footer, PageHeader, EmptyState

**Files:**
- Move: `src/app/page.tsx` → `src/app/(public)/page.tsx`
- Move: `src/app/kursus/` → `src/app/(public)/kursus/`
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(peserta)/layout.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/PageHeader.tsx`
- Create: `src/components/ui/empty-state.tsx`
- Modify: public, auth, and peserta pages to remove their own `<Navbar />`

**Interfaces:**
- Consumes: `Button`, `Sheet`, `DropdownMenu`, `Avatar`, `Breadcrumb`, `Separator`, `cn`.
- Produces:
  - `Navbar` (no props): role-aware links; desktop `DropdownMenu`; mobile `Sheet`.
  - `Footer` (no props): landing-only footer.
  - `PageHeader({ title, description?, breadcrumbs?, actions?, className? })`.
  - `EmptyState({ icon?, title, description?, action?, className? })`.

```ts
import type { LucideIcon } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}
```

- [ ] **Step 1: Move the public routes**

```powershell
New-Item -ItemType Directory -Force "src/app/(public)" | Out-Null
git mv "src/app/page.tsx" "src/app/(public)/page.tsx"
git mv "src/app/kursus" "src/app/(public)/kursus"
```

- [ ] **Step 2: Create the three layouts**

`(public)/layout.tsx`:

```tsx
import Navbar from "@/components/layout/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div id="konten" className="flex-1">
        {children}
      </div>
    </div>
  );
}
```

`(peserta)/layout.tsx`: same structure as public. Do not add a bottom bar.

`(auth)/layout.tsx`: two-column shell, no Navbar:

```tsx
<div className="min-h-screen grid lg:grid-cols-2">
  <aside className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground font-bold text-primary">PA</div>
      <span className="text-lg font-semibold">Pijar Aksara</span>
    </Link>
    <div className="space-y-4">
      <p className="text-2xl font-semibold leading-snug">
        Belajar keterampilan kerja yang langsung bisa dipakai.
      </p>
      <ul className="space-y-2 text-sm text-primary-foreground">
        <li>Kurikulum praktis untuk kantor dan UMKM.</li>
        <li>Instruktur praktisi dan evaluasi terukur.</li>
        <li>Sertifikat resmi setelah seluruh modul lulus.</li>
      </ul>
    </div>
    <p className="text-xs text-primary-foreground">Lembaga Kursus Pijar Aksara · Depok</p>
  </aside>
  <main id="konten" className="flex items-center justify-center p-4 sm:p-8">
    {children}
  </main>
</div>
```

- [ ] **Step 3: Rewrite `Navbar`**

Desktop (≥768px):
- Root: `sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur print:hidden`.
- Logo + wordmark to `/`.
- Links by role:
  - guest: `/kursus` "Katalog", `/#faq` "FAQ".
  - peserta: `/kursus` "Katalog", `/kursus-saya` "Kursus Saya".
  - instruktur: `/kursus` "Katalog", `/instruktur/kursus` "Kelola Kursus".
  - admin: `/admin/dashboard` "Panel Admin".
- Active state: `text-primary` + 2px underline; inactive `text-muted-foreground`.
- Logged-in: `DropdownMenu` avatar with name/email/role badge, Profil, role panel link, separator, Keluar (`signOut`).
- Guest: `Button variant="ghost"` Masuk + `Button` Daftar.
- Loading: 8×8 `Skeleton` circle, not a flash of Masuk.

Mobile (<768px):
- `h-14` bar, logo + avatar trigger (logged-in) or menu icon trigger (guest).
- Right `Sheet`: nav links + separator + account block; Keluar for logged-in; Masuk/Daftar for guest.
- Close the Sheet with `onClick` on every link. No hamburger next to avatar, no bottom bar.
- Use `aria-label` on icon buttons and `aria-current="page"` on active links.

- [ ] **Step 4: Create `Footer`**

Landing-only footer with:
- Institution name and the existing Depok description.
- Quick links: Katalog, FAQ (`/#faq`), Masuk, Daftar.
- Location: “Depok, Jawa Barat”.
- Copyright with `new Date().getFullYear()`.
Use `border-t bg-muted/40`, `max-w-7xl`, and no fake email/phone.

- [ ] **Step 5: Create `PageHeader` and `EmptyState`**

`PageHeader` renders `Breadcrumb` when `breadcrumbs` is non-empty, then a responsive title row (`text-2xl sm:text-3xl font-semibold tracking-tight`) with `actions` on the right. `EmptyState` centers an optional Lucide icon in a `rounded-lg bg-muted` tile, title, description, and action.

- [ ] **Step 6: Remove per-page Navbar usage**

Remove `import Navbar` and `<Navbar />` from:
- `src/app/(public)/page.tsx`
- `src/app/(public)/kursus/page.tsx`
- `src/app/(public)/kursus/[slug]/page.tsx`
- `src/app/(peserta)/kursus-saya/page.tsx`
- `src/app/(peserta)/kursus-saya/[pendaftaranId]/modul/[urutan]/page.tsx`
- `src/app/(peserta)/kursus-saya/[pendaftaranId]/sertifikat/page.tsx`
- `src/app/(peserta)/profil/page.tsx`

Keep their existing outer `div` for now; later tasks clean them.

- [ ] **Step 7: Verify shells**

Run: `npx tsc --noEmit` (expect 0).

Manual at 375px and 1280px:
- Guest `/` sees Navbar + mobile Sheet; no bottom bar.
- Peserta `/kursus-saya` sees one Navbar only (not two).
- `/masuk` has no Navbar and shows the split panel on desktop.
- Sheet closes on link click and Esc.

- [ ] **Step 8: Commit**

```powershell
git add "src/app/(public)" "src/app/(peserta)/layout.tsx" "src/app/(auth)/layout.tsx" src/components/layout/Navbar.tsx src/components/layout/Footer.tsx src/components/layout/PageHeader.tsx src/components/ui/empty-state.tsx "src/app/(public)/page.tsx" "src/app/(public)/kursus" "src/app/(peserta)/kursus-saya/page.tsx" "src/app/(peserta)/kursus-saya/[pendaftaranId]/modul/[urutan]/page.tsx" "src/app/(peserta)/kursus-saya/[pendaftaranId]/sertifikat/page.tsx" "src/app/(peserta)/profil/page.tsx"
git commit -m "feat(ui): add route-group shells and responsive navigation"
```

---

## Task 6: Auth pages

**Files:**
- Modify: `src/app/(auth)/masuk/page.tsx`
- Modify: `src/app/(auth)/daftar/page.tsx`
- Modify: `src/app/(auth)/lupa-password/page.tsx`
- Modify: `src/app/(auth)/atur-ulang-kata-sandi/page.tsx`
- Modify: `src/app/akses-ditolak/page.tsx`
- Modify: `src/components/auth/GoogleAuthButton.tsx`

**Interfaces:**
- Consumes: `Card*`, `Input`, `Label`, `Button`, `Alert*`, `Separator`, `Skeleton`.
- Produces: auth screens that render inside `(auth)/layout.tsx`; no auth logic changes.

- [ ] **Step 1: Restyle the login page**

Keep all hooks, handlers, `kembali`/`pesan` handling, and redirect logic. Replace only markup:
- Page returns a single `Card className="w-full max-w-md"`.
- `CardHeader` with title “Masuk ke Akun Anda” and link to `/daftar`.
- `Alert variant="destructive"` for `pesanParam === "verifikasi_gagal"` and `errorMsg`.
- `Label` + `Input` for email/password; keep the `Eye`/`EyeOff` toggle button with `aria-label`.
- Submit `Button className="w-full"` with `Loader2` spinner.
- `GoogleAuthButton` above a `Separator` labeled “atau dengan email”.

- [ ] **Step 2: Restyle register and password-reset pages**

Apply the same Card/Input/Label/Button/Alert pattern. Preserve every validation rule, Supabase call, countdown, and redirect. Keep inline field errors; do not convert them to toasts.

- [ ] **Step 3: Restyle `akses-ditolak`**

Centered `Card` with `ShieldAlert`, reason text, and the existing Masuk/Kembali actions. No Navbar. Add `id="konten"` to the page's main wrapper so the root skip link works.

- [ ] **Step 4: Restyle `GoogleAuthButton`**

Use `Button variant="outline" className="w-full"` with the existing Google SVG and `Loader2` while loading. Keep the `onError` behavior.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` (expect 0).

Manual:
- `/masuk` wrong password shows the inline destructive alert.
- Password toggle works with keyboard.
- `/daftar` validation messages still appear.
- Google button shows loading state.
- 375px: no horizontal scroll; split panel is hidden.

- [ ] **Step 6: Commit**

```powershell
git add "src/app/(auth)/masuk/page.tsx" "src/app/(auth)/daftar/page.tsx" "src/app/(auth)/lupa-password/page.tsx" "src/app/(auth)/atur-ulang-kata-sandi/page.tsx" src/app/akses-ditolak/page.tsx src/components/auth/GoogleAuthButton.tsx
git commit -m "feat(ui): redesign auth screens"
```

---

## Task 7: Catalog data hooks, filters, card, and `/kursus`

**Files:**
- Create: `src/types/kursus.ts`
- Create: `src/lib/data/kursus-fallback.ts`
- Create: `src/hooks/useKursusCatalog.ts`
- Create: `src/hooks/useKatalogFilters.ts`
- Create: `src/lib/kursus.ts`
- Modify: `src/components/kursus/KursusCard.tsx`
- Modify: `src/components/landing/CourseCatalogSection.tsx`
- Modify: `src/app/(public)/kursus/page.tsx`
- Delete: `src/components/kursus/KursusFilter.tsx` (unused after this task)

**Interfaces:**
- Consumes: `Card`, `Badge`, `Button`, `Input`, `Select`, `Skeleton`, `EmptyState`.
- Produces:
  - `KursusItem` in `src/types/kursus.ts` (same fields as today).
  - `useKursusCatalog(): { courses: KursusItem[]; categories: string[]; loading: boolean }`.
  - `useKatalogFilters(): { q: string; kategori: string; harga: "semua" | "gratis" | "berbayar"; setQ(v: string): void; setKategori(v: string): void; setHarga(v: "semua" | "gratis" | "berbayar"): void; reset(): void }`.
  - `filterKursus(courses: KursusItem[], filters: { q: string; kategori: string; harga: "semua" | "gratis" | "berbayar" }): KursusItem[]`.
  - `CourseCatalogSection` keeps its current props plus optional `loading?: boolean` and `onReset?: () => void`.

- [ ] **Step 1: Extract the type and fallback data**

Move `KursusItem` to `src/types/kursus.ts`. Move the four `INITIAL_COURSES` objects from `src/app/(public)/kursus/page.tsx` into `src/lib/data/kursus-fallback.ts` as `INITIAL_COURSES`. Keep `KursusCard` exporting the type for compatibility:

```ts
export type { KursusItem } from "@/types/kursus";
```

- [ ] **Step 2: Create `useKursusCatalog`**

Port the existing Supabase query and N+1 seat counts from `/kursus` into the hook. Use `useMemo(() => createClient(), [])`. On error, keep `INITIAL_COURSES`; always clear loading in `finally`. Do not change query filters.

```ts
export function useKursusCatalog() {
  // courses: INITIAL_COURSES initially
  // fetch published courses + seat counts
  // categories = unique kategori
}
```

- [ ] **Step 3: Create `useKatalogFilters`**

Use `useSearchParams`, `usePathname`, `useRouter`, `useMemo`, `useCallback`.

Rules:
- Defaults: `q=""`, `kategori="semua"`, `harga="semua"`.
- Invalid `harga` falls back to `"semua"`.
- Omitting a default deletes its param; keep unrelated params untouched.
- `reset()` removes `q`, `kategori`, and `harga` and calls `router.replace` once.
- Update with `router.replace(`${pathname}?${params.toString()}`, { scroll: false })`; if there are no params, use `pathname`.

Also create `src/lib/kursus.ts` with the pure filter used by both pages:

```ts
import type { KursusItem } from "@/types/kursus";

export interface KursusFilters {
  q: string;
  kategori: string;
  harga: "semua" | "gratis" | "berbayar";
}

export function filterKursus(courses: KursusItem[], filters: KursusFilters): KursusItem[] {
  const q = filters.q.trim().toLowerCase();
  return courses.filter((k) => {
    const matchQ =
      !q ||
      [k.judul, k.ringkasan, k.kategori, k.instruktur_nama ?? ""]
        .some((value) => value.toLowerCase().includes(q));
    const matchKategori = filters.kategori === "semua" || k.kategori === filters.kategori;
    const matchHarga =
      filters.harga === "semua" ||
      (filters.harga === "gratis" ? k.harga === 0 : k.harga > 0);
    return matchQ && matchKategori && matchHarga;
  });
}
```

- [ ] **Step 4: Restyle `KursusCard`**

Use `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Badge`, `Button asChild`.
- Category badge: `variant="secondary"`.
- Full: `variant="destructive"`; almost full: `bg-highlight text-highlight-foreground`.
- Price: `text-lg font-semibold`; “Gratis” in `text-emerald-700`.
- CTA: `Button variant="outline" size="sm" asChild` wrapping the detail `Link`.
- Remove gradients, `rounded-2xl`, `animate-pulse`, and hover-lift.

- [ ] **Step 5: Restyle `CourseCatalogSection`**

Keep `id="katalog"` and the existing props. Replace the toolbar with:
- `Input` with `Search` icon and an `X` clear button.
- `Select` for price (`Semua Harga`, `Gratis`, `Berbayar`).
- Category buttons: `Button variant={selected ? "default" : "outline"} size="sm"`.
- “Reset filter” `Button variant="ghost" size="sm"` when any filter is active; it calls `onReset` once (pages pass `filters.reset`), which clears `q`, sets `kategori`/`harga` to `"semua"`, and updates the URL in one `router.replace`.
- Grid `sm:grid-cols-2 lg:grid-cols-3 gap-6`.
- When `loading` is true, render six `Skeleton` cards in that grid instead of the course cards.
- Empty state via `EmptyState` with “Tidak ada kursus yang sesuai” and a reset action.

- [ ] **Step 6: Rewrite `/kursus` page**

```tsx
"use client";

function KatalogContent() {
  const { courses, categories, loading } = useKursusCatalog();
  const filters = useKatalogFilters();
  const filtered = useMemo(
    () => filterKursus(courses, filters),
    [courses, filters.q, filters.kategori, filters.harga]
  );
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CourseCatalogSection
        courses={filtered}
        searchQuery={filters.q}
        onSearchChange={filters.setQ}
        selectedCategory={filters.kategori}
        onCategoryChange={filters.setKategori}
        selectedPrice={filters.harga}
        onPriceChange={filters.setHarga}
        categories={categories}
        loading={loading}
        onReset={filters.reset}
      />
    </main>
  );
}
export default function KursusPage() {
  return <Suspense fallback={<CatalogSkeleton />}>{<KatalogContent />}</Suspense>;
}
```

Remove the page's own `<footer>` (footer is landing-only). Keep the fallback data inside the hook, not the page.

`CatalogSkeleton` can be a local component using `Skeleton` cards (1 hero line + 6 cards).

- [ ] **Step 7: Delete the unused filter component**

Confirm no imports remain:

`Get-ChildItem -Path src -Recurse -File -Include *.tsx | Select-String -Pattern "KursusFilter"`

Then `git rm src/components/kursus/KursusFilter.tsx`.

- [ ] **Step 8: Verify anonymous URL state and fallback**

Run: `npx tsc --noEmit` (expect 0).

Manual in a private window (logged out):
1. Open `/kursus?q=excel&kategori=Administrasi&harga=berbayar`; only matching cards render.
2. Change category to “Semua Kategori”; URL drops `kategori`.
3. Clear search; URL drops `q`.
4. Copy the URL into a new tab; same result, no redirect to `/masuk`.
5. Temporarily block `*.supabase.co` in DevTools or disconnect the network; reload; fallback courses render and the page does not crash.

- [ ] **Step 9: Commit**

```powershell
git add src/types/kursus.ts src/lib/data/kursus-fallback.ts src/hooks/useKursusCatalog.ts src/hooks/useKatalogFilters.ts src/lib/kursus.ts src/components/kursus/KursusCard.tsx src/components/landing/CourseCatalogSection.tsx "src/app/(public)/kursus/page.tsx"
git commit -m "feat(ui): add URL-driven course catalog and card design"
```

---

## Task 8: Landing page

**Files:**
- Create: `src/hooks/useLandingStats.ts`
- Modify: `src/components/landing/HeroSection.tsx`
- Modify: `src/components/landing/ValueProposition.tsx`
- Modify: `src/components/landing/MentorShowcase.tsx`
- Modify: `src/components/landing/TestimonialSection.tsx`
- Modify: `src/components/landing/FaqSection.tsx`
- Modify: `src/components/landing/MascotInteractive.tsx` (colors only; keep SVG and motion logic)
- Modify: `src/app/(public)/page.tsx`
- Keep: `src/components/landing/MascotInteractive.tsx` (do not change behavior)

**Interfaces:**
- Consumes: catalog hooks (Task 7), `Card`, `Badge`, `Button`, `Accordion`, `Avatar`, `Footer`, `Skeleton`.
- Produces: `useLandingStats(): { kursusTerbit: number; pesertaAktif: number; available: boolean; loading: boolean }`.

- [ ] **Step 1: Create `useLandingStats`**

Run two head-only counts in parallel:

```ts
supabase.from("kursus").select("id", { count: "exact", head: true }).eq("status", "terbit")
supabase.from("pendaftaran").select("id", { count: "exact", head: true }).in("status", ["aktif", "selesai"])
```

On error return `{ kursusTerbit: 0, pesertaAktif: 0, available: false, loading: false }`. On success set `available: true` even when a count is `0`. No new tables, RPCs, or migrations.

- [ ] **Step 2: Rewrite the hero**

- Light `bg-muted/30` band, `border-b`, two columns (`lg:grid-cols-12`, text 7 / mascot 5).
- Keep the cycling-phrase state and interval; replace gradient text with `text-primary` and normal weights (`font-semibold`, `tracking-tight`).
- Eyebrow: uppercase `text-xs text-muted-foreground` “Sistem LMS Resmi · Kota Depok”.
- Primary CTA `Button size="lg" asChild` → `#katalog`; secondary `Button variant="outline" size="lg" asChild` → `/daftar`.
- Stats strip under the CTAs: two items (“Kursus terbit”, “Peserta aktif”) only when `available`; use `Separator` between them.
- Keep `<MascotInteractive />` in the right column; do not alter its file's SVG geometry, event handlers, or reduced-motion checks. Replace only its `brand-*`/legacy color classes with `primary`/`muted` tokens.

- [ ] **Step 3: Restyle the value, mentor, and testimonial sections**

- `ValueProposition`: `Card` grid, Lucide icon in `rounded-md bg-secondary p-2`, title `font-semibold`, body `text-sm text-muted-foreground`. Keep all four existing benefit texts.
- `MentorShowcase`: `Card` + `Avatar`/`AvatarFallback` with the existing initials; skills as `Badge variant="secondary"`. Keep the existing three mentors and copy.
- `TestimonialSection`: `Card` with five `Star` icons in `text-amber-500`, quote `text-sm leading-relaxed`, `Avatar` with existing initials. Keep the three testimonials.
- Section headers use `text-2xl sm:text-3xl font-semibold tracking-tight`; remove `font-extrabold`, `rounded-2xl`, and hover-lift.

- [ ] **Step 4: Convert FAQ to `Accordion`**

Add `id="faq"` to the section. Use `Accordion type="single" collapsible defaultValue="faq-0"` with `AccordionItem`, `AccordionTrigger`, `AccordionContent`. Keep all four Q&A strings. Remove the local `openIndex` state.

- [ ] **Step 5: Recompose the landing page**

`src/app/(public)/page.tsx` becomes a client component with a Suspense wrapper:

```tsx
function HomeContent() {
  const { courses, categories, loading } = useKursusCatalog();
  const filters = useKatalogFilters();
  const filtered = useMemo(
    () => filterKursus(courses, filters),
    [courses, filters.q, filters.kategori, filters.harga]
  );
  return (
    <>
      <HeroSection />
      <ValueProposition />
      <CourseCatalogSection
        courses={filtered}
        searchQuery={filters.q}
        onSearchChange={filters.setQ}
        selectedCategory={filters.kategori}
        onCategoryChange={filters.setKategori}
        selectedPrice={filters.harga}
        onPriceChange={filters.setHarga}
        categories={categories}
        loading={loading}
        onReset={filters.reset}
      />
      <MentorShowcase />
      <TestimonialSection />
      <FaqSection />
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-lg border bg-card p-8 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Siap mulai belajar keterampilan baru?</h2>
              <p className="text-sm text-muted-foreground">
                Pilih kursus singkat bersertifikat resmi sesuai kebutuhan kerja atau usaha Anda.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild><Link href="/kursus">Jelajahi Katalog</Link></Button>
              <Button variant="outline" asChild><Link href="/daftar">Daftar Akun</Link></Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
export default function HomePage() {
  return <Suspense fallback={<LandingSkeleton />}>{<HomeContent />}</Suspense>;
}
```

`LandingSkeleton` is a local component: a hero block with two `Skeleton` lines, one `Skeleton` CTA, and a three-card `Skeleton` grid.

Remove `INITIAL_COURSES`, the local Supabase effect, the old inline footer, and the outer `min-h-screen`/`Navbar` wrapper (the layout owns them). Keep the section order.

- [ ] **Step 6: Verify landing**

Run: `npx tsc --noEmit` (expect 0).

Manual at 375px, 768px, 1280px:
- Mascot still tracks the pointer; with `prefers-reduced-motion: reduce` it does not animate.
- `/kursus?kategori=...` filter state also filters the landing catalog and updates the URL.
- Stats appear only when `available` is true; no “0” flash while loading.
- Footer appears only on `/`; `/kursus` has no footer.
- No horizontal overflow.

- [ ] **Step 7: Commit**

```powershell
git add src/hooks/useLandingStats.ts src/components/landing/HeroSection.tsx src/components/landing/ValueProposition.tsx src/components/landing/MentorShowcase.tsx src/components/landing/TestimonialSection.tsx src/components/landing/FaqSection.tsx src/components/landing/MascotInteractive.tsx "src/app/(public)/page.tsx"
git commit -m "feat(ui): redesign landing page with shadcn sections"
```

---

## Task 9: Course detail and registration CTA

**Files:**
- Modify: `src/app/(public)/kursus/[slug]/page.tsx`
- Modify: `src/app/(public)/kursus/[slug]/TombolDaftarKursus.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `Card*`, `Badge`, `Button`, `Accordion`, `Dialog*`, `Alert`, `Separator`, `toast`.
- Produces: detail page with sticky registration card; CTA dialog.

- [ ] **Step 1: Restyle the detail page**

Keep `getKursusData`, `generateMetadata`, fallback data, `notFound()`, and all quota calculations unchanged.
- Replace the breadcrumb band with `PageHeader` (`breadcrumbs`: Beranda `/`, Katalog `/kursus`, current title) inside `max-w-7xl`.
- Main grid stays `lg:grid-cols-3`; left column `lg:col-span-2`.
- Header block: `Card` with category `Badge variant="secondary"`, quota `Badge`, title `text-2xl sm:text-4xl font-semibold tracking-tight`, summary, instructor row with `AvatarFallback`.
- Description block: `Card` with `CardTitle` “Tentang Kursus Ini”.
- Syllabus: `Card` + `Accordion type="single" collapsible`; each module row shows number, title, duration.
- Certificate standard block: `Card className="border-primary/20 bg-primary/5"` with `Award`; keep the exact graduation/certificate copy.
- Sticky right column: `Card` with price, capacity rows, `Separator`, CTA, and the three existing guarantees with `CheckCircle2`.
- Remove `font-extrabold`, gradients, and `rounded-2xl`.

- [ ] **Step 2: Replace the CTA modal with `Dialog`**

In `TombolDaftarKursus.tsx`, keep all state and handlers (`checkRegistration`, RPC call, Mayar redirect, target tab).
- Replace the custom modal wrapper with `Dialog open={isModalOpen} onOpenChange={setIsModalOpen}`.
- `DialogContent` with title “Konfirmasi Pendaftaran Kursus” and description.
- Method choices: two `label` cards with native radio inputs, selected state `border-primary bg-primary/5`.
- Error: `Alert variant="destructive"`.
- Success: `Alert` with `CheckCircle2` and the existing redirect copy.
- Buttons: `Button variant="outline"` Batal + `Button` Setuju & Daftar with `Loader2`.
- Replace every `AlertModal` use with `toast.error` / `toast.success` (including the “Peran Tidak Sesuai” case). Remove the `alertModal` state and import.
- Full/role/existing-registration branches keep their behavior; restyle with `Button`, `Alert`, `Card`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` (expect 0).

Manual:
- Guest clicks “Masuk untuk Mendaftar” → `/masuk?kembali=/kursus/<slug>`.
- Logged-in peserta opens the dialog, Esc closes it, focus returns to the trigger.
- Non-peserta sees the role explanation, not a broken CTA.
- Full course shows a disabled “Kuota Kursus Penuh”.
- Dialog remains usable at 375px (scroll inside content, no horizontal overflow).

- [ ] **Step 4: Commit**

```powershell
git add "src/app/(public)/kursus/[slug]/page.tsx" "src/app/(public)/kursus/[slug]/TombolDaftarKursus.tsx"
git commit -m "feat(ui): redesign course detail and registration dialog"
```

---

## Task 10: Peserta — Kursus Saya

**Files:**
- Modify: `src/app/(peserta)/kursus-saya/page.tsx`
- Modify: `src/components/peserta/ModalPetunjukTransfer.tsx`
- Modify: `src/components/peserta/ModalSimulasiMayar.tsx`
- Modify: `src/components/peserta/ModalUploadBuktiPembayaran.tsx`
- Modify: `src/components/peserta/ModalRekapNilai.tsx`

**Interfaces:**
- Consumes: `Tabs`, `Card*`, `Badge`, `Button`, `Progress`, `Skeleton`, `EmptyState`, `Dialog*`, `Table*`, `ConfirmDialog`, `toast`, `useSearchParams`.
- Produces: URL-driven tab state (`?tab=aktif|menunggu_bayar|selesai|riwayat|semua`); dialog-based payment flows.

- [ ] **Step 1: Make the tab URL-driven**

Wrap the export in `Suspense` (because `useSearchParams` is used). Initialize `activeTab` from `?tab=` and validate against the union. Define `handleTabChange(next: TabFilter)` to set state and call `router.replace(`/kursus-saya?tab=${next}`, { scroll: false })`; omit `tab` for `aktif` (default). Pass it to `Tabs onValueChange`. In the existing effect that reads URL params after a payment redirect, remove the `setActiveTab(tabParam)` branch (the new initializer owns tab state) and keep the `pendaftaran_id` handling that opens the proof-upload dialog.

- [ ] **Step 2: Restyle the header and KPIs**

- `PageHeader title="Ruang Kursus Saya"` with description.
- Four KPI `Card`s: Sedang Belajar, Menunggu Bayar, Selesai, Total. Value `text-2xl font-semibold`; label `text-sm text-muted-foreground`.
- Replace the custom tab bar with `Tabs value={activeTab} onValueChange={handleTabChange}` and `TabsList` (horizontal scroll on mobile) + `TabsTrigger` with a count `Badge variant="secondary"`.

- [ ] **Step 3: Restyle the course cards**

- Loading: 6 `Skeleton` cards instead of a spinner.
- Empty: `EmptyState` with the existing per-tab icon/copy and a `Button asChild` to `/kursus`.
- Card: `Card` header with category + status `Badge`; title; instructor/module metadata; `Progress value={progressPct}`; footer actions.
- Status colors: active `variant="secondary"` + green dot, waiting `bg-highlight text-highlight-foreground`, completed `variant="secondary"` + `Award`, expired/cancelled `variant="outline"`.
- Actions stay the same: Buka Kelas, Bayar, Unggah Bukti, Petunjuk Transfer, Rekap Nilai, Sertifikat, Batalkan.
- Remove countdown pulse animation; keep the countdown text.

- [ ] **Step 4: Convert payment modals to `Dialog`**

For each of the four modal components, keep props and all Supabase logic; replace the fixed-overlay markup:
- `Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}`.
- `DialogContent` with `DialogHeader`/`DialogTitle`/`DialogDescription`.
- `DialogFooter` with `Button` actions.
- `ModalUploadBuktiPembayaran`: keep file validation (5 MB; JPG/PNG/WEBP/PDF), preview, `unggah_bukti_pembayaran` RPC, fallback update, and `onSuccess()`; replace the success banner with `toast.success("Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.")` immediately followed by `onSuccess(); onClose();` (remove the 1200ms timeout).
- `ModalSimulasiMayar`/`ModalPetunjukTransfer`: same content, shadcn styling.
- `ModalRekapNilai`: keep props and data; render scores in a `Table` inside a `Dialog`.

- [ ] **Step 5: Replace cancel confirmation and alerts**

- Replace `ConfirmModal` with `ConfirmDialog` (same props) for “Batalkan Pendaftaran”.
- Replace `AlertModal` state/markup with `toast.error` / `toast.success` for all payment/cancel messages. Remove the `alertModal` state and imports.
- Keep the BR-07 pre-check query before opening the cancel dialog.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` (expect 0).

Manual:
1. `/kursus-saya` defaults to “Sedang Belajar”; `/kursus-saya?tab=selesai` opens the Selesai tab and copies correctly.
2. Clicking a tab updates the URL without a full reload.
3. Loading shows skeletons, then cards.
4. Cancel dialog: Esc closes, focus returns, confirm calls the same RPC and shows a toast.
5. Upload proof: 6 MB file is rejected; valid image previews and uploads; toast on success.
6. At 375px the tab strip scrolls horizontally and cards do not overflow.

- [ ] **Step 7: Commit**

```powershell
git add "src/app/(peserta)/kursus-saya/page.tsx" src/components/peserta/ModalPetunjukTransfer.tsx src/components/peserta/ModalSimulasiMayar.tsx src/components/peserta/ModalUploadBuktiPembayaran.tsx src/components/peserta/ModalRekapNilai.tsx
git commit -m "feat(ui): redesign peserta course dashboard and payment dialogs"
```

---

## Task 11: Peserta — Ruang Belajar

**Files:**
- Modify: `src/app/(peserta)/kursus-saya/[pendaftaranId]/modul/[urutan]/page.tsx`
- Modify: `src/components/peserta/SidebarModul.tsx`
- Modify: `src/components/peserta/FormKuis.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `Card*`, `Button`, `Badge`, `Sheet*`, `Skeleton`, `Alert`, `toast`.
- Produces: desktop sidebar + mobile module `Sheet`; restyled quiz.

- [ ] **Step 1: Restyle the learning room shell**

- `PageHeader` with breadcrumbs: Kursus Saya `/kursus-saya` → course title → “Modul N”.
- Keep the “Lihat Sertifikat” action when `isCourseCompleted`.
- Loading: content `Skeleton`s (title, video, text) instead of a spinner.
- Error: `Card` + `Alert variant="destructive"` + back `Button`.
- Completion banner: `Card className="border-emerald-200 bg-emerald-50"` with the existing copy and `Button` to the certificate.

- [ ] **Step 2: Add the mobile module Sheet**

- Desktop `lg:col-span-1` keeps `<SidebarModul />`.
- On mobile (`lg:hidden`), render a `Sheet` with `SheetTrigger asChild` `Button variant="outline"` “Daftar Modul” and `SheetContent side="left"` containing `SidebarModul`.
- Control the module Sheet with local `open` state and close it in a `useEffect` when `currentUrutan` changes, so selecting a module dismisses the sheet.
- Keep the content column `order-1`, sidebar `order-2 lg:order-1`; remove the mobile inline sidebar so the module content is first.

- [ ] **Step 3: Restyle module content**

- Title block: `Card` with `Badge variant="secondary"` “Modul N”, clock meta, title.
- Video: `Card` with `aspect-video`; keep the iframe, `getEmbedUrl`, and external link.
- Reading: `Card` with `FileText` heading and `prose`-free text block (`whitespace-pre-line leading-relaxed`).
- PDF: `Card className="border-primary/20 bg-primary/5"` with download `Button`.
- Mark-read: `Button` with `Loader2`; success state `Badge`/`Alert` with `CheckCircle2`.
- Locked module: `Card className="border-highlight bg-highlight/40"` with `Lock`, existing explanation, and `Button` to the previous module.
- Replace both `alert()` calls with `toast.error`.

- [ ] **Step 4: Restyle `SidebarModul`**

Use `Card` + `CardHeader`/`CardContent`; locked rows `text-muted-foreground` with `Lock`; active row `bg-secondary text-foreground`; completed rows keep the emerald check; certificate link as `Button variant="outline" asChild`. Keep the `ModulStatusItem` interface unchanged.

- [ ] **Step 5: Restyle `FormKuis`**

Keep all state, Supabase calls, scoring, attempt history, and early returns. Replace markup only:
- Question `Card`s with numbered heading.
- Options as `<label>` rows: `rounded-md border p-3`; selected `border-primary bg-primary/5`; keep native radio inputs for accessibility.
- Submit/reset `Button`s; error `Alert`.
- Result modal → `Dialog` with `DialogTitle` “Hasil Evaluasi”, score, pass/fail `Badge`, and the existing next-module link.
- Loading: `Skeleton` question blocks.
- Keep Indonesian copy and the pass threshold behavior.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` (expect 0).

Manual:
1. Desktop: sidebar visible; mobile: “Daftar Modul” opens the left Sheet and closes on selection.
2. Locked module shows the explanation; previous-module button works.
3. Mark-read persists after reload; toast appears on failure (simulate by blocking the request).
4. Quiz: select answers, submit, result dialog opens; Esc closes.
5. Keyboard: radio options are reachable; focus ring visible.

- [ ] **Step 7: Commit**

```powershell
git add "src/app/(peserta)/kursus-saya/[pendaftaranId]/modul/[urutan]/page.tsx" src/components/peserta/SidebarModul.tsx src/components/peserta/FormKuis.tsx
git commit -m "feat(ui): redesign learning room and quiz"
```

---

## Task 12: Peserta — Certificate and Profile

**Files:**
- Modify: `src/app/(peserta)/kursus-saya/[pendaftaranId]/sertifikat/page.tsx`
- Modify: `src/components/peserta/SertifikatView.tsx`
- Modify: `src/app/(peserta)/profil/page.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `Card*`, `Button`, `Table*`, `Dialog*`, `Pagination`, `EmptyState`, `Skeleton`, `toast`.
- Produces: print-safe certificate and restyled profile; no data logic changes.

- [ ] **Step 1: Restyle the certificate toolbar only**

In `SertifikatView.tsx`, change only the `no-print` toolbar:
- Back link → `Button variant="ghost" asChild`.
- Print button → `Button` with `Printer`.
- Keep the entire `.certificate-sheet` markup, serif typography, `#1E3A8A`/`#C59B27` colors, SVG seal, and print classes unchanged. The certificate is exempt from the new typography rules because it is a printed document.

- [ ] **Step 2: Restyle the certificate page states**

- Loading: `Skeleton` block.
- Error: `Card` + `Alert variant="destructive"` + back `Button`; keep the existing messages.
- Wrap the content in `max-w-7xl`; the layout Navbar already has `print:hidden` from Task 5. Any page-level header or action added here also needs `print:hidden`.

- [ ] **Step 3: Restyle the profile page**

Keep all queries, role branches, save handlers, audit-log pagination, and modals.
- `PageHeader title="Profil & Pengaturan Akun"`.
- Identity + form in a `Card` grid: `Label`/`Input` for name and phone; save `Button` with `Loader2`; email read-only.
- While `loadingData` is true, render a `Skeleton` form block and `Skeleton` table rows instead of the role panels.
- Peserta transcript: `Card` + `Table` (`TableHeader`/`TableRow`/`TableHead`/`TableCell`) + `Badge` for pass/fail.
- Instruktur courses and admin audit logs: use `Table` + `Badge`; keep existing columns and data. (Wave 2 restyles the admin shell, not these tables.)
- Replace `AlertModal` with `toast.success`/`toast.error`; remove the `alertModal` state/import.
- Replace the profile page's custom JSON detail overlay with `Dialog` + `pre` JSON block; keep the selected-log state.
- Replace the old `Pagination` import with `@/components/ui/Pagination` (same API).

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` (expect 0).

Manual:
1. `/profil` as peserta: save name/phone → toast; reload shows persisted values.
2. Transcript table renders; the admin audit JSON dialog opens/closes with the keyboard.
3. Admin/instruktur profile views still render without errors (data logic untouched).
4. Certificate: `Ctrl+P` preview shows only the sheet, one A4 page, no navbar/buttons; colors and seals intact.
5. Print styles still hide `.no-print` elements.

- [ ] **Step 5: Commit**

```powershell
git add "src/app/(peserta)/kursus-saya/[pendaftaranId]/sertifikat/page.tsx" src/components/peserta/SertifikatView.tsx "src/app/(peserta)/profil/page.tsx"
git commit -m "feat(ui): redesign certificate and profile screens"
```

---

## Task 13: Wave 1 verification and cleanup

**Files:**
- Modify only files required by fixes found below.

**Interfaces:**
- Consumes: all Wave 1 tasks.
- Produces: a green Wave 1 branch.

- [ ] **Step 1: Static checks**

Run: `npx tsc --noEmit`
Expected: exit code 0.

Run: `npm run build`
Expected: successful build.

- [ ] **Step 2: Check for leftover legacy UI in Wave 1 areas**

```powershell
Get-ChildItem -Path "src/app/(public)","src/app/(auth)","src/app/(peserta)" -Recurse -File -Include *.tsx | Select-String -Pattern 'AlertModal|ConfirmModal|bg-slate-50|text-slate-900|brand-'
Get-ChildItem -Path "src/components/landing","src/components/kursus","src/components/peserta","src/components/auth" -Recurse -File -Include *.tsx | Select-String -Pattern 'AlertModal|ConfirmModal'
Get-ChildItem -Path "src/app/(public)","src/app/(peserta)" -Recurse -File -Include *.tsx | Select-String -Pattern 'components/layout/Navbar'
```

Expected: no `AlertModal`/`ConfirmModal` in `(public)`, `(auth)`, `(peserta)`, landing, catalog, peserta components, or auth components, and no direct `Navbar` imports in the public/peserta pages. Legacy `brand-`/`slate-` may remain only in files explicitly deferred to Wave 2 and in the certificate's print palette; list any remainder in the final report.

- [ ] **Step 3: Run the manual matrix**

For each role (guest, peserta at minimum) and width (375, 768, 1280):
- `/`, `/kursus`, `/kursus/[slug]`, `/masuk`, `/daftar`, `/kursus-saya`, a module page, `/sertifikat`, `/profil`.
- Check: no horizontal scroll, one Navbar, no bottom bar, focus visible, Sheet/Dialog close with Esc, footer only on `/`.
- Check loading, empty, and error states where applicable.
- Capture before/after screenshots for the review message (save outside the repo or attach to the PR; do not commit binary images).

- [ ] **Step 4: Fix regressions and re-run checks**

Fix only defects found in Steps 1–3. Repeat `npx tsc --noEmit` and `npm run build` after fixes.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "fix(ui): resolve wave 1 verification findings"
```

If there are no changes, skip the commit.

---

## Wave 1 Definition of Done

- Tokens and primitives from Tasks 1–4 are the only styling source for migrated pages.
- Public, auth, and peserta pages use the new shells; no page imports `Navbar` directly.
- Catalog filters and tabs are URL-shareable for guests.
- Landing keeps the mascot, shows stats only when available, and is the only page with a footer.
- Certificate print output is unchanged in layout and content.
- `npx tsc --noEmit` and `npm run build` pass on `redesign/shadcn-ui`.
- Wave 2 (instruktur/admin) is not started until this branch is reviewed and approved.
