"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";
import { ModalPetunjukTransfer } from "@/components/peserta/ModalPetunjukTransfer";
import { ModalSimulasiMayar } from "@/components/peserta/ModalSimulasiMayar";
import { ModalRekapNilai } from "@/components/peserta/ModalRekapNilai";
import {
  BookOpen,
  Clock,
  Award,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Building2,
  XCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  FileCheck2,
  History,
  FileText,
  User,
} from "lucide-react";

type TabFilter = "aktif" | "menunggu_bayar" | "selesai" | "riwayat" | "semua";

interface ModulItem {
  id: string;
  urutan: number;
  judul: string;
  durasi_menit: number;
}

interface ProgresModulItem {
  id: string;
  modul_id: string;
  lulus_pada: string | null;
  materi_dibaca_pada: string | null;
}

interface PercobaanKuisItem {
  id: string;
  modul_id: string;
  nomor_percobaan: number;
  nilai: number;
  lulus: boolean;
  jumlah_benar: number;
  jumlah_soal: number;
  dikerjakan_pada: string;
}

interface PendaftaranItem {
  id: string;
  kursus_id: string;
  status: "menunggu_bayar" | "aktif" | "selesai" | "kedaluwarsa" | "dibatalkan";
  nominal: number;
  metode_bayar: string;
  batas_bayar: string | null;
  didaftarkan_pada: string;
  alasan_batal?: string | null;
  kursus: {
    id: string;
    judul: string;
    slug: string;
    kategori: string;
    nilai_lulus: number;
    modul?: ModulItem[];
  };
  total_modul: number;
  modul_lulus: number;
  sertifikat?: { nomor_sertifikat: string } | null;
  progres_modul: ProgresModulItem[];
  percobaan_kuis: PercobaanKuisItem[];
}

