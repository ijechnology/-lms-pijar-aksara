"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  Eye,
  FileCode,
  AlertCircle,
  Database,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  waktu: string;
  actor_id: string | null;
  actor_email: string | null;
  aksi: string;
  tabel_target: string;
  record_id: string | null;
  data_lama: any;
  data_baru: any;
}

export default function TabAuditLog() {
  const supabase = createClient();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("semua");

  // Modal Detail Payload JSON
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("waktu", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
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
    const matchSearch =
      l.aksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.actor_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.tabel_target.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (tableFilter !== "semua" && l.tabel_target !== tableFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner Sifat Immutability (INV-07) */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-bold text-amber-400">Append-Only Audit Log (INV-07):</span>
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
            placeholder="Cari aksi, email pelaku, tabel..."
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
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    {/* Waktu */}
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {formatDate(log.waktu)}
                    </td>

                    {/* Pelaku */}
                    <td className="px-4 py-4 font-sans font-medium text-slate-900">
                      {log.actor_email || "Sistem"}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.aksi}
                      </span>
                    </td>

                    {/* Tabel */}
                    <td className="px-4 py-4 text-slate-600">{log.tabel_target}</td>

                    {/* Record ID */}
                    <td className="px-4 py-4 text-slate-400 truncate max-w-[120px]">
                      {log.record_id || "-"}
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
                    {formatDate(selectedLog.waktu)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pelaku:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedLog.actor_email || "Sistem"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tabel Target:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedLog.tabel_target}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Record ID:</span>
                  <span className="font-mono text-slate-700 truncate block">
                    {selectedLog.record_id || "-"}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">
                  Data Baru / Parameter (data_baru):
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-56">
                  {JSON.stringify(selectedLog.data_baru, null, 2) || "null"}
                </pre>
              </div>

              {selectedLog.data_lama && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Data Lama (data_lama):
                  </span>
                  <pre className="p-3 bg-slate-900 text-rose-300 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-56">
                    {JSON.stringify(selectedLog.data_lama, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
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
