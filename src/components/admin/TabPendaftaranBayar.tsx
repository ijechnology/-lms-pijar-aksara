"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  BookOpen,
} from "lucide-react";

interface PendaftaranAdminItem {
  id: string;
  user_id: string;
  kursus_id: string;
  status_pembayaran: "menunggu_pembayaran" | "menunggu_konfirmasi" | "aktif" | "dibatalkan";
  batas_pembayaran: string | null;
  dibuat_pada: string;
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

export default function TabPendaftaranBayar() {
  const supabase = createClient();

  const [regList, setRegList] = useState<PendaftaranAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  // Modal Pembatalan Pendaftaran
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetReg, setTargetReg] = useState<PendaftaranAdminItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase
        .from("pendaftaran")
        .select(`
          id, user_id, kursus_id, status_pembayaran, batas_pembayaran, dibuat_pada,
          user:profiles!pendaftaran_user_id_fkey (nama_lengkap, email, no_hp),
          kursus (judul, harga, kuota)
        `)
        .order("dibuat_pada", { ascending: false });

      if (error) throw error;
      setRegList((data as any) || []);
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat data pendaftaran.",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Konfirmasi Pembayaran Manual via Database RPC
  const handleKonfirmasiManual = async (reg: PendaftaranAdminItem) => {
    const confirmManual = window.confirm(
      `Konfirmasi pembayaran manual untuk peserta ${reg.user?.nama_lengkap || reg.user?.email} pada kursus "${reg.kursus?.judul}"? Status pendaftaran akan diaktifkan.`
    );
    if (!confirmManual) return;

    setProcessing(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase.rpc("konfirmasi_pembayaran_manual", {
        p_pendaftaran_id: reg.id,
      });

      if (error) throw error;

      setFeedback({
        type: "success",
        text: `Pendaftaran berhasil dikonfirmasi secara manual! Akses kursus telah dibuka untuk ${reg.user?.nama_lengkap}.`,
      });

      await loadData();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengonfirmasi pendaftaran.",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Batalkan Pendaftaran (Wajib alasan >= 10 karakter)
  const handleBatalkanPendaftaran = async () => {
    if (!targetReg) return;
    if (cancelReason.trim().length < 10) {
      setFeedback({
        type: "error",
        text: "Alasan pembatalan wajib diisi minimal 10 karakter.",
      });
      return;
    }

    setProcessing(true);
    setFeedback(null);
    try {
      // 1. Update status pendaftaran menjadi dibatalkan
      const { error: updErr } = await supabase
        .from("pendaftaran")
        .update({ status_pembayaran: "dibatalkan" })
        .eq("id", targetReg.id);

      if (updErr) throw updErr;

      // 2. Catat ke audit_log
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      await supabase.from("audit_log").insert({
        actor_id: adminUser?.id || null,
        actor_email: adminUser?.email || "admin@pijaraksara.id",
        aksi: "PEMBATALAN_PENDAFTARAN",
        tabel_target: "pendaftaran",
        record_id: targetReg.id,
        data_baru: {
          alasan: cancelReason.trim(),
          kursus: targetReg.kursus?.judul,
          peserta: targetReg.user?.nama_lengkap,
        },
      });

      setFeedback({
        type: "success",
        text: `Pendaftaran telah berhasil dibatalkan. Kuota kursus telah dibebaskan.`,
      });

      setCancelModalOpen(false);
      setTargetReg(null);
      setCancelReason("");
      await loadData();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal membatalkan pendaftaran.",
      });
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

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredList = regList.filter((r) => {
    const matchSearch =
      (r.user?.nama_lengkap || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.kursus?.judul || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (statusFilter !== "semua" && r.status_pembayaran !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "aktif":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            Aktif / Lunas
          </span>
        );
      case "menunggu_konfirmasi":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 animate-pulse">
            Menunggu Konfirmasi
          </span>
        );
      case "menunggu_pembayaran":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            Menunggu Bayar
          </span>
        );
      case "dibatalkan":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

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
            placeholder="Cari nama peserta, email, kursus..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="semua">Semua Status Transaksi</option>
            <option value="menunggu_konfirmasi">Menunggu Konfirmasi Manual</option>
            <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
            <option value="aktif">Aktif / Lunas</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Tabel Transaksi Pendaftaran */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat transaksi pendaftaran...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">Tidak ada data pendaftaran yang sesuai filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Peserta</th>
                  <th className="px-4 py-4">Kursus</th>
                  <th className="px-4 py-4">Biaya</th>
                  <th className="px-4 py-4">Waktu Daftar / Batas</th>
                  <th className="px-4 py-4">Status Pembayaran</th>
                  <th className="px-5 py-4 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    {/* Peserta */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{r.user?.nama_lengkap}</div>
                      <div className="text-xs text-slate-500">{r.user?.email}</div>
                      {r.user?.no_hp && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{r.user?.no_hp}</div>
                      )}
                    </td>

                    {/* Kursus */}
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-800">{r.kursus?.judul}</div>
                    </td>

                    {/* Biaya */}
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-slate-900">
                      {r.kursus?.harga === 0 ? "Gratis" : formatRupiah(r.kursus?.harga || 0)}
                    </td>

                    {/* Waktu */}
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      <div>{formatDate(r.dibuat_pada)}</div>
                      {r.batas_pembayaran && (
                        <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                          Batas: {formatDate(r.batas_pembayaran)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(r.status_pembayaran)}
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Tombol Konfirmasi Manual */}
                        {r.status_pembayaran !== "aktif" && r.status_pembayaran !== "dibatalkan" && (
                          <button
                            onClick={() => handleKonfirmasiManual(r)}
                            disabled={processing}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi Manual
                          </button>
                        )}

                        {/* Tombol Batalkan */}
                        {r.status_pembayaran !== "dibatalkan" && (
                          <button
                            onClick={() => {
                              setTargetReg(r);
                              setCancelReason("");
                              setFeedback(null);
                              setCancelModalOpen(true);
                            }}
                            disabled={processing}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Batalkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Batalkan Pendaftaran (Wajib alasan >= 10 karakter) */}
      {cancelModalOpen && targetReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Batalkan Pendaftaran</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Peserta: <span className="font-semibold">{targetReg.user?.nama_lengkap}</span> |{" "}
                  {targetReg.kursus?.judul}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Alasan Pembatalan Pendaftaran (Wajib min. 10 karakter):
              </label>
              <textarea
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Contoh: Melewati batas waktu pembayaran 24 jam / Peserta membatalkan registrasi..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Alasan akan dicatat ke dalam audit log sistem</span>
                <span
                  className={
                    cancelReason.trim().length >= 10
                      ? "text-emerald-600 font-bold"
                      : "text-rose-600 font-bold"
                  }
                >
                  {cancelReason.trim().length} / 10 karakter
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleBatalkanPendaftaran}
                disabled={processing || cancelReason.trim().length < 10}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition"
              >
                {processing ? "Memproses..." : "Ya, Batalkan Pendaftaran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
