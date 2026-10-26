"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Info, Loader2, LogIn } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

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
          setErrorMsg(
            "Email Anda belum dikonfirmasi. Silakan periksa tautan verifikasi di kotak masuk atau spam email Anda."
          );
        } else if (errLower.includes("invalid login credentials")) {
          setErrorMsg(
            "Email atau kata sandi tidak cocok. Silakan periksa kembali."
          );
        } else {
          setErrorMsg(
            error.message ||
              "Email atau kata sandi tidak cocok. Silakan periksa kembali."
          );
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("peran, aktif")
          .eq("id", data.user.id)
          .single();

        if (profile && !profile.aktif) {
          await supabase.auth.signOut();
          setErrorMsg(
            "Akun ini sedang dinonaktifkan. Silakan hubungi admin lembaga."
          );
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
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat masuk akun.";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Masuk ke Akun Anda</CardTitle>
        <CardDescription>
          Belum punya akun?{" "}
          <Link
            href="/daftar"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Daftar gratis di sini
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {pesanParam === "verifikasi_gagal" && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Tautan verifikasi email tidak valid atau telah kedaluwarsa.
              Silakan periksa kembali tautan terbaru di email Anda.
            </AlertDescription>
          </Alert>
        )}

        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <GoogleAuthButton
          label="Masuk dengan Google"
          onError={(err) => setErrorMsg(err)}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">
              atau dengan email
            </span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata Sandi</Label>
              <Link
                href="/lupa-password"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-transparent"
                aria-label={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
              >
                {showPassword ? (
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
              <LogIn className="h-4 w-4" />
            )}
            Masuk
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
