"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertTriangle,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  GraduationCap,
  BookOpen,
  Lightbulb,
  X,
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

  // Filter Rentang: 3 Pilihan Bersih (8 Minggu, Bulan Ini, Custom)
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

  // 3. DAFTAR ANALITIK
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

  // Ubah Rentang Filter (8w, bulan-ini, kustom)
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

        if (regDate && regDate >= startOfBulanIni && regDate <= endOfBulanIni) {
          regBulanIniCount += 1;
        }

        if (
          (r.status === "aktif" || r.status === "selesai") &&
          payDate &&
          payDate >= startOfBulanIni &&
          payDate <= endOfBulanIni
        ) {
          revBulanIni += nominal;
        }

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
      // HITUNG GRAFIK BATANG TINGKAT PENYELESAIAN PER KURSUS
      // -------------------------------------------------------------
      const completionList: PenyelesaianKursusItem[] = [];
      const hampirPenuhKursus: KursusKapasitasItem[] = [];

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
        // HITUNG TABEL KURSUS HAMPIR PENUH (Sisa Kursi 2 atau Kurang - PRD)
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

          // Sesuai PRD: Kursus hampir penuh (sisa kursi 2 atau kurang)
          if (sisaKursi <= 2) {
            hampirPenuhKursus.push({
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

      hampirPenuhKursus.sort((a, b) => a.sisa_kursi - b.sisa_kursi);
      setKursusHampirPenuhList(hampirPenuhKursus);
    } catch (err) {
      console.error("Gagal memuat data dasbor analitik admin:", err);
    } finally {
      dataLoadedRef.current = true;
      setLoading(false);
    }
  }, [user, supabase, rentang, customDari, customSampai]);

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
  }, [user, role, isLoading, router, loadDashboardData]);

  // Handler Uji Coba Cron (Tombol ringkas di header)
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
          `Uji coba cron berhasil dijalankan: ${data.total_diproses ?? 0} tagihan diproses, ${data.email_terkirim ?? 0} email pengingat dikirim.`,
      });
      loadDashboardData();
    } catch (err: any) {
      setCronFeedback({
        type: "error",
        message: err.message || "Terjadi kesalahan saat memicu pengujian cron.",
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

  if (loading && !dataLoadedRef.current) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Filter Controls */}
      <PageHeader
        title="Dasbor Analitik Eksekutif"
        description="Pantau volume pendaftaran, omzet pembayaran mingguan, retensi kelulusan kursus, dan ketersediaan kuota secara terpadu."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Rentang: 8 Minggu | Bulan Ini | Custom */}
            <div className="inline-flex items-center rounded-lg border bg-muted/40 p-1 text-xs">
              <button
                type="button"
                onClick={() => handleGantiRentang("8w")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  rentang === "8w" && !isCustomMode
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                8 Minggu
              </button>
              <button
                type="button"
                onClick={() => handleGantiRentang("bulan-ini")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  rentang === "bulan-ini" && !isCustomMode
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => handleGantiRentang("kustom")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  isCustomMode
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Tombol Pengujian Cron */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerCronManual}
              disabled={cronLoading}
              title="Picu uji coba scheduler pengingat batas bayar sisa 3 jam secara manual"
              className="gap-1.5 text-xs font-semibold"
            >
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{cronLoading ? "Mengecek..." : "Uji Cron (3 Jam)"}</span>
            </Button>
          </div>
        }
      />

      {/* Input Tanggal Custom jika mode aktif */}
      {isCustomMode && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <form
              onSubmit={handleTerapkanKustom}
              className="flex flex-wrap items-center gap-4 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Dari:</span>
                <Input
                  type="date"
                  required
                  value={customDari}
                  onChange={(e) => setCustomDari(e.target.value)}
                  className="h-8 text-xs bg-background w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Sampai:</span>
                <Input
                  type="date"
                  required
                  value={customSampai}
                  onChange={(e) => setCustomSampai(e.target.value)}
                  className="h-8 text-xs bg-background w-36"
                />
              </div>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Terapkan Tanggal
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Feedback Uji Cron */}
      {cronFeedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            cronFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          <span>{cronFeedback.message}</span>
          <button
            onClick={() => setCronFeedback(null)}
            className="ml-4 font-bold hover:opacity-75"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Kartu Ringkasan Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pendaftaran Bulan Ini
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {summaryCards.pendaftaranBulanIni}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Pendaftar baru bulan kalender ini
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pendapatan Bulan Ini
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {formatRupiah(summaryCards.pendapatanBulanIni)}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Transaksi lunas bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Peserta Aktif
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {summaryCards.pesertaAktif}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Sedang aktif belajar saat ini
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sertifikat Terbit
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {summaryCards.sertifikatTerbit}
            </div>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              Kelulusan resmi terverifikasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafik 1 & 2: Pendaftaran Mingguan & Pendapatan Mingguan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Pendaftaran per Minggu (Gratis vs Berbayar)
            </CardTitle>
            <CardDescription className="text-xs">
              Perbandingan volume pendaftar kursus gratis dan berbayar setiap minggu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GrafikPendaftaranMingguan data={chartPendaftaranMingguan} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Pendapatan per Minggu</CardTitle>
            <CardDescription className="text-xs">
              Tren omset dari pendaftaran aktif dan selesai yang sudah lunas dibayar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GrafikPendapatanMingguan data={chartPendapatanMingguan} />
          </CardContent>
        </Card>
      </div>

      {/* Grafik 3: Tingkat Penyelesaian per Kursus */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Tingkat Penyelesaian per Kursus
            </CardTitle>
            <CardDescription className="text-xs">
              Rasio kelulusan: selesai ÷ (aktif + selesai) × 100%
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
              ≥ 75%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block" />
              50-74%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
              25-49%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
              &lt; 25%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <GrafikPenyelesaianKursus data={chartPenyelesaianKursus} />
        </CardContent>
      </Card>

      {/* Tabel 1 & 2: Modul Terendah & Kursus Hampir Penuh */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Tabel 1: Modul Tingkat Lulus Pertama Terendah */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">
                  Modul Tingkat Lulus Pertama Terendah
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Evaluasi kuis untuk instruktur pengampu
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              {modulLulusPertamaList.length} Modul
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Modul &amp; Kursus</TableHead>
                  <TableHead className="text-xs">Instruktur</TableHead>
                  <TableHead className="text-xs text-right">Lulus Tes Ke-1</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modulLulusPertamaList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                      Belum ada data pengerjaan kuis pada sistem.
                    </TableCell>
                  </TableRow>
                ) : (
                  modulLulusPertamaList.map((item, idx) => (
                    <TableRow key={item.modul_id}>
                      <TableCell className="max-w-[200px]">
                        <div className="font-semibold text-foreground text-xs truncate">
                          <span className="text-muted-foreground mr-1.5 font-bold">#{idx + 1}</span>
                          {item.modul_judul}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {item.kursus_judul} (Modul {item.modul_urutan})
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-medium text-foreground block truncate max-w-[130px]">
                          {item.instruktur_nama || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            item.persen_lulus < 50
                              ? "destructive"
                              : item.persen_lulus < 75
                              ? "secondary"
                              : "default"
                          }
                          className="font-mono text-[11px] px-1.5 py-0"
                        >
                          {item.persen_lulus}%
                        </Badge>
                        <span className="block text-[10px] text-muted-foreground mt-0.5">
                          {item.total_lulus_pertama}/{item.total_percobaan_pertama} lulus
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tabel 2: Kursus Hampir Penuh (Sisa Kursi ≤ 2) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">
                  Kursus Hampir Penuh (Sisa Kursi ≤ 2)
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Perlu penyesuaian kuota di tinjauan kursus
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={kursusHampirPenuhList.length > 0 ? "destructive" : "outline"}
              className="text-[10px] font-bold"
            >
              {kursusHampirPenuhList.length} Kursus
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Kursus</TableHead>
                  <TableHead className="text-xs">Sisa Kursi</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kursusHampirPenuhList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-emerald-600 font-bold text-xs">Semua Kursus Aman</span>
                        <span className="text-[11px] text-muted-foreground">
                          Tidak ada kursus terbit dengan sisa kursi ≤ 2.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  kursusHampirPenuhList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[200px]">
                        <div className="font-semibold text-foreground text-xs truncate">
                          {item.judul}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {item.kursi_terpakai} dari {item.kuota} terpakai ({item.persen_keterisian}%)
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.sisa_kursi === 0 ? "destructive" : "secondary"}
                          className="text-[11px] font-bold"
                        >
                          {item.sisa_kursi === 0 ? "Penuh (0)" : `Sisa ${item.sisa_kursi} Kursi`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-7 text-[11px] font-semibold gap-1 px-2.5"
                        >
                          <Link href="/admin/tinjauan">
                            <SlidersHorizontal className="w-3 h-3 text-primary" />
                            <span>Ubah</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
