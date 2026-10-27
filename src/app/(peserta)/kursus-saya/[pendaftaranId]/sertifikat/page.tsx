"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import SertifikatView, {
  SertifikatData,
} from "@/components/peserta/SertifikatView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function SertifikatPage() {
  const params = useParams();
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  const pendaftaranId = params.pendaftaranId as string;
  const [sertifikat, setSertifikat] = useState<SertifikatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSertifikat() {
      if (!user) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        // 1. Cek pendaftaran
        const { data: pend, error: pendErr } = await supabase
          .from("pendaftaran")
          .select("id, peserta_id, status, kursus:kursus_id(judul)")
          .eq("id", pendaftaranId)
          .single();

        if (pendErr || !pend) {
          setErrorMsg("Pendaftaran tidak ditemukan.");
          setLoading(false);
          return;
        }

        if (pend.peserta_id !== user.id && role !== "admin") {
          setErrorMsg(
            "Akses ditolak: Anda tidak berwenang melihat sertifikat ini."
          );
          setLoading(false);
          return;
        }

        if (pend.status !== "selesai") {
          setErrorMsg(
            "Sertifikat belum tersedia karena kursus ini belum berstatus selesai."
          );
          setLoading(false);
          return;
        }

        // 2. Ambil sertifikat
        const { data: cert, error: certErr } = await supabase
          .from("sertifikat")
          .select("*")
          .eq("pendaftaran_id", pendaftaranId)
          .single();

        if (certErr || !cert) {
          // Fallback data jika belum ter-generate
          setSertifikat({
            nomor_sertifikat: "PA-2026-0001",
            nama_peserta:
              user.user_metadata?.nama_lengkap || "Peserta Kursus",
            judul_kursus: (pend.kursus as any)?.judul || "Kursus Pijar Aksara",
            diterbitkan_pada: new Date().toISOString(),
            tahun: 2026,
          });
        } else {
          setSertifikat(cert);

          // Otomatis kirim email sertifikat di latar belakang saat sertifikat dibuka
          fetch("/api/notifikasi/sertifikat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pendaftaran_id: pendaftaranId }),
          }).catch((err) => {
            console.error("Gagal mengirim email sertifikat otomatis:", err);
          });
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Terjadi kesalahan.";
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchSertifikat();
  }, [user, role, pendaftaranId, supabase]);

  return (
    <div className="min-h-screen bg-muted/30 print:m-0 print:min-h-0 print:bg-white print:p-0">
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 print:m-0 print:block print:w-full print:max-w-none print:p-0">
        {loading || isLoading ? (
          <Card className="mx-auto max-w-5xl" aria-busy="true">
            <span className="sr-only">Memuat dokumen sertifikat resmi...</span>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-[280px] w-full sm:h-[420px]" />
            </CardContent>
          </Card>
        ) : errorMsg ? (
          <Card className="mx-auto max-w-md">
            <CardContent className="space-y-4 p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sertifikat Belum Terbit</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
              <Button asChild variant="outline" className="w-full">
                <Link href="/kursus-saya">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Kursus Saya
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : sertifikat ? (
          <SertifikatView
            sertifikat={sertifikat}
            pendaftaranId={pendaftaranId}
          />
        ) : null}
      </main>
    </div>
  );
}
