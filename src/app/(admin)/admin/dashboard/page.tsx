"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import GrafikPendaftaran from "@/components/admin/GrafikPendaftaran";
import GrafikPendapatan from "@/components/admin/GrafikPendapatan";
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Shield,
  Filter,
  Calendar,
  AlertTriangle,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  BellRing,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

interface KursusStatItem {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  harga: number;
  kuota: number;
  status: string;
  nilai_lulus: number;
  kursi_terpakai: number;
  total_belajar: number;
  jumlah_selesai: number;
  persen_kelulusan: number;
  persen_keterisian: number;
  sisa_kursi: number;
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  // Filter Rentang Periode (?rentang=8w | 4w | semua) - Sesuai PETA_ROUTE §3
  const rentangParam = searchParams.get("rentang") || "8w";
  const [rentang, setRentang] = useState<string>(rentangParam);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPendapatan: 0,
    pendaftaranAktif: 0,
    menungguTinjauan: 0,
    totalSertifikat: 0,
    totalKursusTerbit: 0,
  });

  const [chartPendaftaran, setChartPendaftaran] = useState<
    Array<{ nama: string; total: number; aktif: number }>
  >([]);
  const [chartPendapatan, setChartPendapatan] = useState<
    Array<{ periode: string; pendapatan: number }>
  >([]);

  // 2 Tabel Analitik Khusus (Plan Task 9 & PETA_ROUTE §1)
  const [kelulusanTerendahList, setKelulusanTerendahList] = useState<KursusStatItem[]>([]);
  const [kursiHampirPenuhList, setKursiHampirPenuhList] = useState<KursusStatItem[]>([]);

  // Pemicu Cron Manual
  const [cronLoading, setCronLoading] = useState(false);
  const [cronFeedback, setCronFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const dataLoadedRef = useRef(false);

  // Ubah URL Search Params saat rentang berubah
  const handleGantiRentang = (val: string) => {
    setRentang(val);
    router.push(`/admin/dashboard?rentang=${val}`, { scroll: false });
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    if (!dataLoadedRef.current) {
      setLoading(true);
    }
    try {
      // 1. Tentukan tanggal batas rentang
      const now = new Date();
      let filterStartDate: Date | null = null;
      if (rentang === "8w") {
        filterStartDate = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);
      } else if (rentang === "4w") {
        filterStartDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      }

      // 2. Ambil seluruh data pendaftaran
      const { data: pendaftaranData, error: pErr } = await supabase
        .from("pendaftaran")
        .select(`
          id, status, nominal, didaftarkan_pada, batas_bayar, kursus_id,
          kursus (id, judul, slug, harga, kuota, kategori, status, nilai_lulus)
        `);

      if (pErr) throw pErr;

      // 3. Ambil data kursus untuk agregasi tabel analitik
      const { data: kursusData, error: kAllErr } = await supabase
        .from("kursus")
        .select("id, judul, slug, kategori, harga, kuota, status, nilai_lulus");

      if (kAllErr) throw kAllErr;

      // 4. Hitung jumlah status ditinjau, sertifikat, dan kursus terbit
      const { count: ditinjauCount } = await supabase
        .from("kursus")
        .select("id", { count: "exact", head: true })
        .eq("status", "ditinjau");

      const { count: sertifikatCount } = await supabase
        .from("sertifikat")
        .select("id", { count: "exact", head: true });

      const { count: terbitCount } = await supabase
        .from("kursus")
        .select("id", { count: "exact", head: true })
        .eq("status", "terbit");

      // 5. Agregasi Pendaftaran & Pendapatan sesuai Filter Rentang
      const allRegs = pendaftaranData || [];
      let pendapatan = 0;
      let aktifCount = 0;
      const kursusStatsMap: { [judul: string]: { total: number; aktif: number } } = {};
      const periodeMap: { [key: string]: number } = {};

      allRegs.forEach((r: any) => {
        const regDate = r.didaftarkan_pada ? new Date(r.didaftarkan_pada) : null;
        const masukRentang =
          !filterStartDate || (regDate && regDate >= filterStartDate);

        const kJudul = r.kursus?.judul || "Kursus Lain";
        const kHarga = r.nominal ?? r.kursus?.harga ?? 0;

        if (masukRentang) {
          if (!kursusStatsMap[kJudul]) {
            kursusStatsMap[kJudul] = { total: 0, aktif: 0 };
          }
          kursusStatsMap[kJudul].total += 1;

          if (r.status === "aktif" || r.status === "selesai") {
            aktifCount += 1;
            pendapatan += kHarga;
            kursusStatsMap[kJudul].aktif += 1;

            // Kelompokkan pendapatan berdasarkan label periode
            if (regDate) {
              const label = regDate.toLocaleDateString("id-ID", {
                month: "short",
                year: "2-digit",
              });
              periodeMap[label] = (periodeMap[label] || 0) + kHarga;
            }
          }
        }
      });

      setStats({
        totalPendapatan: pendapatan,
        pendaftaranAktif: aktifCount,
        menungguTinjauan: ditinjauCount || 0,
        totalSertifikat: sertifikatCount || 0,
        totalKursusTerbit: terbitCount || 0,
      });

      // Format Grafik Pendaftaran (Top 6 Kursus)
      const formattedChartPendaftaran = Object.entries(kursusStatsMap)
        .map(([nama, data]) => ({
          nama: nama.length > 20 ? nama.substring(0, 18) + "..." : nama,
          total: data.total,
          aktif: data.aktif,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);
      setChartPendaftaran(formattedChartPendaftaran);

      // Format Grafik Pendapatan
      const formattedChartPendapatan = Object.entries(periodeMap).map(([periode, sum]) => ({
        periode,
        pendapatan: sum,
      }));
      setChartPendapatan(formattedChartPendapatan);

      // 6. Hitung Metrik untuk Tabel Kelulusan Terendah & Kursi Hampir Penuh
      const kursusList = kursusData || [];
      const computedKursus: KursusStatItem[] = kursusList.map((k: any) => {
        // Ambil pendaftaran untuk kursus ini
        const regsForK = allRegs.filter((r: any) => r.kursus_id === k.id);

        // Kursi terpakai (BR-06)
        const kursiTerpakai = regsForK.filter(
          (r: any) =>
            r.status === "aktif" ||
            r.status === "selesai" ||
            (r.status === "menunggu_bayar" && r.batas_bayar && new Date(r.batas_bayar) > now)
        ).length;

        // Peserta belajar (aktif + selesai)
        const totalBelajar = regsForK.filter(
          (r: any) => r.status === "aktif" || r.status === "selesai"
        ).length;

        // Peserta selesai
        const jumlahSelesai = regsForK.filter((r: any) => r.status === "selesai").length;

        const persenKelulusan =
          totalBelajar > 0 ? Math.round((jumlahSelesai / totalBelajar) * 100) : 0;
        const persenKeterisian =
          k.kuota > 0 ? Math.round((kursiTerpakai / k.kuota) * 100) : 0;
        const sisaKursi = Math.max(0, k.kuota - kursiTerpakai);

        return {
          id: k.id,
          judul: k.judul,
          slug: k.slug,
          kategori: k.kategori,
          harga: k.harga,
          kuota: k.kuota,
          status: k.status,
          nilai_lulus: k.nilai_lulus,
          kursi_terpakai: kursiTerpakai,
          total_belajar: totalBelajar,
          jumlah_selesai: jumlahSelesai,
          persen_kelulusan: persenKelulusan,
          persen_keterisian: persenKeterisian,
          sisa_kursi: sisaKursi,
        };
      });

      // A. Tabel Kelulusan Terendah:
      // Hanya kursus yang sudah memiliki peserta belajar (total_belajar > 0), urutkan dari persen_kelulusan terkecil
      const lowestCompletion = computedKursus
        .filter((k) => k.total_belajar > 0)
        .sort((a, b) => a.persen_kelulusan - b.persen_kelulusan)
        .slice(0, 5);
      setKelulusanTerendahList(lowestCompletion);

      // B. Tabel Kursi Hampir Penuh:
      // Hanya kursus berstatus 'terbit', urutkan dari persentase keterisian tertinggi
      const almostFull = computedKursus
        .filter((k) => k.status === "terbit")
        .sort((a, b) => b.persen_keterisian - a.persen_keterisian)
        .slice(0, 5);
      setKursiHampirPenuhList(almostFull);
    } catch (err) {
      console.error("Gagal memuat analitik dasbor admin:", err);
    } finally {
      dataLoadedRef.current = true;
      setLoading(false);
    }
  }, [user?.id, supabase, rentang]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/masuk");
      } else if (role !== "admin") {
        router.push("/akses-ditolak");
      } else {
        loadDashboardData();
      }
    }
  }, [user?.id, role, isLoading, router, loadDashboardData]);

  // Handler Jalankan Cron Secara Manual dari Dasbor
  const handleTriggerCronManual = async () => {
    setCronLoading(true);
    setCronFeedback(null);
    try {
      const res = await fetch("/api/cron/pengingat-bayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengeksekusi cron scheduler.");
      }
      setCronFeedback({
        type: "success",
        message:
          data.message ||
          `Scheduler cron berhasil dijalankan! ${data.totalTerkirim ?? 0} email pengingat terkirim.`,
      });
    } catch (err) {
      setCronFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal memicu cron pengingat bayar.",
      });
    } finally {
      setCronLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading || !user || role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Dasbor & Filter Periode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" /> Ringkasan Analitik & Performa
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dasbor Eksekutif LMS
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Pantau metrik pendapatan, partisipasi kursus, evaluasi kelulusan, dan kapasitas kursi secara berkala.
            </p>
          </div>

          {/* Toolbar: Filter Rentang & Tombol Cron Manual */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Rentang Periode (?rentang=8w) */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <span className="px-2 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <button
                onClick={() => handleGantiRentang("8w")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  rentang === "8w"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="8 Minggu Terakhir (Bawaan PRD & PETA_ROUTE)"
              >
                8 Minggu
              </button>
              <button
                onClick={() => handleGantiRentang("4w")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  rentang === "4w"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="4 Minggu Terakhir (1 Bulan)"
              >
                4 Minggu
              </button>
              <button
                onClick={() => handleGantiRentang("semua")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  rentang === "semua"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="Semua Waktu"
              >
                Semua
              </button>
            </div>

            {/* Tombol Uji Pemicu Cron Pengingat Bayar */}
            <button
              onClick={handleTriggerCronManual}
              disabled={cronLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              title="Jalankan scheduler pengecekan tagihan jatuh tempo <= 3 jam secara instan"
            >
              <BellRing className={`w-3.5 h-3.5 ${cronLoading ? "animate-spin" : ""}`} />
              <span>{cronLoading ? "Memproses Cron..." : "Tes Cron Pengingat"}</span>
            </button>
          </div>
        </div>

        {/* Banner Feedback Cron Scheduler */}
        {cronFeedback && (
          <div
            className={`p-4 rounded-xl text-sm flex items-start justify-between gap-3 shadow-xs ${
              cronFeedback.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {cronFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span className="font-medium">{cronFeedback.message}</span>
            </div>
            <button
              onClick={() => setCronFeedback(null)}
              className="font-bold text-xs text-slate-500 hover:text-slate-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* 5 Kartu Metrik Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Total Pendapatan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Pendapatan
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {formatRupiah(stats.totalPendapatan)}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Periode: {rentang === "8w" ? "8 Minggu" : rentang === "4w" ? "4 Minggu" : "Semua Waktu"}
              </p>
            </div>
          </div>

          {/* 2. Pendaftaran Aktif */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pendaftaran Aktif
              </span>
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.pendaftaranAktif}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Peserta aktif & lulus
              </p>
            </div>
          </div>

          {/* 3. Menunggu Tinjauan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Menunggu Tinjauan
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.menungguTinjauan}
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                {stats.menungguTinjauan > 0 ? "Memerlukan moderasi" : "Semua kursus termoderasi"}
              </p>
            </div>
          </div>

          {/* 4. Sertifikat Diterbitkan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sertifikat Terbit
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.totalSertifikat}
              </h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">
                Kelulusan resmi
              </p>
            </div>
          </div>

          {/* 5. Kursus Terbit */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Kursus Terbit
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.totalKursusTerbit}
              </h3>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">
                Di katalog publik
              </p>
            </div>
          </div>
        </div>

        {/* Grafik Analitik Performa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Partisipasi Pendaftaran Kursus
                </h3>
                <p className="text-xs text-slate-500">
                  Perbandingan total pendaftar vs peserta aktif ({rentang === "8w" ? "8 Minggu Terakhir" : rentang === "4w" ? "4 Minggu Terakhir" : "Semua"})
                </p>
              </div>
            </div>
            <GrafikPendaftaran data={chartPendaftaran} />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Tren Pendapatan Terkonfirmasi
                </h3>
                <p className="text-xs text-slate-500">
                  Total omset pembayaran kursus terverifikasi ({rentang === "8w" ? "8 Minggu Terakhir" : rentang === "4w" ? "4 Minggu Terakhir" : "Semua"})
                </p>
              </div>
            </div>
            <GrafikPendapatan data={chartPendapatan} />
          </div>
        </div>

        {/* DUA TABEL ANALITIK KHUSUS: Kelulusan Terendah & Kursi Hampir Penuh (Plan Task 9) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TABEL 1: Kursus dengan Kelulusan Terendah (Evaluasi Kurikulum) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Tingkat Kelulusan Terendah
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Evaluasi kursus dengan rasio kelulusan peserta paling menantang
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">Memuat analisis kelulusan...</div>
              ) : kelulusanTerendahList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Belum ada data aktivitas kursus.</div>
              ) : (
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Kursus</th>
                      <th className="px-3 py-3 text-center">Peserta</th>
                      <th className="px-3 py-3 text-center">Lulus</th>
                      <th className="px-4 py-3">Rasio Kelulusan</th>
                      <th className="px-3 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kelulusanTerendahList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900 max-w-[200px] truncate">
                          <div>{item.judul}</div>
                          <span className="text-[10px] text-slate-400 font-normal">{item.kategori}</span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-700 font-medium">
                          {item.total_belajar}
                        </td>
                        <td className="px-3 py-3 text-center text-slate-700 font-medium">
                          {item.jumlah_selesai}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.persen_kelulusan < 40
                                    ? "bg-rose-500"
                                    : item.persen_kelulusan < 70
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${item.persen_kelulusan}%` }}
                              />
                            </div>
                            <span
                              className={`text-[11px] font-bold ${
                                item.persen_kelulusan < 40
                                  ? "text-rose-600"
                                  : item.persen_kelulusan < 70
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {item.persen_kelulusan}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <Link
                            href={`/instruktur/kursus/${item.id}/peserta?from=admin`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-800 transition"
                            title="Buka rekap progres dan nilai kuis peserta kursus ini"
                          >
                            <span>Rekap Nilai</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* TABEL 2: Kursus Kursi Hampir Penuh (Peringatan Dini Kapasitas) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Kapasitas Kursi Kursus Terbit
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Peringatan kuota peserta hampir penuh untuk penyesuaian kuota (BR-06)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">Memuat status kursi...</div>
              ) : kursiHampirPenuhList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Tidak ada kursus terbit aktif.</div>
              ) : (
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Kursus</th>
                      <th className="px-3 py-3 text-center">Kuota</th>
                      <th className="px-3 py-3 text-center">Terpakai</th>
                      <th className="px-3 py-3 text-center">Sisa Kursi</th>
                      <th className="px-4 py-3">Keterisian</th>
                      <th className="px-3 py-3 text-right">Kelola</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kursiHampirPenuhList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900 max-w-[180px] truncate">
                          <div>{item.judul}</div>
                          <span className="text-[10px] text-slate-400 font-normal">{item.kategori}</span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-600 font-medium">
                          {item.kuota}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-slate-800">
                          {item.kursi_terpakai}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {item.sisa_kursi === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                              Penuh (0)
                            </span>
                          ) : item.sisa_kursi <= 3 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                              Sisa {item.sisa_kursi}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                              Sisa {item.sisa_kursi}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.persen_keterisian >= 90
                                    ? "bg-rose-500"
                                    : item.persen_keterisian >= 70
                                    ? "bg-amber-500"
                                    : "bg-brand-500"
                                }`}
                                style={{ width: `${Math.min(100, item.persen_keterisian)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700">
                              {item.persen_keterisian}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <Link
                            href="/admin"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-800 transition"
                            title="Buka panel admin untuk menyesuaikan kuota kursus"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>Ubah</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
