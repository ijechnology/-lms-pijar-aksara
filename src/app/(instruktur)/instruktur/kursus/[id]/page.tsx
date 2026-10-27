"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import EditorModul, { ModulData } from "@/components/instruktur/EditorModul";
import EditorSoal from "@/components/instruktur/EditorSoal";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
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
  Loader2,
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
        toast.error("Gagal membuka file PDF: " + (error?.message || "File belum diunggah atau tidak ditemukan."));
      } else {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err) {
      console.error("Gagal unduh PDF:", err);
      toast.error("Terjadi kesalahan saat memuat berkas PDF.");
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

  // Ajukan review state
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

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

  const handleAjukanReview = () => {
    if (!kursus || isLocked) return;

    if (!isCurriculumValid) {
      let pesan = "Kurikulum belum memenuhi standar kelayakan: ";
      if (!isModulCountValid) {
        pesan += `Jumlah modul harus 2 s/d 10 (saat ini: ${totalModul} modul). `;
      }
      if (invalidModulSoal.length > 0) {
        pesan += `Modul ${invalidModulSoal.map((m) => m.urutan).join(", ")} belum memiliki 3-20 butir soal.`;
      }
      toast.error(pesan);
      return;
    }

    setConfirmSubmitOpen(true);
  };

  const executeAjukanReview = async () => {
    if (!kursus) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("ajukan_kursus", {
        p_kursus_id: kursus.id,
      });

      if (error) throw error;

      toast.success(
        `Kursus "${kursus.judul}" berhasil diajukan untuk ditinjau oleh Admin!`
      );
      setConfirmSubmitOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Gagal mengajukan kursus:", err);
      toast.error(err.message || "Gagal mengajukan kursus untuk ditinjau.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (st: KursusDetail["status"]) => {
    switch (st) {
      case "draf":
        return <Badge variant="outline">Draf</Badge>;
      case "ditinjau":
        return (
          <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-700 font-medium">
            Sedang Ditinjau Admin
          </Badge>
        );
      case "terbit":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
            Terbit di Katalog
          </Badge>
        );
      case "ditutup":
        return <Badge variant="secondary">Ditutup</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Memuat data kurikulum kursus...</p>
      </div>
    );
  }

  if (errorMsg || !kursus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-6 space-y-4">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Terjadi Kesalahan</h1>
            <p className="text-sm text-muted-foreground">{errorMsg || "Kursus tidak ditemukan."}</p>
          </div>
          <Button asChild className="w-full">
            <Link href={role === "admin" ? "/admin/tinjauan" : "/instruktur/kursus"}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {role === "admin" ? "Kembali ke Panel Admin" : "Kembali ke Daftar Kursus"}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title={kursus.judul}
          description={kursus.ringkasan}
          breadcrumbs={[
            {
              label: role === "admin" ? "Panel Admin" : "Daftar Kursus",
              href: role === "admin" ? "/admin/tinjauan" : "/instruktur/kursus",
            },
            { label: kursus.judul },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
                <Link href={`/instruktur/kursus/${kursus.id}/peserta${role === "admin" ? "?from=admin" : ""}`}>
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Rekap Nilai Peserta</span>
                </Link>
              </Button>

              {kursus.status === "terbit" && (
                <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
                  <Link href={`/kursus/${kursus.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span>Pratinjau Katalog</span>
                  </Link>
                </Button>
              )}

              {role !== "admin" && kursus.status === "draf" && (
                <Button
                  size="sm"
                  onClick={handleAjukanReview}
                  disabled={submitting}
                  className="h-9 gap-1.5 font-medium"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Memproses..." : "Ajukan Kursus ke Admin"}
                </Button>
              )}
            </div>
          }
        />

        {/* Ringkasan Metadata Kursus & Validasi */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge variant="secondary" className="font-semibold text-xs">
                  {kursus.kategori}
                </Badge>
                {getStatusBadge(kursus.status)}
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Award className="h-3.5 w-3.5 text-muted-foreground" />
                  Syarat Lulus: Min. {kursus.nilai_lulus}%
                </span>
              </div>

              {isLocked && role !== "admin" && (
                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-md">
                  <Lock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Kurikulum Terkunci ({kursus.status.toUpperCase()})</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Catatan Penolakan Admin jika ada */}
            {kursus.catatan_tinjauan && (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Catatan Tinjauan dari Admin:</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {kursus.catatan_tinjauan}
                </AlertDescription>
              </Alert>
            )}

            {/* Checklist Standar Kurikulum */}
            <div className="rounded-lg bg-muted/40 border p-4">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Kesiapan Standar Kurikulum Kursus (BR-03)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {isModulCountValid ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                  <span className={isModulCountValid ? "text-foreground" : "text-amber-800 font-medium"}>
                    Jumlah Modul: <strong>{totalModul}</strong> (Wajib 2 s/d 10 modul)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {invalidModulSoal.length === 0 && totalModul > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                  <span
                    className={
                      invalidModulSoal.length === 0 && totalModul > 0
                        ? "text-foreground"
                        : "text-amber-800 font-medium"
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
          </CardContent>
        </Card>

        {/* Grid 2 Kolom: Modul (Kiri) & Materi / Soal (Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Editor Modul (5 kolom) */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Daftar Modul Pembelajaran
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <EditorModul
                  kursusId={kursus.id}
                  isLocked={isLocked}
                  modulList={modulList}
                  onRefresh={loadData}
                  onSelectModulForSoal={(modul) => setSelectedModul(modul)}
                  selectedModulId={selectedModul?.id || null}
                />
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Detail Materi, Media & Soal (7 kolom) */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              {selectedModul ? (
                <>
                  <CardHeader className="border-b pb-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          Modul {selectedModul.urutan}
                        </span>
                        <CardTitle className="text-lg leading-snug mt-0.5">
                          {selectedModul.judul}
                        </CardTitle>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {selectedModul.durasi_menit} Menit
                          </span>
                          <span>·</span>
                          <span>{selectedModul.soal_count ?? 0} Butir Soal Kuis</span>
                        </div>
                      </div>

                      <Tabs
                        value={activeTab}
                        onValueChange={(val) => setActiveTab(val as "materi" | "soal")}
                        className="w-auto"
                      >
                        <TabsList className="grid grid-cols-2 h-9">
                          <TabsTrigger value="materi" className="text-xs gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Materi & Media</span>
                          </TabsTrigger>
                          <TabsTrigger value="soal" className="text-xs gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5" />
                            <span>Soal Kuis ({selectedModul.soal_count ?? 0})</span>
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {/* Tab 1: Materi & Media */}
                    {activeTab === "materi" && (
                      <div className="space-y-6">
                        {/* Video Player */}
                        {selectedModul.video_url ? (
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Video className="h-3.5 w-3.5 text-sky-600" /> Video Pembelajaran
                            </h4>
                            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border shadow-xs relative">
                              <iframe
                                src={getEmbedUrl(selectedModul.video_url)!}
                                title={selectedModul.judul}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                referrerPolicy="strict-origin-when-cross-origin"
                                className="w-full h-full border-0"
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                              <span className="truncate max-w-sm">{selectedModul.video_url}</span>
                              <a
                                href={selectedModul.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium inline-flex items-center gap-1 shrink-0"
                              >
                                Buka di YouTube <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg border border-dashed text-xs text-muted-foreground flex items-center gap-2.5">
                            <Video className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                            <span>Modul ini belum menyertakan tautan video pembelajaran.</span>
                          </div>
                        )}

                        {/* Berkas Lampiran PDF */}
                        {selectedModul.lampiran_path ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Download className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  Berkas Lampiran Materi (PDF)
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">
                                  {selectedModul.lampiran_path.split("/").pop()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnduhPdf(selectedModul.lampiran_path)}
                              disabled={downloadingPdf}
                              className="gap-1.5 h-8 text-xs font-medium self-start sm:self-auto"
                            >
                              <Download className="h-3.5 w-3.5" />
                              {downloadingPdf ? "Membuka..." : "Buka / Unduh PDF"}
                            </Button>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg border border-dashed text-xs text-muted-foreground flex items-center gap-2.5">
                            <FileText className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                            <span>Modul ini tidak memiliki berkas lampiran PDF.</span>
                          </div>
                        )}

                        {/* Teks Materi Lengkap */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-primary" /> Materi Bacaan Lengkap
                          </h4>
                          <div className="text-sm leading-relaxed whitespace-pre-line bg-muted/30 p-5 rounded-xl border font-sans">
                            {selectedModul.isi_materi ? (
                              selectedModul.isi_materi
                            ) : (
                              <span className="text-muted-foreground italic">Belum ada teks materi bacaan pada modul ini.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Soal Kuis */}
                    {activeTab === "soal" && (
                      <div className="space-y-4">
                        <EditorSoal
                          modulId={selectedModul.id}
                          modulJudul={selectedModul.judul}
                          isLocked={isLocked}
                          onSoalCountChanged={loadData}
                        />
                      </div>
                    )}
                  </CardContent>
                </>
              ) : (
                <CardContent className="py-16 text-center text-muted-foreground space-y-2">
                  <BookOpen className="h-10 w-10 mx-auto opacity-30" />
                  <p className="text-sm font-medium">Pilih salah satu modul di sebelah kiri untuk melihat materi dan butir soal kuis.</p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Dialog Konfirmasi Pengajuan Kurikulum */}
      <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              <span>Ajukan Kursus untuk Ditinjau?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              <p>
                Apakah Anda yakin ingin mengajukan kursus <strong>&quot;{kursus.judul}&quot;</strong> untuk ditinjau oleh Admin?
              </p>
              <p className="text-xs text-muted-foreground">
                Setelah diajukan, kurikulum akan terkunci dari pengeditan hingga hasil review dari Admin keluar.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAjukanReview}
              disabled={submitting}
            >
              {submitting ? "Memproses..." : "Ya, Ajukan Review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
