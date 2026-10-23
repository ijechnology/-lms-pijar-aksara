"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldX, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

function AksesDitolakContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alasan = searchParams.get("alasan");
  const { role, user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

  const handleKeHalamanLogin = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Gagal logout:", err);
    } finally {
      router.push("/masuk");
    }
  };

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
              Login sebagai:{" "}
              <span className="font-semibold text-slate-800">{user.email}</span>
            </p>
            <p>
              Peran aktif:{" "}
              <span className="font-semibold capitalize text-brand-600">
                {role || "Tamu"}
              </span>
            </p>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handleKeHalamanLogin}
            disabled={loggingOut}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition disabled:opacity-60 cursor-pointer"
          >
            {loggingOut ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>Kembali ke Halaman Masuk</span>
          </button>
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
