"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ShieldAlert,
  Search,
  Clock,
  Eye,
  FileCode,
  Database,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  User,
} from "lucide-react";

export interface AuditLogItem {
  id: string | number;
  dibuat_pada: string;
  pelaku_id: string | null;
  aksi: string;
  nama_tabel: string;
  id_data: string | null;
  data_sebelum: any;
  data_sesudah: any;
  pelaku: {
    nama_lengkap: string;
    email: string;
    peran: string;
  } | null;
}

function AdminAuditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const detailParam = searchParams.get("detail");

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("semua");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Log for Slide-over Sheet (U11)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(detailParam);

  // Sync selectedLogId with search params
  useEffect(() => {
    setSelectedLogId(detailParam);
  }, [detailParam]);

  const handleOpenDetail = (id: string | number) => {
    const strId = String(id);
    setSelectedLogId(strId);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("detail", strId);
    router.replace(`/admin/audit?${newParams.toString()}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    setSelectedLogId(null);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("detail");
    router.replace(`/admin/audit?${newParams.toString()}`, { scroll: false });
  };

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_log")
        .select(`
          id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada,
          pelaku:profiles!audit_log_pelaku_id_fkey (nama_lengkap, email, peran)
        `)
        .order("dibuat_pada", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data as any) || []);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat riwayat audit log.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const formatDate = (iso: string) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const actorEmail = l.pelaku?.email || "";
      const actorName = l.pelaku?.nama_lengkap || "";
      const matchSearch =
        l.aksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.nama_tabel.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (tableFilter !== "semua" && l.nama_tabel !== tableFilter) return false;
      return true;
    });
  }, [logs, searchQuery, tableFilter]);

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tableFilter]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const selectedLog = useMemo(() => {
    if (!selectedLogId) return null;
    return logs.find((l) => String(l.id) === selectedLogId) || null;
  }, [logs, selectedLogId]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* PageHeader */}
      <PageHeader
        title="Log Audit Sistem"
        description="Catatan audit append-only yang merekam setiap aktivitas modifikasi data, status kursus, peran pengguna, dan transaksi secara permanen."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={loading}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Muat Ulang</span>
          </Button>
        }
      />

      {/* Banner Immutability (INV-07) */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-foreground">Append-Only Immutable Log:</span>
            <span className="text-muted-foreground ml-1.5 leading-relaxed">
              Seluruh catatan perubahan status moderasi kursus, konfirmasi bayar, dan peran pengguna tersimpan permanen dan terisolasi dari modifikasi langsung.
            </span>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase font-bold shrink-0">
          Audit Safe
        </Badge>
      </div>

      {/* Toolbar Search & Filter */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aksi, nama/email pelaku, tabel..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={tableFilter} onValueChange={(val) => setTableFilter(val)}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                <SelectValue placeholder="Semua Tabel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Tabel Target</SelectItem>
                <SelectItem value="kursus">Tabel Kursus</SelectItem>
                <SelectItem value="pendaftaran">Tabel Pendaftaran</SelectItem>
                <SelectItem value="profiles">Tabel Profil Pengguna</SelectItem>
                <SelectItem value="modul">Tabel Modul</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {filteredLogs.length} catatan
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Log Audit */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Waktu Kejadian</TableHead>
              <TableHead className="w-[220px]">Pelaku (Actor)</TableHead>
              <TableHead>Aksi Sistem</TableHead>
              <TableHead>Tabel Target</TableHead>
              <TableHead>Record ID</TableHead>
              <TableHead className="text-right">Payload</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-xs">Memuat riwayat log audit...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <Database className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Belum ada catatan log yang cocok dengan filter.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => handleOpenDetail(log.id)}
                >
                  {/* Waktu */}
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground font-mono">
                    {formatDate(log.dibuat_pada)}
                  </TableCell>

                  {/* Pelaku */}
                  <TableCell>
                    <div className="text-xs">
                      <div className="font-semibold text-foreground">
                        {log.pelaku?.nama_lengkap || "Sistem Otomatis"}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {log.pelaku?.email || "internal@system"}
                      </div>
                    </div>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[11px] uppercase px-1.5 py-0">
                      {log.aksi}
                    </Badge>
                  </TableCell>

                  {/* Tabel Target */}
                  <TableCell className="font-mono text-xs text-foreground">
                    {log.nama_tabel}
                  </TableCell>

                  {/* Record ID */}
                  <TableCell className="font-mono text-[11px] text-muted-foreground truncate max-w-[120px]">
                    {log.id_data ? log.id_data.slice(0, 12) + "..." : "-"}
                  </TableCell>

                  {/* Aksi Detail */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(log.id);
                      }}
                      className="h-7 text-xs gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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

      {/* Slide-over Detail JSON Payload Sheet (U11) */}
      <Sheet open={!!selectedLog} onOpenChange={(open) => !open && handleCloseDetail()}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selectedLog && (
            <div className="space-y-6 py-2">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs uppercase">
                    {selectedLog.aksi}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    ID #{selectedLog.id}
                  </span>
                </div>
                <SheetTitle className="text-lg font-bold mt-2 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-primary" />
                  Rincian Audit Record
                </SheetTitle>
                <SheetDescription>
                  Tabel target: <span className="font-mono text-foreground">{selectedLog.nama_tabel}</span> (Record ID: {selectedLog.id_data || "-"})
                </SheetDescription>
              </SheetHeader>

              {/* Ringkasan Meta Kejadian */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Waktu Kejadian:</span>
                  <span className="font-semibold text-foreground">
                    {formatDate(selectedLog.dibuat_pada)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Pelaku (Actor):</span>
                  <span className="font-semibold text-foreground">
                    {selectedLog.pelaku?.nama_lengkap || "Sistem"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Email Pelaku:</span>
                  <span className="font-mono text-[11px] text-foreground truncate block">
                    {selectedLog.pelaku?.email || "internal@system"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Peran Actor:</span>
                  <span className="font-semibold uppercase text-[11px] text-foreground">
                    {selectedLog.pelaku?.peran || "system"}
                  </span>
                </div>
              </div>

              {/* Data Sebelum (State Lama) jika ada */}
              {selectedLog.data_sebelum && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Data Sebelum (State Lama)
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      before
                    </Badge>
                  </div>
                  <pre className="p-3 bg-muted rounded-lg overflow-x-auto text-[11px] font-mono border max-h-48 text-foreground leading-relaxed">
                    {JSON.stringify(selectedLog.data_sebelum, null, 2)}
                  </pre>
                </div>
              )}

              {/* Data Sesudah (State Baru) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Data Sesudah (State Baru / Payload)
                  </span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono">
                    after
                  </Badge>
                </div>
                <pre className="p-3 bg-muted rounded-lg overflow-x-auto text-[11px] font-mono border max-h-60 text-foreground leading-relaxed">
                  {JSON.stringify(selectedLog.data_sesudah || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}

export default function AdminAuditPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <AdminAuditContent />
    </Suspense>
  );
}
