"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Lock,
  RotateCcw,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

interface SoalItem {
  id: string;
  urutan: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
}

interface FormKuisProps {
  pendaftaranId: string;
  modulId: string;
  nilaiLulus: number;
  isLulusModul: boolean;
  materiDibacaPada: string | null;
  onLulusSuccess?: () => void;
  isAllModulLulus?: boolean;
  isFinalModul?: boolean;
  nextUrutan?: number | null;
}

function KuisSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2 p-5 pt-0">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function FormKuis({
  pendaftaranId,
  modulId,
  nilaiLulus,
  isLulusModul,
  materiDibacaPada,
  onLulusSuccess,
  isAllModulLulus = false,
  isFinalModul = false,
  nextUrutan = null,
}: FormKuisProps) {
  const supabase = createClient();
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [soalList, setSoalList] = useState<SoalItem[]>([]);
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [loadingSoal, setLoadingSoal] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [riwayatPercobaan, setRiwayatPercobaan] = useState<any[]>([]);
  const [hasilTerakhir, setHasilTerakhir] = useState<any | null>(null);
  const [modalHasilOpen, setModalHasilOpen] = useState(false);
  const resultWasOpenRef = useRef(false);

  useEffect(() => {
    if (modalHasilOpen) {
      resultWasOpenRef.current = true;
      return;
    }

    if (resultWasOpenRef.current) {
      resultWasOpenRef.current = false;
      requestAnimationFrame(() => submitButtonRef.current?.focus());
    }
  }, [modalHasilOpen]);

  // Ambil riwayat percobaan dan daftar soal
  useEffect(() => {
    async function initKuis() {
      setLoadingSoal(true);
      setErrorMsg(null);
      try {
        // 1. Ambil riwayat percobaan kuis
        const { data: riwayat } = await supabase
          .from("percobaan_kuis")
          .select("*")
          .eq("pendaftaran_id", pendaftaranId)
          .eq("modul_id", modulId)
          .order("nomor_percobaan", { ascending: true });

        if (riwayat) {
          setRiwayatPercobaan(riwayat);
        }

        // 2. Ambil soal kuis tanpa kunci jawaban via RPC (INV-05)
        const { data: soalData, error: soalErr } = await supabase.rpc(
          "get_soal_kuis",
          {
            p_pendaftaran_id: pendaftaranId,
            p_modul_id: modulId,
          }
        );

        if (!soalErr && Array.isArray(soalData)) {
          setSoalList(soalData);
        } else if (soalErr) {
          console.warn("RPC get_soal_kuis error:", soalErr);
        }
      } catch (err) {
        console.error("Gagal inisialisasi kuis:", err);
      } finally {
        setLoadingSoal(false);
      }
    }

    if (materiDibacaPada) {
      initKuis();
    } else {
      setLoadingSoal(false);
    }
  }, [pendaftaranId, modulId, materiDibacaPada, supabase]);

  const jumlahPercobaan = riwayatPercobaan.length;
  const sisaPercobaan = Math.max(0, 3 - jumlahPercobaan);
  const isSudahLulus =
    isLulusModul || riwayatPercobaan.some((r) => r.lulus);
  const isPercobaanHabis = jumlahPercobaan >= 3 && !isSudahLulus;
  const isResultDialogOpen = modalHasilOpen && Boolean(hasilTerakhir);

  const handlePilihJawaban = (soalId: string, opsi: string) => {
    setJawaban((prev) => ({
      ...prev,
      [soalId]: opsi,
    }));
  };

  const handleKirimKuis = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validasi semua soal wajib dijawab (BR-09)
    const belumDijawab = soalList.filter((s) => !jawaban[s.id]);
    if (belumDijawab.length > 0) {
      const nomorList = belumDijawab
        .map((s) => `Nomor ${s.urutan}`)
        .join(", ");
      setErrorMsg(
        `Terdapat ${belumDijawab.length} butir soal yang belum dijawab (${nomorList}). Semua soal wajib dijawab sebelum mengirimkan kuis!`
      );

      // Auto-scroll ke soal pertama yang belum dijawab
      const firstEl = document.getElementById(`soal-card-${belumDijawab[0].id}`);
      if (firstEl) {
        firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    try {
      // Panggil RPC database atomik kirim_jawaban_kuis (INV-04, INV-05, INV-06)
      const { data, error } = await supabase.rpc("kirim_jawaban_kuis", {
        p_pendaftaran_id: pendaftaranId,
        p_modul_id: modulId,
        p_jawaban: jawaban,
      });

      if (error) {
        setErrorMsg(error.message || "Gagal mengevaluasi kuis di database.");
        setSubmitting(false);
        return;
      }

      setHasilTerakhir(data);
      submitButtonRef.current?.focus();
      setModalHasilOpen(true);

      // Perbarui riwayat
      setRiwayatPercobaan((prev) => [
        ...prev,
        {
          nomor_percobaan: data.nomor_percobaan,
          nilai: data.nilai,
          jumlah_benar: data.jumlah_benar,
          jumlah_soal: data.jumlah_soal,
          lulus: data.lulus,
        },
      ]);

      if (data.kursus_selesai) {
        // Kirim email notifikasi sertifikat resmi terbit
        fetch("/api/notifikasi/sertifikat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pendaftaran_id: pendaftaranId }),
        }).catch((certEmailErr) => {
          console.error(
            "Gagal mengirim email notifikasi sertifikat:",
            certEmailErr
          );
        });
      }

      if (data.lulus && onLulusSuccess) {
        onLulusSuccess();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan evaluasi kuis.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Kondisi jika materi belum ditandai dibaca (BR-08)
  if (!materiDibacaPada) {
    return (
      <Card className="border-highlight bg-highlight/40">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
            <Lock className="h-5 w-5" />
          </span>
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-highlight-foreground">
              Kuis Masih Terkunci
            </h4>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-highlight-foreground/80">
              Silakan pelajari materi bacaan dan video di atas, kemudian tekan
              tombol{" "}
              <span className="font-semibold text-highlight-foreground">
                &quot;Tandai Materi Sudah Dibaca&quot;
              </span>{" "}
              untuk membuka lembar evaluasi kuis modul ini.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. Kondisi jika modul sudah lulus (INV-04: Modul lulus tidak bisa diuji ulang)
  if (isSudahLulus && !isResultDialogOpen) {
    const highestScore = Math.max(
      ...riwayatPercobaan.map((r) => r.nilai),
      nilaiLulus
    );

    const isCourseFinished =
      isAllModulLulus || (isFinalModul && isSudahLulus);

    if (isCourseFinished) {
      return (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-col items-center gap-5 p-6 text-center sm:p-10">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Award className="h-8 w-8" />
            </span>
            <div className="space-y-2">
              <Badge
                variant="secondary"
                className="border-emerald-200 bg-emerald-100 text-emerald-800"
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Program Pelatihan Selesai
              </Badge>
              <h4 className="text-xl font-semibold text-emerald-950 sm:text-2xl">
                Selamat! Anda Telah Menyelesaikan Seluruh Kursus
              </h4>
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-emerald-900">
                Seluruh modul dan kuis evaluasi berhasil Anda tuntaskan dengan
                predikat kelulusan. Nilai kelulusan modul ini:{" "}
                <span className="font-semibold">{highestScore} / 100</span>.
                Dokumen sertifikat resmi ber-SK Lembaga Pijar Aksara telah
                diterbitkan untuk Anda.
              </p>
            </div>

            <Button
              asChild
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Link href={`/kursus-saya/${pendaftaranId}/sertifikat`}>
                <Award />
                Buka &amp; Cetak Sertifikat Kelulusan Resmi
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Award className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <h4 className="text-lg font-semibold text-emerald-950">
              Selamat! Anda Telah Lulus Modul Ini
            </h4>
            <p className="text-sm text-emerald-800">
              Nilai Terbaik:{" "}
              <span className="text-base font-semibold">{highestScore}</span> /
              100 (Syarat Lulus: {nilaiLulus})
            </p>
          </div>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            Sesuai aturan kurikulum, kuis pada modul yang telah berstatus lulus
            tidak dapat diulang kembali. Silakan lanjutkan belajar ke modul
            berikutnya.
          </p>
          {nextUrutan && (
            <Button asChild>
              <Link
                href={`/kursus-saya/${pendaftaranId}/modul/${nextUrutan}`}
              >
                Lanjut ke Modul {nextUrutan}
                <ArrowRight />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // 3. Kondisi jika batas 3 kali percobaan habis (BR-10)
  if (isPercobaanHabis && !isResultDialogOpen) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <h4 className="text-lg font-semibold text-foreground">
              Batas Percobaan Kuis Telah Habis
            </h4>
            <p className="text-sm text-destructive">
              Anda telah menggunakan seluruh 3 kali batas percobaan untuk modul
              ini tanpa mencapai nilai kelulusan {nilaiLulus}.
            </p>
          </div>
          <Card className="w-full max-w-xs bg-background">
            <CardContent className="space-y-1 p-3 text-sm">
              <span className="block font-medium text-foreground">
                Riwayat Nilai:
              </span>
              {riwayatPercobaan.map((r) => (
                <div
                  key={r.nomor_percobaan}
                  className="flex justify-between gap-3"
                >
                  <span className="text-muted-foreground">
                    Percobaan ke-{r.nomor_percobaan}:
                  </span>
                  <span className="font-semibold text-destructive">
                    {r.nilai} / 100
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Kartu Header Kuis & Sisa Percobaan */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold sm:text-lg">
                Kuis Evaluasi Modul
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Semua soal pilihan ganda dinilai langsung di server. Kunci
              jawaban tidak pernah dibocorkan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">Syarat Lulus: {nilaiLulus} / 100</Badge>
            <Badge variant={sisaPercobaan === 1 ? "highlight" : "secondary"}>
              Sisa {sisaPercobaan} Percobaan
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tampilan Hasil Evaluasi Kuis Terakhir */}
      {hasilTerakhir && !modalHasilOpen && (
        <Card
          className={
            hasilTerakhir.lulus
              ? "border-emerald-200 bg-emerald-50"
              : "border-highlight bg-highlight/40"
          }
        >
          <CardContent className="space-y-3 p-5 text-center">
            <Badge
              variant={hasilTerakhir.lulus ? "secondary" : "highlight"}
              className={
                hasilTerakhir.lulus
                  ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                  : undefined
              }
            >
              {hasilTerakhir.lulus ? (
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="mr-1 h-3.5 w-3.5" />
              )}
              {hasilTerakhir.lulus ? "Lulus" : "Belum Lulus"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Nilai terakhir:{" "}
              <span className="font-semibold text-foreground">
                {hasilTerakhir.nilai} / 100
              </span>{" "}
              · Jawaban benar {hasilTerakhir.jumlah_benar} /{" "}
              {hasilTerakhir.jumlah_soal}
            </p>
            {hasilTerakhir.kursus_selesai && (
              <Button
                asChild
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Link href={`/kursus-saya/${pendaftaranId}/sertifikat`}>
                  <Award />
                  Buka &amp; Cetak Sertifikat Resmi
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulir Lembar Soal Kuis */}
      {loadingSoal ? (
        <KuisSkeleton />
      ) : soalList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Soal kuis untuk modul ini belum dikonfigurasi oleh instruktur.
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleKirimKuis} className="space-y-5">
          {soalList.map((soal) => {
            const jawabanAktif = jawaban[soal.id];
            const opsiList = [
              { label: "A", text: soal.pilihan_a },
              { label: "B", text: soal.pilihan_b },
              { label: "C", text: soal.pilihan_c },
              { label: "D", text: soal.pilihan_d },
            ];

            const isUnanswered = !jawabanAktif && Boolean(errorMsg);

            return (
              <Card
                key={soal.id}
                id={`soal-card-${soal.id}`}
                className={
                  isUnanswered
                    ? "border-destructive/50 ring-2 ring-destructive/20"
                    : undefined
                }
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                        isUnanswered
                          ? "bg-destructive/10 text-destructive"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {soal.urutan}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="text-sm font-medium leading-relaxed sm:text-base">
                        {soal.pertanyaan}
                      </CardTitle>
                      {isUnanswered && (
                        <p className="text-xs font-medium text-destructive">
                          * Butir soal ini belum dijawab
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 p-5 pt-0">
                  {opsiList.map((opsi) => {
                    const isSelected = jawabanAktif === opsi.label;
                    return (
                      <label
                        key={opsi.label}
                        className={`flex cursor-pointer select-none items-center gap-3 rounded-md border p-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`soal-${soal.id}`}
                          value={opsi.label}
                          checked={isSelected}
                          onChange={() =>
                            handlePilihJawaban(soal.id, opsi.label)
                          }
                          className="sr-only"
                        />
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {opsi.label}
                        </span>
                        <span className="min-w-0 flex-1 leading-relaxed">
                          {opsi.text}
                        </span>
                      </label>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}

          <div className="space-y-3">
            {errorMsg && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <Button
              ref={submitButtonRef}
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Mengevaluasi Jawaban di Server...
                </>
              ) : (
                <>
                  <Send />
                  Kirim Jawaban Kuis Sekarang
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Sistem akan mengunci percobaan secara atomik. Pastikan seluruh
              jawaban telah Anda periksa.
            </p>
          </div>
        </form>
      )}

      {/* Dialog Hasil Evaluasi Kuis (BR-09, BR-10, BR-11) */}
      <Dialog
        open={modalHasilOpen}
        onOpenChange={(open) => {
          if (!open) setModalHasilOpen(false);
        }}
      >
        {hasilTerakhir && (
          <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 overflow-hidden p-0">
            <DialogHeader className="shrink-0 border-b px-6 py-4 pr-14">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                    hasilTerakhir.lulus
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-highlight text-highlight-foreground"
                  }`}
                >
                  {hasilTerakhir.lulus ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 space-y-1">
                  <DialogTitle>Hasil Evaluasi</DialogTitle>
                  <DialogDescription>
                    Ringkasan nilai dan tindak lanjut kuis modul ini.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-6 py-5">
              <div className="space-y-2 text-center">
                <Badge
                  variant={hasilTerakhir.lulus ? "secondary" : "destructive"}
                  className={
                    hasilTerakhir.lulus
                      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                      : undefined
                  }
                >
                  {hasilTerakhir.lulus ? "Lulus" : "Belum Lulus"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {hasilTerakhir.lulus
                    ? "Jawaban Anda telah dievaluasi dan memenuhi batas syarat kelulusan."
                    : `Syarat minimal nilai kelulusan modul ini adalah ${nilaiLulus}.`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-md border bg-muted/30 p-4 text-center">
                <div className="border-r">
                  <span className="block text-xs text-muted-foreground">
                    Nilai Anda:
                  </span>
                  <span
                    className={`text-3xl font-semibold ${
                      hasilTerakhir.lulus
                        ? "text-emerald-600"
                        : "text-highlight-foreground"
                    }`}
                  >
                    {hasilTerakhir.nilai}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    dari 100
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">
                    Jawaban Benar:
                  </span>
                  <span className="text-3xl font-semibold text-foreground">
                    {hasilTerakhir.jumlah_benar}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    dari {hasilTerakhir.jumlah_soal} butir soal
                  </span>
                </div>
              </div>

              {hasilTerakhir.kursus_selesai ? (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Seluruh modul telah selesai. Sertifikat kelulusan digital
                    Anda telah resmi diterbitkan oleh sistem Pijar Aksara.
                  </AlertDescription>
                </Alert>
              ) : !hasilTerakhir.lulus ? (
                <Alert className="border-highlight bg-highlight/40 text-highlight-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Sisa kesempatan kuis:{" "}
                    <strong>{hasilTerakhir.sisa_percobaan} kali lagi</strong>{" "}
                    (Maksimal 3x percobaan).
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>

            <DialogFooter className="shrink-0 flex-col gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:justify-end sm:space-x-0">
              {hasilTerakhir.kursus_selesai ? (
                <Button
                  asChild
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                >
                  <Link href={`/kursus-saya/${pendaftaranId}/sertifikat`}>
                    <Award />
                    Buka &amp; Cetak Sertifikat
                  </Link>
                </Button>
              ) : hasilTerakhir.lulus ? (
                nextUrutan ? (
                  <Button asChild className="w-full sm:w-auto">
                    <Link
                      href={`/kursus-saya/${pendaftaranId}/modul/${nextUrutan}`}
                    >
                      Lanjut ke Modul {nextUrutan}
                      <ArrowRight />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() => setModalHasilOpen(false)}
                  >
                    Tutup
                  </Button>
                )
              ) : hasilTerakhir.sisa_percobaan > 0 ? (
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setModalHasilOpen(false);
                    setJawaban({});
                    setErrorMsg(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <RotateCcw />
                  Ulangi Kuis Sekarang
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setModalHasilOpen(false)}
                >
                  Tutup
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
