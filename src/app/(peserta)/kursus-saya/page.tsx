"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  History,
  Layers,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { ModalPetunjukTransfer } from "@/components/peserta/ModalPetunjukTransfer";
import { ModalRekapNilai } from "@/components/peserta/ModalRekapNilai";
import { ModalSimulasiMayar } from "@/components/peserta/ModalSimulasiMayar";
import { ModalUploadBuktiPembayaran } from "@/components/peserta/ModalUploadBuktiPembayaran";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import EmptyState from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

const TAB_FILTERS = [
  "aktif",
  "menunggu_bayar",
  "selesai",
  "riwayat",
  "semua",
] as const;

type TabFilter = (typeof TAB_FILTERS)[number];

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
  status:
    | "menunggu_bayar"
    | "aktif"
    | "selesai"
    | "kedaluwarsa"
    | "dibatalkan";
  nominal: number;
  metode_bayar: string;
  batas_bayar: string | null;
  didaftarkan_pada: string;
  alasan_batal?: string | null;
  kursus?: {
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
  bukti_bayar_url?: string | null;
  bukti_bayar_pada?: string | null;
  catatan_pembayaran?: string | null;
}

const emptyStates: Record<
  TabFilter,
  { icon: LucideIcon; title: string; description: string }
> = {
  aktif: {
    icon: BookOpen,
    title: "Tidak Ada Kursus yang Sedang Berjalan",
    description:
      "Mulai perjalanan belajar Anda dengan memilih kursus singkat bersertifikat resmi dari katalog.",
  },
  menunggu_bayar: {
    icon: Clock,
    title: "Tidak Ada Tagihan Menunggu Pembayaran",
    description:
      "Seluruh tagihan Anda telah lunas atau belum ada pendaftaran kursus berbayar.",
  },
  selesai: {
    icon: Award,
    title: "Belum Ada Kursus yang Selesai",
    description:
      "Selesaikan seluruh modul dan evaluasi kuis untuk meraih sertifikat kelulusan resmi.",
  },
  riwayat: {
    icon: History,
    title: "Tidak Ada Riwayat Pendaftaran Dibatalkan",
    description:
      "Pendaftaran yang dibatalkan atau kedaluwarsa akan tampil di sini.",
  },
  semua: {
    icon: Layers,
    title: "Belum Ada Kursus yang Diikuti",
    description:
      "Buka katalog untuk melihat seluruh pilihan kursus Lembaga Kursus Pijar Aksara Depok.",
  },
};

function parseTab(value: string | null): TabFilter {
  return TAB_FILTERS.includes(value as TabFilter)
    ? (value as TabFilter)
    : "aktif";
}

function formatRupiah(value: number) {
  if (value === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRegisteredDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CourseCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="flex flex-col">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
          <CardFooter className="mt-auto border-t bg-muted/30 p-4">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function DashboardFallback() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <CourseCardsSkeleton />
    </main>
  );
}

