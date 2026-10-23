"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, AlertCircle, Sparkles, Key, Check, Eye, EyeOff, Info } from "lucide-react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kembali = searchParams.get("kembali");
  const pesanParam = searchParams.get("pesan");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        const errLower = error.message.toLowerCase();
        if (errLower.includes("email not confirmed")) {
          setErrorMsg("Email Anda belum dikonfirmasi. Silakan periksa tautan verifikasi di kotak masuk atau spam email Anda.");
        } else if (errLower.includes("invalid login credentials")) {
          setErrorMsg("Email atau kata sandi tidak cocok. Silakan periksa kembali.");
        } else {
          setErrorMsg(error.message || "Email atau kata sandi tidak cocok. Silakan periksa kembali.");
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Cek peran untuk pengalihan default jika tidak ada url kembali
        const { data: profile } = await supabase
          .from("profiles")
          .select("peran, aktif")
          .eq("id", data.user.id)
          .single();

        if (profile && !profile.aktif) {
          await supabase.auth.signOut();
          setErrorMsg("Akun ini sedang dinonaktifkan. Silakan hubungi admin lembaga.");
          setLoading(false);
          return;
        }

        if (kembali) {
          router.push(kembali);
        } else if (profile?.peran === "admin") {
          router.push("/admin/dashboard");
        } else if (profile?.peran === "instruktur") {
          router.push("/instruktur/kursus");
        } else {
          router.push("/kursus-saya");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk akun.";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const setTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword("Latihan#2026");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
            PA
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Pijar Aksara
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Masuk ke Akun Anda
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Belum punya akun?{" "}
          <Link
            href="/daftar"
            className="font-semibold text-brand-600 hover:text-brand-500 transition"
          >
            Daftar gratis di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {pesanParam === "verifikasi_gagal" && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900 text-sm">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-700" />
              <span>Tautan verifikasi email tidak valid atau telah kedaluwarsa. Silakan periksa kembali tautan terbaru di email Anda.</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tombol Masuk dengan Google */}
          <div className="mb-5">
            <GoogleAuthButton
              label="Masuk dengan Google"
              onError={(err) => setErrorMsg(err)}
            />
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
                  atau dengan email
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="mt-1 block w-full px-3.5 py-2.5 rounded-xl border border-slate-300 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Kata Sandi
                </label>
                <Link
                  href="/lupa-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/25 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Masuk
                </>
              )}
            </button>
          </form>

          {/* Akses Cepat Akun Uji Resmi */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-accent-600" /> Akun Uji Coba Cepat (Password: Latihan#2026)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTestAccount("ratna@pijaraksara.test")}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium text-center transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setTestAccount("yudha@pijaraksara.test")}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-medium text-center transition"
              >
                Instruktur
              </button>
              <button
                type="button"
                onClick={() => setTestAccount("nadia.putri@pijaraksara.test")}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium text-center transition"
              >
                Peserta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
