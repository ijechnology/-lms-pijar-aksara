"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const { user, profile, role, isLoading, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (r: string | null) => {
    switch (r) {
      case "admin":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Admin
          </span>
        );
      case "instruktur":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            Instruktur
          </span>
        );
      case "peserta":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Peserta
          </span>
        );
      default:
        return null;
    }
  };

  const navLinks = [
    { href: "/", label: "Katalog Kursus", icon: BookOpen, show: true },
    {
      href: "/kursus-saya",
      label: "Kursus Saya",
      icon: GraduationCap,
      show: role === "peserta",
    },
    {
      href: "/instruktur/kursus",
      label: "Kelola Kursus",
      icon: LayoutDashboard,
      show: role === "instruktur",
    },
    {
      href: "/admin",
      label: "Panel Admin",
      icon: ShieldAlert,
      show: role === "admin",
    },
    {
      href: "/admin/dashboard",
      label: "Dasbor Analitik",
      icon: LayoutDashboard,
      show: role === "admin",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
              PA
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-brand-600 transition block leading-tight">
                Pijar Aksara
              </span>
              <span className="text-[11px] text-slate-500 tracking-wide block">
                Lembaga Kursus Depok
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((item) => item.show)
              .map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === link.href || pathname.startsWith(link.href + "/");
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
          </nav>

          {/* Desktop Right Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-8 bg-slate-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <Link
                  href="/profil"
                  className="flex items-center gap-2.5 text-right hover:bg-slate-100/80 px-2.5 py-1.5 rounded-xl transition group cursor-pointer"
                  title="Profil & Pengaturan Akun"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 leading-tight">
                      {profile?.nama_lengkap || user.email?.split("@")[0]}
                    </div>
                    <div className="mt-0.5">{getRoleBadge(role)}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-xs group-hover:bg-brand-600 group-hover:text-white transition">
                    <User className="w-4 h-4" />
                  </div>
                </Link>

                <button
                  onClick={signOut}
                  title="Keluar Akun"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/masuk"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-500/30 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Daftar Akun
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col gap-1">
            {navLinks
              .filter((item) => item.show)
              .map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === link.href || pathname.startsWith(link.href + "/");
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium transition ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-3">
                <Link
                  href="/profil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                  title="Profil & Pengaturan Akun"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {profile?.nama_lengkap || user.email}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  {getRoleBadge(role)}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" /> Keluar Akun
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/masuk"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow transition"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