function KursusSayaContent() {
  const { user, profile, isLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlTab = parseTab(searchParams.get("tab"));
  const [pendaftaranList, setPendaftaranList] = useState<PendaftaranItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>(urlTab);
  const [batalModalOpen, setBatalModalOpen] = useState(false);
  const [selectedBatalId, setSelectedBatalId] = useState<string | null>(null);
  const dataLoadedRef = useRef(false);

  const [selectedRekapItem, setSelectedRekapItem] =
    useState<PendaftaranItem | null>(null);
  const [selectedUploadBuktiItem, setSelectedUploadBuktiItem] =
    useState<PendaftaranItem | null>(null);
  const [selectedTransferItem, setSelectedTransferItem] =
    useState<PendaftaranItem | null>(null);
  const [selectedMayarSimulasiItem, setSelectedMayarSimulasiItem] =
    useState<PendaftaranItem | null>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);

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
          bukti_bayar_url, bukti_bayar_pada, catatan_pembayaran,
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
            bukti_bayar_url: item.bukti_bayar_url,
            bukti_bayar_pada: item.bukti_bayar_pada,
            catatan_pembayaran: item.catatan_pembayaran,
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

  // Keep the selected tab in sync with browser back/forward navigation.
  useEffect(() => {
    setActiveTab((current) => (current === urlTab ? current : urlTab));
  }, [urlTab]);

  // Keep the active tab visible inside the horizontally scrollable tab strip.
  useEffect(() => {
    const list = tabsListRef.current;
    const activeTabEl = list?.querySelector<HTMLElement>(
      '[role="tab"][data-state="active"]'
    );
    if (!list || !activeTabEl) return;

    const listRect = list.getBoundingClientRect();
    const activeRect = activeTabEl.getBoundingClientRect();
    const target =
      list.scrollLeft +
      (activeRect.left - listRect.left) -
      (listRect.width - activeRect.width) / 2;

    list.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime listener Supabase: status changes from an admin are reflected immediately.
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

  // Detect the redirect back from the Mayar gateway.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("pembayaran") !== "selesai") return;

    const pendaftaranId = params.get("pendaftaran_id");
    if (pendaftaranId) {
      fetch("/api/pembayaran/mayar/verifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaran_id: pendaftaranId }),
      })
        .then((res) => res.json())
        .then((resData) => {
          loadData();
          toast.success(
            resData.message ||
              "Terima kasih! Pembayaran via Mayar telah selesai dan status kursus Anda kini telah Aktif."
          );
        })
        .catch(() => {
          loadData();
          toast.error(
            "Pembayaran belum dapat diverifikasi. Silakan muat ulang halaman atau hubungi administrator."
          );
        });
    } else {
      toast.success(
        "Terima kasih! Transaksi pembayaran via Mayar berhasil diselesaikan. Status pendaftaran Anda akan otomatis aktif secara instan."
      );
      loadData();
    }

    window.history.replaceState({}, "", window.location.pathname);
  }, [loadData]);

  const handleTabChange = (next: string) => {
    const tab = parseTab(next);
    setActiveTab(tab);
    router.replace(
      tab === "aktif" ? "/kursus-saya" : `/kursus-saya?tab=${tab}`,
      { scroll: false }
    );
  };

  // BR-07: Sebelum membuka dialog batal, verifikasi status terkini di DB.
  const confirmBatalPendaftaran = async (pendaftaranId: string) => {
    try {
      const { data: latest } = await supabase
        .from("pendaftaran")
        .select("status")
        .eq("id", pendaftaranId)
        .single();

      if (latest && latest.status !== "menunggu_bayar") {
        await loadData();
        toast.error(
          latest.status === "aktif"
            ? "Pembayaran kursus ini telah dikonfirmasi aktif oleh admin. Pendaftaran tidak dapat dibatalkan, Anda sudah dapat langsung melanjutkan belajar."
            : `Pendaftaran ini telah berstatus "${latest.status}" sehingga tidak dapat dibatalkan.`
        );
        return;
      }
    } catch (err) {
      console.warn("Gagal cek status terkini:", err);
    }

    setSelectedBatalId(pendaftaranId);
    setBatalModalOpen(true);
  };

  // BR-07: Eksekusi pembatalan dengan atomic update status = 'menunggu_bayar'.
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
        toast.error(error.message);
      } else if (!data || data.length === 0) {
        await loadData();
        setBatalModalOpen(false);
        setSelectedBatalId(null);
        toast.error(
          "Pembayaran pendaftaran ini telah dikonfirmasi aktif oleh admin atau status telah berubah. Anda dapat langsung melanjutkan belajar."
        );
      } else {
        await loadData();
        setBatalModalOpen(false);
        setSelectedBatalId(null);
        toast.success(
          "Pendaftaran kursus telah dibatalkan. Anda dapat mendaftar kembali kapan saja melalui katalog kursus."
        );
      }
    } catch (err) {
      console.error("Gagal batalkan pendaftaran:", err);
      toast.error("Terjadi kesalahan saat membatalkan pendaftaran.");
    } finally {
      setCancelingId(null);
    }
  };

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
        toast.success(data.message || "Pendaftaran sudah aktif!");
        loadData();
      } else if (data.isTransferManual) {
        setSelectedTransferItem(item);
      } else if (data.isMock || data.paymentUrl?.includes("mock_invoice=true")) {
        setSelectedMayarSimulasiItem(item);
      } else if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan pembayaran."
      );
    } finally {
      setPayingId(null);
    }
  };

  const countAktif = pendaftaranList.filter(
    (p) => p.status === "aktif"
  ).length;
  const countMenunggu = pendaftaranList.filter(
    (p) => p.status === "menunggu_bayar"
  ).length;
  const countSelesai = pendaftaranList.filter(
    (p) => p.status === "selesai"
  ).length;
  const countRiwayat = pendaftaranList.filter(
    (p) => p.status === "dibatalkan" || p.status === "kedaluwarsa"
  ).length;

  const filteredList = pendaftaranList.filter((item) => {
    if (activeTab === "aktif") return item.status === "aktif";
    if (activeTab === "menunggu_bayar")
      return item.status === "menunggu_bayar";
    if (activeTab === "selesai") return item.status === "selesai";
    if (activeTab === "riwayat")
      return item.status === "dibatalkan" || item.status === "kedaluwarsa";
    return true;
  });

  const loading = loadingData || isLoading;
  const emptyState = emptyStates[activeTab];
  const EmptyIcon = emptyState.icon;

  const kpiItems = [
    {
      label: "Sedang Belajar",
      value: countAktif,
      icon: BookOpen,
    },
    {
      label: "Menunggu Bayar",
      value: countMenunggu,
      icon: Clock,
    },
    {
      label: "Selesai",
      value: countSelesai,
      icon: Award,
    },
    {
      label: "Total",
      value: pendaftaranList.length,
      icon: Layers,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <PageHeader
        title="Ruang Kursus Saya"
        description="Pantau progres belajar, akses modul, pembayaran, dan transkrip kelulusan resmi Anda."
      />

      <section
        aria-label="Ringkasan kursus saya"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {kpiItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-xs leading-tight text-muted-foreground sm:text-sm">
                    {item.label}
                  </p>
                  {loading ? (
                    <Skeleton className="mt-1 h-7 w-10" />
                  ) : (
                    <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                  )}
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList
          ref={tabsListRef}
          aria-label="Filter kursus saya"
          className="flex h-auto w-full justify-start overflow-x-auto rounded-lg bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <TabsTrigger
            value="aktif"
            className="flex shrink-0 items-center gap-2 px-3 py-2"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Sedang Belajar</span>
            <Badge variant="secondary" className="h-5 min-w-5 justify-center rounded px-1.5 text-[11px]">
              {countAktif}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="menunggu_bayar"
            className="flex shrink-0 items-center gap-2 px-3 py-2"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Menunggu Pembayaran</span>
            <Badge variant="secondary" className="h-5 min-w-5 justify-center rounded px-1.5 text-[11px]">
              {countMenunggu}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="selesai"
            className="flex shrink-0 items-center gap-2 px-3 py-2"
          >
            <Award className="h-3.5 w-3.5" />
            <span>Selesai &amp; Sertifikat</span>
            <Badge variant="secondary" className="h-5 min-w-5 justify-center rounded px-1.5 text-[11px]">
              {countSelesai}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="riwayat"
            className="flex shrink-0 items-center gap-2 px-3 py-2"
          >
            <History className="h-3.5 w-3.5" />
            <span>Riwayat Dibatalkan</span>
            <Badge variant="secondary" className="h-5 min-w-5 justify-center rounded px-1.5 text-[11px]">
              {countRiwayat}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="semua"
            className="flex shrink-0 items-center gap-2 px-3 py-2"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Semua</span>
            <Badge variant="secondary" className="h-5 min-w-5 justify-center rounded px-1.5 text-[11px]">
              {pendaftaranList.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <CourseCardsSkeleton />
          ) : filteredList.length === 0 ? (
            <EmptyState
              icon={EmptyIcon}
              title={emptyState.title}
              description={emptyState.description}
              action={
                <Button asChild>
                  <Link href="/kursus">Jelajahi Katalog Kursus</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredList.map((item) => {
                const progressPct =
                  item.total_modul > 0
                    ? Math.floor(
                        (item.modul_lulus / item.total_modul) * 100
                      )
                    : 0;
                const totalDuration =
                  item.kursus?.modul?.reduce(
                    (sum, modul) => sum + (modul.durasi_menit || 0),
                    0
                  ) || 0;
                const courseTitle =
                  item.kursus?.judul || "Kursus Telah Ditutup";
                const hasModuleDetail = item.total_modul > 0;

                return (
                  <Card key={item.id} className="flex flex-col overflow-hidden">
                    <CardHeader className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline">
                          {item.kursus?.kategori || "Kursus"}
                        </Badge>

                        {item.status === "aktif" && (
                          <Badge
                            variant="secondary"
                            className="gap-1.5 whitespace-nowrap"
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                              aria-hidden="true"
                            />
                            Sedang Belajar
                          </Badge>
                        )}
                        {item.status === "selesai" && (
                          <Badge
                            variant="secondary"
                            className="gap-1.5 whitespace-nowrap"
                          >
                            <Award className="h-3 h-3" />
                            Lulus Selesai
                          </Badge>
                        )}
                        {item.status === "menunggu_bayar" && (
                          <Badge
                            variant="highlight"
                            className="gap-1.5 whitespace-nowrap"
                          >
                            <Clock className="h-3 w-3" />
                            Menunggu Bayar
                          </Badge>
                        )}
                        {item.status === "kedaluwarsa" && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 whitespace-nowrap"
                          >
                            <Clock className="h-3 w-3" />
                            Kedaluwarsa
                          </Badge>
                        )}
                        {item.status === "dibatalkan" && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 whitespace-nowrap"
                          >
                            <XCircle className="h-3 w-3" />
                            Dibatalkan
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <CardTitle className="line-clamp-2 text-base leading-snug sm:text-lg">
                          {courseTitle}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {hasModuleDetail
                              ? `${item.total_modul} modul`
                              : `${item.modul_lulus} modul lulus`}
                          </span>
                          {totalDuration > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {totalDuration} menit
                            </span>
                          )}
                          {item.didaftarkan_pada && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatRegisteredDate(item.didaftarkan_pada)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-4 p-5 pt-0">
                      {(item.status === "aktif" ||
                        item.status === "selesai") && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted-foreground">
                              Progres Pembelajaran
                            </span>
                            <span className="font-medium text-foreground">
                              {hasModuleDetail
                                ? `${item.modul_lulus} / ${item.total_modul} modul (${progressPct}%)`
                                : `${item.modul_lulus} modul lulus`}
                            </span>
                          </div>
                          {hasModuleDetail ? (
                            <Progress
                              value={progressPct}
                              aria-label={`Progres kursus ${courseTitle}`}
                              className={
                                item.status === "selesai"
                                  ? "[&>div]:bg-emerald-600"
                                  : undefined
                              }
                            />
                          ) : (
                            <p className="rounded-md border border-dashed bg-muted/30 px-2.5 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
                              Rincian modul tidak lagi tersedia karena kursus
                              telah ditutup. Sertifikat dan riwayat kelulusan
                              tetap dapat diakses.
                            </p>
                          )}
                          {hasModuleDetail && (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="h-auto justify-start p-0 text-xs"
                              onClick={() => setSelectedRekapItem(item)}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Lihat Rekap Nilai Kuis (Transkrip)
                            </Button>
                          )}
                        </div>
                      )}

                      {item.status === "menunggu_bayar" && (
                        <div className="space-y-3">
                          <div className="space-y-2 rounded-md border border-highlight bg-highlight/40 p-3 text-xs">
                            <div className="flex justify-between gap-3 text-highlight-foreground">
                              <span>Nominal Tagihan</span>
                              <span className="font-semibold">
                                {formatRupiah(item.nominal)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-3 text-highlight-foreground/80">
                              <span>Metode Pembayaran</span>
                              <span className="font-medium capitalize">
                                {item.metode_bayar === "mayar"
                                  ? "Mayar Payment Gateway"
                                  : item.metode_bayar.replace("_", " ")}
                              </span>
                            </div>
                            {item.batas_bayar && (
                              <div className="flex justify-between gap-3 border-t border-highlight pt-1.5 font-medium text-highlight-foreground">
                                <span>Batas Waktu Bayar</span>
                                <span>{formatDateTime(item.batas_bayar)}</span>
                              </div>
                            )}
                          </div>

                          {item.metode_bayar === "transfer_manual" &&
                            (item.bukti_bayar_url ? (
                              <div className="space-y-1 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs">
                                <div className="flex items-center gap-1.5 font-medium text-emerald-800">
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                  <span>Bukti Pembayaran Terunggah</span>
                                </div>
                                <p className="text-emerald-700">
                                  Menunggu verifikasi Administrator Lembaga.
                                </p>
                                {item.catatan_pembayaran && (
                                  <p className="mt-1 rounded border border-emerald-100 bg-background/70 px-2 py-1 text-muted-foreground">
                                    Catatan: {item.catatan_pembayaran}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1 rounded-md border border-highlight bg-highlight/30 p-3 text-xs">
                                <div className="flex items-center gap-1.5 font-medium text-highlight-foreground">
                                  <AlertCircle className="h-4 w-4 shrink-0" />
                                  <span>Belum Mengunggah Bukti</span>
                                </div>
                                <p className="leading-relaxed text-highlight-foreground/80">
                                  Silakan transfer ke rekening resmi lalu unggah
                                  struk pembayaran agar pendaftaran Anda dapat
                                  diverifikasi oleh admin.
                                </p>
                              </div>
                            ))}
                        </div>
                      )}

                      {(item.status === "kedaluwarsa" ||
                        item.status === "dibatalkan") && (
                        <div className="space-y-1 rounded-md border bg-muted/40 p-3 text-xs">
                          <span className="block font-medium text-foreground">
                            Keterangan
                          </span>
                          <p className="line-clamp-3 text-muted-foreground">
                            {item.alasan_batal ||
                              (item.status === "kedaluwarsa"
                                ? "Melewati batas bayar 24 jam. Kuota kursi telah dikembalikan ke katalog."
                                : "Pendaftaran dibatalkan.")}
                          </p>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="mt-auto flex-col items-stretch gap-2 border-t bg-muted/30 p-4 sm:flex-row sm:items-center">
                      {item.status === "aktif" && (
                        <Button asChild className="w-full">
                          <Link href={`/kursus-saya/${item.id}/modul/1`}>
                            Buka Kelas
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}

                      {item.status === "selesai" && (
                        <div className="flex w-full gap-2">
                          {hasModuleDetail && (
                            <Button
                              asChild
                              variant="outline"
                              className="flex-1"
                            >
                              <Link href={`/kursus-saya/${item.id}/modul/1`}>
                                Ulas Materi
                              </Link>
                            </Button>
                          )}
                          <Button asChild className="flex-1">
                            <Link
                              href={`/kursus-saya/${item.id}/sertifikat`}
                            >
                              <Award className="h-4 w-4" />
                              Sertifikat
                            </Link>
                          </Button>
                        </div>
                      )}

                      {item.status === "menunggu_bayar" && (
                        <div className="w-full space-y-2">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0 text-destructive hover:text-destructive"
                              onClick={() => confirmBatalPendaftaran(item.id)}
                              disabled={cancelingId === item.id}
                            >
                              {cancelingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Batalkan"
                              )}
                            </Button>

                            {item.metode_bayar === "transfer_manual" ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setSelectedTransferItem(item)}
                              >
                                <Building2 className="h-4 w-4" />
                                Petunjuk Transfer
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleBayar(item)}
                                disabled={payingId === item.id}
                              >
                                {payingId === item.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Memproses...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="h-4 w-4" />
                                    Bayar Sekarang
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                          {item.metode_bayar === "transfer_manual" && (
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                item.bukti_bayar_url ? "secondary" : "default"
                              }
                              className="w-full"
                              onClick={() => setSelectedUploadBuktiItem(item)}
                            >
                              <Upload className="h-4 w-4" />
                              {item.bukti_bayar_url
                                ? "Perbarui Bukti"
                                : "Unggah Bukti"}
                            </Button>
                          )}
                        </div>
                      )}

                      {(item.status === "kedaluwarsa" ||
                        item.status === "dibatalkan") &&
                        (item.kursus?.slug ? (
                          <Button
                            asChild
                            variant="outline"
                            className="w-full"
                          >
                            <Link href={`/kursus/${item.kursus.slug}`}>
                              Daftar Ulang Kursus Ini
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled
                          >
                            Kursus Telah Ditutup
                          </Button>
                        ))}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedRekapItem && (
        <ModalRekapNilai
          isOpen={!!selectedRekapItem}
          onClose={() => setSelectedRekapItem(null)}
          pesertaData={{
            nama_lengkap:
              profile?.nama_lengkap ||
              user?.email?.split("@")[0] ||
              "Peserta",
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

      <ModalPetunjukTransfer
        isOpen={!!selectedTransferItem}
        onClose={() => setSelectedTransferItem(null)}
        data={selectedTransferItem}
        onOpenUpload={() => {
          if (selectedTransferItem) {
            setSelectedUploadBuktiItem(selectedTransferItem);
          }
        }}
      />

      {selectedUploadBuktiItem && (
        <ModalUploadBuktiPembayaran
          isOpen={!!selectedUploadBuktiItem}
          onClose={() => setSelectedUploadBuktiItem(null)}
          pendaftaranId={selectedUploadBuktiItem.id}
          kursusJudul={selectedUploadBuktiItem.kursus?.judul || "Kursus"}
          nominal={selectedUploadBuktiItem.nominal}
          currentBuktiUrl={selectedUploadBuktiItem.bukti_bayar_url}
          currentCatatan={selectedUploadBuktiItem.catatan_pembayaran}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      <ModalSimulasiMayar
        isOpen={!!selectedMayarSimulasiItem}
        onClose={() => setSelectedMayarSimulasiItem(null)}
        data={selectedMayarSimulasiItem}
        onSuccess={(message) => {
          toast.success(message);
          loadData();
        }}
      />

      <ConfirmDialog
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
    </main>
  );
}

export default function KursusSayaPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <KursusSayaContent />
    </Suspense>
  );
}
