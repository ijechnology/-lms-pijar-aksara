"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
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
  role: "peserta" | "instruktur" | "admin";
  is_active: boolean;
  dibuat_pada: string;
}

export default function TabPengguna() {
  const supabase = createClient();
  const { user: currentAdmin } = useAuth();

  const [userList, setUserList] = useState<PenggunaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("semua");

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nama_lengkap, email, no_hp, role, is_active, dibuat_pada")
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

  // Ubah Peran Pengguna
  const handleUbahPeran = async (targetUser: PenggunaItem, newRole: "peserta" | "instruktur" | "admin") => {
    if (targetUser.id === currentAdmin?.id) {
      alert("Demi keamanan sistem, Anda tidak dapat mengubah peran akun Anda sendiri.");
      return;
    }

    const confirmChange = window.confirm(
      `Ubah peran "${targetUser.nama_lengkap}" dari [${targetUser.role.toUpperCase()}] menjadi [${newRole.toUpperCase()}]?`
    );
    if (!confirmChange) return;

    setProcessingId(targetUser.id);
    setFeedback(null);
    try {
      // 1. Update tabel profiles
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", targetUser.id);

      if (updErr) throw updErr;

      // 2. Catat audit log
      await supabase.from("audit_log").insert({
        actor_id: currentAdmin?.id || null,
        actor_email: currentAdmin?.email || "admin@pijaraksara.id",
        aksi: "PERUBAHAN_PERAN_PENGGUNA",
        tabel_target: "profiles",
        record_id: targetUser.id,
        data_baru: {
          pengguna: targetUser.nama_lengkap,
          email: targetUser.email,
          peran_lama: targetUser.role,
          peran_baru: newRole,
        },
      });

      setFeedback({
        type: "success",
        text: `Peran untuk ${targetUser.nama_lengkap} berhasil diubah menjadi ${newRole}.`,
      });

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

  // Aktifkan / Nonaktifkan Akun Pengguna
  const handleToggleStatus = async (targetUser: PenggunaItem) => {
    if (targetUser.id === currentAdmin?.id) {
      alert("Demi keamanan sistem, Anda tidak dapat menonaktifkan akun Anda sendiri.");
      return;
    }

    const newStatus = !targetUser.is_active;
    const confirmToggle = window.confirm(
      `${newStatus ? "Aktifkan kembali" : "Nonaktifkan"} akun "${targetUser.nama_lengkap}"?`
    );
    if (!confirmToggle) return;

    setProcessingId(targetUser.id);
    setFeedback(null);
    try {
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ is_active: newStatus })
        .eq("id", targetUser.id);

      if (updErr) throw updErr;

      await supabase.from("audit_log").insert({
        actor_id: currentAdmin?.id || null,
        actor_email: currentAdmin?.email || "admin@pijaraksara.id",
        aksi: "STATUS_AKUN_DIUBAH",
        tabel_target: "profiles",
        record_id: targetUser.id,
        data_baru: {
          pengguna: targetUser.nama_lengkap,
          email: targetUser.email,
          status_baru: newStatus ? "aktif" : "nonaktif",
        },
      });

      setFeedback({
        type: "success",
        text: `Status akun ${targetUser.nama_lengkap} berhasil diubah menjadi ${
          newStatus ? "Aktif" : "Nonaktif"
        }.`,
      });

      await loadUsers();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah status akun.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredUsers = userList.filter((u) => {
    const matchSearch =
      u.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (roleFilter !== "semua" && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Notifikasi Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.text}</div>
        </div>
      )}

      {/* Toolbar Filter & Pencarian */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="semua">Semua Peran</option>
            <option value="peserta">Peserta</option>
            <option value="instruktur">Instruktur</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat data pengguna...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">Tidak ada pengguna yang cocok dengan filter.</p>
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
                {filteredUsers.map((u) => {
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
                        {u.role === "admin" && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1 w-fit">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                        {u.role === "instruktur" && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            Instruktur
                          </span>
                        )}
                        {u.role === "peserta" && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            Peserta
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {u.is_active ? (
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
                              value={u.role}
                              disabled={processingId === u.id}
                              onChange={(e) =>
                                handleUbahPeran(
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
                              onClick={() => handleToggleStatus(u)}
                              disabled={processingId === u.id}
                              className={`p-1.5 rounded-lg border transition ${
                                u.is_active
                                  ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title={u.is_active ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                            >
                              {u.is_active ? (
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
      </div>
    </div>
  );
}
