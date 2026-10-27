"use client";

import React, { Fragment, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileCode,
  Loader2,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import EmptyState from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

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

interface KursusEnrollment {
  id: string;
  kursus_id: string;
  status: string;
  didaftarkan_pada: string;
  kursus: {
    id: string;
    judul: string;
    slug: string;
    kategori: string;
    nilai_lulus: number;
    modul: ModulItem[];
  };
  total_modul: number;
  modul_lulus: number;
  sertifikat?: { nomor_sertifikat: string } | null;
  progres_modul: ProgresModulItem[];
  percobaan_kuis: PercobaanKuisItem[];
}

interface InstrukturCourse {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  status: string;
  modulCount: number;
  pesertaCount: number;
}

interface AdminAuditLogItem {
  id: string | number;
  dibuat_pada: string;
  pelaku_id: string | null;
  aksi: string;
  nama_tabel: string;
  id_data: string | null;
  data_sebelum: any;
  data_sesudah: any;
}

interface ProfileFormProps {
  role: string | null;
  profileName?: string;
  namaLengkap: string;
  noHp: string;
  email: string;
  savingProfile: boolean;
  onNamaChange: (value: string) => void;
  onNoHpChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "PA";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ProfileForm({
  role,
  profileName,
  namaLengkap,
  noHp,
  email,
  savingProfile,
  onNamaChange,
  onNoHpChange,
  onSubmit,
}: ProfileFormProps) {
  const displayName = profileName || namaLengkap || "Pengguna";
  const isAdmin = role === "admin";

  const roleLabel =
    role === "admin"
      ? "Administrator Sistem"
      : role === "instruktur"
        ? "Instruktur Terverifikasi"
        : "Peserta Terverifikasi";

  const formDescription =
    role === "admin"
      ? "Kelola identitas akun administrator Anda. Perubahan berlaku untuk seluruh aktivitas di sistem."
      : role === "instruktur"
        ? "Nama ini ditampilkan sebagai pengampu kursus di katalog publik."
        : "Nama ini digunakan pada dokumen sertifikat kelulusan resmi.";

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div
            className={
              isAdmin
                ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-highlight text-base font-semibold text-highlight-foreground"
                : "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base font-semibold text-primary"
            }
            aria-hidden="true"
          >
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="text-lg">Data Pribadi</CardTitle>
            <Badge
              variant={isAdmin ? "highlight" : "secondary"}
              className="gap-1"
            >
              <ShieldCheck className="h-3 w-3" />
              {roleLabel}
            </Badge>
          </div>
        </div>
        <CardDescription>{formDescription}</CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profil-nama">Nama Lengkap</Label>
            <Input
              id="profil-nama"
              type="text"
              value={namaLengkap}
              onChange={(event) => onNamaChange(event.target.value)}
              required
              placeholder="Masukkan nama lengkap Anda"
              aria-describedby="profil-nama-hint"
            />
            <p id="profil-nama-hint" className="text-xs text-muted-foreground">
              Pastikan nama sesuai dengan identitas resmi Anda.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profil-email">Alamat Email (Akun)</Label>
            <Input
              id="profil-email"
              type="email"
              value={email}
              readOnly
              aria-readonly="true"
              className="bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Email akun terhubung dengan autentikasi Anda.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profil-hp">Nomor HP / WhatsApp</Label>
            <Input
              id="profil-hp"
              type="tel"
              value={noHp}
              onChange={(event) => onNoHpChange(event.target.value)}
              placeholder="Contoh: 081234567890"
              aria-describedby="profil-hp-hint"
            />
            <p id="profil-hp-hint" className="text-xs text-muted-foreground">
              Digunakan untuk pemberitahuan status dan konfirmasi pembayaran.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={savingProfile}
            aria-busy={savingProfile}
          >
            {savingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {savingProfile ? "Menyimpan Perubahan..." : "Simpan Profil Saya"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Memuat data profil...</span>

      <Card className="lg:col-span-1">
        <CardHeader className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardHeader>
        <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
          <Skeleton className="h-10 w-full" />
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function EnrollmentStatusBadge({ status }: { status: string }) {
  if (status === "selesai") {
    return (
      <Badge
        variant="secondary"
        className="border-emerald-200 bg-emerald-100 text-emerald-800"
      >
        Selesai
      </Badge>
    );
  }

  if (status === "aktif") {
    return (
      <Badge
        variant="secondary"
        className="border-primary/20 bg-primary/10 text-primary"
      >
        Aktif
      </Badge>
    );
  }

  if (status === "menunggu_bayar") {
    return <Badge variant="highlight">Menunggu Pembayaran</Badge>;
  }

  if (status === "dibatalkan") {
    return <Badge variant="destructive">Dibatalkan</Badge>;
  }

  return (
    <Badge variant="outline" className="capitalize">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function ModulStatusBadge({
  lulus,
  attemptCount,
}: {
  lulus: boolean;
  attemptCount: number;
}) {
  if (lulus) {
    return (
      <Badge
        variant="secondary"
        className="gap-1 border-emerald-200 bg-emerald-100 text-emerald-800"
      >
        <CheckCircle2 className="h-3 w-3" />
        Lulus
      </Badge>
    );
  }

  if (attemptCount >= 3) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Gagal
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="h-3 w-3" />
      Belum Selesai
    </Badge>
  );
}

function InstrukturStatusBadge({ status }: { status: string }) {
  if (status === "disetujui" || status === "terbit") {
    return (
      <Badge
        variant="secondary"
        className="border-emerald-200 bg-emerald-100 text-emerald-800"
      >
        {status === "terbit" ? "Terbit" : "Disetujui"}
      </Badge>
    );
  }

  if (status === "diajukan" || status === "ditinjau") {
    return (
      <Badge variant="highlight">
        {status === "ditinjau" ? "Ditinjau" : "Diajukan"}
      </Badge>
    );
  }

  if (status === "ditolak") {
    return <Badge variant="destructive">Ditolak</Badge>;
  }

  return (
    <Badge variant="outline" className="capitalize">
      {status === "ditutup" ? "Ditutup" : status}
    </Badge>
  );
}

function TranscriptCard({
  enrollments,
  expandedCourse,
  onToggle,
  title,
  description,
}: {
  enrollments: KursusEnrollment[];
  expandedCourse: Record<string, boolean>;
  onToggle: (id: string) => void;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-3 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/kursus-saya">Buka Kursus Saya</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {enrollments.length === 0 ? (
          <div className="p-5 pt-0 sm:p-6 sm:pt-0">
            <EmptyState
              icon={BookOpen}
              title="Belum Ada Kursus yang Diikuti"
              description="Anda belum memiliki riwayat pendaftaran atau evaluasi kuis di LMS Pijar Aksara."
              action={
                <Button asChild>
                  <Link href="/kursus">Jelajahi Katalog Kursus</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <Table className="min-w-[680px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-5 sm:pl-6">Kursus</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progres</TableHead>
                <TableHead className="pr-5 text-right sm:pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => {
                const isExpanded = !!expandedCourse[enrollment.id];
                const hasCourse = !!enrollment.kursus;
                const progressPct =
                  enrollment.total_modul > 0
                    ? Math.floor(
                        (enrollment.modul_lulus / enrollment.total_modul) * 100
                      )
                    : 0;
                const sortedModul = [...(enrollment.kursus?.modul || [])].sort(
                  (a, b) => a.urutan - b.urutan
                );
                const detailId = `transcript-detail-${enrollment.id}`;

                return (
                  <Fragment key={enrollment.id}>
                    <TableRow>
                      <TableCell className="pl-5 sm:pl-6">
                        <div className="min-w-0 space-y-1.5">
                          <p className="font-medium">
                            {enrollment.kursus?.judul ||
                              "Kursus Telah Ditutup"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-[11px]">
                              {enrollment.kursus?.kategori ||
                                "Tidak tersedia"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Terdaftar{" "}
                              {new Date(
                                enrollment.didaftarkan_pada
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <EnrollmentStatusBadge status={enrollment.status} />
                      </TableCell>
                      <TableCell>
                        {hasCourse ? (
                          <div className="min-w-[130px] space-y-1">
                            <p className="text-sm">
                              {enrollment.modul_lulus} dari{" "}
                              {enrollment.total_modul} modul
                            </p>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {progressPct}% selesai
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Data modul tidak tersedia
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="pr-5 text-right sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {enrollment.status === "selesai" && (
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={`/kursus-saya/${enrollment.id}/sertifikat`}
                              >
                                <Award className="h-4 w-4" />
                                Sertifikat
                              </Link>
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggle(enrollment.id)}
                            aria-expanded={isExpanded}
                            aria-controls={isExpanded ? detailId : undefined}
                            aria-label={`${
                              isExpanded ? "Tutup" : "Lihat"
                            } rincian nilai ${
                              enrollment.kursus?.judul ||
                              "kursus yang telah ditutup"
                            }`}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow id={detailId} className="hover:bg-transparent">
                        <TableCell
                          colSpan={4}
                          className="bg-muted/30 p-0 whitespace-normal"
                        >
                          <div className="space-y-3 p-4 sm:p-5">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm font-medium">
                                Rincian Nilai Kuis per Modul
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Syarat lulus:{" "}
                                {hasCourse
                                  ? `${enrollment.kursus?.nilai_lulus ?? 70}/100`
                                  : "Tidak tersedia"}
                              </p>
                            </div>

                            {sortedModul.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                {hasCourse
                                  ? "Belum ada modul pada kursus ini."
                                  : "Data modul tidak tersedia karena detail kursus tidak dapat diakses."}
                              </p>
                            ) : (
                              <div className="overflow-hidden rounded-md border bg-background">
                                <Table className="min-w-[580px]">
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Modul</TableHead>
                                      <TableHead>Nilai Terbaik</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Riwayat Percobaan</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {sortedModul.map((modul) => {
                                      const progress =
                                        enrollment.progres_modul.find(
                                          (item) =>
                                            item.modul_id === modul.id
                                        );
                                      const isLulus =
                                        progress?.lulus_pada !== null &&
                                        progress?.lulus_pada !== undefined;
                                      const attempts = enrollment.percobaan_kuis
                                        .filter(
                                          (item) =>
                                            item.modul_id === modul.id
                                        )
                                        .sort(
                                          (a, b) =>
                                            a.nomor_percobaan -
                                            b.nomor_percobaan
                                        );
                                      const bestScore =
                                        attempts.length > 0
                                          ? Math.max(
                                              ...attempts.map(
                                                (attempt) => attempt.nilai
                                              )
                                            )
                                          : null;

                                      return (
                                        <TableRow key={modul.id}>
                                          <TableCell className="whitespace-normal">
                                            <span className="font-medium">
                                              {modul.urutan}. {modul.judul}
                                            </span>
                                          </TableCell>
                                          <TableCell className="tabular-nums">
                                            {bestScore !== null
                                              ? `${bestScore}/100`
                                              : "—"}
                                          </TableCell>
                                          <TableCell>
                                            <ModulStatusBadge
                                              lulus={isLulus}
                                              attemptCount={attempts.length}
                                            />
                                          </TableCell>
                                          <TableCell className="whitespace-normal">
                                            {attempts.length === 0 ? (
                                              <span className="text-xs text-muted-foreground">
                                                Belum ada percobaan
                                              </span>
                                            ) : (
                                              <div className="flex flex-wrap gap-1.5">
                                                {attempts.map((attempt) => (
                                                  <Badge
                                                    key={attempt.id}
                                                    variant={
                                                      attempt.lulus
                                                        ? "secondary"
                                                        : "outline"
                                                    }
                                                    className={
                                                      attempt.lulus
                                                        ? "border-emerald-200 bg-emerald-100 font-mono text-emerald-800"
                                                        : "font-mono"
                                                    }
                                                  >
                                                    #{attempt.nomor_percobaan}:{" "}
                                                    {attempt.nilai} (Benar:{" "}
                                                    {attempt.jumlah_benar}/
                                                    {attempt.jumlah_soal})
                                                  </Badge>
                                                ))}
                                              </div>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function InstrukturCoursesCard({
  courses,
}: {
  courses: InstrukturCourse[];
}) {
  return (
    <Card>
      <CardHeader className="space-y-3 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Kursus yang Anda Ampu</CardTitle>
            <CardDescription>
              Pantau modul, evaluasi, dan jumlah peserta pada kursus yang Anda
              kelola.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/instruktur/kursus">Kelola Semua Kursus</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {courses.length === 0 ? (
          <div className="p-5 pt-0 sm:p-6 sm:pt-0">
            <EmptyState
              icon={BookOpen}
              title="Belum Ada Kursus"
              description="Anda belum membuat kursus pelatihan di LMS Pijar Aksara."
              action={
                <Button asChild>
                  <Link href="/instruktur/kursus">Buat Kursus Sekarang</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <Table className="min-w-[700px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-5 sm:pl-6">Kursus</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Modul</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead className="pr-5 text-right sm:pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="pl-5 sm:pl-6">
                    <Link
                      href={`/instruktur/kursus/${course.id}`}
                      className="font-medium hover:underline"
                    >
                      {course.judul}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{course.kategori}</Badge>
                  </TableCell>
                  <TableCell>
                    <InstrukturStatusBadge status={course.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {course.modulCount}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {course.pesertaCount}
                  </TableCell>
                  <TableCell className="pr-5 text-right sm:pr-6">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/instruktur/kursus/${course.id}`}>
                        Kelola
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

type AuditActionMeta = {
  label: string;
  variant: "secondary" | "destructive" | "highlight" | "outline";
  className?: string;
};

function getAuditActionMeta(aksi: string): AuditActionMeta {
  const normalized = aksi.toLowerCase();

  if (normalized.includes("konfirmasi") || normalized.includes("bayar")) {
    return {
      label: "Konfirmasi Pembayaran",
      variant: "secondary",
      className: "border-emerald-200 bg-emerald-100 text-emerald-800",
    };
  }

  if (normalized.includes("setujui")) {
    return {
      label: "Setujui Kursus",
      variant: "secondary",
      className: "border-emerald-200 bg-emerald-100 text-emerald-800",
    };
  }

  if (normalized.includes("tolak") || normalized.includes("batal")) {
    return {
      label: normalized.includes("batal")
        ? "Batalkan Pendaftaran"
        : "Tolak Kursus",
      variant: "destructive",
    };
  }

  if (normalized.includes("kuota") || normalized.includes("harga")) {
    return {
      label: "Ubah Kuota / Biaya",
      variant: "highlight",
    };
  }

  return {
    label: aksi,
    variant: "outline",
  };
}

function getAuditSummary(log: AdminAuditLogItem) {
  if (log.data_sesudah && typeof log.data_sesudah === "object") {
    if (log.data_sesudah.kursus) {
      return `Kursus: ${log.data_sesudah.kursus}`;
    }

    if (log.data_sesudah.status) {
      return `Status diubah ke: ${log.data_sesudah.status}`;
    }
  }

  return `Target ID: ${log.id_data || "-"}`;
}

function AdminAuditCard({
  logs,
  search,
  page,
  perPage,
  loading,
  onSearchChange,
  onPageChange,
  onSelectLog,
  onRefresh,
  email,
}: {
  logs: AdminAuditLogItem[];
  search: string;
  page: number;
  perPage: number;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSelectLog: (log: AdminAuditLogItem) => void;
  onRefresh: () => void;
  email: string;
}) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Log Aktivitas Akun Saya
            </CardTitle>
            <CardDescription>
              Rekam jejak tindakan administratif akun Anda ({email}).
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Segarkan
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Label htmlFor="cari-log-admin" className="sr-only">
            Cari log aktivitas
          </Label>
          <Input
            id="cari-log-admin"
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari aksi (misal: verifikasi, kursus, kuota)..."
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="p-5 pt-0 sm:p-6 sm:pt-0">
            <EmptyState
              icon={Activity}
              title="Belum Ada Catatan Aktivitas"
              description={
                search
                  ? "Tidak ada aktivitas yang sesuai dengan kata kunci pencarian Anda."
                  : "Aktivitas administratif yang Anda lakukan akan tercatat otomatis di sini."
              }
            />
          </div>
        ) : (
          <>
            <Table className="min-w-[760px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Waktu</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Tabel</TableHead>
                  <TableHead>Ringkasan</TableHead>
                  <TableHead className="pr-5 text-right sm:pr-6">
                    Detail
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs
                  .slice((page - 1) * perPage, page * perPage)
                  .map((log) => {
                    const action = getAuditActionMeta(log.aksi);
                    const formattedDate = new Date(
                      log.dibuat_pada
                    ).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const hasDetail =
                      log.data_sesudah &&
                      typeof log.data_sesudah === "object";

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap pl-5 text-xs text-muted-foreground sm:pl-6">
                          {formattedDate}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={action.variant}
                            className={`whitespace-nowrap ${action.className || ""}`}
                          >
                            {action.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                            {log.nama_tabel}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[260px] text-sm text-muted-foreground">
                          <p className="line-clamp-1">{getAuditSummary(log)}</p>
                        </TableCell>
                        <TableCell className="pr-5 text-right sm:pr-6">
                          {hasDetail ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onSelectLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">Detail</span>
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>

            {logs.length > perPage && (
              <div className="border-t px-4 py-3 sm:px-6">
                <Pagination
                  currentPage={page}
                  totalItems={logs.length}
                  itemsPerPage={perPage}
                  onPageChange={onPageChange}
                  className="py-0"
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AdminLogDialog({
  log,
  onClose,
}: {
  log: AdminAuditLogItem | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!log}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8 text-base">
            <FileCode className="h-5 w-5 text-primary" />
            Rincian Log: {log?.aksi ?? "Aktivitas"}
          </DialogTitle>
          <DialogDescription>
            Payload audit sebelum dan sesudah perubahan.
          </DialogDescription>
        </DialogHeader>

        {log && (
          <div className="space-y-2">
            <div className="grid gap-3 rounded-md border bg-muted/50 p-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Tabel Target</p>
                <p className="font-medium">{log.nama_tabel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ID Data</p>
                <p className="truncate font-mono text-xs">{log.id_data || "-"}</p>
              </div>
            </div>

            {log.data_sebelum && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Data Sebelum</p>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted p-3 font-mono text-xs leading-relaxed">
                  {JSON.stringify(log.data_sebelum, null, 2)}
                </pre>
              </div>
            )}

            {log.data_sesudah && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Data Sesudah</p>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted p-3 font-mono text-xs leading-relaxed">
                  {JSON.stringify(log.data_sesudah, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfilPesertaPage() {
  const { user, profile, refreshProfile, isLoading: authLoading, role } = useAuth();
  const supabase = createClient();

  const [namaLengkap, setNamaLengkap] = useState("");
  const [noHp, setNoHp] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [enrollments, setEnrollments] = useState<KursusEnrollment[]>([]);
  const [instrukturCourses, setInstrukturCourses] = useState<
    InstrukturCourse[]
  >([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLogItem[]>([]);
  const [searchAdminLog, setSearchAdminLog] = useState("");
  const [selectedAdminLog, setSelectedAdminLog] =
    useState<AdminAuditLogItem | null>(null);
  const [adminLogPage, setAdminLogPage] = useState(1);
  const adminLogsPerPage = 5;

  const [loadingData, setLoadingData] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<Record<string, boolean>>(
    {}
  );

  // Isi data form dari profil saat tersedia
  useEffect(() => {
    if (profile) {
      setNamaLengkap(profile.nama_lengkap || "");
      setNoHp(profile.no_hp || "");
    }
  }, [profile]);

  // Reset pagination saat pencarian log berubah
  useEffect(() => {
    setAdminLogPage(1);
  }, [searchAdminLog]);

  // Muat riwayat kursus dan nilai kuis peserta & kursus instruktur / log admin
  const loadData = useCallback(async () => {
    if (!user) return;

    if (role === "admin") {
      setLoadingData(true);
      try {
        const { data: logs, error: logErr } = await supabase
          .from("audit_log")
          .select(
            `
              id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
            `
          )
          .eq("pelaku_id", user.id)
          .order("dibuat_pada", { ascending: false })
          .limit(100);

        if (!logErr && logs) {
          setAdminAuditLogs(logs);
        }
      } catch (err) {
        console.error("Gagal memuat log audit admin:", err);
      } finally {
        setLoadingData(false);
      }
      return;
    }

    setLoadingData(true);
    try {
      // 1. Jika instruktur, ambil kursus yang diampu
      if (role === "instruktur") {
        const { data: taughtCourses } = await supabase
          .from("kursus")
          .select(
            `
              id, judul, slug, kategori, status,
              modul (id),
              pendaftaran (id)
            `
          )
          .eq("instruktur_id", user.id)
          .order("dibuat_pada", { ascending: false });

        if (taughtCourses) {
          setInstrukturCourses(
            taughtCourses.map((course: any) => ({
              id: course.id,
              judul: course.judul,
              slug: course.slug,
              kategori: course.kategori,
              status: course.status,
              modulCount: (course.modul || []).length,
              pesertaCount: (course.pendaftaran || []).length,
            }))
          );
        }
      }

      // 2. Ambil riwayat pendaftaran sebagai peserta jika ada
      const { data, error } = await supabase
        .from("pendaftaran")
        .select(
          `
            id, kursus_id, status, didaftarkan_pada,
            kursus:kursus_id (
              id, judul, slug, kategori, nilai_lulus,
              modul (id, urutan, judul, durasi_menit)
            ),
            sertifikat (nomor_sertifikat),
            progres_modul (id, modul_id, lulus_pada, materi_dibaca_pada),
            percobaan_kuis (id, modul_id, nomor_percobaan, nilai, lulus, jumlah_benar, jumlah_soal, dikerjakan_pada)
          `
        )
        .eq("peserta_id", user.id)
        .order("didaftarkan_pada", { ascending: false });

      if (!error && data) {
        const formatted: KursusEnrollment[] = data.map((item: any) => {
          const totalModul = item.kursus?.modul?.length || 0;
          const modulLulus = (item.progres_modul || []).filter(
            (progress: any) => progress.lulus_pada !== null
          ).length;

          return {
            id: item.id,
            kursus_id: item.kursus_id,
            status: item.status,
            didaftarkan_pada: item.didaftarkan_pada,
            kursus: item.kursus,
            total_modul: totalModul,
            modul_lulus: modulLulus,
            sertifikat: item.sertifikat?.[0] || null,
            progres_modul: item.progres_modul || [],
            percobaan_kuis: item.percobaan_kuis || [],
          };
        });

        setEnrollments(formatted);

        // Buka kursus pertama secara bawaan
        if (formatted.length > 0) {
          setExpandedCourse({ [formatted[0].id]: true });
        }
      }
    } catch (err) {
      console.error("Gagal memuat rekap data profil:", err);
    } finally {
      setLoadingData(false);
    }
  }, [user?.id, role, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simpan perubahan profil peserta (nama & no_hp) sesuai kebijakan RLS profiles_update_self
  const handleSimpanProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!namaLengkap.trim()) {
      toast.error("Nama lengkap wajib diisi.");
      return;
    }

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nama_lengkap: namaLengkap.trim(),
          no_hp: noHp.trim() || null,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      toast.success("Data profil Anda berhasil disimpan ke sistem.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan profil."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleCourseExpand = (id: string) => {
    setExpandedCourse((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredAdminLogs = adminAuditLogs.filter((log) => {
    if (!searchAdminLog) return true;
    const query = searchAdminLog.toLowerCase();
    return (
      log.aksi.toLowerCase().includes(query) ||
      log.nama_tabel.toLowerCase().includes(query) ||
      JSON.stringify(log.data_sesudah || {})
        .toLowerCase()
        .includes(query)
    );
  });

  const description =
    role === "admin"
      ? "Kelola identitas akun administrator dan pantau rekam jejak audit aktivitas Anda."
      : role === "instruktur"
        ? "Kelola data profil pengajar dan pantau ikhtisar kursus yang Anda ampu."
        : "Kelola data pribadi dan lihat rekapitulasi nilai kuis kelulusan Anda.";

  const isLoading = loadingData || authLoading;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <PageHeader title="Profil & Pengaturan Akun" description={description} />

      {isLoading ? (
        <ProfileSkeleton />
      ) : role === "admin" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <ProfileForm
            role={role}
            profileName={profile?.nama_lengkap}
            namaLengkap={namaLengkap}
            noHp={noHp}
            email={user?.email || ""}
            savingProfile={savingProfile}
            onNamaChange={setNamaLengkap}
            onNoHpChange={setNoHp}
            onSubmit={handleSimpanProfil}
          />
          <AdminAuditCard
            logs={filteredAdminLogs}
            search={searchAdminLog}
            page={adminLogPage}
            perPage={adminLogsPerPage}
            loading={loadingData}
            onSearchChange={setSearchAdminLog}
            onPageChange={setAdminLogPage}
            onSelectLog={setSelectedAdminLog}
            onRefresh={loadData}
            email={user?.email || ""}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <ProfileForm
            role={role}
            profileName={profile?.nama_lengkap}
            namaLengkap={namaLengkap}
            noHp={noHp}
            email={user?.email || ""}
            savingProfile={savingProfile}
            onNamaChange={setNamaLengkap}
            onNoHpChange={setNoHp}
            onSubmit={handleSimpanProfil}
          />

          <div className="space-y-6 lg:col-span-2">
            {role === "instruktur" && (
              <InstrukturCoursesCard courses={instrukturCourses} />
            )}

            {(role !== "instruktur" || enrollments.length > 0) && (
              <TranscriptCard
                enrollments={enrollments}
                expandedCourse={expandedCourse}
                onToggle={toggleCourseExpand}
                title={
                  role === "instruktur"
                    ? "Kursus yang Anda Ikuti (Sebagai Peserta)"
                    : "Transkrip Nilai Belajar Peserta"
                }
                description="Rekap nilai kuis hanya dapat diakses oleh Anda, instruktur pengampu, dan administrator lembaga."
              />
            )}
          </div>
        </div>
      )}

      <AdminLogDialog
        log={selectedAdminLog}
        onClose={() => setSelectedAdminLog(null)}
      />
    </main>
  );
}