export default function KursusSayaPage() {
  const { user, profile, isLoading } = useAuth();
  const supabase = createClient();

  const [pendaftaranList, setPendaftaranList] = useState<PendaftaranItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("aktif");
  const dataLoadedRef = useRef(false);

  // Modal Rekap Nilai Kuis (BR-12)
  const [selectedRekapItem, setSelectedRekapItem] = useState<PendaftaranItem | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    if (!dataLoadedRef.current) {
      setLoadingData(true);
    }
    try {
      const { data, error } = await supabase
        .from("pendaftaran")
        .select(`
          id, kursus_id, status, nominal, metode_bayar, batas_bayar, didaftarkan_pada, alasan_batal,
          kursus:kursus_id (
            id, judul, slug, kategori, nilai_lulus,
            modul (id, urutan, judul, durasi_menit)
          ),
          sertifikat (nomor_sertifikat),
          progres_modul (id, modul_id, lulus_pada, materi_dibaca_pada),
          percobaan_kuis (id, modul_id, nomor_percobaan, nilai, lulus, jumlah_benar, jumlah_soal, dikerjakan_pada)
        `)
        .eq("peserta_id", user.id)
        .order("didaftarkan_pada", { ascending: false });

      if (!error && data) {
        const now = new Date();
        const formatted: PendaftaranItem[] = data.map((item: any) => {
          const totalModul = item.kursus?.modul?.length || 0;
          const modulLulus = (item.progres_modul || []).filter(
            (p: any) => p.lulus_pada !== null
          ).length;

          // Periksa apakah status menunggu_bayar telah kedaluwarsa secara temporal (BR-07)
          let currentStatus = item.status;
          if (
            currentStatus === "menunggu_bayar" &&
            item.batas_bayar &&
            new Date(item.batas_bayar) <= now
          ) {
            currentStatus = "kedaluwarsa";
          }

          return {
            id: item.id,
            kursus_id: item.kursus_id,
            status: currentStatus,
            nominal: item.nominal,
            metode_bayar: item.metode_bayar,
            batas_bayar: item.batas_bayar,
            didaftarkan_pada: item.didaftarkan_pada,
            alasan_batal: item.alasan_batal,
            kursus: item.kursus,
            total_modul: totalModul,
            modul_lulus: modulLulus,
            sertifikat: item.sertifikat?.[0] || null,
            progres_modul: item.progres_modul || [],
            percobaan_kuis: item.percobaan_kuis || [],
          };
        });
        setPendaftaranList(formatted);
      }
    } catch (err) {
      console.error("Gagal memuat kursus saya:", err);
    } finally {
      dataLoadedRef.current = true;
      setLoadingData(false);
    }
  }, [user?.id, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime listener Supabase: Ketika admin konfirmasi bayar di tab lain, UI langsung update tanpa reload!
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`pendaftaran-changes-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pendaftaran",
          filter: `peserta_id=eq.${user.id}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, loadData]);

  // Deteksi redirect kembali setelah menyelesaikan pembayaran di Mayar Gateway
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("pembayaran") === "selesai") {
        const pendaftaranId = params.get("pendaftaran_id");
        if (pendaftaranId) {
          // Panggil endpoint verifikasi agar status pendaftaran langsung diperbarui menjadi aktif
          fetch("/api/pembayaran/mayar/verifikasi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pendaftaran_id: pendaftaranId }),
          })
            .then((res) => res.json())
            .then((resData) => {
              loadData();
              setAlertModal({
                isOpen: true,
                title: resData.success ? "Pembayaran Terverifikasi!" : "Pembayaran Diproses",
                message:
                  resData.message ||
                  "Terima kasih! Pembayaran via Mayar telah selesai dan status kursus Anda kini telah Aktif.",
                type: "success",
              });
            })
            .catch(() => {
              loadData();
            });
        } else {
          setAlertModal({
            isOpen: true,
            title: "Pembayaran Diproses",
            message:
              "Terima kasih! Transaksi pembayaran via Mayar berhasil diselesaikan. Status pendaftaran Anda akan otomatis aktif secara instan.",
            type: "success",
          });
          loadData();
        }
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [loadData]);

  const [batalModalOpen, setBatalModalOpen] = useState(false);
  const [selectedBatalId, setSelectedBatalId] = useState<string | null>(null);
  const [selectedTransferItem, setSelectedTransferItem] = useState<PendaftaranItem | null>(null);
  const [selectedMayarSimulasiItem, setSelectedMayarSimulasiItem] = useState<PendaftaranItem | null>(null);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // BR-07: Sebelum membuka modal batal, verifikasi status terkini di DB
  const confirmBatalPendaftaran = async (pendaftaranId: string) => {
    try {
      const { data: latest } = await supabase
        .from("pendaftaran")
        .select("status")
        .eq("id", pendaftaranId)
        .single();

      if (latest && latest.status !== "menunggu_bayar") {
        await loadData();
        setAlertModal({
          isOpen: true,
          title: "Status Pendaftaran Telah Berubah",
          message:
            latest.status === "aktif"
              ? "Pembayaran kursus ini telah dikonfirmasi aktif oleh admin. Pendaftaran tidak dapat dibatalkan, Anda sudah dapat langsung melanjutkan belajar."
              : `Pendaftaran ini telah berstatus "${latest.status}" sehingga tidak dapat dibatalkan.`,
          type: "info",
        });
        return;
      }

      setSelectedBatalId(pendaftaranId);
      setBatalModalOpen(true);
    } catch (err) {
      console.warn("Gagal cek status terkini:", err);
      setSelectedBatalId(pendaftaranId);
      setBatalModalOpen(true);
    }
  };

  // BR-07: Eksekusi pembatalan dengan atomic update status = 'menunggu_bayar'
  const handleBatalPendaftaran = async () => {
    if (!selectedBatalId) return;

    setCancelingId(selectedBatalId);
    try {
      const { data, error } = await supabase
        .from("pendaftaran")
        .update({
          status: "dibatalkan",
          dibatalkan_pada: new Date().toISOString(),
          alasan_batal: "Dibatalkan sendiri oleh peserta sebelum pembayaran",
        })
        .eq("id", selectedBatalId)
        .eq("status", "menunggu_bayar")
        .select("id, status");

      if (error) {
        setAlertModal({
          isOpen: true,
          title: "Gagal Membatalkan",
          message: error.message,
          type: "error",
        });
      } else if (!data || data.length === 0) {
        // Status sudah berubah di server (misal admin baru saja klik konfirmasi bayar)
        await loadData();
        setBatalModalOpen(false);
        setSelectedBatalId(null);
        setAlertModal({
          isOpen: true,
          title: "Pendaftaran Tidak Dapat Dibatalkan",
          message:
            "Pembayaran pendaftaran ini telah dikonfirmasi aktif oleh admin atau status telah berubah. Anda dapat langsung melanjutkan belajar.",
          type: "info",
        });
      } else {
        await loadData();
        setBatalModalOpen(false);
        setSelectedBatalId(null);
        setAlertModal({
          isOpen: true,
          title: "Pendaftaran Berhasil Dibatalkan",
          message:
            "Pendaftaran kursus telah dibatalkan. Anda dapat mendaftar kembali kapan saja melalui katalog kursus.",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Gagal batalkan pendaftaran:", err);
    } finally {
      setCancelingId(null);
    }
  };

  const [payingId, setPayingId] = useState<string | null>(null);

  const handleBayar = async (item: PendaftaranItem) => {
    if (item.metode_bayar === "transfer_manual") {
      setSelectedTransferItem(item);
      return;
    }

    setPayingId(item.id);
    try {
      const response = await fetch("/api/pembayaran/mayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaran_id: item.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses pembayaran.");
      }

      if (data.alreadyActive) {
        setAlertModal({
          isOpen: true,
          title: "Pendaftaran Aktif",
          message: data.message || "Pendaftaran sudah aktif!",
          type: "success",
        });
        loadData();
      } else if (data.isTransferManual) {
        setSelectedTransferItem(item);
      } else if (data.isMock || data.paymentUrl?.includes("mock_invoice=true")) {
        setSelectedMayarSimulasiItem(item);
      } else if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: "Kendala Pembayaran",
        message: err instanceof Error ? err.message : "Terjadi kesalahan pembayaran.",
        type: "error",
      });
    } finally {
      setPayingId(null);
    }
  };

  const formatRupiah = (val: number) => {
    if (val === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Kalkulasi Filter Tab & KPI
  const countAktif = pendaftaranList.filter((p) => p.status === "aktif").length;
  const countMenunggu = pendaftaranList.filter((p) => p.status === "menunggu_bayar").length;
  const countSelesai = pendaftaranList.filter((p) => p.status === "selesai").length;
  const countRiwayat = pendaftaranList.filter(
    (p) => p.status === "dibatalkan" || p.status === "kedaluwarsa"
  ).length;

  const filteredList = pendaftaranList.filter((item) => {
    if (activeTab === "aktif") return item.status === "aktif";
    if (activeTab === "menunggu_bayar") return item.status === "menunggu_bayar";
    if (activeTab === "selesai") return item.status === "selesai";
    if (activeTab === "riwayat")
      return item.status === "dibatalkan" || item.status === "kedaluwarsa";
    return true; // semua
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header Ruang Kursus Saya */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ruang Kursus Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau progres belajar, akses modul, pembayaran, dan transkrip kelulusan resmi Anda.
          </p>
        </div>

        {/* Tab Navigasi Segregasi Kursus Saya (PRD Kategori) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab("aktif")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer ${
              activeTab === "aktif"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sedang Belajar</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === "aktif"
                  ? "bg-brand-100 text-brand-800 font-extrabold"
                  : "bg-slate-300/60 text-slate-600"
              }`}
            >
              {countAktif}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("menunggu_bayar")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer ${
              activeTab === "menunggu_bayar"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Pembayaran</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === "menunggu_bayar"
                  ? "bg-amber-100 text-amber-800 font-extrabold"
                  : "bg-slate-300/60 text-slate-600"
              }`}
            >
              {countMenunggu}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("selesai")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer ${
              activeTab === "selesai"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Selesai &amp; Sertifikat</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === "selesai"
                  ? "bg-emerald-100 text-emerald-800 font-extrabold"
                  : "bg-slate-300/60 text-slate-600"
              }`}
            >
              {countSelesai}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer ${
              activeTab === "riwayat"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Dibatalkan</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === "riwayat"
                  ? "bg-slate-200 text-slate-800 font-extrabold"
                  : "bg-slate-300/60 text-slate-600"
              }`}
            >
              {countRiwayat}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("semua")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer ${
              activeTab === "semua"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === "semua"
                  ? "bg-slate-200 text-slate-800 font-extrabold"
                  : "bg-slate-300/60 text-slate-600"
              }`}
            >
              {pendaftaranList.length}
            </span>
          </button>
        </div>

        {/* Konten Daftar Kursus */}
        {loadingData || isLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm">Memuat data kursus Anda...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-sm">
            {activeTab === "aktif" ? (
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            ) : activeTab === "menunggu_bayar" ? (
              <Clock className="w-12 h-12 text-amber-300 mx-auto" />
            ) : activeTab === "selesai" ? (
              <Award className="w-12 h-12 text-emerald-300 mx-auto" />
            ) : (
              <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            )}

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                {activeTab === "aktif"
                  ? "Tidak Ada Kursus yang Sedang Berjalan"
                  : activeTab === "menunggu_bayar"
                  ? "Tidak Ada Tagihan Menunggu Pembayaran"
                  : activeTab === "selesai"
                  ? "Belum Ada Kursus yang Selesai"
                  : activeTab === "riwayat"
                  ? "Tidak Ada Riwayat Pendaftaran Dibatalkan"
                  : "Belum Ada Kursus yang Diikuti"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {activeTab === "aktif"
                  ? "Mulai perjalanan belajar Anda dengan memilih kursus singkat bersertifikat resmi dari katalog."
                  : activeTab === "menunggu_bayar"
                  ? "Seluruh tagihan Anda telah lunas atau belum ada pendaftaran kursus berbayar."
                  : activeTab === "selesai"
                  ? "Selesaikan seluruh modul dan evaluasi kuis untuk meraih sertifikat kelulusan resmi."
                  : "Buka katalog untuk melihat seluruh pilihan kursus Lembaga Kursus Pijar Aksara Depok."}
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:bg-brand-700 transition"
            >
              Jelajahi Katalog Kursus
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item) => {
              const progressPct =
                item.total_modul > 0
                  ? Math.floor((item.modul_lulus / item.total_modul) * 100)
                  : 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Header Card Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                        {item.kursus?.kategori || "Kursus"}
                      </span>

                      {item.status === "aktif" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Sedang Belajar
                        </span>
                      )}
                      {item.status === "selesai" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Lulus Selesai
                        </span>
                      )}
                      {item.status === "menunggu_bayar" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" /> Menunggu Bayar
                        </span>
                      )}
                      {item.status === "kedaluwarsa" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          Kedaluwarsa
                        </span>
                      )}
                      {item.status === "dibatalkan" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          Dibatalkan
                        </span>
                      )}
                    </div>

                    {/* Judul Kursus */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                      {item.kursus?.judul}
                    </h3>

                    {/* FOKUS BELAJAR: Kondisi Aktif / Selesai (Progress Bar & Modul) */}
                    {(item.status === "aktif" || item.status === "selesai") && (
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between text-xs font-medium text-slate-600">
                          <span>Progres Pembelajaran:</span>
                          <span className="font-bold text-slate-800">
                            {item.modul_lulus} / {item.total_modul} Modul ({progressPct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              item.status === "selesai"
                                ? "bg-emerald-500"
                                : "bg-brand-600"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        {/* Tombol Lihat Nilai Kuis (BR-12) */}
                        <div className="pt-1">
                          <button
                            onClick={() => setSelectedRekapItem(item)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 hover:text-brand-800 hover:underline cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Lihat Rekap Nilai Kuis (Transkrip)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FOKUS FINANSIAL: Kondisi Menunggu Bayar (Info Tagihan & Batas Bayar 24 Jam) */}
                    {item.status === "menunggu_bayar" && (
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
                        <div className="flex justify-between text-slate-700">
                          <span>Nominal Tagihan:</span>
                          <span className="font-extrabold text-slate-900">
                            {formatRupiah(item.nominal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Metode Pembayaran:</span>
                          <span className="capitalize font-semibold">
                            {item.metode_bayar.replace("_", " ")}
                          </span>
                        </div>
                        {item.batas_bayar && (
                          <div className="flex justify-between text-amber-900 font-bold pt-1.5 border-t border-amber-200/80">
                            <span>Batas Bayar 24 Jam:</span>
                            <span>
                              {new Date(item.batas_bayar).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* FOKUS RIWAYAT: Keterangan Dibatalkan atau Kedaluwarsa */}
                    {(item.status === "kedaluwarsa" || item.status === "dibatalkan") && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                        <span className="font-semibold text-slate-700 block">Keterangan:</span>
                        <p className="line-clamp-2">
                          {item.alasan_batal ||
                            (item.status === "kedaluwarsa"
                              ? "Melewati batas bayar 24 jam. Kuota kursi telah dikembalikan ke katalog."
                              : "Pendaftaran dibatalkan.")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions Sesuai Status & PRD */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Status Aktif: Tombol Lanjutkan Belajar */}
                    {item.status === "aktif" && (
                      <Link
                        href={`/kursus-saya/${item.id}/modul/1`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        Lanjutkan Belajar <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {/* Status Selesai: Tombol Lihat Sertifikat (Versi Cetak) & Ulas Materi */}
                    {item.status === "selesai" && (
                      <div className="w-full flex gap-2">
                        <Link
                          href={`/kursus-saya/${item.id}/modul/1`}
                          className="flex-1 text-center py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          Ulas Materi
                        </Link>
                        <Link
                          href={`/kursus-saya/${item.id}/sertifikat`}
                          className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" /> Cetak Sertifikat
                        </Link>
                      </div>
                    )}

                    {/* Status Menunggu Bayar: Tombol Batal & Tombol Bayar */}
                    {item.status === "menunggu_bayar" && (
                      <div className="w-full flex gap-2">
                        <button
                          onClick={() => confirmBatalPendaftaran(item.id)}
                          disabled={cancelingId === item.id}
                          className="flex-1 py-2 px-3 rounded-xl border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                        >
                          {cancelingId === item.id ? "Membatalkan..." : "Batalkan"}
                        </button>
                        {item.metode_bayar === "transfer_manual" ? (
                          <button
                            onClick={() => setSelectedTransferItem(item)}
                            className="flex-1 text-center py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Building2 className="w-3.5 h-3.5" /> Petunjuk Transfer
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBayar(item)}
                            disabled={payingId === item.id}
                            className="flex-1 text-center py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            {payingId === item.id ? "Memproses..." : "Bayar via Mayar"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Status Kedaluwarsa / Dibatalkan: Tombol Daftar Ulang */}
                    {(item.status === "kedaluwarsa" || item.status === "dibatalkan") && (
                      <Link
                        href={`/kursus/${item.kursus?.slug}`}
                        className="w-full text-center py-2.5 px-4 rounded-xl border border-brand-200 text-xs font-bold text-brand-600 hover:bg-brand-50 transition"
                      >
                        Daftar Ulang Kursus Ini
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Rekap Nilai Kuis & Data Peserta (BR-12) */}
      {selectedRekapItem && (
        <ModalRekapNilai
          isOpen={!!selectedRekapItem}
          onClose={() => setSelectedRekapItem(null)}
          pesertaData={{
            nama_lengkap: profile?.nama_lengkap || user?.email?.split("@")[0] || "Peserta",
            email: user?.email || "-",
            no_hp: profile?.no_hp || null,
          }}
          kursusJudul={selectedRekapItem.kursus?.judul || ""}
          nilaiLulus={selectedRekapItem.kursus?.nilai_lulus || 70}
          modulList={selectedRekapItem.kursus?.modul || []}
          progresList={selectedRekapItem.progres_modul}
          percobaanList={selectedRekapItem.percobaan_kuis}
        />
      )}

      {/* Modal Petunjuk Transfer Bank Manual */}
      <ModalPetunjukTransfer
        isOpen={!!selectedTransferItem}
        onClose={() => setSelectedTransferItem(null)}
        data={selectedTransferItem}
      />

      {/* Modal Simulasi Pembayaran Mayar Sandbox */}
      <ModalSimulasiMayar
        isOpen={!!selectedMayarSimulasiItem}
        onClose={() => setSelectedMayarSimulasiItem(null)}
        data={selectedMayarSimulasiItem}
        onSuccess={(msg) => {
          setAlertModal({
            isOpen: true,
            title: "Pembayaran Berhasil",
            message: msg,
            type: "success",
          });
          loadData();
        }}
      />

      {/* Modal Konfirmasi Pembatalan Pendaftaran (BR-07) */}
      <ConfirmModal
        isOpen={batalModalOpen}
        onClose={() => {
          setBatalModalOpen(false);
          setSelectedBatalId(null);
        }}
        onConfirm={handleBatalPendaftaran}
        title="Batalkan Pendaftaran Kursus?"
        message="Pendaftaran yang belum dibayar ini akan dibatalkan dan kursi akan dikembalikan. Anda dapat mendaftar kembali kapan saja melalui katalog kursus."
        confirmLabel="Ya, Batalkan"
        cancelLabel="Kembali"
        variant="danger"
        loading={cancelingId !== null}
      />

      {/* Modal Notifikasi / Alert Sistem */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
