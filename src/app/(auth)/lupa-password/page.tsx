"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const targetEmail = email.trim().toLowerCase();

    try {
      const redirectUrl = `${window.location.origin}/atur-ulang-kata-sandi`;
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      setSubmittedEmail(targetEmail);
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengirimkan tautan reset kata sandi.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !submittedEmail) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const redirectUrl = `${window.location.origin}/atur-ulang-kata-sandi`;
      const { error } = await supabase.auth.resetPasswordForEmail(
        submittedEmail,
        {
          redirectTo: redirectUrl,
        }
      );
      if (error) throw error;

      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengirim ulang email reset.";
      setErrorMsg(msg);
    } finally {
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
          Lupa Kata Sandi?
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Masukkan email akun Anda untuk menerima tautan pengaturan ulang kata sandi.
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

          {submittedEmail ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Tautan Reset Telah Dikirim!
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Kami telah mengirimkan instruksi pemulihan kata sandi ke:
                </p>
                <div className="mt-1 inline-block px-3 py-1 bg-slate-100 text-slate-800 font-semibold text-sm rounded-lg">
                  {submittedEmail}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-800 space-y-1">
                <p className="font-semibold">Catatan penting:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Buka kotak masuk atau folder spam di email Anda.</li>
                  <li>Klik tombol / tautan konfirmasi untuk membuat kata sandi baru.</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || resendCooldown > 0}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition disabled:opacity-50"
                >
                  {resendCooldown > 0
                    ? `Kirim Ulang (${resendCooldown}s)`
                    : "Kirim Ulang Tautan"}
                </button>

                <Link
                  href="/masuk"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Masuk
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email Akun
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

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/25 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" /> Kirim Tautan Reset
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/masuk"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-500 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Ingat kata sandi? Masuk di sini
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
