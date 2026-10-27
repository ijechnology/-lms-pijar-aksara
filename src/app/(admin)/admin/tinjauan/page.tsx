"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  Users,
  Award,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";

export interface KursusTinjauanItem {
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
  instruktur: {
    nama_lengkap: string;
    email: string;
  } | null;
  modul: Array<{
    id: string;
    urutan: number;
    judul: string;
    durasi_menit: number;
    soal: Array<{ id: string }>;
  }>;
}

function AdminTinjauanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [kursusList, setKursusList] = useState<KursusTinjauanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals & Dialogs State
  const [approveTarget, setApproveTarget] = useState<KursusTinjauanItem | null>(null);
  const [closeTarget, setCloseTarget] = useState<KursusTinjauanItem | null>(null);
  const [reopenTarget, setReopenTarget] = useState<KursusTinjauanItem | null>(null);

  // Penolakan Kursus
  const [rejectTarget, setRejectTarget] = useState<KursusTinjauanItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Ubah Kuota & Harga
  const [editTarget, setEditTarget] = useState<KursusTinjauanItem | null>(null);
  const [editKuota, setEditKuota] = useState<number>(20);
  const [editHarga, setEditHarga] = useState<number>(0);
  const [editKursiTerpakai, setEditKursiTerpakai] = useState<number>(0);
  const [fetchingKursi, setFetchingKursi] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Pratinjau Sheet Kurikulum
  const [previewTarget, setPreviewTarget] = useState<KursusTinjauanItem | null>(null);

  const [processing, setProcessing] = useState(false);

  const loadKursus = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("kursus")
        .select(`
          id, judul, slug, kategori, ringkasan, deskripsi, harga, kuota, nilai_lulus,
          status, catatan_tinjauan, dibuat_pada,
          instruktur:profiles!kursus_instruktur_id_fkey (nama_lengkap, email),
          modul (
            id, urutan, judul, durasi_menit,
            soal (id)
          )
        `)
        .order("dibuat_pada", { ascending: false });

      if (error) throw error;
      setKursusList((data as any) || []);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data kursus.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadKursus();
  }, [loadKursus]);

  // Aksi Moderasi: Terbitkan
  const handleSetujuiTerbit = async () => {
    if (!approveTarget) return;
    setProcessing(true);
    try {
      const { error } = await supabase.rpc("putuskan_tinjauan_kursus", {
        p_kursus_id: approveTarget.id,
        p_keputusan: "terbit",
        p_catatan: null,
      });

      if (error) throw error;
      toast.success(`Kursus "${approveTarget.judul}" berhasil disetujui & diterbitkan!`);
      setApproveTarget(null);
      await loadKursus();
    } catch (err: any) {
      toast.error(err.message || "Gagal menerbitkan kursus.");
    } finally {
      setProcessing(false);
    }
  };

  // Aksi Moderasi: Tolak
  const handleTolakKursus = async () => {
    if (!rejectTarget) return;
    if (rejectReason.trim().length < 10) {
      setRejectError("Alasan penolakan wajib diisi minimal 10 karakter agar instruktur paham hal yang perlu diperbaiki.");
      return;
    }

    setProcessing(true);
    setRejectError(null);
    try {
      const { error } = await supabase.rpc("putuskan_tinjauan_kursus", {
        p_kursus_id: rejectTarget.id,
        p_keputusan: "tolak",
        p_catatan: rejectReason.trim(),
      });

      if (error) throw error;
      toast.success(`Kursus "${rejectTarget.judul}" dikembalikan ke draf instruktur dengan catatan perbaikan.`);
      setRejectTarget(null);
      setRejectReason("");
      await loadKursus();
    } catch (err: any) {
      setRejectError(err.message || "Gagal menolak kursus.");
    } finally {
      setProcessing(false);
    }
  };

  // Aksi Tutup Kursus
  const handleTutupKursus = async () => {
    if (!closeTarget) return;
    setProcessing(true);
    try {
      const { error } = await supabase.rpc("ubah_status_kursus_admin", {
        p_kursus_id: closeTarget.id,
        p_status_baru: "ditutup",
      });

      if (error) throw error;
      toast.success(`Kursus "${closeTarget.judul}" berhasil ditutup dan tercatat di audit log.`);
      setCloseTarget(null);
      await loadKursus();
    } catch (err: any) {
      toast.error(err.message || "Gagal menutup kursus.");
    } finally {
      setProcessing(false);
    }
  };

  // Aksi Buka Kembali Kursus
  const handleBukaKembaliKursus = async () => {
    if (!reopenTarget) return;
    setProcessing(true);
    try {
      const { error } = await supabase.rpc("ubah_status_kursus_admin", {
        p_kursus_id: reopenTarget.id,
        p_status_baru: "terbit",
      });

      if (error) throw error;
      toast.success(`Kursus "${reopenTarget.judul}" berhasil dibuka kembali dan tercatat di audit log.`);
      setReopenTarget(null);
      await loadKursus();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuka kembali kursus.");
    } finally {
      setProcessing(false);
    }
  };

  // Buka Modal Edit Kuota & Harga
  const handleBukaModalEditKuotaHarga = async (k: KursusTinjauanItem) => {
    setEditTarget(k);
    setEditKuota(k.kuota);
    setEditHarga(k.harga);
    setEditError(null);
    setFetchingKursi(true);

    try {
      const { data, error } = await supabase.rpc("hitung_kursi_terpakai", {
        p_kursus_id: k.id,
      });
      if (error) throw error;
      setEditKursiTerpakai(typeof data === "number" ? data : 0);
    } catch (err) {
      console.error("Gagal hitung kursi terpakai:", err);
      setEditKursiTerpakai(0);
    } finally {
      setFetchingKursi(false);
    }
  };

  // Simpan Edit Kuota & Harga
  const handleSimpanKuotaHarga = async () => {
    if (!editTarget) return;

    if (editKuota < editKursiTerpakai) {
      setEditError(
        `Validasi gagal: Kuota baru (${editKuota}) tidak boleh lebih kecil dari kursi yang sedang terpakai (${editKursiTerpakai}).`
      );
      return;
    }

    if (editKuota < 1 || editKuota > 100) {
      setEditError("Kuota peserta harus berada di antara 1 sampai 100 orang.");
      return;
    }

    if (editHarga !== 0 && (editHarga < 50000 || editHarga > 5000000)) {
      setEditError("Harga kursus harus Rp0 (gratis) atau antara Rp50.000 sampai Rp5.000.000.");
      return;
    }

    setProcessing(true);
    setEditError(null);

    try {
      const { error } = await supabase.rpc("ubah_kuota_harga_kursus", {
        p_kursus_id: editTarget.id,
        p_kuota: editKuota,
        p_harga: editHarga,
      });

      if (error) throw error;

      toast.success(
        `Kuota (${editKuota} kursi) dan harga (${editHarga === 0 ? "Gratis" : formatRupiah(editHarga)}) untuk "${editTarget.judul}" berhasil diperbarui!`
      );
      setEditTarget(null);
      await loadKursus();
    } catch (err: any) {
      setEditError(err.message || "Gagal memperbarui kuota dan harga kursus.");
    } finally {
      setProcessing(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ditinjau":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200">
            Ditinjau
          </Badge>
        );
      case "terbit":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200">
            Terbit
          </Badge>
        );
      case "ditutup":
        return <Badge variant="destructive">Ditutup</Badge>;
      case "draf":
        return <Badge variant="secondary">Draf</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter & Search
  const filteredKursus = useMemo(() => {
    return kursusList.filter((k) => {
      const matchSearch =
        k.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (k.instruktur?.nama_lengkap || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter !== "semua" && k.status !== statusFilter) return false;

      return true;
    });
  }, [kursusList, searchQuery, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredKursus.length / itemsPerPage) || 1;
  const paginatedKursus = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredKursus.slice(start, start + itemsPerPage);
  }, [filteredKursus, currentPage]);

  const jumlahDitinjau = kursusList.filter((k) => k.status === "ditinjau").length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* PageHeader */}
      <PageHeader
        title="Tinjauan & Penerbitan Kursus"
        description="Moderasi silabus pelatihan, setujui penerbitan kursus, kelola kuota & harga, atau pantau status pelatihan kerja."
        actions={
          <div className="flex items-center gap-2">
            {jumlahDitinjau > 0 && (
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 gap-1.5 py-1 px-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{jumlahDitinjau} kursus menunggu tinjauan</span>
              </Badge>
            )}
          </div>
        }
      />

      {/* Toolbar Search & Filter */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul, kategori, instruktur..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="ditinjau">Menunggu Ditinjau</SelectItem>
                <SelectItem value="terbit">Terbit Publik</SelectItem>
                <SelectItem value="ditutup">Ditutup Sementara</SelectItem>
                <SelectItem value="draf">Draf Instruktur</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {filteredKursus.length} kursus
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Tinjauan Kursus */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Kursus &amp; Kategori</TableHead>
              <TableHead>Instruktur</TableHead>
              <TableHead>Harga &amp; Kuota</TableHead>
              <TableHead>Silabus Materi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi Moderasi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-xs">Memuat antrean kursus...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedKursus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Tidak ada kursus yang cocok dengan filter.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedKursus.map((k) => {
                const totalModul = k.modul?.length || 0;
                const totalSoal = (k.modul || []).reduce(
                  (acc, curr) => acc + (curr.soal?.length || 0),
                  0
                );
                const siapTerbit = totalModul >= 1 && totalSoal >= 1;

                return (
                  <TableRow key={k.id} className="hover:bg-muted/40 transition-colors">
                    {/* Kursus Info */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground text-sm line-clamp-1">
                          {k.judul}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            {k.kategori}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            Pass: {k.nilai_lulus}%
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Instruktur */}
                    <TableCell>
                      <div className="text-xs">
                        <div className="font-medium text-foreground">
                          {k.instruktur?.nama_lengkap || "Tanpa Instruktur"}
                        </div>
                        <div className="text-muted-foreground text-[11px]">
                          {k.instruktur?.email || "-"}
                        </div>
                      </div>
                    </TableCell>

                    {/* Harga & Kuota */}
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="font-semibold text-foreground">
                          {k.harga === 0 ? "Gratis" : formatRupiah(k.harga)}
                        </div>
                        <div className="text-muted-foreground text-[11px]">
                          Kuota: <span className="font-medium text-foreground">{k.kuota}</span> kursi
                        </div>
                      </div>
                    </TableCell>

                    {/* Silabus */}
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="font-medium text-foreground">
                          {totalModul} Modul | {totalSoal} Soal
                        </div>
                        <div>
                          {siapTerbit ? (
                            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Lengkap
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Belum Lengkap
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{renderStatusBadge(k.status)}</TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Tombol Pratinjau Silabus Sheet */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewTarget(k)}
                          className="h-8 px-2 text-xs gap-1"
                          title="Lihat silabus dan soal evaluasi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Pratinjau</span>
                        </Button>

                        {/* Link Peserta Kursus */}
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 px-2 text-xs gap-1"
                        >
                          <Link href={`/instruktur/kursus/${k.id}/peserta?from=admin`}>
                            <Users className="w-3.5 h-3.5" />
                            <span>Peserta</span>
                          </Link>
                        </Button>

                        {/* Ubah Kuota & Harga */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBukaModalEditKuotaHarga(k)}
                          className="h-8 px-2 text-xs gap-1"
                          title="Atur kuota kursi dan nominal harga"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Atur</span>
                        </Button>

                        {/* Jika Ditinjau: Setujui / Tolak */}
                        {k.status === "ditinjau" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => setApproveTarget(k)}
                              className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Terbitkan</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRejectTarget(k);
                                setRejectReason("");
                                setRejectError(null);
                              }}
                              className="h-8 px-2.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </Button>
                          </>
                        )}

                        {/* Tutup Sementara */}
                        {k.status === "terbit" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCloseTarget(k)}
                            className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                          >
                            <Lock className="w-3.5 h-3.5 mr-1" />
                            <span>Tutup</span>
                          </Button>
                        )}

                        {/* Buka Kembali */}
                        {k.status === "ditutup" && (
                          <Button
                            size="sm"
                            onClick={() => setReopenTarget(k)}
                            className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Buka</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t text-xs text-muted-foreground">
            <div>
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-8 px-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 px-2"
              >
                Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Slide-over Pratinjau Kurikulum Sheet (Task 6) */}
      <Sheet open={!!previewTarget} onOpenChange={(open) => !open && setPreviewTarget(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {previewTarget && (
            <div className="space-y-6 py-2">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  {renderStatusBadge(previewTarget.status)}
                  <Badge variant="outline" className="text-xs">
                    {previewTarget.kategori}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold mt-2">
                  {previewTarget.judul}
                </SheetTitle>
                <SheetDescription className="space-y-1">
                  <div>Instruktur: {previewTarget.instruktur?.nama_lengkap || "-"} ({previewTarget.instruktur?.email})</div>
                  <div>
                    Passing Grade Kuis: <span className="font-semibold text-foreground">{previewTarget.nilai_lulus}%</span> | Kuota: <span className="font-semibold text-foreground">{previewTarget.kuota} kursi</span>
                  </div>
                </SheetDescription>
              </SheetHeader>

              {/* Ringkasan Kursus */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Ringkasan & Deskripsi
                </h4>
                <p className="text-xs leading-relaxed text-foreground bg-muted/30 p-3 rounded-lg border">
                  {previewTarget.ringkasan || previewTarget.deskripsi || "Tidak ada deskripsi kursus."}
                </p>
              </div>

              {/* Catatan Tinjauan Sebelumnya jika ada */}
              {previewTarget.catatan_tinjauan && (
                <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 space-y-1">
                  <div className="text-xs font-bold text-amber-800">Catatan Tinjauan Terakhir:</div>
                  <p className="text-xs text-amber-900">{previewTarget.catatan_tinjauan}</p>
                </div>
              )}

              {/* Daftar Modul Silabus */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Silabus Kurikulum ({previewTarget.modul?.length || 0} Modul)
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Total {previewTarget.modul?.reduce((a, b) => a + (b.durasi_menit || 0), 0) || 0} Menit
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(previewTarget.modul || []).map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg border bg-card text-card-foreground space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                          Modul {m.urutan} ({m.durasi_menit || 0} Menit)
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {m.soal?.length || 0} Soal Kuis
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold text-foreground">{m.judul}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog Konfirmasi Terbitkan Kursus */}
      <AlertDialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terbitkan Kursus ke Publik?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyetujui dan menerbitkan kursus &quot;{approveTarget?.judul}&quot;? Kursus akan langsung aktif di katalog publik dan siap menerima pendaftaran peserta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSetujuiTerbit}
              disabled={processing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {processing ? "Memproses..." : "Ya, Terbitkan Kursus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Penolakan Kursus dengan Catatan Wajib (BR-04) */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak &amp; Kembalikan ke Instruktur</DialogTitle>
            <DialogDescription>
              Tuliskan alasan penolakan secara jelas agar instruktur kursus &quot;{rejectTarget?.judul}&quot; dapat memperbaiki materi atau soal evaluasi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="rejectReason" className="text-xs font-semibold">
              Alasan Penolakan (Minimal 10 Karakter)
            </Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError(null);
              }}
              placeholder="Contoh: Modul 2 belum memiliki video penjelasan dan passing grade kuis terlalu rendah..."
              rows={4}
              className="text-xs"
            />
            {rejectError && (
              <p className="text-xs text-destructive font-medium">{rejectError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={processing}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleTolakKursus}
              disabled={processing || rejectReason.trim().length < 10}
            >
              {processing ? "Menyimpan..." : "Tolak Kursus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Tutup Kursus */}
      <AlertDialog open={!!closeTarget} onOpenChange={(open) => !open && setCloseTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutup Pendaftaran Kursus?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menutup sementara pendaftaran kursus &quot;{closeTarget?.judul}&quot;? Kursus tidak akan menerima pendaftar baru tetapi peserta yang sudah aktif tetap dapat belajar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTutupKursus}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? "Memproses..." : "Tutup Pendaftaran"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Buka Kembali Kursus */}
      <AlertDialog open={!!reopenTarget} onOpenChange={(open) => !open && setReopenTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buka Kembali Pendaftaran Kursus?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membuka kembali kursus &quot;{reopenTarget?.judul}&quot;? Kursus akan kembali dapat menerima pendaftaran baru dari peserta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBukaKembaliKursus}
              disabled={processing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {processing ? "Memproses..." : "Buka Kembali Kursus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Ubah Kuota & Harga (BR-02, BR-06, BR-12) */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Kuota &amp; Harga Kursus</DialogTitle>
            <DialogDescription>
              Perbarui batas kuota peserta dan harga pendaftaran kursus &quot;{editTarget?.judul}&quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kursi Sedang Terpakai:</span>
                <span className="font-bold text-foreground">
                  {fetchingKursi ? "Menghitung..." : `${editKursiTerpakai} Kursi`}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Kuota baru tidak boleh lebih kecil dari kursi yang sedang terisi saat ini.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editKuota" className="text-xs font-semibold">
                Batas Kuota Peserta (1 - 100 orang)
              </Label>
              <Input
                id="editKuota"
                type="number"
                min={editKursiTerpakai}
                max={100}
                value={editKuota}
                onChange={(e) => setEditKuota(parseInt(e.target.value) || 0)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editHarga" className="text-xs font-semibold">
                Nominal Harga (Rp0 untuk Gratis, atau Rp50.000 - Rp5.000.000)
              </Label>
              <Input
                id="editHarga"
                type="number"
                step={5000}
                value={editHarga}
                onChange={(e) => setEditHarga(parseInt(e.target.value) || 0)}
                className="h-9 text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Format: {editHarga === 0 ? "Gratis (Rp0)" : formatRupiah(editHarga)}
              </p>
            </div>

            {editError && (
              <p className="text-xs text-destructive font-medium">{editError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={processing}>
              Batal
            </Button>
            <Button onClick={handleSimpanKuotaHarga} disabled={processing || fetchingKursi}>
              {processing ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function AdminTinjauanPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <AdminTinjauanContent />
    </Suspense>
  );
}
