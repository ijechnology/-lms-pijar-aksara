"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    <main
      id="konten"
      className="flex min-h-screen items-center justify-center bg-background p-4"
    >
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <ShieldAlert className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <Badge variant="destructive">HTTP 403 - Akses Ditolak</Badge>
            <h1 className="text-2xl font-semibold tracking-tight">
              {alasan === "akun_nonaktif"
                ? "Akun Anda Sedang Dinonaktifkan"
                : "Anda Tidak Memiliki Hak Akses"}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {alasan === "akun_nonaktif"
                ? "Akun ini telah dinonaktifkan oleh administrator lembaga. Silakan hubungi pengelola LMS Pijar Aksara."
                : "Halaman yang Anda tuju memerlukan wewenang peran yang berbeda dari akun Anda saat ini."}
            </p>
          </div>

          {user && (
            <div className="space-y-1 rounded-lg border bg-muted/40 p-4 text-left text-xs text-muted-foreground">
              <p>
                Login sebagai:{" "}
                <span className="font-semibold text-foreground">
                  {user.email}
                </span>
              </p>
              <p>
                Peran aktif:{" "}
                <span className="font-semibold capitalize text-primary">
                  {role || "Tamu"}
                </span>
              </p>
            </div>
          )}

          <Button
            onClick={handleKeHalamanLogin}
            disabled={loggingOut}
            className="w-full"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            Kembali ke Halaman Masuk
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function AksesDitolakPage() {
  return (
    <Suspense
      fallback={
        <main
          id="konten"
          className="flex min-h-screen items-center justify-center p-4"
        >
          <Skeleton className="h-80 w-full max-w-md" />
        </main>
      }
    >
      <AksesDitolakContent />
    </Suspense>
  );
}
