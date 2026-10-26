"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  RefreshCw,
  UserPlus,
} from "lucide-react";

import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

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

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          nama_lengkap: namaLengkap.trim(),
          email: targetEmail,
          no_hp: noHp.trim() || null,
          peran: "peserta",
          aktif: true,
        });

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
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">
          {registeredEmail ? "Verifikasi Email Anda" : "Buat Akun Peserta Baru"}
        </CardTitle>
        <CardDescription>
          {registeredEmail ? (
            "Langkah terakhir untuk mengaktifkan akun belajar Anda"
          ) : (
            <>
              Sudah punya akun?{" "}
              <Link
                href="/masuk"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Masuk di sini
              </Link>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        {registeredEmail ? (
          <div className="space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-7 w-7" />
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-lg font-semibold">Cek Kotak Masuk Email Anda</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Kami telah mengirimkan tautan verifikasi pendaftaran ke:
              </p>
              <p className="inline-block max-w-full truncate rounded-md border bg-muted px-3 py-1.5 text-sm font-medium">
                {registeredEmail}
              </p>
            </div>

            <Alert className="border-highlight bg-highlight text-highlight-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold">Instruksi verifikasi:</p>
                <ol className="mt-1 list-inside list-decimal space-y-1">
                  <li>Buka aplikasi atau web email Anda.</li>
                  <li>
                    Cari email dari <strong>Pijar Aksara</strong> (periksa juga
                    folder Spam/Promosi).
                  </li>
                  <li>
                    Klik tombol atau tautan <strong>Verifikasi Email</strong>.
                  </li>
                  <li>
                    Setelah diklik, Anda akan langsung otomatis masuk ke akun
                    Anda.
                  </li>
                </ol>
              </AlertDescription>
            </Alert>

            {resendStatus && (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{resendStatus}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendVerification}
                disabled={resending || resendCooldown > 0}
              >
                <RefreshCw
                  className={`h-4 w-4 ${resending ? "animate-spin" : ""}`}
                />
                {resendCooldown > 0
                  ? `Kirim Ulang Email (${resendCooldown}s)`
                  : "Kirim Ulang Email Verifikasi"}
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/masuk">
                  Sudah verifikasi? Buka Halaman Masuk
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <GoogleAuthButton
              label="Daftar dengan Google"
              onError={(err) => setErrorMsg(err)}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">
                  atau daftar dengan email
                </span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namaLengkap">
                  Nama Lengkap (untuk Sertifikat)
                </Label>
                <Input
                  id="namaLengkap"
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Nama Lengkap Sesuai KTP"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noHp">Nomor WhatsApp / HP</Label>
                <Input
                  id="noHp"
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  autoComplete="tel"
                />
                <p className="text-xs text-muted-foreground">
                  Format 08xxxxxxxxxx (10–13 digit)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-transparent"
                    aria-label={
                      showPassword ? "Sembunyikan sandi" : "Lihat sandi"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-transparent"
                    aria-label={
                      showConfirmPassword
                        ? "Sembunyikan sandi"
                        : "Lihat sandi"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Daftar Akun Peserta
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
