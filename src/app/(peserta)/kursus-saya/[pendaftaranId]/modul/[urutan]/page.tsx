"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import SidebarModul, { ModulStatusItem } from "@/components/peserta/SidebarModul";
import FormKuis from "@/components/peserta/FormKuis";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Download,
  Video,
  FileText,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export default function RuangBelajarPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const supabase = createClient();

  const pendaftaranId = params.pendaftaranId as string;
  const currentUrutan = parseInt(params.urutan as string, 10) || 1;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [pendaftaran, setPendaftaran] = useState<any | null>(null);
  const [kursus, setKursus] = useState<any | null>(null);
  const [modulList, setModulList] = useState<ModulStatusItem[]>([]);
  const [currentModul, setCurrentModul] = useState<any | null>(null);
  const [currentProgres, setCurrentProgres] = useState<any | null>(null);

  const [markingRead, setMarkingRead] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Ambil data pendaftaran & validasi pemilik (BR-08, BR-12)
      const { data: pend, error: pendErr } = await supabase
        .from("pendaftaran")
        .select(`
          id, kursus_id, peserta_id, status,
          kursus:kursus_id (id, judul, slug, nilai_lulus)
        `)
        .eq("id", pendaftaranId)
        .single();

      if (pendErr || !pend) {
        setErrorMsg("Pendaftaran tidak ditemukan.");
        setLoading(false);
        return;
      }

      if (pend.peserta_id !== user.id) {
        setErrorMsg("Akses ditolak: Pendaftaran ini bukan milik akun Anda.");
        setLoading(false);
        return;
      }

      if (pend.status !== "aktif" && pend.status !== "selesai") {
        setErrorMsg("Pendaftaran kursus ini belum berstatus aktif.");
        setLoading(false);
        return;
      }

      setPendaftaran(pend);
      setKursus(pend.kursus);

      // 2. Ambil seluruh modul pada kursus ini
      const { data: allModul, error: modErr } = await supabase
        .from("modul")
        .select("id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit")
        .eq("kursus_id", pend.kursus_id)
        .order("urutan", { ascending: true });

      if (modErr || !allModul) {
        setErrorMsg("Gagal memuat modul pembelajaran.");
        setLoading(false);
        return;
      }

      // 3. Ambil seluruh progres modul untuk pendaftaran ini
      const { data: progresData } = await supabase
        .from("progres_modul")
        .select("id, modul_id, materi_dibaca_pada, lulus_pada")
        .eq("pendaftaran_id", pendaftaranId);

      const progresMap = new Map<string, any>();
      (progresData || []).forEach((p) => progresMap.set(p.modul_id, p));

      // 4. Hitung status bertingkat (BR-08: Modul N terbuka jika Modul N-1 lulus)
      let previousLulus = true; // Modul 1 langsung terbuka
      const statusList: ModulStatusItem[] = [];

      for (let i = 0; i < allModul.length; i++) {
        const m = allModul[i];
        const prog = progresMap.get(m.id);
        const isLulus = prog?.lulus_pada !== null && prog?.lulus_pada !== undefined;
        const isUnlocked = i === 0 || previousLulus;

        statusList.push({
          id: m.id,
          urutan: m.urutan,
          judul: m.judul,
          durasi_menit: m.durasi_menit,
          isLulus,
          isUnlocked,
          isCurrent: m.urutan === currentUrutan,
        });

        previousLulus = isLulus;
      }

      setModulList(statusList);

      // Temukan modul saat ini
      const activeM = allModul.find((m) => m.urutan === currentUrutan);
      if (activeM) {
        setCurrentModul(activeM);
        setCurrentProgres(progresMap.get(activeM.id) || null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [user, pendaftaranId, currentUrutan, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler: Tandai Materi Sudah Dibaca (BR-08)
  const handleTandaiDibaca = async () => {
    if (!currentModul) return;
    setMarkingRead(true);

    try {
      const { error } = await supabase.from("progres_modul").upsert(
        {
          pendaftaran_id: pendaftaranId,
          modul_id: currentModul.id,
          materi_dibaca_pada: new Date().toISOString(),
        },
        { onConflict: "pendaftaran_id,modul_id" }
      );

      if (error) {
        alert("Gagal menandai materi: " + error.message);
      } else {
        await loadData();
      }
    } catch (err) {
      console.error("Gagal tandai dibaca:", err);
    } finally {
      setMarkingRead(false);
    }
  };

  // Handler: Unduh PDF privat lewat Signed URL 60 menit (BR-08, Bab 10)
  const handleUnduhPdf = async () => {
    if (!currentModul?.lampiran_path) return;
    setDownloadingPdf(true);

    try {
      // Buat signed URL 60 menit (3600 detik) dari bucket privat modul-lampiran
      const { data, error } = await supabase.storage
        .from("modul-lampiran")
        .createSignedUrl(currentModul.lampiran_path, 3600);

      if (error || !data?.signedUrl) {
        alert("Gagal membuat tautan unduh privat: " + (error?.message || "File belum diunggah"));
      } else {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err) {
      console.error("Gagal unduh PDF:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Format link YouTube ke embed jika perlu
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes("embed/")) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const activeStatus = modulList.find((m) => m.urutan === currentUrutan);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/kursus-saya" className="hover:text-brand-600 transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Kursus Saya
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-sm">
              {kursus?.judul || "Ruang Belajar"}
            </span>
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading || isLoading ? (
          <div className="py-24 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm">Mempersiapkan materi ruang belajar...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 max-w-md mx-auto text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-lg">Kendala Akses</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{errorMsg}</p>
            <Link
              href="/kursus-saya"
              className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              Kembali ke Kursus Saya
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Sidebar Modul */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <SidebarModul
                pendaftaranId={pendaftaranId}
                modulList={modulList}
                currentUrutan={currentUrutan}
              />
            </div>

            {/* Area Konten Materi & Kuis */}
            <div className="lg:col-span-3 order-1 lg:order-2 space-y-8">
              {/* Cek apakah modul ini terkunci (BR-08) */}
              {activeStatus && !activeStatus.isUnlocked ? (
                <div className="bg-white rounded-2xl p-10 border border-amber-200 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Modul {currentUrutan} Masih Terkunci
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Sesuai aturan kurikulum bertingkat (BR-08), Anda harus menyelesaikan dan lulus kuis pada modul sebelumnya terlebih dahulu sebelum dapat membuka materi ini.
                  </p>
                  <Link
                    href={`/kursus-saya/${pendaftaranId}/modul/${currentUrutan - 1}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
                  >
                    Buka Modul {currentUrutan - 1}
                  </Link>
                </div>
              ) : currentModul ? (
                <>
                  {/* Judul & Metadata Modul */}
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700">
                        Modul {currentModul.urutan}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Estimasi Belajar: {currentModul.durasi_menit} Menit</span>
                      </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {currentModul.judul}
                    </h1>

                    {/* Sematan Video Jika Ada */}
                    {currentModul.video_url && (
                      <div className="pt-2">
                        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-slate-900">
                          <iframe
                            src={getEmbedUrl(currentModul.video_url)!}
                            title={currentModul.judul}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        </div>
                      </div>
                    )}

                    {/* Bacaan Materi */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-600" /> Materi Bacaan
                      </h3>
                      <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 sm:p-6 rounded-xl border border-slate-100 font-sans">
                        {currentModul.isi_materi}
                      </div>
                    </div>

                    {/* Lampiran PDF Jika Ada */}
                    {currentModul.lampiran_path && (
                      <div className="pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                              <Download className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Berkas Lampiran Materi (PDF)
                              </p>
                              <p className="text-xs text-slate-500">
                                Akses privat terenkripsi · Berlaku 60 menit
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleUnduhPdf}
                            disabled={downloadingPdf}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition"
                          >
                            {downloadingPdf ? "Memverifikasi..." : "Unduh PDF"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tombol Konfirmasi Baca Materi (BR-08) */}
                    <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      {currentProgres?.materi_dibaca_pada ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Materi telah ditandai selesai dibaca. Kuis evaluasi terbuka di bawah.</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleTandaiDibaca}
                          disabled={markingRead}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {markingRead ? "Menyimpan Progres..." : "Tandai Materi Sudah Dibaca"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lembar Evaluasi Kuis Modul */}
                  <div className="pt-2">
                    <FormKuis
                      pendaftaranId={pendaftaranId}
                      modulId={currentModul.id}
                      nilaiLulus={kursus?.nilai_lulus || 70}
                      isLulusModul={activeStatus?.isLulus || false}
                      materiDibacaPada={currentProgres?.materi_dibaca_pada || null}
                      onLulusSuccess={loadData}
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
