"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import EditorModul, { ModulData } from "@/components/instruktur/EditorModul";
import EditorSoal from "@/components/instruktur/EditorSoal";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import ConfirmModal from "@/components/ui/ConfirmModal";
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
  Video,
  Download,
  FileText,
  Eye,
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

  // Tab & Media Viewer
  const [activeTab, setActiveTab] = useState<"materi" | "soal">("materi");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Helper unduh PDF via Signed URL (BR-08)
  const handleUnduhPdf = async (path: string | null) => {
    if (!path) return;
    setDownloadingPdf(true);
    try {
      const { data, error } = await supabase.storage
        .from("modul-lampiran")
        .createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) {
        alert("Gagal membuka file PDF: " + (error?.message || "File belum diunggah atau tidak ditemukan."));
      } else {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err) {
      console.error("Gagal unduh PDF:", err);
      alert("Terjadi kesalahan saat memuat berkas PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Format link YouTube ke embed
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes("youtube.com/embed/")) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{6,15})/);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&enablejsapi=1`;
    }
    return url;
  };

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

  const isLocked = role === "admin" || kursus?.status !== "draf";

  // Validasi kurikulum BR-03: 2-10 modul, 3-20 soal per modul
  const totalModul = modulList.length;
  const isModulCountValid = totalModul >= 2 && totalModul <= 10;
  const invalidModulSoal = modulList.filter(
    (m) => (m.soal_count || 0) < 3 || (m.soal_count || 0) > 20
  );
  const isCurriculumValid = isModulCountValid && invalidModulSoal.length === 0;

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  const handleAjukanReview = () => {
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

    setConfirmSubmitOpen(true);
  };

  const executeAjukanReview = async () => {
    if (!kursus) return;

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

      setConfirmSubmitOpen(false);
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
            href={role === "admin" ? "/admin" : "/instruktur/kursus"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> {role === "admin" ? "Kembali ke Panel Admin" : "Kembali ke Daftar Kursus"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigasi Atas & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={role === "admin" ? "/admin" : "/instruktur/kursus"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              {role === "admin" ? "Kembali ke Panel Admin" : "Kembali ke Daftar Kursus"}
            </Link>
            <div className="h-4 w-px bg-slate-300 hidden sm:block" />
            <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link
                href={role === "admin" ? "/admin" : "/instruktur/kursus"}
                className="hover:text-brand-600 transition"
              >
                {role === "admin" ? "Panel Admin" : "Daftar Kursus"}
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold truncate max-w-[200px]">
                {kursus.judul}
              </span>
              <span>/</span>
              <span>
                {role === "admin" ? "Inspeksi Kurikulum" : "Editor Kurikulum"}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/instruktur/kursus/${kursus.id}/peserta${role === "admin" ? "?from=admin" : ""}`}
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

            {/* Aksi Ajukan Kursus untuk Instruktur (Dihapus dari header untuk Admin sesuai permintaan) */}
            {role !== "admin" && (
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
            )}
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

          {/* Kolom Kanan: Detail Materi, Media & Editor Soal (7 kolom) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              {selectedModul ? (
                <>
                  {/* Header Modul Terpilih */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5">
                    <div>
                      <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                        Modul {selectedModul.urutan}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        {selectedModul.judul}
                      </h2>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {selectedModul.durasi_menit} Menit
                        </span>
                        <span>·</span>
                        <span>{selectedModul.soal_count ?? 0} Butir Soal Kuis</span>
                      </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab("materi")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeTab === "materi"
                            ? "bg-white text-brand-700 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Materi &amp; Media
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("soal")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeTab === "soal"
                            ? "bg-white text-brand-700 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Soal Kuis ({selectedModul.soal_count ?? 0})
                      </button>
                    </div>
                  </div>

                  {/* Konten Tab 1: Materi, Video & PDF */}
                  {activeTab === "materi" && (
                    <div className="space-y-6">
                      {/* Video Player */}
                      {selectedModul.video_url ? (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-blue-600" /> Video Pembelajaran
                          </h4>
                          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-slate-900 relative">
                            <iframe
                              src={getEmbedUrl(selectedModul.video_url)!}
                              title={selectedModul.judul}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              referrerPolicy="strict-origin-when-cross-origin"
                              className="w-full h-full border-0"
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                            <span className="truncate max-w-sm">{selectedModul.video_url}</span>
                            <a
                              href={selectedModul.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1 hover:underline flex-shrink-0"
                            >
                              Buka di YouTube <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center gap-2.5">
                          <Video className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span>Modul ini belum menyertakan tautan video pembelajaran.</span>
                        </div>
                      )}

                      {/* Berkas Lampiran PDF */}
                      {selectedModul.lampiran_path ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                              <Download className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Berkas Lampiran Materi (PDF)
                              </p>
                              <p className="text-xs text-slate-500 truncate max-w-xs">
                                {selectedModul.lampiran_path.split("/").pop()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnduhPdf(selectedModul.lampiran_path)}
                            disabled={downloadingPdf}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition self-start sm:self-auto disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" />
                            {downloadingPdf ? "Membuka PDF..." : "Buka / Unduh PDF"}
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span>Modul ini tidak memiliki berkas lampiran PDF.</span>
                        </div>
                      )}

                      {/* Bacaan Materi Lengkap */}
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-brand-600" /> Materi Bacaan Lengkap
                        </h4>
                        <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200 font-sans">
                          {selectedModul.isi_materi ? (
                            selectedModul.isi_materi
                          ) : (
                            <span className="text-slate-400 italic">Belum ada teks materi bacaan pada modul ini.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Konten Tab 2: Butir Soal Kuis */}
                  {activeTab === "soal" && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">
                        Kunci jawaban tersimpan terisolasi di sisi server (INV-05) dan tidak akan
                        pernah dibocorkan ke peserta.
                      </p>
                      <EditorSoal
                        modulId={selectedModul.id}
                        modulJudul={selectedModul.judul}
                        isLocked={isLocked}
                        onSoalCountChanged={loadData}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
                  <p className="text-sm font-medium">Pilih modul di sebelah kiri untuk melihat materi dan butir soal kuis.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Modal Konfirmasi Pengajuan Kurikulum */}
      <ConfirmModal
        isOpen={confirmSubmitOpen}
        onClose={() => setConfirmSubmitOpen(false)}
        onConfirm={executeAjukanReview}
        title="Ajukan Kursus untuk Ditinjau?"
        message="Apakah Anda yakin ingin mengajukan kursus ini untuk ditinjau oleh Admin? Setelah diajukan, kurikulum akan terkunci dari pengeditan hingga hasil review keluar."
        confirmLabel="Ya, Ajukan Review"
        cancelLabel="Batal"
        variant="primary"
        loading={submitting}
      />
    </div>
  );
}
