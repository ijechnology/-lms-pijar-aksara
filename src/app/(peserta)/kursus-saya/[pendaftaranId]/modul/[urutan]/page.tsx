"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  List,
  Loader2,
  Lock,
  Sparkles,
  Video,
} from "lucide-react";

import FormKuis from "@/components/peserta/FormKuis";
import SidebarModul, {
  type ModulStatusItem,
} from "@/components/peserta/SidebarModul";
import PageHeader from "@/components/layout/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

function RuangBelajarSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-start">
      <Card className="order-2 hidden lg:order-1 lg:col-span-1 lg:block">
        <CardHeader className="border-b p-5">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-2 p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>

      <div className="order-1 space-y-5 lg:order-2 lg:col-span-3">
        <Card>
          <CardHeader className="space-y-3 p-5 sm:p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-4/5" />
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RuangBelajarPage() {
  const params = useParams();
  const { user, isLoading } = useAuth();
  const supabase = createClient();

  const pendaftaranId = params.pendaftaranId as string;
  const currentUrutan = parseInt(params.urutan as string, 10) || 1;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [pendaftaran, setPendaftaran] = useState<any | null>(null);
  const [kursus, setKursus] = useState<any | null>(null);
  const [modulList, setModulList] = useState<ModulStatusItem[]>([]);
  const [currentModul, setCurrentModul] = useState<any | null>(null);
  const [currentProgres, setCurrentProgres] = useState<any | null>(null);

  const [markingRead, setMarkingRead] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const dataLoadedRef = useRef(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    if (!dataLoadedRef.current) {
      setLoading(true);
    }
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
        .select(
          "id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit"
        )
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
        const isLulus =
          prog?.lulus_pada !== null && prog?.lulus_pada !== undefined;
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
      dataLoadedRef.current = true;
      setLoading(false);
    }
  }, [user?.id, pendaftaranId, currentUrutan, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tutup Sheet modul mobile setelah berpindah modul.
  useEffect(() => {
    setSheetOpen(false);
  }, [currentUrutan]);

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
        toast.error(`Gagal menandai materi: ${error.message}`);
      } else {
        await loadData();
      }
    } catch (err) {
      console.error("Gagal tandai dibaca:", err);
      toast.error("Terjadi kesalahan saat menandai materi.");
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
        toast.error(
          `Gagal membuat tautan unduh privat: ${
            error?.message || "File belum diunggah"
          }`
        );
      } else {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err) {
      console.error("Gagal unduh PDF:", err);
      toast.error("Terjadi kesalahan saat mengunduh lampiran.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Format link YouTube ke embed secara robust
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/embed/")) return url;
    // Deteksi ID dari berbagai variasi URL YouTube (youtu.be, watch?v=, dsb)
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{6,15})/
    );
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&enablejsapi=1`;
    }
    return url;
  };

  const activeStatus = modulList.find((m) => m.urutan === currentUrutan);
  const isAllModulLulus =
    modulList.length > 0 && modulList.every((m) => m.isLulus);
  const isCourseCompleted =
    pendaftaran?.status === "selesai" || isAllModulLulus;
  const isFinalModul = currentUrutan === modulList.length;
  const nextUrutan =
    currentUrutan < modulList.length ? currentUrutan + 1 : null;
  const isContentLoading = loading || isLoading;

  const breadcrumbs = [
    { label: "Kursus Saya", href: "/kursus-saya" },
    ...(kursus?.judul ? [{ label: kursus.judul }] : []),
    { label: `Modul ${currentUrutan}` },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <PageHeader
        title={kursus?.judul || "Ruang Belajar"}
        breadcrumbs={breadcrumbs}
        actions={
          isCourseCompleted && !isContentLoading ? (
            <Button asChild variant="outline">
              <Link href={`/kursus-saya/${pendaftaranId}/sertifikat`}>
                <Award />
                Lihat Sertifikat
              </Link>
            </Button>
          ) : undefined
        }
      />

      {isContentLoading ? (
        <RuangBelajarSkeleton />
      ) : errorMsg ? (
        <Card className="mx-auto max-w-md">
          <CardContent className="space-y-5 p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Kendala Akses</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="w-full">
              <Link href="/kursus-saya">Kembali ke Kursus Saya</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {isCourseCompleted && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold text-emerald-900">
                      Selamat! Anda Telah Menyelesaikan Seluruh Modul Kursus
                      Ini
                    </h2>
                    <p className="text-sm leading-relaxed text-emerald-800">
                      Seluruh kurikulum pembelajaran telah tuntas. Sertifikat
                      kelulusan digital resmi Anda telah terbit.
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Link href={`/kursus-saya/${pendaftaranId}/sertifikat`}>
                    <Award />
                    Buka &amp; Cetak Sertifikat
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-start">
            <div className="order-2 hidden lg:order-1 lg:col-span-1 lg:block">
              <SidebarModul
                pendaftaranId={pendaftaranId}
                modulList={modulList}
                currentUrutan={currentUrutan}
              />
            </div>

            <div className="order-1 min-w-0 space-y-5 lg:order-2 lg:col-span-3">
              <div className="lg:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <List />
                      Daftar Modul
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[85vw] overflow-y-auto p-4 sm:max-w-sm"
                  >
                    <SheetHeader className="pr-8 text-left">
                      <SheetTitle>Daftar Modul</SheetTitle>
                      <SheetDescription>
                        {kursus?.judul || "Modul pembelajaran"}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                      <SidebarModul
                        pendaftaranId={pendaftaranId}
                        modulList={modulList}
                        currentUrutan={currentUrutan}
                        hideHeader
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {activeStatus && !activeStatus.isUnlocked ? (
                <Card className="border-highlight bg-highlight/40">
                  <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-10">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
                      <Lock className="h-6 w-6" />
                    </span>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">
                        Modul {currentUrutan} Masih Terkunci
                      </h2>
                      <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                        Sesuai aturan kurikulum bertingkat, Anda harus
                        menyelesaikan dan lulus kuis pada modul sebelumnya
                        terlebih dahulu sebelum dapat membuka materi ini.
                      </p>
                    </div>
                    <Button asChild>
                      <Link
                        href={`/kursus-saya/${pendaftaranId}/modul/${
                          currentUrutan - 1
                        }`}
                      >
                        Buka Modul {currentUrutan - 1}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : currentModul ? (
                <>
                  <Card>
                    <CardHeader className="space-y-3 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="secondary">
                          Modul {currentModul.urutan}
                        </Badge>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Estimasi Belajar: {currentModul.durasi_menit} Menit
                        </span>
                      </div>
                      <CardTitle className="text-xl leading-snug sm:text-2xl">
                        {currentModul.judul}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  {currentModul.video_url && (
                    <Card>
                      <CardContent className="space-y-3 p-4 sm:p-6">
                        <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
                          <iframe
                            src={getEmbedUrl(currentModul.video_url)!}
                            title={currentModul.judul}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                            className="h-full w-full border-0"
                          />
                        </div>
                        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                          <span className="inline-flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5 text-primary" />
                            Video materi modul
                          </span>
                          <Button
                            asChild
                            variant="link"
                            size="sm"
                            className="h-auto justify-start p-0 text-xs"
                          >
                            <a
                              href={currentModul.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Buka di tab YouTube eksternal
                              <ExternalLink />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4 text-primary" />
                        Materi Bacaan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
                      <div className="whitespace-pre-line text-sm leading-relaxed text-foreground sm:text-base">
                        {currentModul.isi_materi}
                      </div>
                    </CardContent>
                  </Card>

                  {currentModul.lampiran_path && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Download className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-medium">
                              Berkas Lampiran Materi (PDF)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Akses privat terenkripsi · Berlaku 60 menit
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={handleUnduhPdf}
                          disabled={downloadingPdf}
                          className="shrink-0"
                        >
                          {downloadingPdf ? (
                            <>
                              <Loader2 className="animate-spin" />
                              Memverifikasi...
                            </>
                          ) : (
                            <>
                              <Download />
                              Unduh PDF
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                      {currentProgres?.materi_dibaca_pada ? (
                        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>
                            Materi telah ditandai selesai dibaca. Kuis evaluasi
                            terbuka di bawah.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleTandaiDibaca}
                          disabled={markingRead}
                          className="w-full sm:w-auto"
                        >
                          {markingRead ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <CheckCircle2 />
                          )}
                          {markingRead
                            ? "Menyimpan Progres..."
                            : "Tandai Materi Sudah Dibaca"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <FormKuis
                    pendaftaranId={pendaftaranId}
                    modulId={currentModul.id}
                    nilaiLulus={kursus?.nilai_lulus || 70}
                    isLulusModul={activeStatus?.isLulus || false}
                    materiDibacaPada={currentProgres?.materi_dibaca_pada || null}
                    onLulusSuccess={loadData}
                    isAllModulLulus={isAllModulLulus}
                    isFinalModul={isFinalModul}
                    nextUrutan={nextUrutan}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
