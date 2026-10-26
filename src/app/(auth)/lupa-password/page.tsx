"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, Mail, RefreshCw } from "lucide-react";

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
import { createClient } from "@/lib/supabase/client";

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

      if (error) throw error;

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
        { redirectTo: redirectUrl }
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
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Lupa Kata Sandi?</CardTitle>
        <CardDescription>
          Masukkan email akun Anda untuk menerima tautan pengaturan ulang kata
          sandi.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {submittedEmail ? (
          <div className="space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-7 w-7" />
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-lg font-semibold">
                Tautan Reset Telah Dikirim!
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Kami telah mengirimkan instruksi pemulihan kata sandi ke:
              </p>
              <p className="inline-block max-w-full truncate rounded-md border bg-muted px-3 py-1.5 text-sm font-medium">
                {submittedEmail}
              </p>
            </div>

            <Alert className="border-highlight bg-highlight text-highlight-foreground">
              <AlertDescription>
                <p className="font-semibold">Catatan penting:</p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>Buka kotak masuk atau folder spam di email Anda.</li>
                  <li>
                    Klik tombol atau tautan konfirmasi untuk membuat kata sandi
                    baru.
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={loading || resendCooldown > 0}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {resendCooldown > 0
                  ? `Kirim Ulang (${resendCooldown}s)`
                  : "Kirim Ulang Tautan"}
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/masuk">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Halaman Masuk
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Akun</Label>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Kirim Tautan Reset
            </Button>

            <div className="text-center">
              <Button variant="link" asChild>
                <Link href="/masuk">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Ingat kata sandi? Masuk di sini
                </Link>
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
