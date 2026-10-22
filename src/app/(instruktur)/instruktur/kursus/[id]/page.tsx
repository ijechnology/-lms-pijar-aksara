"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import EditorModul, { ModulData } from "@/components/instruktur/EditorModul";
import EditorSoal from "@/components/instruktur/EditorSoal";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Users,
  Send,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sparkles,
  Info,
  Clock,
  Award,
} from "lucide-react";

interface KursusDetail {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan: string;
  deskripsi: string;
  harga: number;
  kuota: number;
  nilai_lulus: number;
  status: "draf" | "ditinjau" | "terbit" | "ditutup";
  catatan_tinjauan: string | null;
  dibuat_pada: string;
  instruktur_id: string;
}

export default function DetailKurikulumInstrukturPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  const kursusId = params.id as string;

  const [kursus, setKursus] = useState<KursusDetail | null>(null);
  const [modulList, setModulList] = useState<ModulData[]>([]);
  const [selectedModul, setSelectedModul] = useState<ModulData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ajukan review
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    if (!kursusId || !user) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Ambil detail kursus
      const { data: kursusData, error: kursusErr } = await supabase
        .from("kursus")
        .select("*")
        .eq("id", kursusId)
        .single();

      if (kursusErr || !kursusData) {
        throw new Error(kursusErr?.message || "Kursus tidak ditemukan.");
      }

      // Verifikasi kepemilikan instruktur (atau admin)
      if (kursusData.instruktur_id !== user.id && role !== "admin") {
        throw new Error("Anda tidak memiliki hak akses mengelola kursus ini.");
      }

      setKursus(kursusData);

      // 2. Ambil modul beserta hitungan butir soalnya
      const { data: moduls, error: modulErr } = await supabase
        .from("modul")
        .select(`
          id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit,
          soal (id)
        `)
        .eq("kursus_id", kursusId)
        .order("urutan", { ascending: true });

      if (modulErr) {
        throw new Error(modulErr.message);
      }

      const formattedModuls: ModulData[] = (moduls || []).map((m: any) => ({
        id: m.id,
        kursus_id: m.kursus_id,
        urutan: m.urutan,
        judul: m.judul,
        isi_materi: m.isi_materi,
        video_url: m.video_url,
        lampiran_path: m.lampiran_path,
        durasi_menit: m.durasi_menit,
        soal_count: (m.soal || []).length,
      }));

      setModulList(formattedModuls);

      // Pertahankan modul terpilih jika masih ada, atau pilih modul pertama secara default
      setSelectedModul((prev) => {
        if (!prev) return formattedModuls[0] || null;
        const found = formattedModuls.find((m) => m.id === prev.id);
        return found || formattedModuls[0] || null;
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memuat kurikulum.");
    } finally {
      setLoading(false);
    }
  }, [kursusId, user, role, supabase]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/masuk");
      } else {
        loadData();
      }
    }
  }, [isLoading, user, loadData, router]);

  const isLocked = kursus?.status !== "draf";

  // Validasi kurikulum BR-03: 2-10 modul, 3-20 soal per modul
  const totalModul = modulList.length;
  const isModulCountValid = totalModul >= 2 && totalModul <= 10;
  const invalidModulSoal = modulList.filter(
    (m) => (m.soal_count || 0) < 3 || (m.soal_count || 0) > 20
  );
  const isCurriculumValid = isModulCountValid && invalidModulSoal.length === 0;

  const handleAjukanReview = async () => {
    if (!kursus || isLocked) return;

    if (!isCurriculumValid) {
      let pesan = "Kurikulum belum memenuhi syarat BR-03:\n";
      if (!isModulCountValid) {
        pesan += `- Jumlah modul harus 2 s/d 10 (saat ini: ${totalModul} modul)\n`;
      }
      if (invalidModulSoal.length > 0) {
        pesan += `- Modul berikut belum memiliki 3-20 butir soal: ${invalidModulSoal
          .map((m) => `Modul ${m.urutan} (${m.soal_count || 0} soal)`)
          .join(", ")}`;
      }
      setSubmitFeedback({
        type: "error",
        message: pesan,
      });
      return;
    }

    const confirmSubmit = window.confirm(
      "Apakah Anda yakin ingin mengajukan kursus ini untuk ditinjau oleh Admin? Setelah diajukan, kurikulum akan terkunci dari pengeditan."
    );
    if (!confirmSubmit) return;

    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const { data, error } = await supabase.rpc("ajukan_kursus", {
        p_kursus_id: kursus.id,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSubmitFeedback({
        type: "success",
        message:
          "Kursus berhasil diajukan untuk ditinjau oleh Admin! Status kursus kini 'Ditinjau'.",
      });

      // Muat ulang data kursus
      await loadData();
    } catch (err) {
      setSubmitFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal mengajukan kursus.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "draf":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Draf
          </span>
        );
      case "ditinjau":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            Sedang Ditinjau Admin
          </span>
        );
      case "terbit":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Terbit di Katalog
          </span>
        );
      case "ditutup":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            Ditutup
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Memuat data kurikulum kursus...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !kursus) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-16 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h1>
          <p className="text-slate-600 mb-6">{errorMsg || "Kursus tidak ditemukan."}</p>
          <Link
            href="/instruktur/kursus"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kursus
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigasi Atas */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/instruktur/kursus"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" /> Daftar Kursus
            </Link>
            <div className="h-4 w-px bg-slate-300" />
            <span className="text-xs font-medium text-slate-500">Editor Kurikulum</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/instruktur/kursus/${kursus.id}/peserta`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition"
            >
              <Users className="w-4 h-4" /> Rekap Nilai Peserta
            </Link>
            {kursus.status === "terbit" && (
              <Link
                href={`/kursus/${kursus.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Pratinjau Katalog
              </Link>
            )}
          </div>
        </div>

        {/* Ringkasan Header Kursus */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  {kursus.kategori}
                </span>
                {getStatusBadge(kursus.status)}
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  Kriteria Lulus: Min {kursus.nilai_lulus}%
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {kursus.judul}
              </h1>
              <p className="text-sm text-slate-600 line-clamp-2">{kursus.ringkasan}</p>
            </div>

            {/* Aksi Ajukan Kursus */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {kursus.status === "draf" ? (
                <button
                  onClick={handleAjukanReview}
                  disabled={submitting}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md transition ${
                    isCurriculumValid
                      ? "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Memproses..." : "Ajukan Kursus ke Admin"}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  <Lock className="w-4 h-4 text-slate-500" />
                  Kurikulum Terkunci ({kursus.status.toUpperCase()})
                </div>
              )}
            </div>
          </div>

          {/* Feedback Notifikasi */}
          {submitFeedback && (
            <div
              className={`p-4 rounded-xl text-sm flex items-start gap-3 whitespace-pre-line ${
                submitFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {submitFeedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{submitFeedback.message}</div>
            </div>
          )}

          {/* Catatan Penolakan / Catatan Tinjauan Admin jika ada */}
          {kursus.catatan_tinjauan && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Catatan Tinjauan dari Admin:</p>
                <p className="text-amber-800 mt-1">{kursus.catatan_tinjauan}</p>
              </div>
            </div>
          )}

          {/* Checklist Kesiapan Kurikulum BR-03 */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Kesiapan Standar Kurikulum Kursus (BR-03)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                {isModulCountValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
                <span className={isModulCountValid ? "text-slate-700" : "text-amber-800 font-semibold"}>
                  Jumlah Modul: <strong>{totalModul}</strong> (Wajib 2 s/d 10 modul)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {invalidModulSoal.length === 0 && totalModul > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
                <span
                  className={
                    invalidModulSoal.length === 0 && totalModul > 0
                      ? "text-slate-700"
                      : "text-amber-800 font-semibold"
                  }
                >
                  Butir Soal per Modul:{" "}
                  {invalidModulSoal.length === 0 && totalModul > 0 ? (
                    "Semua modul memenuhi (3 - 20 butir)"
                  ) : (
                    <span>
                      {invalidModulSoal.length} modul belum memenuhi syarat (min. 3 soal)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid 2 Kolom: Kolom Kiri Modul & Kolom Kanan Soal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Editor Modul (5 kolom) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600" />
                Daftar Modul Pembelajaran
              </h2>
              <EditorModul
                kursusId={kursus.id}
                isLocked={isLocked}
                modulList={modulList}
                onRefresh={loadData}
                onSelectModulForSoal={(modul) => setSelectedModul(modul)}
                selectedModulId={selectedModul?.id || null}
              />
            </div>
          </div>

          {/* Kolom Kanan: Editor Butir Soal untuk Modul Terpilih (7 kolom) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              {selectedModul ? (
                <>
                  <div className="border-b border-slate-200 pb-4 mb-5">
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                      Modul {selectedModul.urutan}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                      <HelpCircle className="w-5 h-5 text-brand-600" />
                      Butir Soal Kuis: {selectedModul.judul}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Kunci jawaban tersimpan terisolasi di sisi server (INV-05) dan tidak akan
                      pernah dibocorkan ke peserta.
                    </p>
                  </div>

                  <EditorSoal
                    modulId={selectedModul.id}
                    modulJudul={selectedModul.judul}
                    isLocked={isLocked}
                    onSoalCountChanged={loadData}
                  />
                </>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
                  <p className="text-sm font-medium">Pilih modul di sebelah kiri untuk mengelola butir soal kuis.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
