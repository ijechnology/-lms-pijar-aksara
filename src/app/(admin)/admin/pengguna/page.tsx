"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Lock,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

export interface PenggunaItem {
  id: string;
  nama_lengkap: string;
  email: string;
  no_hp: string | null;
  peran: "peserta" | "instruktur" | "admin";
  aktif: boolean;
  dibuat_pada: string;
}

function AdminPenggunaContent() {
  const supabase = createClient();
  const { user: currentAdmin } = useAuth();

  const [userList, setUserList] = useState<PenggunaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("semua");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [processingId, setProcessingId] = useState<string | null>(null);

  // Dialog Konfirmasi Peran
  const [confirmRoleModal, setConfirmRoleModal] = useState<{
    user: PenggunaItem;
    newRole: "peserta" | "instruktur" | "admin";
  } | null>(null);

  // Dialog Konfirmasi Status
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    user: PenggunaItem;
    newStatus: boolean;
  } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada")
        .order("dibuat_pada", { ascending: false });

      if (error) throw error;
      setUserList(data || []);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Request Ubah Peran
  const requestUbahPeran = (targetUser: PenggunaItem, newRole: "peserta" | "instruktur" | "admin") => {
    if (targetUser.id === currentAdmin?.id) {
      toast.error("Demi keamanan sistem, Anda tidak dapat mengubah peran akun Anda sendiri.");
      return;
    }
    if (targetUser.peran === newRole) return;
    setConfirmRoleModal({ user: targetUser, newRole });
  };

  // Eksekusi Ubah Peran
  const handleUbahPeran = async () => {
    if (!confirmRoleModal) return;
    const { user: targetUser, newRole } = confirmRoleModal;

    setProcessingId(targetUser.id);
    try {
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ peran: newRole })
        .eq("id", targetUser.id);

      if (updErr) throw updErr;

      await supabase.from("audit_log").insert({
        pelaku_id: currentAdmin?.id || null,
        aksi: "ubah_peran_pengguna",
        nama_tabel: "profiles",
        id_data: targetUser.id,
        data_sebelum: { peran: targetUser.peran },
        data_sesudah: { peran: newRole },
      });

      toast.success(`Peran untuk "${targetUser.nama_lengkap}" berhasil diubah menjadi ${newRole}.`);
      setConfirmRoleModal(null);
      await loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah peran pengguna.");
    } finally {
      setProcessingId(null);
    }
  };

  // Request Toggle Status Akun
  const requestToggleStatus = (targetUser: PenggunaItem) => {
    if (targetUser.id === currentAdmin?.id) {
      toast.error("Demi keamanan sistem, Anda tidak dapat menonaktifkan akun Anda sendiri.");
      return;
    }
    setConfirmStatusModal({ user: targetUser, newStatus: !targetUser.aktif });
  };

  // Eksekusi Toggle Status Akun
  const handleToggleStatus = async () => {
    if (!confirmStatusModal) return;
    const { user: targetUser, newStatus } = confirmStatusModal;

    setProcessingId(targetUser.id);
    try {
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ aktif: newStatus })
        .eq("id", targetUser.id);

      if (updErr) throw updErr;

      await supabase.from("audit_log").insert({
        pelaku_id: currentAdmin?.id || null,
        aksi: newStatus ? "aktifkan_pengguna" : "nonaktifkan_pengguna",
        nama_tabel: "profiles",
        id_data: targetUser.id,
        data_sebelum: { aktif: targetUser.aktif },
        data_sesudah: { aktif: newStatus },
      });

      toast.success(
        `Akun "${targetUser.nama_lengkap}" berhasil ${newStatus ? "diaktifkan kembali" : "dinonaktifkan"}.`
      );
      setConfirmStatusModal(null);
      await loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui status akun.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    const src = name?.trim() || email?.split("@")[0] || "PG";
    return src
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  };

  const filteredUsers = useMemo(() => {
    return userList.filter((u) => {
      const matchSearch =
        (u.nama_lengkap || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.no_hp || "").includes(searchQuery);

      if (!matchSearch) return false;
      if (roleFilter !== "semua" && u.peran !== roleFilter) return false;
      return true;
    });
  }, [userList, searchQuery, roleFilter]);

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* PageHeader */}
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola hak akses peran pengguna (peserta, instruktur, admin) serta status keaktifan akun dalam sistem."
        actions={
          <Badge variant="outline" className="text-xs py-1 px-2.5">
            Total {userList.length} Pengguna Terdaftar
          </Badge>
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
              placeholder="Cari nama, email, no. telepon..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val)}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                <SelectValue placeholder="Semua Peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Peran</SelectItem>
                <SelectItem value="peserta">Peserta</SelectItem>
                <SelectItem value="instruktur">Instruktur</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {filteredUsers.length} pengguna
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Pengguna */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Pengguna</TableHead>
              <TableHead>Tanggal Bergabung</TableHead>
              <TableHead className="w-[200px]">Peran Sistem</TableHead>
              <TableHead className="w-[180px]">Status Akun</TableHead>
              <TableHead className="text-right">Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-xs">Memuat daftar pengguna...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Tidak ada pengguna yang cocok dengan filter.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((u) => {
                const isSelf = u.id === currentAdmin?.id;
                const isProcessing = processingId === u.id;

                return (
                  <TableRow key={u.id} className="hover:bg-muted/40 transition-colors">
                    {/* Profil Pengguna */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {getInitials(u.nama_lengkap, u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5 truncate">
                            <span>{u.nama_lengkap || "Pengguna"}</span>
                            {isSelf && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1 border-primary/30 text-primary font-bold">
                                Anda
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                          {u.no_hp && (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span>{u.no_hp}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Tanggal Terdaftar */}
                    <TableCell>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(u.dibuat_pada)}</span>
                      </div>
                    </TableCell>

                    {/* Selector Peran Pengguna */}
                    <TableCell>
                      {isSelf ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold uppercase text-[10px]">
                          Administrator (Terkunci)
                        </Badge>
                      ) : (
                        <Select
                          value={u.peran}
                          disabled={isProcessing}
                          onValueChange={(val: "peserta" | "instruktur" | "admin") =>
                            requestUbahPeran(u, val)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs font-semibold w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="peserta">Peserta</SelectItem>
                            <SelectItem value="instruktur">Instruktur</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>

                    {/* Toggle Status Aktif (Switch) */}
                    <TableCell>
                      {isSelf ? (
                        <Badge variant="outline" className="text-[11px] text-emerald-600 border-emerald-200 bg-emerald-50/50">
                          Aktif (Sesi Anda)
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <Switch
                            checked={u.aktif}
                            disabled={isProcessing}
                            onCheckedChange={() => requestToggleStatus(u)}
                            aria-label={`Ubah status ${u.nama_lengkap}`}
                          />
                          <span
                            className={`text-xs font-semibold ${
                              u.aktif ? "text-emerald-600" : "text-muted-foreground"
                            }`}
                          >
                            {u.aktif ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* Keterangan */}
                    <TableCell className="text-right">
                      {isSelf ? (
                        <span className="text-[11px] text-muted-foreground italic flex items-center justify-end gap-1">
                          <Lock className="w-3 h-3" /> Akun Terlindungi
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {u.peran === "admin"
                            ? "Akses Penuh"
                            : u.peran === "instruktur"
                            ? "Pengampu Kursus"
                            : "Siswa Belajar"}
                        </span>
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

      {/* AlertDialog Konfirmasi Perubahan Peran */}
      <AlertDialog
        open={!!confirmRoleModal}
        onOpenChange={(open) => !open && setConfirmRoleModal(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ubah Peran Hak Akses Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah peran pengguna &quot;
              {confirmRoleModal?.user.nama_lengkap}&quot; dari{" "}
              <span className="font-semibold text-foreground uppercase">
                {confirmRoleModal?.user.peran}
              </span>{" "}
              menjadi{" "}
              <span className="font-semibold text-foreground uppercase">
                {confirmRoleModal?.newRole}
              </span>
              ? Perubahan ini akan langsung mempengaruhi otorisasi menu dan data di sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!processingId}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUbahPeran}
              disabled={!!processingId}
              className="bg-primary text-primary-foreground"
            >
              {processingId ? "Memproses..." : "Ya, Ubah Peran"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog Konfirmasi Perubahan Status Akun */}
      <AlertDialog
        open={!!confirmStatusModal}
        onOpenChange={(open) => !open && setConfirmStatusModal(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmStatusModal?.newStatus ? "Aktifkan Kembali Akun?" : "Nonaktifkan Akun Pengguna?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmStatusModal?.newStatus ? (
                <>
                  Apakah Anda yakin ingin mengaktifkan kembali akun pengguna &quot;
                  {confirmStatusModal?.user.nama_lengkap}&quot;? Pengguna akan dapat masuk kembali ke dalam sistem.
                </>
              ) : (
                <>
                  Apakah Anda yakin ingin menonaktifkan akun pengguna &quot;
                  {confirmStatusModal?.user.nama_lengkap}&quot;? Pengguna tidak akan dapat masuk atau mengakses kursus hingga akun diaktifkan kembali.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!processingId}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={!!processingId}
              className={
                confirmStatusModal?.newStatus
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {processingId
                ? "Memproses..."
                : confirmStatusModal?.newStatus
                ? "Ya, Aktifkan"
                : "Ya, Nonaktifkan Akun"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

export default function AdminPenggunaPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <AdminPenggunaContent />
    </Suspense>
  );
}
