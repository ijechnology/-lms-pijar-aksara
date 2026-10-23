"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
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
  peserta_id: string;
  kursus_id: string;
  status: "menunggu_bayar" | "aktif" | "selesai" | "kedaluwarsa" | "dibatalkan";
  nominal: number;
  metode_bayar: string;
  batas_bayar: string | null;
  didaftarkan_pada: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Konfirmasi Manual
  const [targetKonfirmasi, setTargetKonfirmasi] = useState<PendaftaranAdminItem | null>(null);

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
          id, peserta_id, kursus_id, status, nominal, metode_bayar, batas_bayar, didaftarkan_pada,
          user:profiles!pendaftaran_peserta_id_fkey (nama_lengkap, email, no_hp),
          kursus (judul, harga, kuota)
        `)
        .order("didaftarkan_pada", { ascending: false });

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
  const handleKonfirmasiManual = async () => {
    if (!targetKonfirmasi) return;

    setProcessing(true);
    setFeedback(null);
    try {
      const { error } = await supabase.rpc("konfirmasi_pembayaran_manual", {
        p_pendaftaran_id: targetKonfirmasi.id,
      });

      if (error) throw error;

      setFeedback({
        type: "success",
        text: `Pendaftaran berhasil dikonfirmasi secara manual! Akses kursus telah dibuka untuk ${targetKonfirmasi.user?.nama_lengkap || "peserta"}.`,
      });

      setTargetKonfirmasi(null);
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
        .update({
          status: "dibatalkan",
          alasan_batal: cancelReason.trim(),
          dibatalkan_pada: new Date().toISOString(),
        })
        .eq("id", targetReg.id);

      if (updErr) throw updErr;

      // 2. Catat ke audit_log
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      await supabase.from("audit_log").insert({
        pelaku_id: adminUser?.id || null,
        aksi: "batalkan_pendaftaran",
        nama_tabel: "pendaftaran",
        id_data: targetReg.id,
        data_sesudah: {
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
    if (!iso) return "-";
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
    if (statusFilter !== "semua" && r.status !== statusFilter) return false;
    return true;
  });

  // Reset pagination saat search/filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "aktif":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            Aktif / Lunas
          </span>
        );
      case "selesai":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            Selesai / Lulus
          </span>
        );
      case "menunggu_bayar":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            Menunggu Bayar
          </span>
        );
      case "kedaluwarsa":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            Kedaluwarsa
          </span>
        );
      case "dibatalkan":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {st}
          </span>
        );
    }
  };

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

      {/* Kontrol & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari peserta, email, atau judul kursus..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="semua">Semua Status</option>
            <option value="menunggu_bayar">Menunggu Bayar</option>
            <option value="aktif">Aktif / Lunas</option>
            <option value="selesai">Selesai / Lulus</option>
            <option value="kedaluwarsa">Kedaluwarsa</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Pendaftaran */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs">Memuat data pendaftaran dan pembayaran...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada pendaftaran ditemukan</p>
            <p className="text-xs text-slate-500">Sesuaikan kata kunci pencarian atau filter status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Peserta</th>
                  <th className="px-4 py-3.5">Kursus</th>
                  <th className="px-4 py-3.5">Nominal / Metode</th>
                  <th className="px-4 py-3.5">Waktu Daftar</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedList.map((r) => {
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      {/* Peserta */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{r.user?.nama_lengkap || "Anonim"}</div>
                        <div className="text-[11px] text-slate-500">{r.user?.email}</div>
                        {r.user?.no_hp && (
                          <div className="text-[11px] text-slate-400">{r.user.no_hp}</div>
                        )}
                      </td>

                      {/* Kursus */}
                      <td className="px-4 py-4 max-w-xs">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {r.kursus?.judul || "Kursus"}
                        </div>
                      </td>

                      {/* Nominal / Metode */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{formatRupiah(r.nominal ?? r.kursus?.harga ?? 0)}</div>
                        <div className="text-[11px] text-slate-500 capitalize">{r.metode_bayar || "Mayar"}</div>
                      </td>

                      {/* Waktu Daftar & Batas Bayar */}
                      <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                        <div>{formatDate(r.didaftarkan_pada)}</div>
                        {r.batas_bayar && r.status === "menunggu_bayar" && (
                          <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                            Batas: {formatDate(r.batas_bayar)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(r.status)}
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Tombol Konfirmasi Manual */}
                          {r.status === "menunggu_bayar" && (
                            <button
                              onClick={() => setTargetKonfirmasi(r)}
                              disabled={processing}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi Manual
                            </button>
                          )}

                          {/* Tombol Batalkan */}
                          {r.status !== "dibatalkan" && r.status !== "selesai" && (
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
            totalItems={filteredList.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal Konfirmasi Manual (Modern UI) */}
      <ConfirmModal
        isOpen={targetKonfirmasi !== null}
        onClose={() => setTargetKonfirmasi(null)}
        onConfirm={handleKonfirmasiManual}
        title="Konfirmasi Pembayaran Manual?"
        message={`Konfirmasi pembayaran manual untuk peserta ${targetKonfirmasi?.user?.nama_lengkap || targetKonfirmasi?.user?.email} pada kursus "${targetKonfirmasi?.kursus?.judul}"? Status pendaftaran akan langsung diaktifkan dan kuota kursi dikurangi.`}
        confirmLabel="Ya, Konfirmasi Lunas"
        cancelLabel="Batal"
        variant="success"
        loading={processing}
      />

      {/* Modal Pembatalan Pendaftaran */}
      {cancelModalOpen && targetReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop overlay dengan blur sempurna */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            aria-hidden="true"
            onClick={() => !processing && setCancelModalOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Batalkan Pendaftaran</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Peserta: <span className="font-semibold">{targetReg.user?.nama_lengkap}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Kursus: <span className="font-semibold">{targetReg.kursus?.judul}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Alasan Pembatalan (Wajib min. 10 karakter):
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Contoh: Peserta salah memilih jadwal kursus atau batas waktu pembayaran terlampaui..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Minimal 10 karakter</span>
                <span
                  className={
                    cancelReason.trim().length >= 10 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"
                  }
                >
                  {cancelReason.trim().length} / 10
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBatalkanPendaftaran}
                disabled={processing || cancelReason.trim().length < 10}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition disabled:opacity-50"
              >
                {processing ? "Memproses..." : "Batalkan Pendaftaran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
