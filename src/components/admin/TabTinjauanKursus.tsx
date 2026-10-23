"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Lock,
  Search,
  Filter,
  Users,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface KursusTinjauanItem {
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

export default function TabTinjauanKursus() {
  const supabase = createClient();

  const [kursusList, setKursusList] = useState<KursusTinjauanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  // Modal Konfirmasi Terbit, Tutup, & Buka Kembali
  const [approveTargetKursus, setApproveTargetKursus] = useState<KursusTinjauanItem | null>(null);
  const [closeTargetKursus, setCloseTargetKursus] = useState<KursusTinjauanItem | null>(null);
  const [reopenTargetKursus, setReopenTargetKursus] = useState<KursusTinjauanItem | null>(null);

  // Pagination (Seragam 10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Penolakan (BR-04: Wajib alasan >= 10 karakter)
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetKursus, setRejectTargetKursus] = useState<KursusTinjauanItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal Pratinjau Kurikulum
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTargetKursus, setPreviewTargetKursus] = useState<KursusTinjauanItem | null>(null);

  const loadKursus = useCallback(async () => {
    setLoading(true);
    setActionError(null);
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
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal memuat data kursus.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadKursus();
  }, [loadKursus]);

  // Aksi Moderasi Terbitkan
  const handleSetujuiTerbit = async () => {
    if (!approveTargetKursus) return;

    setProcessing(true);
    setActionError(null);
    try {
      const { data, error } = await supabase.rpc("putuskan_tinjauan_kursus", {
        p_kursus_id: approveTargetKursus.id,
        p_keputusan: "terbit",
        p_catatan: null,
      });

      if (error) throw error;
      setApproveTargetKursus(null);
      await loadKursus();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal menerbitkan kursus.");
    } finally {
      setProcessing(false);
    }
  };

  const handleTolakKursus = async () => {
    if (!rejectTargetKursus) return;
    if (rejectReason.trim().length < 10) {
      setActionError("Alasan penolakan wajib diisi minimal 10 karakter (BR-04).");
      return;
    }

    setProcessing(true);
    setActionError(null);
    try {
      const { data, error } = await supabase.rpc("putuskan_tinjauan_kursus", {
        p_kursus_id: rejectTargetKursus.id,
        p_keputusan: "tolak",
        p_catatan: rejectReason.trim(),
      });

      if (error) throw error;
      setRejectModalOpen(false);
      setRejectTargetKursus(null);
      setRejectReason("");
      await loadKursus();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal menolak kursus.");
    } finally {
      setProcessing(false);
    }
  };

  const handleTutupKursus = async () => {
    if (!closeTargetKursus) return;

    setProcessing(true);
    setActionError(null);
    try {
      const { error } = await supabase
        .from("kursus")
        .update({ status: "ditutup" })
        .eq("id", closeTargetKursus.id);

      if (error) throw error;
      setCloseTargetKursus(null);
      await loadKursus();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal menutup kursus.");
    } finally {
      setProcessing(false);
    }
  };

  const handleBukaKembaliKursus = async () => {
    if (!reopenTargetKursus) return;

    setProcessing(true);
    setActionError(null);
    try {
      const { error } = await supabase
        .from("kursus")
        .update({ status: "terbit" })
        .eq("id", reopenTargetKursus.id);

      if (error) throw error;
      setReopenTargetKursus(null);
      await loadKursus();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal membuka kembali kursus.");
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

  // Filter & Search
  const filteredKursus = kursusList.filter((k) => {
    const matchSearch =
      k.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (k.instruktur?.nama_lengkap || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (statusFilter !== "semua" && k.status !== statusFilter) return false;
    return true;
  });

  // Reset pagination saat filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const paginatedKursus = filteredKursus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "draf":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            Draf
          </span>
        );
      case "ditinjau":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 animate-pulse">
            Menunggu Tinjauan
          </span>
        );
      case "terbit":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            Terbit di Katalog
          </span>
        );
      case "ditutup":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            Ditutup
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifikasi Error */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{actionError}</div>
        </div>
      )}

      {/* Toolbar Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul kursus, instruktur, kategori..."
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
            <option value="semua">Semua Status</option>
            <option value="ditinjau">Menunggu Tinjauan (Prioritas)</option>
            <option value="terbit">Terbit di Katalog</option>
            <option value="draf">Draf Instruktur</option>
            <option value="ditutup">Ditutup</option>
          </select>
        </div>
      </div>

      {/* Tabel Kursus */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat data kurikulum kursus...</p>
          </div>
        ) : filteredKursus.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">Tidak ada kursus yang ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Kursus</th>
                  <th className="px-4 py-4">Instruktur</th>
                  <th className="px-4 py-4 whitespace-nowrap">Kategori</th>
                  <th className="px-4 py-4 whitespace-nowrap">Biaya / Kuota</th>
                  <th className="px-4 py-4 whitespace-nowrap">Kurikulum</th>
                  <th className="px-4 py-4 whitespace-nowrap">Status</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedKursus.map((k) => {
                  const moduls = k.modul || [];
                  let totalSoal = 0;
                  moduls.forEach((m) => {
                    totalSoal += (m.soal || []).length;
                  });

                  return (
                    <tr key={k.id} className="hover:bg-slate-50/80 transition">
                      {/* Kursus (Terpisah dari Instruktur) */}
                      <td className="px-5 py-4 max-w-xs">
                        <button
                          onClick={() => {
                            setPreviewTargetKursus(k);
                            setPreviewModalOpen(true);
                          }}
                          className="font-bold text-slate-900 hover:text-brand-600 text-left transition block line-clamp-2"
                          title="Klik untuk melihat detail & kurikulum"
                        >
                          {k.judul}
                        </button>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          /{k.slug}
                        </div>
                        {k.catatan_tinjauan && (
                          <div className="text-xs text-amber-800 bg-amber-50 p-1.5 rounded mt-1.5 border border-amber-200">
                            <strong>Catatan:</strong> {k.catatan_tinjauan}
                          </div>
                        )}
                      </td>

                      {/* Instruktur (Kolom Terpisah) */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-xs">
                          {k.instruktur?.nama_lengkap || "Tanpa Nama"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {k.instruktur?.email || "-"}
                        </div>
                      </td>

                      {/* Kategori - whitespace-nowrap agar rapi dan tidak tertekuk */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap inline-block border border-slate-200/60">
                          {k.kategori}
                        </span>
                      </td>

                      {/* Biaya / Kuota */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs">
                          {k.harga === 0 ? "Gratis" : formatRupiah(k.harga)}
                        </div>
                        <div className="text-[11px] text-slate-500">Kuota: {k.kuota} kursi</div>
                      </td>

                      {/* Kurikulum */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-800">
                          {moduls.length} Modul · {totalSoal} Soal
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Passing Grade: {k.nilai_lulus}%
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(k.status)}</td>

                      {/* Aksi - Bersih, rapi, dan tidak menumpuk padat */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Jika Ditinjau: Setujui / Tolak */}
                          {k.status === "ditinjau" && (
                            <>
                              <button
                                onClick={() => setApproveTargetKursus(k)}
                                disabled={processing}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                                title="Terbitkan kursus ke katalog"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Terbitkan
                              </button>

                              <button
                                onClick={() => {
                                  setRejectTargetKursus(k);
                                  setRejectReason("");
                                  setActionError(null);
                                  setRejectModalOpen(true);
                                }}
                                disabled={processing}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
                                title="Tolak dengan catatan perbaikan"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Tolak
                              </button>
                            </>
                          )}

                          {/* Jika Terbit: Tutup */}
                          {k.status === "terbit" && (
                            <button
                              onClick={() => setCloseTargetKursus(k)}
                              disabled={processing}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition"
                              title="Tutup kursus dari pendaftaran publik"
                            >
                              <Lock className="w-3.5 h-3.5" /> Tutup
                            </button>
                          )}

                          {/* Jika Ditutup: Buka Kembali */}
                          {k.status === "ditutup" && (
                            <button
                              onClick={() => setReopenTargetKursus(k)}
                              disabled={processing}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
                              title="Buka kembali pendaftaran kursus"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Buka Kembali
                            </button>
                          )}

                          {/* Detail & Pratinjau Modal */}
                          <button
                            onClick={() => {
                              setPreviewTargetKursus(k);
                              setPreviewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 transition shadow-2xs"
                            title="Lihat Detail & Kurikulum Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
            totalItems={filteredKursus.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal Penolakan (BR-04: Alasan Wajib >= 10 Karakter) */}
      {rejectModalOpen && rejectTargetKursus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop overlay dengan blur sempurna */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            aria-hidden="true"
            onClick={() => !processing && setRejectModalOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tolak Pengajuan Kursus</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kursus: <span className="font-semibold">{rejectTargetKursus.judul}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Alasan Penolakan / Catatan Perbaikan Kurikulum (Wajib min. 10 karakter):
              </label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Modul 2 belum memiliki butir soal yang cukup mendalam. Silakan tambahkan studi kasus praktis..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Minimal 10 karakter sesuai aturan BR-04</span>
                <span
                  className={
                    rejectReason.trim().length >= 10 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"
                  }
                >
                  {rejectReason.trim().length} / 10 karakter
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleTolakKursus}
                disabled={processing || rejectReason.trim().length < 10}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition"
              >
                {processing ? "Memproses..." : "Kembalikan ke Draf"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Kurikulum */}
      {previewModalOpen && previewTargetKursus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop overlay dengan blur sempurna */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            aria-hidden="true"
            onClick={() => setPreviewModalOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 text-brand-700">
                  {previewTargetKursus.kategori}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {previewTargetKursus.judul}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm text-slate-700">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Ringkasan & Deskripsi
                </h4>
                <p className="text-xs text-slate-600">{previewTargetKursus.ringkasan}</p>
                <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {previewTargetKursus.deskripsi}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Daftar Modul Pembelajaran ({previewTargetKursus.modul?.length || 0} Modul)
                </h4>
                <div className="space-y-2">
                  {(previewTargetKursus.modul || []).map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-brand-700 mr-2">Modul {m.urutan}:</span>
                        <span className="font-semibold text-slate-900">{m.judul}</span>
                        <div className="text-slate-400 mt-0.5 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {m.durasi_menit} menit
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold">
                        {(m.soal || []).length} Soal Kuis
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal: Tombol Navigasi Komprehensif */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/instruktur/kursus/${previewTargetKursus.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Buka Kurikulum Lengkap
                </Link>

                {(previewTargetKursus.status === "terbit" || previewTargetKursus.status === "ditutup") && (
                  <Link
                    href={`/instruktur/kursus/${previewTargetKursus.id}/peserta?from=admin`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition"
                  >
                    <Users className="w-3.5 h-3.5" /> Rekap Nilai Peserta
                  </Link>
                )}

                {previewTargetKursus.status === "terbit" && (
                  <Link
                    href={`/kursus/${previewTargetKursus.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Halaman Publik
                  </Link>
                )}
              </div>

              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Terbitkan Kursus */}
      <ConfirmModal
        isOpen={approveTargetKursus !== null}
        onClose={() => setApproveTargetKursus(null)}
        onConfirm={handleSetujuiTerbit}
        title="Terbitkan Kursus ke Katalog Publik?"
        message={`Apakah Anda yakin ingin menyetujui dan menerbitkan kursus "${approveTargetKursus?.judul}"? Peserta akan langsung dapat melihat dan mendaftar ke kursus ini.`}
        confirmLabel="Ya, Terbitkan"
        cancelLabel="Batal"
        variant="success"
        loading={processing}
      />

      {/* Modal Konfirmasi Tutup Kursus */}
      <ConfirmModal
        isOpen={closeTargetKursus !== null}
        onClose={() => setCloseTargetKursus(null)}
        onConfirm={handleTutupKursus}
        title="Tutup Kursus dari Katalog Publik?"
        message={`Tutup kursus "${closeTargetKursus?.judul}" dari katalog publik? Peserta baru tidak dapat mendaftar lagi, namun peserta yang sudah terdaftar tetap dapat mengakses materi.`}
        confirmLabel="Ya, Tutup Kursus"
        cancelLabel="Batal"
        variant="danger"
        loading={processing}
      />

      {/* Modal Konfirmasi Buka Kembali Kursus */}
      <ConfirmModal
        isOpen={reopenTargetKursus !== null}
        onClose={() => setReopenTargetKursus(null)}
        onConfirm={handleBukaKembaliKursus}
        title="Buka Kembali Kursus ke Katalog Publik?"
        message={`Buka kembali kursus "${reopenTargetKursus?.judul}" ke katalog publik? Calon peserta dapat kembali mendaftar ke kursus ini.`}
        confirmLabel="Ya, Buka Kembali"
        cancelLabel="Batal"
        variant="success"
        loading={processing}
      />
    </div>
  );
}
