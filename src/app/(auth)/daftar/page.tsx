"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validasi dasar
    if (namaLengkap.trim().length < 3 || namaLengkap.trim().length > 100) {
      setErrorMsg("Nama lengkap harus antara 3 sampai 100 karakter.");
      setLoading(false);
      return;
    }

    if (noHp && !/^08[0-9]{8,11}$/.test(noHp.trim())) {
      setErrorMsg("Format nomor HP harus diawali 08 dengan 10 sampai 13 digit angka.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            nama_lengkap: namaLengkap.trim(),
            no_hp: noHp.trim() || null,
            peran: "peserta",
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Pastikan baris di profiles dibuat jika trigger auth belum dieksekusi di database
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          nama_lengkap: namaLengkap.trim(),
          email: email.trim().toLowerCase(),
          no_hp: noHp.trim() || null,
          peran: "peserta",
          aktif: true,
        });

        setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke ruang belajar...");
        setTimeout(() => {
          router.push("/kursus-saya");
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran.";
      setErrorMsg(msg);
      setLoading(false);
    }
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
          Buat Akun Peserta Baru
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link
            href="/masuk"
            className="font-semibold text-brand-600 hover:text-brand-500 transition"
          >
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="namaLengkap"
                className="block text-sm font-medium text-slate-700"
              >
                Nama Lengkap (untuk Sertifikat)
              </label>
              <input
                id="namaLengkap"
                type="text"
                required
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Nama Lengkap Sesuai KTP"
                className="mt-1 block w-full px-3.5 py-2.5 rounded-xl border border-slate-300 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
            </div>

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
              <label
                htmlFor="noHp"
                className="block text-sm font-medium text-slate-700"
              >
                Nomor WhatsApp / HP
              </label>
              <input
                id="noHp"
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="mt-1 block w-full px-3.5 py-2.5 rounded-xl border border-slate-300 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-slate-500">
                Format 08xxxxxxxxxx (10–13 digit)
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="mt-1 block w-full px-3.5 py-2.5 rounded-xl border border-slate-300 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700"
              >
                Konfirmasi Kata Sandi
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi"
                className="mt-1 block w-full px-3.5 py-2.5 rounded-xl border border-slate-300 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/25 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Daftar Akun Peserta
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
