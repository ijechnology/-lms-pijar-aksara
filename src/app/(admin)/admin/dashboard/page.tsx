"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import GrafikPendaftaranMingguan, {
  PendaftaranMingguanItem,
} from "@/components/admin/GrafikPendaftaranMingguan";
import GrafikPendapatanMingguan, {
  PendapatanMingguanItem,
} from "@/components/admin/GrafikPendapatanMingguan";
import GrafikPenyelesaianKursus, {
  PenyelesaianKursusItem,
} from "@/components/admin/GrafikPenyelesaianKursus";
import {
  TrendingUp,
  CreditCard,
  Users,
  Award,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  GraduationCap,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

interface ModulLulusPertamaItem {
  modul_id: string;
  modul_judul: string;
  modul_urutan: number;
  kursus_id: string;
  kursus_judul: string;
  instruktur_nama: string;
  total_percobaan_pertama: number;
  total_lulus_pertama: number;
  persen_lulus: number;
  rata_rata_nilai: number;
}

interface KursusKapasitasItem {
  id: string;
  judul: string;
  kategori: string;
  kuota: number;
  kursi_terpakai: number;
  sisa_kursi: number;
  persen_keterisian: number;
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  // Filter Rentang Tanggal: 3 Pilihan Bersih (8 Minggu, Bulan Ini, Custom)
  const rentangParam = searchParams.get("rentang") || "8w";
  const dariParam = searchParams.get("dari") || "";
  const sampaiParam = searchParams.get("sampai") || "";

  const [rentang, setRentang] = useState<string>(rentangParam);
  const [customDari, setCustomDari] = useState<string>(dariParam);
  const [customSampai, setCustomSampai] = useState<string>(sampaiParam);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(rentangParam === "kustom");

  const [loading, setLoading] = useState(true);

  // 1. KARTU RINGKASAN
  const [summaryCards, setSummaryCards] = useState({
    pendaftaranBulanIni: 0,
    pendapatanBulanIni: 0,
    pesertaAktif: 0,
    sertifikatTerbit: 0,
  });

  // 2. GRAFIK ANALITIK
  const [chartPendaftaranMingguan, setChartPendaftaranMingguan] = useState<
    PendaftaranMingguanItem[]
  >([]);
  const [chartPendapatanMingguan, setChartPendapatanMingguan] = useState<
    PendapatanMingguanItem[]
  >([]);
  const [chartPenyelesaianKursus, setChartPenyelesaianKursus] = useState<
    PenyelesaianKursusItem[]
  >([]);

  // 3. DAFTAR ANALITIK RAMAH UX
  const [modulLulusPertamaList, setModulLulusPertamaList] = useState<
    ModulLulusPertamaItem[]
  >([]);
  const [kursusHampirPenuhList, setKursusHampirPenuhList] = useState<
    KursusKapasitasItem[]
  >([]);

  // Cron Pemicu Pengingat
  const [cronLoading, setCronLoading] = useState(false);
  const [cronFeedback, setCronFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const dataLoadedRef = useRef(false);

  // Ubah Rentang Filter (Hanya 3: 8w, bulan-ini, kustom)
  const handleGantiRentang = (val: string) => {
    setRentang(val);
    if (val === "kustom") {
      setIsCustomMode(true);
    } else {
      setIsCustomMode(false);
      router.push(`/admin/dashboard?rentang=${val}`, { scroll: false });
    }
  };

  const handleTerapkanKustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDari || !customSampai) return;
    router.push(
      `/admin/dashboard?rentang=kustom&dari=${customDari}&sampai=${customSampai}`,
      { scroll: false }
    );
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    if (!dataLoadedRef.current) {
      setLoading(true);
    }
    try {
      const now = new Date();

      // Tentukan rentang tanggal filter
      let filterStartDate = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000); // 8 Minggu default
      let filterEndDate = new Date(now.getTime());

      if (rentang === "bulan-ini") {
        filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      } else if (rentang === "kustom" && customDari && customSampai) {
        filterStartDate = new Date(`${customDari}T00:00:00`);
        filterEndDate = new Date(`${customSampai}T23:59:59`);
      }

      // 1. Ambil Data Pendaftaran
      const { data: pendaftaranData, error: pErr } = await supabase
        .from("pendaftaran")
        .select(`
          id, status, nominal, didaftarkan_pada, dibayar_pada, batas_bayar, kursus_id,
          kursus (id, judul, slug, harga, kuota, kategori, status)
        `);

      if (pErr) throw pErr;

      // 2. Ambil Data Kursus untuk Kapasitas dan Penyelesaian
      const { data: kursusData, error: kErr } = await supabase
        .from("kursus")
        .select("id, judul, slug, kategori, harga, kuota, status");

      if (kErr) throw kErr;

      // 3. Ambil Total Sertifikat Terbit
      const { count: sertifikatCount } = await supabase
        .from("sertifikat")
        .select("id", { count: "exact", head: true });

      // 4. Ambil Analisis Modul Lulus Percobaan Pertama Terendah via RPC
      const { data: rpcModulData, error: rpcErr } = await supabase.rpc(
        "get_analisis_modul_lulus_pertama"
      );

      if (!rpcErr && rpcModulData) {
        setModulLulusPertamaList(rpcModulData.slice(0, 5));
      }

      const allRegs = pendaftaranData || [];
      const kursusList = kursusData || [];

      // -------------------------------------------------------------
      // HITUNG KARTU RINGKASAN:
      // 1. Pendaftaran bulan ini
      // 2. Pendapatan bulan ini
      // 3. Peserta aktif
      // 4. Sertifikat terbit
      // -------------------------------------------------------------
      const startOfBulanIni = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfBulanIni = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      let regBulanIniCount = 0;
      let revBulanIni = 0;
      let pesertaAktifCount = 0;

      allRegs.forEach((r: any) => {
        const regDate = r.didaftarkan_pada ? new Date(r.didaftarkan_pada) : null;
        const payDate = r.dibayar_pada ? new Date(r.dibayar_pada) : regDate;
        const nominal = r.nominal ?? r.kursus?.harga ?? 0;

        // Pendaftaran bulan ini
        if (regDate && regDate >= startOfBulanIni && regDate <= endOfBulanIni) {
          regBulanIniCount += 1;
        }

        // Pendapatan bulan ini (pendaftaran aktif dan selesai yang sudah dibayar)
        if (
          (r.status === "aktif" || r.status === "selesai") &&
          payDate &&
          payDate >= startOfBulanIni &&
          payDate <= endOfBulanIni
        ) {
          revBulanIni += nominal;
        }

        // Peserta aktif
        if (r.status === "aktif") {
          pesertaAktifCount += 1;
        }
      });

      setSummaryCards({
        pendaftaranBulanIni: regBulanIniCount,
        pendapatanBulanIni: revBulanIni,
        pesertaAktif: pesertaAktifCount,
        sertifikatTerbit: sertifikatCount || 0,
      });

      // -------------------------------------------------------------
      // HITUNG GRAFIK BATANG PENDAFTARAN & GARIS PENDAPATAN PER MINGGU
      // -------------------------------------------------------------
      const DAY_MS = 24 * 60 * 60 * 1000;
      const totalSpanDays = Math.max(
        7,
        Math.ceil((filterEndDate.getTime() - filterStartDate.getTime()) / DAY_MS)
      );
      const weekCount = Math.max(1, Math.ceil(totalSpanDays / 7));

      const weeklyBuckets: Array<{
        start: Date;
        end: Date;
        minggu: string;
        tanggal: string;
        gratis: number;
        berbayar: number;
        total: number;
        pendapatan: number;
      }> = [];

      let curStart = new Date(filterStartDate.getTime());

      for (let i = 0; i < weekCount; i++) {
        const curEnd = new Date(
          Math.min(filterEndDate.getTime(), curStart.getTime() + 7 * DAY_MS)
        );
        const startLabel = curStart.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
        const endLabel = new Date(curEnd.getTime() - 1000).toLocaleDateString(
          "id-ID",
          { day: "numeric", month: "short" }
        );

        weeklyBuckets.push({
          start: new Date(curStart),
          end: new Date(curEnd),
          minggu: `Mgg ${i + 1}`,
          tanggal: `${startLabel} - ${endLabel}`,
          gratis: 0,
          berbayar: 0,
          total: 0,
          pendapatan: 0,
        });

        curStart = curEnd;
        if (curStart >= filterEndDate) break;
      }

      allRegs.forEach((r: any) => {
        const regDate = r.didaftarkan_pada ? new Date(r.didaftarkan_pada) : null;
        const payDate = r.dibayar_pada ? new Date(r.dibayar_pada) : regDate;
        const nominal = r.nominal ?? r.kursus?.harga ?? 0;
        const isGratis = nominal === 0;
        const isLunas = r.status === "aktif" || r.status === "selesai";

        // Alokasikan ke bucket mingguan pendaftaran
        if (regDate && regDate >= filterStartDate && regDate <= filterEndDate) {
          for (const b of weeklyBuckets) {
            if (regDate >= b.start && regDate < b.end) {
              if (isGratis) {
                b.gratis += 1;
              } else {
                b.berbayar += 1;
              }
              b.total += 1;
              break;
            }
          }
        }

        // Alokasikan ke bucket mingguan pendapatan
        if (
          isLunas &&
          nominal > 0 &&
          payDate &&
          payDate >= filterStartDate &&
          payDate <= filterEndDate
        ) {
          for (const b of weeklyBuckets) {
            if (payDate >= b.start && payDate < b.end) {
              b.pendapatan += nominal;
              break;
            }
          }
        }
      });

      setChartPendaftaranMingguan(
        weeklyBuckets.map((b) => ({
          minggu: b.minggu,
          tanggal: b.tanggal,
          gratis: b.gratis,
          berbayar: b.berbayar,
          total: b.total,
        }))
      );

      setChartPendapatanMingguan(
        weeklyBuckets.map((b) => ({
          minggu: b.minggu,
          tanggal: b.tanggal,
          pendapatan: b.pendapatan,
        }))
      );

      // -------------------------------------------------------------
      // HITUNG GRAFIK BATANG TINGKAT PENYELESAIAN PER KURSUS:
      // (selesai dibagi aktif ditambah selesai)
      // -------------------------------------------------------------
      const completionList: PenyelesaianKursusItem[] = [];
      const hampirPenuhTemp: KursusKapasitasItem[] = [];

      kursusList.forEach((k: any) => {
        const regsForK = allRegs.filter((r: any) => r.kursus_id === k.id);

        const aktifK = regsForK.filter((r: any) => r.status === "aktif").length;
        const selesaiK = regsForK.filter((r: any) => r.status === "selesai").length;
        const totalBelajarK = aktifK + selesaiK;

        const persenSelesai =
          totalBelajarK > 0 ? Math.round((selesaiK / totalBelajarK) * 100) : 0;

        if (totalBelajarK > 0) {
          completionList.push({
            id: k.id,
            kursus: k.judul,
            persenSelesai,
            selesai: selesaiK,
            aktif: aktifK,
            totalBelajar: totalBelajarK,
          });
        }

        // -------------------------------------------------------------
        // HITUNG DAFTAR KURSUS HAMPIR PENUH (sisa kursi 2 atau kurang):
        // -------------------------------------------------------------
        if (k.status === "terbit") {
          const kursiTerpakai = regsForK.filter(
            (r: any) =>
              r.status === "aktif" ||
              r.status === "selesai" ||
              (r.status === "menunggu_bayar" &&
                r.batas_bayar &&
                new Date(r.batas_bayar) > now)
          ).length;

          const sisaKursi = Math.max(0, k.kuota - kursiTerpakai);
          const persenKeterisian =
            k.kuota > 0 ? Math.round((kursiTerpakai / k.kuota) * 100) : 0;

          if (sisaKursi <= 2) {
            hampirPenuhTemp.push({
              id: k.id,
              judul: k.judul,
              kategori: k.kategori,
              kuota: k.kuota,
              kursi_terpakai: kursiTerpakai,
              sisa_kursi: sisaKursi,
              persen_keterisian: persenKeterisian,
            });
          }
        }
      });

      completionList.sort((a, b) => a.persenSelesai - b.persenSelesai);
      setChartPenyelesaianKursus(completionList);

      hampirPenuhTemp.sort((a, b) => a.sisa_kursi - b.sisa_kursi);
      setKursusHampirPenuhList(hampirPenuhTemp);
    } catch (err) {
      console.error("Gagal memuat data dasbor analitik admin:", err);
    } finally {
      dataLoadedRef.current = true;
      setLoading(false);
    }
  }, [user?.id, supabase, rentang, customDari, customSampai]);

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

  // Handler Uji Coba Cron Pengingat 3 Jam (Kirimkan Bearer Session Token agar selalu lolos otorisasi)
  const handleTriggerCronManual = async () => {
    setCronLoading(true);
    setCronFeedback(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/cron/pengingat-bayar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses cron pengingat bayar.");
      }
      setCronFeedback({
        type: "success",
        message:
          data.message ||
          `Scheduler cron berhasil dijalankan! ${data.sent ?? 0} email pengingat (sisa <= 3 jam) terkirim.`,
      });
    } catch (err) {
      setCronFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Gagal memicu cron pengingat batas bayar.",
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
        {/* HEADER & FILTER RENTANG TANGGAL (Hanya 3 Pilihan Bersih) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" /> Ringkasan Analitik Eksekutif
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dasbor LMS Pijar Aksara
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Pantau pendaftaran, pendapatan mingguan, retensi kursus, dan peringatan kapasitas kursi secara akurat.
            </p>
          </div>

          {/* FILTER RENTANG: 8 Minggu | Bulan Ini | Custom */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs self-start lg:self-auto">
            <button
              type="button"
              onClick={() => handleGantiRentang("8w")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                rentang === "8w" && !isCustomMode
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              8 Minggu
            </button>
            <button
              type="button"
              onClick={() => handleGantiRentang("bulan-ini")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                rentang === "bulan-ini" && !isCustomMode
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => handleGantiRentang("kustom")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                isCustomMode
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* INPUT TANGGAL CUSTOM JIKA MODE CUSTOM AKTIF */}
        {isCustomMode && (
          <form
            onSubmit={handleTerapkanKustom}
            className="bg-white p-4 rounded-2xl border border-brand-200 shadow-sm flex flex-wrap items-center gap-4 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Dari:</span>
              <input
                type="date"
                required
                value={customDari}
                onChange={(e) => setCustomDari(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Sampai:</span>
              <input
                type="date"
                required
                value={customSampai}
                onChange={(e) => setCustomSampai(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition"
            >
              Terapkan Tanggal
            </button>
          </form>
        )}

        {/* NOTIFIKASI HASIL TES CRON */}
        {cronFeedback && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              cronFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span>{cronFeedback.message}</span>
            <button
              onClick={() => setCronFeedback(null)}
              className="ml-4 font-bold hover:underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* 4 KARTU RINGKASAN PERSIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Pendaftaran Bulan Ini */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pendaftaran Bulan Ini
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900">
                {summaryCards.pendaftaranBulanIni}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Pendaftar baru bulan kalender ini
              </p>
            </div>
          </div>

          {/* 2. Pendapatan Bulan Ini */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pendapatan Bulan Ini
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900">
                {formatRupiah(summaryCards.pendapatanBulanIni)}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Transaksi lunas bulan ini
              </p>
            </div>
          </div>

          {/* 3. Peserta Aktif */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Peserta Aktif
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900">
                {summaryCards.pesertaAktif}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Sedang aktif belajar saat ini
              </p>
            </div>
          </div>

          {/* 4. Sertifikat Terbit */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sertifikat Terbit
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900">
                {summaryCards.sertifikatTerbit}
              </h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">
                Kelulusan resmi terverifikasi
              </p>
            </div>
          </div>
        </div>

        {/* GRAFIK 1 & 2: Pendaftaran Mingguan & Pendapatan Mingguan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Pendaftaran per Minggu (Gratis vs Berbayar)
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan volume pendaftar kursus gratis dan berbayar setiap minggu
              </p>
            </div>
            <GrafikPendaftaranMingguan data={chartPendaftaranMingguan} />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Pendapatan per Minggu
              </h3>
              <p className="text-xs text-slate-500">
                Tren omset dari pendaftaran aktif dan selesai yang sudah lunas dibayar
              </p>
            </div>
            <GrafikPendapatanMingguan data={chartPendapatanMingguan} />
          </div>
        </div>

        {/* GRAFIK 3: Tingkat Penyelesaian per Kursus (Lega & Dilengkapi Kontrol Limit) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" />
                Tingkat Penyelesaian per Kursus
              </h3>
              <p className="text-xs text-slate-500">
                Rasio kelulusan: <span className="font-semibold text-slate-700">selesai &divide; (aktif + selesai) &times; 100%</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                &ge; 75%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                50-74%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                25-49%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                &lt; 25%
              </span>
            </div>
          </div>
          <GrafikPenyelesaianKursus data={chartPenyelesaianKursus} />
        </div>

        {/* DUA WIDGET ANALITIK RAMAH UX (CARD-BASED, SEKALI LIHAT, TANPA SCROLL HORIZONTAL) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WIDGET 1: Modul Tingkat Lulus Percobaan Pertama Terendah */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Modul Tingkat Lulus Tes Pertama Terendah
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Masukan evaluasi kurikulum untuk instruktur terkait modul yang menantang
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Menganalisis hasil tes kuis pertama...
              </div>
            ) : modulLulusPertamaList.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Belum ada data pengerjaan kuis pada sistem.
              </div>
            ) : (
              <div className="space-y-3">
                {modulLulusPertamaList.map((item, idx) => (
                  <div
                    key={item.modul_id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          Modul {item.modul_urutan}: {item.modul_judul}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.kursus_judul} &bull;{" "}
                          <span className="font-semibold text-brand-600">
                            {item.instruktur_nama}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {item.total_lulus_pertama} dari {item.total_percobaan_pertama} peserta lulus langsung (Rata-rata: {item.rata_rata_nilai})
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 flex-shrink-0 pl-9 sm:pl-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          item.persen_lulus < 50
                            ? "bg-rose-100 text-rose-700"
                            : item.persen_lulus < 75
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {item.persen_lulus}% Lulus
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Percobaan ke-1
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>
                Data ini membantu instruktur menyempurnakan materi atau tingkat kesulitan soal kuis.
              </span>
            </div>
          </div>

          {/* WIDGET 2: Peringatan Kapasitas Kursus (Sisa Kursi <= 2) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Kursus Hampir Penuh (Sisa Kursi &le; 2)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Peringatan kritis kapasitas kursi kursus terbit untuk penambahan kuota segera
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Memeriksa ketersediaan kursi...
              </div>
            ) : kursusHampirPenuhList.length === 0 ? (
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs sm:text-sm">
                    Kapasitas Kursus Terbit Aman
                  </h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Semua kursus terbit saat ini memiliki lebih dari 2 kursi tersedia untuk pendaftar baru.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {kursusHampirPenuhList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/20 hover:bg-rose-50/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            item.sisa_kursi === 0
                              ? "bg-rose-600 text-white"
                              : item.sisa_kursi === 1
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.sisa_kursi === 0
                            ? "Penuh (0 Kursi)"
                            : `Sisa ${item.sisa_kursi} Kursi`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.kategori}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate mt-1">
                        {item.judul}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full"
                            style={{
                              width: `${Math.min(100, item.persen_keterisian)}%`,
                            }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700">
                          {item.kursi_terpakai} / {item.kuota} terpakai ({item.persen_keterisian}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 self-end sm:self-center">
                      <Link
                        href="/admin"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-brand-500 text-slate-700 hover:text-brand-600 font-bold text-xs shadow-xs transition"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
                        <span>Ubah Kuota</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center justify-between">
              <span>Hanya memantau kursus terbit dengan sisa kursi &le; 2.</span>
              <Link href="/admin" className="font-bold text-brand-600 hover:underline">
                Kelola Kursus &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION CRON PENGINGAT 3 JAM */}
        <div className="bg-gradient-to-r from-slate-900 to-brand-950 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" /> Penjadwal Terotomatisasi (Scheduler Cron)
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Pengingat Batas Waktu Pembayaran (Tersisa 3 Jam)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sistem secara otomatis mengecek invoice <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">menunggu_bayar</code> yang jatuh tempo dalam jendela sisa waktu &le; 3 jam. Email pengingat hanya dikirim satu kali pada fase krusial ini sebelum tagihan kedaluwarsa otomatis.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={handleTriggerCronManual}
              disabled={cronLoading}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{cronLoading ? "Mengecek Tagihan..." : "Tes Cron Pengingat (3 Jam)"}</span>
            </button>
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
