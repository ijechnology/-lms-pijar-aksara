"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";
import Pagination from "@/components/ui/Pagination";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  UserCheck,
  UserX,
  Lock,
} from "lucide-react";

interface PenggunaItem {
  id: string;
  nama_lengkap: string;
  email: string;
  no_hp: string | null;
  peran: "peserta" | "instruktur" | "admin";
  aktif: boolean;
  dibuat_pada: string;
}

export default function TabPengguna() {
  const supabase = createClient();
  const { user: currentAdmin } = useAuth();

  const [userList, setUserList] = useState<PenggunaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal Dialogs
  const [confirmRoleModal, setConfirmRoleModal] = useState<{
    user: PenggunaItem;
    newRole: "peserta" | "instruktur" | "admin";
  } | null>(null);

  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    user: PenggunaItem;
    newStatus: boolean;
  } | null>(null);

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada")
        .order("dibuat_pada", { ascending: false });

      if (error) throw error;
      setUserList(data || []);
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat data pengguna.",
      });
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
      setAlertModal({
        isOpen: true,
        title: "Tindakan Ditolak",
        message: "Demi keamanan sistem, Anda tidak dapat mengubah peran akun Anda sendiri.",
        type: "error",
      });
      return;
    }

    setConfirmRoleModal({ user: targetUser, newRole });
  };

  // Eksekusi Ubah Peran Pengguna
  const handleUbahPeran = async () => {
    if (!confirmRoleModal) return;
    const { user: targetUser, newRole } = confirmRoleModal;

    setProcessingId(targetUser.id);
    setFeedback(null);
    try {
      // 1. Update tabel profiles
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ peran: newRole })
        .eq("id", targetUser.id);

      if (updErr) throw updErr;

      // 2. Catat audit log
      await supabase.from("audit_log").insert({
        pelaku_id: currentAdmin?.id || null,
        aksi: "ubah_peran_pengguna",
        nama_tabel: "profiles",
        id_data: targetUser.id,
        data_sebelum: { peran: targetUser.peran },
        data_sesudah: { peran: newRole },
      });

      setFeedback({
        type: "success",
        text: `Peran untuk ${targetUser.nama_lengkap} berhasil diubah menjadi ${newRole}.`,
      });

      setConfirmRoleModal(null);
      await loadUsers();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah peran pengguna.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Request Toggle Status Akun
  const requestToggleStatus = (targetUser: PenggunaItem) => {
    if (targetUser.id === currentAdmin?.id) {
      setAlertModal({
        isOpen: true,
        title: "Tindakan Ditolak",
        message: "Demi keamanan sistem, Anda tidak dapat menonaktifkan akun Anda sendiri.",
        type: "error",
      });
      return;
    }

    setConfirmStatusModal({ user: targetUser, newStatus: !targetUser.aktif });
  };

  // Eksekusi Toggle Status Akun
  const handleToggleStatus = async () => {
    if (!confirmStatusModal) return;
    const { user: targetUser, newStatus } = confirmStatusModal;

    setProcessingId(targetUser.id);
    setFeedback(null);
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

      setFeedback({
        type: "success",
        text: `Akun "${targetUser.nama_lengkap}" berhasil ${newStatus ? "diaktifkan kembali" : "dinonaktifkan"}.`,
      });

      setConfirmStatusModal(null);
      await loadUsers();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memperbarui status akun.",
      });
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

  const filteredUsers = userList.filter((u) => {
    const matchSearch =
      (u.nama_lengkap || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.no_hp || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (roleFilter !== "semua" && u.peran !== roleFilter) return false;
    return true;
  });

  // Reset pagination saat search/filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Feedback Message */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Kontrol dan Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, no handphone..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Peran */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="semua">Semua Peran</option>
            <option value="peserta">Peserta</option>
            <option value="instruktur">Instruktur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs">Memuat daftar pengguna...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada pengguna ditemukan</p>
            <p className="text-xs font-medium">Tidak ada pengguna yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Nama Pengguna</th>
                  <th className="px-4 py-4">Kontak</th>
                  <th className="px-4 py-4">Peran Saat Ini</th>
                  <th className="px-4 py-4">Status Akun</th>
                  <th className="px-4 py-4">Terdaftar</th>
                  <th className="px-5 py-4 text-right">Kelola Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedUsers.map((u) => {
                  const isSelf = u.id === currentAdmin?.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      {/* Nama */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {u.nama_lengkap}
                          {isSelf && (
                            <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>

                      {/* Kontak */}
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {u.no_hp || "-"}
                      </td>

                      {/* Peran */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {u.peran === "admin" && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1 w-fit">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                        {u.peran === "instruktur" && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            Instruktur
                          </span>
                        )}
                        {u.peran === "peserta" && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            Peserta
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {u.aktif ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <UserCheck className="w-3 h-3" /> Aktif
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                            <UserX className="w-3 h-3" /> Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Tanggal */}
                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(u.dibuat_pada)}
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {isSelf ? (
                          <span className="text-xs text-slate-400 italic">Akun Sendiri</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {/* Pilihan Peran */}
                            <select
                              value={u.peran}
                              disabled={processingId === u.id}
                              onChange={(e) =>
                                requestUbahPeran(
                                  u,
                                  e.target.value as "peserta" | "instruktur" | "admin"
                                )
                              }
                              className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                            >
                              <option value="peserta">Peserta</option>
                              <option value="instruktur">Instruktur</option>
                              <option value="admin">Admin</option>
                            </select>

                            {/* Tombol Toggle Status */}
                            <button
                              onClick={() => requestToggleStatus(u)}
                              disabled={processingId === u.id}
                              className={`p-1.5 rounded-lg border transition ${
                                u.aktif
                                  ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title={u.aktif ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                            >
                              {u.aktif ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal Konfirmasi Ubah Peran */}
      <ConfirmModal
        isOpen={confirmRoleModal !== null}
        onClose={() => setConfirmRoleModal(null)}
        onConfirm={handleUbahPeran}
        title="Ubah Peran Pengguna?"
        message={`Ubah peran "${confirmRoleModal?.user.nama_lengkap}" dari [${confirmRoleModal?.user.peran.toUpperCase()}] menjadi [${confirmRoleModal?.newRole.toUpperCase()}]? Hak akses navigasi pengguna akan langsung menyesuaikan peran baru.`}
        confirmLabel="Ya, Ubah Peran"
        cancelLabel="Batal"
        variant="warning"
        loading={processingId !== null}
      />

      {/* Modal Konfirmasi Status Akun */}
      <ConfirmModal
        isOpen={confirmStatusModal !== null}
        onClose={() => setConfirmStatusModal(null)}
        onConfirm={handleToggleStatus}
        title={`${confirmStatusModal?.newStatus ? "Aktifkan Kembali" : "Nonaktifkan"} Akun Pengguna?`}
        message={`${
          confirmStatusModal?.newStatus
            ? `Aktifkan kembali akun "${confirmStatusModal?.user.nama_lengkap}"? Pengguna akan dapat login dan mengakses materi kursusnya kembali.`
            : `Nonaktifkan akun "${confirmStatusModal?.user.nama_lengkap}"? Pengguna tidak akan dapat mengakses ruang belajar atau mendaftar kursus baru.`
        }`}
        confirmLabel={confirmStatusModal?.newStatus ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
        cancelLabel="Batal"
        variant={confirmStatusModal?.newStatus ? "success" : "danger"}
        loading={processingId !== null}
      />

      {/* Modal Alert Informasi/Peringatan */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
