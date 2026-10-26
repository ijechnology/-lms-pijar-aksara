"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: typeof BookOpen;
};

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "PA";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function roleLabel(role: string | null) {
  if (role === "admin") return "Admin";
  if (role === "instruktur") return "Instruktur";
  if (role === "peserta") return "Peserta";
  return null;
}

function isLinkActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const { user, profile, role, isLoading, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links: NavLink[] =
    role === "admin"
      ? [{ href: "/admin/dashboard", label: "Panel Admin", icon: ShieldCheck }]
      : role === "instruktur"
        ? [
            { href: "/kursus", label: "Katalog", icon: BookOpen },
            {
              href: "/instruktur/kursus",
              label: "Kelola Kursus",
              icon: LayoutDashboard,
            },
          ]
        : role === "peserta"
          ? [
              { href: "/kursus", label: "Katalog", icon: BookOpen },
              { href: "/kursus-saya", label: "Kursus Saya", icon: GraduationCap },
            ]
          : [
              { href: "/kursus", label: "Katalog", icon: BookOpen },
              { href: "/#faq", label: "FAQ", icon: HelpCircle },
            ];

  const displayName = profile?.nama_lengkap || user?.email?.split("@")[0] || "Akun";
  const panelHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "instruktur"
        ? "/instruktur/kursus"
        : "/kursus-saya";

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur print:hidden">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold tracking-tight text-primary-foreground">
            PA
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold tracking-tight text-foreground">
              Pijar Aksara
            </span>
            <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">
              Lembaga Kursus Depok
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {links.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isLoading ? (
            <Skeleton className="h-8 w-24 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-accent"
                  aria-label="Buka menu akun"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials(profile?.nama_lengkap, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-28 truncate text-sm font-medium">
                    {displayName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block truncate text-sm font-semibold">
                    {displayName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                  {roleLabel(role) && (
                    <Badge variant="secondary" className="mt-2">
                      {roleLabel(role)}
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profil">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={panelHref}>
                    {role === "admin" ? "Panel Admin" : "Area Saya"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut className="h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/masuk">Masuk</Link>
              </Button>
              <Button asChild>
                <Link href="/daftar">Daftar</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center md:hidden">
          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent"
              aria-label={user ? "Buka menu akun" : "Buka menu navigasi"}
            >
              {user ? (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials(profile?.nama_lengkap, user.email)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[86vw] max-w-sm">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1" aria-label="Navigasi seluler">
            {links.map((link) => {
              const active = isLinkActive(pathname, link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-5" />

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {initials(profile?.nama_lengkap, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              {roleLabel(role) && (
                <Badge variant="secondary">{roleLabel(role)}</Badge>
              )}
              <div className="grid gap-2">
                <Button variant="outline" asChild>
                  <Link href="/profil" onClick={() => setMobileOpen(false)}>
                    Profil
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setMobileOpen(false);
                    void signOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/masuk" onClick={() => setMobileOpen(false)}>
                  Masuk
                </Link>
              </Button>
              <Button asChild>
                <Link href="/daftar" onClick={() => setMobileOpen(false)}>
                  Daftar
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
}
