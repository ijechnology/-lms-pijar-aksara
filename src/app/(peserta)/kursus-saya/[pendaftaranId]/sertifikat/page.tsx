"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SertifikatView, { SertifikatData } from "@/components/peserta/SertifikatView";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Award, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function SertifikatPage() {
  const params = useParams();
  const router = useRouter();
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
          setErrorMsg("Akses ditolak: Anda tidak berwenang melihat sertifikat ini.");
          setLoading(false);
          return;
        }

        if (pend.status !== "selesai") {
          setErrorMsg("Sertifikat belum tersedia karena kursus ini belum berstatus selesai.");
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
            nama_peserta: user.user_metadata?.nama_lengkap || "Peserta Kursus",
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
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchSertifikat();
  }, [user, role, pendaftaranId, supabase]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 print:bg-white print:min-h-0 print:block print:p-0 print:m-0">
      <div className="no-print">
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 print:p-0 print:m-0 print:max-w-none print:w-full print:block">
        {loading || isLoading ? (
          <div className="py-24 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600" />
            <p className="text-sm">Memuat dokumen sertifikat resmi...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 max-w-md mx-auto text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-lg">Sertifikat Belum Terbit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{errorMsg}</p>
            <Link
              href="/kursus-saya"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Kursus Saya
            </Link>
          </div>
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
