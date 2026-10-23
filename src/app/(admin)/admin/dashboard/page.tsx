"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ShieldAlert,
  TrendingUp,
  Award,
  AlertCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Shield,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

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

  const dataLoadedRef = useRef(false);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    if (!dataLoadedRef.current) {
      setLoading(true);
    }
    try {
      // 1. Ambil pendaftaran dan kursus untuk metrik pendapatan & grafik
      const { data: pendaftaranData, error: pErr } = await supabase
        .from("pendaftaran")
        .select(`
          id, status, nominal, didaftarkan_pada,
          kursus (id, judul, harga)
        `);

      if (pErr) throw pErr;

      // 2. Ambil kursus status ditinjau
      const { count: ditinjauCount, error: kErr } = await supabase
        .from("kursus")
        .select("id", { count: "exact", head: true })
        .eq("status", "ditinjau");

      if (kErr) throw kErr;

      // 3. Ambil total sertifikat
      const { count: sertifikatCount, error: sErr } = await supabase
        .from("sertifikat")
        .select("id", { count: "exact", head: true });

      if (sErr) throw sErr;

      // 4. Ambil total kursus terbit
      const { count: terbitCount, error: tErr } = await supabase
        .from("kursus")
        .select("id", { count: "exact", head: true })
        .eq("status", "terbit");

      if (tErr) throw tErr;

      // Hitung agregasi
      const allRegs = pendaftaranData || [];
      let pendapatan = 0;
      let aktifCount = 0;
      const kursusStatsMap: { [judul: string]: { total: number; aktif: number } } = {};
      const periodeMap: { [key: string]: number } = {};

      allRegs.forEach((r: any) => {
        const kJudul = r.kursus?.judul || "Kursus Lain";
        const kHarga = r.nominal ?? r.kursus?.harga ?? 0;

        if (!kursusStatsMap[kJudul]) {
          kursusStatsMap[kJudul] = { total: 0, aktif: 0 };
        }
        kursusStatsMap[kJudul].total += 1;

        if (r.status === "aktif" || r.status === "selesai") {
          aktifCount += 1;
          pendapatan += kHarga;
          kursusStatsMap[kJudul].aktif += 1;

          // Kelompokkan pendapatan berdasarkan bulan
          if (r.didaftarkan_pada) {
            const date = new Date(r.didaftarkan_pada);
            const monthYear = date.toLocaleDateString("id-ID", {
              month: "short",
              year: "2-digit",
            });
            periodeMap[monthYear] = (periodeMap[monthYear] || 0) + kHarga;
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

      // Format Data Grafik Pendaftaran (Top 6 Kursus)
      const formattedChartPendaftaran = Object.entries(kursusStatsMap)
        .map(([nama, data]) => ({
          nama: nama.length > 20 ? nama.substring(0, 18) + "..." : nama,
          total: data.total,
          aktif: data.aktif,
        }))
        .slice(0, 6);
      setChartPendaftaran(formattedChartPendaftaran);

      // Format Data Grafik Pendapatan
      const formattedChartPendapatan = Object.entries(periodeMap).map(([periode, sum]) => ({
        periode,
        pendapatan: sum,
      }));
      setChartPendapatan(formattedChartPendapatan);
    } catch (err) {
      console.error("Gagal memuat analitik dasbor admin:", err);
    } finally {
      dataLoadedRef.current = true;
      setLoading(false);
    }
  }, [user?.id, supabase]);

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
        {/* Header Dasbor */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" /> Ringkasan Analitik & Performa
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dasbor Eksekutif LMS
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Pantau metrik pendapatan, partisipasi kursus, dan kelulusan peserta secara berkala.
            </p>
          </div>
        </div>

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
                <CheckCircle2 className="w-3 h-3" /> Akumulasi Lunas & Aktif
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
                  Perbandingan total pendaftar vs peserta aktif/lunas
                </p>
              </div>
            </div>
            <GrafikPendaftaran data={chartPendaftaran} />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Tren Pendapatan Bulanan
                </h3>
                <p className="text-xs text-slate-500">
                  Total omset pembayaran kursus terkonfirmasi
                </p>
              </div>
            </div>
            <GrafikPendapatan data={chartPendapatan} />
          </div>
        </div>
      </main>
    </div>
  );
}
