"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  UserPlus,
  AlertCircle,
  Mail,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function RegisterPage() {
  const router = useRouter();
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status tampilan notifikasi verifikasi email
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

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
      setErrorMsg(
        "Format nomor HP harus diawali 08 dengan 10 sampai 13 digit angka."
      );
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
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const targetEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: targetEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
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

      // Pastikan baris di profiles dibuat jika data user tersedia
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          nama_lengkap: namaLengkap.trim(),
          email: targetEmail,
          no_hp: noHp.trim() || null,
          peran: "peserta",
          aktif: true,
        });

        // Jika data.session null, pengguna harus memverifikasi email terlebih dahulu
        if (!data.session) {
          setRegisteredEmail(targetEmail);
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
          setLoading(false);
          return;
        }

        // Jika sesi langsung aktif
        setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke ruang belajar...");
        setTimeout(() => {
          router.push("/kursus-saya");
        }, 1200);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat pendaftaran.";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !registeredEmail || resending) return;
    setResending(true);
    setResendStatus(null);
    setErrorMsg(null);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: registeredEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      setResendStatus("Email verifikasi baru berhasil dikirimkan!");
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
          : "Gagal mengirim ulang email verifikasi.";
      setErrorMsg(msg);
    } finally {
      setResending(false);
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
          {registeredEmail ? "Verifikasi Email Anda" : "Buat Akun Peserta Baru"}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          {registeredEmail ? (
            "Langkah terakhir untuk mengaktifkan akun belajar Anda"
          ) : (
            <>
              Sudah punya akun?{" "}
              <Link
                href="/masuk"
                className="font-semibold text-brand-600 hover:text-brand-500 transition"
              >
                Masuk di sini
              </Link>
            </>
          )}
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

          {/* Tampilan Konfirmasi Email Sukses Daftar */}
          {registeredEmail ? (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-inner">
                <Mail className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Cek Kotak Masuk Email Anda
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Kami telah mengirimkan tautan verifikasi pendaftaran ke:
                </p>
                <div className="mt-2 inline-block px-3.5 py-1.5 bg-slate-100 text-slate-900 font-semibold text-sm rounded-xl border border-slate-200">
                  {registeredEmail}
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" /> Instruksi Verifikasi:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>Buka aplikasi atau web email Anda.</li>
                  <li>Cari email dari <strong>Pijar Aksara</strong> (periksa juga folder <em>Spam / Promosi</em>).</li>
                  <li>Klik tombol / tautan <strong>Verifikasi Email</strong>.</li>
                  <li>Setelah diklik, Anda akan langsung otomatis masuk ke akun Anda.</li>
                </ol>
              </div>

              {resendStatus && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800">
                  {resendStatus}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending || resendCooldown > 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${resending ? "animate-spin" : ""}`}
                  />
                  {resendCooldown > 0
                    ? `Kirim Ulang Email (${resendCooldown}s)`
                    : "Kirim Ulang Email Verifikasi"}
                </button>

                <Link
                  href="/masuk"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 transition"
                >
                  Sudah verifikasi? Buka Halaman Masuk{" "}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Tombol Daftar dengan Google */}
              <div className="mb-5">
                <GoogleAuthButton
                  label="Daftar dengan Google"
                  onError={(err) => setErrorMsg(err)}
                />
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
                      atau daftar dengan email
                    </span>
                  </div>
                </div>
              </div>

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
                  <div className="relative mt-1">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
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

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      className="block w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      aria-label={
                        showConfirmPassword ? "Sembunyikan sandi" : "Lihat sandi"
                      }
                    >
                      {showConfirmPassword ? (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
