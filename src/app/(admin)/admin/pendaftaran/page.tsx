"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
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
  CreditCard,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  FileCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

export interface PendaftaranAdminItem {
  id: string;
  peserta_id: string;
  kursus_id: string;
  status: "menunggu_bayar" | "aktif" | "selesai" | "kedaluwarsa" | "dibatalkan";
  nominal: number;
  metode_bayar: string;
  batas_bayar: string | null;
  didaftarkan_pada: string;
  bukti_bayar_url?: string | null;
  bukti_bayar_pada?: string | null;
  catatan_pembayaran?: string | null;
  user: {
    nama_lengkap: string;
    email: string;
    no_hp: string | null;
  } | null;
  kursus: {
    judul: string;
    harga: number;
    kuota: number;
  } | null;
}

function AdminPendaftaranContent() {
  const router = useRouter();
  const supabase = createClient();

  const [regList, setRegList] = useState<PendaftaranAdminItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog Bukti Transfer
  const [previewBukti, setPreviewBukti] = useState<PendaftaranAdminItem | null>(null);

  // Dialog Konfirmasi Manual
  const [targetKonfirmasi, setTargetKonfirmasi] = useState<PendaftaranAdminItem | null>(null);

  // Dialog Pembatalan Tagihan
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetBatal, setTargetBatal] = useState<PendaftaranAdminItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pendaftaran")
        .select(`
          id, peserta_id, kursus_id, status, nominal, metode_bayar, batas_bayar, didaftarkan_pada,
          bukti_bayar_url, bukti_bayar_pada, catatan_pembayaran,
          user:profiles!pendaftaran_peserta_id_fkey (nama_lengkap, email, no_hp),
          kursus (judul, harga, kuota)
        `)
        .order("didaftarkan_pada", { ascending: false });

      if (error) throw error;
      setRegList((data as any) || []);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data pendaftaran.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Konfirmasi Pembayaran Manual via Database RPC
  const handleKonfirmasiManual = async () => {
    if (!targetKonfirmasi) return;

    setProcessing(true);
    try {
      const { error } = await supabase.rpc("konfirmasi_pembayaran_manual", {
        p_pendaftaran_id: targetKonfirmasi.id,
      });

      if (error) throw error;

      // Kirim email notifikasi aktivasi secara background
      fetch("/api/notifikasi/pendaftaran-aktif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaran_id: targetKonfirmasi.id }),
      }).catch((emailErr) => {
        console.error("Gagal mengirim email konfirmasi pendaftaran aktif:", emailErr);
      });

      toast.success(
        `Pembayaran untuk ${targetKonfirmasi.user?.nama_lengkap || "peserta"} berhasil dikonfirmasi dan status kursus aktif!`
      );

      setTargetKonfirmasi(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengonfirmasi pembayaran pendaftaran.");
    } finally {
      setProcessing(false);
    }
  };

  // Batalkan Pendaftaran (Wajib alasan >= 10 karakter)
  const handleBatalkanPendaftaran = async () => {
    if (!targetBatal) return;
    if (cancelReason.trim().length < 10) {
      setCancelError("Alasan pembatalan wajib diisi minimal 10 karakter.");
      return;
    }

    setProcessing(true);
    setCancelError(null);
    try {
      // 1. Update status pendaftaran menjadi dibatalkan
      const { error: updErr } = await supabase
        .from("pendaftaran")
        .update({
          status: "dibatalkan",
          alasan_batal: cancelReason.trim(),
          dibatalkan_pada: new Date().toISOString(),
        })
        .eq("id", targetBatal.id);

      if (updErr) throw updErr;

      // 2. Catat ke audit_log
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      await supabase.from("audit_log").insert({
        pelaku_id: adminUser?.id || null,
        aksi: "batalkan_pendaftaran",
        nama_tabel: "pendaftaran",
        id_data: targetBatal.id,
        data_sesudah: {
          alasan: cancelReason.trim(),
          kursus: targetBatal.kursus?.judul,
          peserta: targetBatal.user?.nama_lengkap,
        },
      });

      toast.success(`Pendaftaran berhasil dibatalkan dan kuota kursi kursus telah dikembalikan.`);
      setCancelModalOpen(false);
      setTargetBatal(null);
      setCancelReason("");
      await loadData();
    } catch (err: any) {
      setCancelError(err.message || "Gagal membatalkan pendaftaran.");
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

  const formatDate = (iso: string | null) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "aktif":
        return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Aktif Belajar</Badge>;
      case "selesai":
        return <Badge className="bg-sky-500/10 text-sky-700 border-sky-200">Selesai Lulus</Badge>;
      case "menunggu_bayar":
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-200">Menunggu Bayar</Badge>;
      case "dibatalkan":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      case "kedaluwarsa":
        return <Badge variant="secondary">Kedaluwarsa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter & Search
  const filteredList = useMemo(() => {
    return regList.filter((r) => {
      const matchSearch =
        (r.user?.nama_lengkap || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.kursus?.judul || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter !== "semua" && r.status !== statusFilter) return false;
      return true;
    });
  }, [regList, searchQuery, statusFilter]);

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const jumlahMenunggu = regList.filter((r) => r.status === "menunggu_bayar").length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* PageHeader */}
      <PageHeader
        title="Pendaftaran & Pembayaran"
        description="Kelola verifikasi pembayaran manual, periksa bukti transfer bank peserta, dan pantau status tagihan kursus."
        actions={
          jumlahMenunggu > 0 ? (
            <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 gap-1.5 py-1 px-2.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{jumlahMenunggu} menunggu pembayaran</span>
            </Badge>
          ) : undefined
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama peserta, email, kursus..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="menunggu_bayar">Menunggu Bayar</SelectItem>
                <SelectItem value="aktif">Aktif Belajar</SelectItem>
                <SelectItem value="selesai">Selesai (Lulus)</SelectItem>
                <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                <SelectItem value="kedaluwarsa">Kedaluwarsa</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {filteredList.length} transaksi
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Transaksi & Pendaftaran */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px]">Peserta</TableHead>
              <TableHead>Kursus</TableHead>
              <TableHead>Nominal &amp; Metode</TableHead>
              <TableHead>Waktu &amp; Batas Bayar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bukti Transfer</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-xs">Memuat data pendaftaran &amp; transaksi...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                  <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Tidak ada data pendaftaran yang cocok dengan filter.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedList.map((r) => {
                const isOverdue =
                  r.status === "menunggu_bayar" &&
                  r.batas_bayar &&
                  new Date(r.batas_bayar) < new Date();

                return (
                  <TableRow key={r.id} className="hover:bg-muted/40 transition-colors">
                    {/* Peserta */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground text-sm">
                          {r.user?.nama_lengkap || "Peserta Tanpa Nama"}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{r.user?.email || "-"}</span>
                        </div>
                        {r.user?.no_hp && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{r.user.no_hp}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Kursus */}
                    <TableCell>
                      <div className="font-medium text-foreground text-xs line-clamp-2 max-w-[200px]">
                        {r.kursus?.judul || "Kursus Tidak Ditemukan"}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Kuota: {r.kursus?.kuota || 0} kursi
                      </div>
                    </TableCell>

                    {/* Nominal & Metode */}
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="font-semibold text-foreground">
                          {r.nominal === 0 ? "Gratis (Rp0)" : formatRupiah(r.nominal)}
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 uppercase">
                          {r.metode_bayar || "manual_transfer"}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Tanggal & Batas Bayar */}
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="text-muted-foreground text-[11px]">
                          Daftar: {formatDate(r.didaftarkan_pada)}
                        </div>
                        {r.status === "menunggu_bayar" && r.batas_bayar && (
                          <div
                            className={`text-[11px] font-semibold flex items-center gap-1 ${
                              isOverdue ? "text-destructive" : "text-amber-600"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>Batas: {formatDate(r.batas_bayar)}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{renderStatusBadge(r.status)}</TableCell>

                    {/* Bukti Transfer */}
                    <TableCell>
                      {r.bukti_bayar_url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewBukti(r)}
                          className="h-7 text-[11px] font-semibold gap-1 text-primary border-primary/30"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Lihat Bukti</span>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Belum Diunggah</span>
                      )}
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right">
                      {r.status === "menunggu_bayar" ? (
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Button
                            size="sm"
                            onClick={() => setTargetKonfirmasi(r)}
                            className="h-7 px-2.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Konfirmasi</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTargetBatal(r);
                              setCancelReason("");
                              setCancelError(null);
                              setCancelModalOpen(true);
                            }}
                            className="h-7 px-2 text-[11px] text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Batalkan</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
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

      {/* Dialog Preview Bukti Pembayaran */}
      <Dialog open={!!previewBukti} onOpenChange={(open) => !open && setPreviewBukti(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bukti Transfer Pembayaran</DialogTitle>
            <DialogDescription>
              Peserta: <span className="font-semibold text-foreground">{previewBukti?.user?.nama_lengkap}</span> | Kursus: <span className="font-semibold text-foreground">{previewBukti?.kursus?.judul}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg overflow-hidden border bg-black/5 flex items-center justify-center max-h-[380px]">
              {previewBukti?.bukti_bayar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewBukti.bukti_bayar_url}
                  alt="Bukti Transfer"
                  className="max-h-[380px] w-auto object-contain mx-auto"
                />
              ) : (
                <p className="p-8 text-xs text-muted-foreground">Gambar bukti tidak tersedia.</p>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>Diunggah pada: {formatDate(previewBukti?.bukti_bayar_pada || null)}</div>
              {previewBukti?.catatan_pembayaran && (
                <div className="p-2 rounded bg-muted text-foreground">
                  Catatan peserta: {previewBukti.catatan_pembayaran}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewBukti(null)}>
              Tutup
            </Button>
            {previewBukti?.status === "menunggu_bayar" && (
              <Button
                onClick={() => {
                  const target = previewBukti;
                  setPreviewBukti(null);
                  setTargetKonfirmasi(target);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Konfirmasi Lunas
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Konfirmasi Pembayaran Manual */}
      <AlertDialog open={!!targetKonfirmasi} onOpenChange={(open) => !open && setTargetKonfirmasi(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pembayaran Lunas?</AlertDialogTitle>
            <AlertDialogDescription>
              Konfirmasi pembayaran manual untuk peserta &quot;{targetKonfirmasi?.user?.nama_lengkap || targetKonfirmasi?.user?.email}&quot; pada kursus &quot;{targetKonfirmasi?.kursus?.judul}&quot;? Status pendaftaran akan langsung menjadi aktif dan peserta akan menerima notifikasi aktivasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKonfirmasiManual}
              disabled={processing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {processing ? "Memproses..." : "Ya, Konfirmasi Lunas"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Pembatalan Tagihan (Wajib Alasan) */}
      <Dialog open={cancelModalOpen} onOpenChange={(open) => !open && setCancelModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Pendaftaran Kursus</DialogTitle>
            <DialogDescription>
              Masukkan alasan pembatalan pendaftaran untuk peserta &quot;{targetBatal?.user?.nama_lengkap}&quot;. Kursi kursus akan otomatis dikembalikan ke kuota publik.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="cancelReason" className="text-xs font-semibold">
              Alasan Pembatalan (Minimal 10 Karakter)
            </Label>
            <Textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value);
                setCancelError(null);
              }}
              placeholder="Contoh: Peserta tidak menyelesaikan pembayaran melewati batas transfer atau salah memilih kelas..."
              rows={3}
              className="text-xs"
            />
            {cancelError && (
              <p className="text-xs text-destructive font-medium">{cancelError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} disabled={processing}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatalkanPendaftaran}
              disabled={processing || cancelReason.trim().length < 10}
            >
              {processing ? "Membatalkan..." : "Batalkan Pendaftaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function AdminPendaftaranPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <AdminPendaftaranContent />
    </Suspense>
  );
}
