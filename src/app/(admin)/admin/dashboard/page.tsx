"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import GrafikPendaftaran from "@/components/admin/GrafikPendaftaran";
import GrafikPendapatan from "@/components/admin/GrafikPendapatan";
import TabTinjauanKursus from "@/components/admin/TabTinjauanKursus";
import TabPendaftaranBayar from "@/components/admin/TabPendaftaranBayar";
import TabPengguna from "@/components/admin/TabPengguna";
import TabAuditLog from "@/components/admin/TabAuditLog";
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
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<
    "analitik" | "tinjauan" | "pendaftaran" | "pengguna" | "audit"
  >("analitik");

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

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Ambil pendaftaran dan kursus untuk metrik pendapatan & grafik
      const { data: pendaftaranData, error: pErr } = await supabase
        .from("pendaftaran")
        .select(`
          id, status_pembayaran, dibuat_pada,
          kursus (id, judul, harga)
        `);

      if (pErr) throw pErr;

      // 2. Ambil kursus status ditinjau
      const { data: kursusDitinjau, error: kErr } = await supabase
        .from("kursus")
        .select("id, status")
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
        const kHarga = r.kursus?.harga || 0;

        if (!kursusStatsMap[kJudul]) {
          kursusStatsMap[kJudul] = { total: 0, aktif: 0 };
        }
        kursusStatsMap[kJudul].total += 1;

        if (r.status_pembayaran === "aktif") {
          aktifCount += 1;
          pendapatan += kHarga;
          kursusStatsMap[kJudul].aktif += 1;

          // Kelompokkan pendapatan berdasarkan bulan
          const date = new Date(r.dibuat_pada);
          const monthYear = date.toLocaleDateString("id-ID", {
            month: "short",
            year: "2-digit",
          });
          periodeMap[monthYear] = (periodeMap[monthYear] || 0) + kHarga;
        }
      });

      setStats({
        totalPendapatan: pendapatan,
        pendaftaranAktif: aktifCount,
        menungguTinjauan: (kursusDitinjau || []).length,
        totalSertifikat: sertifikatCount || 0,
        totalKursusTerbit: terbitCount || 0,
      });

      // Format Data Grafik Pendaftaran (Top 6 Kursus)
      const formattedChartPendaftaran = Object.entries(kursusStatsMap)
        .slice(0, 6)
        .map(([nama, counts]) => ({
          nama: nama.length > 18 ? nama.substring(0, 18) + "..." : nama,
          total: counts.total,
          aktif: counts.aktif,
        }));
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
      setLoading(false);
    }
  }, [user, supabase]);

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
  }, [isLoading, user, role, router, loadDashboardData]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Memuat Dasbor Administrator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Dasbor */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800">
                Pusat Kontrol Sistem
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Dasbor Manajemen Lembaga
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pantau kinerja operasional, moderasi kurikulum kursus, verifikasi pembayaran, dan audit sistem.
            </p>
          </div>
        </div>

        {/* Tab Navigasi Utama */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("analitik")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === "analitik"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Ringkasan Analitik
          </button>

          <button
            onClick={() => setActiveTab("tinjauan")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === "tinjauan"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Tinjauan Kursus
            {stats.menungguTinjauan > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-white">
                {stats.menungguTinjauan}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("pendaftaran")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === "pendaftaran"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Pendaftaran & Pembayaran
          </button>

          <button
            onClick={() => setActiveTab("pengguna")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === "pengguna"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-4 h-4" /> Manajemen Pengguna
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === "audit"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Audit Log
          </button>
        </div>

        {/* Konten Berdasarkan Tab Aktif */}
        {activeTab === "analitik" && (
          <div className="space-y-8">
            {/* Banner Perhatian jika ada kursus menunggu tinjauan */}
            {stats.menungguTinjauan > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      Ada {stats.menungguTinjauan} Kursus Menunggu Tinjauan Kurikulum!
                    </h4>
                    <p className="text-xs text-amber-800">
                      Instruktur telah mengajukan kurikulum baru yang memerlukan verifikasi kelayakan sebelum diterbitkan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("tinjauan")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition self-start sm:self-auto"
                >
                  Buka Tinjauan Kursus <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 4 Kartu Metrik Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Pendapatan
                  </span>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {formatRupiah(stats.totalPendapatan)}
                </div>
                <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span>Dari seluruh transaksi kursus aktif</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Pendaftaran Aktif
                  </span>
                  <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {stats.pendaftaranAktif} Peserta
                </div>
                <div className="text-xs text-slate-500">
                  Akses ruang belajar aktif
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Kursus Terbit
                  </span>
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {stats.totalKursusTerbit} Kursus
                </div>
                <div className="text-xs text-slate-500">
                  Aktif tampil di katalog publik
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Lulus Bersertifikat
                  </span>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {stats.totalSertifikat} Sertifikat
                </div>
                <div className="text-xs text-slate-500">
                  Penerbitan resmi kode PA
                </div>
              </div>
            </div>

            {/* Visualisasi Grafik Recharts: 2 Kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Grafik Pendaftaran per Kursus */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Distribusi Pendaftaran Kursus Terpopuler
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbandingan total pendaftar vs pendaftar yang telah menyelesaikan pembayaran
                  </p>
                </div>
                <GrafikPendaftaran data={chartPendaftaran} />
              </div>

              {/* Grafik Pendapatan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tren Akumulasi Pendapatan Lembaga
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perkembangan arus kas masuk dari pendaftaran kursus berbayar
                  </p>
                </div>
                <GrafikPendapatan data={chartPendapatan} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "tinjauan" && <TabTinjauanKursus />}
        {activeTab === "pendaftaran" && <TabPendaftaranBayar />}
        {activeTab === "pengguna" && <TabPengguna />}
        {activeTab === "audit" && <TabAuditLog />}
      </main>
    </div>
  );
}
