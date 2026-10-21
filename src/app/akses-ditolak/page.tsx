"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldX, ArrowLeft, Home, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function AksesDitolakContent() {
  const searchParams = useSearchParams();
  const alasan = searchParams.get("alasan");
  const { role, user } = useAuth();

  const getDashboardLink = () => {
    if (role === "admin") return { href: "/admin/dashboard", label: "Dasbor Admin" };
    if (role === "instruktur") return { href: "/instruktur/kursus", label: "Kelola Kursus" };
    if (role === "peserta") return { href: "/kursus-saya", label: "Kursus Saya" };
    return { href: "/", label: "Beranda Katalog" };
  };

  const dashLink = getDashboardLink();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldX className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold tracking-wider uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            HTTP 403 - Akses Ditolak
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {alasan === "akun_nonaktif"
              ? "Akun Anda Sedang Dinonaktifkan"
              : "Anda Tidak Memiliki Hak Akses"}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {alasan === "akun_nonaktif"
              ? "Akun ini telah dinonaktifkan oleh administrator lembaga. Silakan hubungi pengelola LMS Pijar Aksara."
              : "Halaman yang Anda tuju memerlukan wewenang peran yang berbeda dari akun Anda saat ini."}
          </p>
        </div>

        {user && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <p>
              Login sebagai: <span className="font-semibold text-slate-800">{user.email}</span>
            </p>
            <p>
              Peran aktif:{" "}
              <span className="font-semibold capitalize text-brand-600">
                {role || "Tamu"}
              </span>
            </p>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <Home className="w-4 h-4" /> Beranda
          </Link>
          <Link
            href={dashLink.href}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition"
          >
            <UserCheck className="w-4 h-4" /> Buka {dashLink.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AksesDitolakPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
        </div>
      }
    >
      <AksesDitolakContent />
    </Suspense>
  );
}
