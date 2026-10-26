"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Pagination from "@/components/ui/Pagination";
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  Eye,
  FileCode,
  AlertCircle,
  Database,
  User,
} from "lucide-react";

interface AuditLogItem {
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

export default function TabAuditLog() {
  const supabase = createClient();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Detail Payload JSON
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

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
    } catch (err) {
      console.error("Gagal memuat audit log:", err);
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

  const filteredLogs = logs.filter((l) => {
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

  // Reset pagination saat search/filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tableFilter]);

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Banner Sifat Immutability (INV-07) */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-bold text-amber-400">Append-Only Audit Log:</span>
            <span className="text-slate-300 ml-1.5">
              Seluruh catatan perubahan status moderasi, konfirmasi pembayaran, dan hak akses
              tersimpan permanen dan terisolasi dari modifikasi atau penghapusan manual.
            </span>
          </div>
        </div>
        <button
          onClick={loadLogs}
          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
        >
          Muat Ulang
        </button>
      </div>

      {/* Toolbar Pencarian & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aksi, nama/email pelaku, tabel..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="semua">Semua Tabel Target</option>
            <option value="kursus">Tabel Kursus</option>
            <option value="pendaftaran">Tabel Pendaftaran</option>
            <option value="profiles">Tabel Profil Pengguna</option>
            <option value="modul">Tabel Modul</option>
          </select>
        </div>
      </div>

      {/* Tabel Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat riwayat audit log sistem...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">Belum ada catatan log yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Waktu Kejadian</th>
                  <th className="px-4 py-4">Pelaku (Actor)</th>
                  <th className="px-4 py-4">Aksi Sistem</th>
                  <th className="px-4 py-4">Tabel Target</th>
                  <th className="px-4 py-4">Record ID</th>
                  <th className="px-5 py-4 text-right">Data Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    {/* Waktu */}
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {formatDate(log.dibuat_pada)}
                    </td>

                    {/* Pelaku */}
                    <td className="px-4 py-4 font-sans font-medium text-slate-900">
                      <div>{log.pelaku?.nama_lengkap || "Sistem"}</div>
                      {log.pelaku?.email && (
                        <div className="text-[11px] text-slate-400 font-normal">{log.pelaku.email}</div>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.aksi}
                      </span>
                    </td>

                    {/* Tabel */}
                    <td className="px-4 py-4 text-slate-600 font-mono">{log.nama_tabel}</td>

                    {/* Record ID */}
                    <td className="px-4 py-4 text-slate-400 font-mono truncate max-w-[120px]">
                      {log.id_data || "-"}
                    </td>

                    {/* Aksi Lihat Payload */}
                    <td className="px-5 py-4 text-right whitespace-nowrap font-sans">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setDetailModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredLogs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal Detail JSON Payload */}
      {detailModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Audit Payload: {selectedLog.aksi}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Waktu:</span>
                  <span className="font-semibold text-slate-700">
                    {formatDate(selectedLog.dibuat_pada)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pelaku:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedLog.pelaku?.nama_lengkap || "Sistem"} ({selectedLog.pelaku?.email || "otomatis"})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tabel Target:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedLog.nama_tabel}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Record ID:</span>
                  <span className="font-mono text-slate-700 truncate block">
                    {selectedLog.id_data || "-"}
                  </span>
                </div>
              </div>

              {selectedLog.data_sebelum && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Data Sebelum (State Lama):
                  </span>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono max-h-36">
                    {JSON.stringify(selectedLog.data_sebelum, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.data_sesudah && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Data Sesudah (State Baru / Payload):
                  </span>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono max-h-36">
                    {JSON.stringify(selectedLog.data_sesudah, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
