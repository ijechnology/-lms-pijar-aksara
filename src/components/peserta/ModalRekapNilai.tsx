"use client";

import React from "react";
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

interface ModulItem {
  id: string;
  urutan: number;
  judul: string;
  durasi_menit: number;
}

interface PercobaanKuisItem {
  id: string;
  modul_id: string;
  nomor_percobaan: number;
  nilai: number;
  lulus: boolean;
  jumlah_benar: number;
  jumlah_soal: number;
  dikerjakan_pada: string;
}

interface ProgresModulItem {
  id: string;
  modul_id: string;
  lulus_pada: string | null;
  materi_dibaca_pada: string | null;
}

export interface RekapNilaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  pesertaData: {
    nama_lengkap: string;
    email: string;
    no_hp?: string | null;
  };
  kursusJudul: string;
  nilaiLulus: number;
  modulList: ModulItem[];
  progresList: ProgresModulItem[];
  percobaanList: PercobaanKuisItem[];
}

export function ModalRekapNilai({
  isOpen,
  onClose,
  pesertaData,
  kursusJudul,
  nilaiLulus,
  modulList,
  progresList,
  percobaanList,
}: RekapNilaiModalProps) {
  if (!isOpen) return null;

  const sortedModul = [...modulList].sort((a, b) => a.urutan - b.urutan);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
              Transkrip Akademik (BR-12)
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              Rekap Nilai Kuis &amp; Data Peserta
            </h3>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">
              Kursus: <span className="font-bold text-slate-700">{kursusJudul}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Identitas Peserta (BR-12) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Identitas Peserta Pemilik Akun
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span className="truncate font-semibold">{pesertaData.nama_lengkap}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span className="truncate">{pesertaData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span className="truncate font-mono">{pesertaData.no_hp || "Belum diisi"}</span>
              </div>
            </div>
          </div>

          {/* Tabel Evaluasi Kuis per Modul */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-slate-800">
                Daftar Evaluasi per Modul (Syarat Lulus: {nilaiLulus}/100)
              </h4>
              <span className="text-slate-500">Maks. 3x Percobaan (BR-10)</span>
            </div>

            {sortedModul.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Belum ada modul yang terdaftar pada kursus ini.
              </p>
            ) : (
              <div className="space-y-3">
                {sortedModul.map((m) => {
                  const prog = progresList.find((p) => p.modul_id === m.id);
                  const isLulus = prog?.lulus_pada !== null && prog?.lulus_pada !== undefined;
                  const attempts = percobaanList
                    .filter((p) => p.modul_id === m.id)
                    .sort((a, b) => a.nomor_percobaan - b.nomor_percobaan);

                  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.nilai)) : null;

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-md bg-brand-50 text-brand-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            {m.urutan}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">
                              {m.judul}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Estimasi Waktu: {m.durasi_menit} Menit
                            </p>
                          </div>
                        </div>

                        <div>
                          {isLulus ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lulus
                            </span>
                          ) : attempts.length >= 3 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                              <XCircle className="w-3.5 h-3.5" /> Belum Lulus
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                              <Clock className="w-3.5 h-3.5" /> Belum Selesai
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Riwayat Percobaan Nilai Kuis */}
                      <div className="pt-2 border-t border-slate-100">
                        {attempts.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">
                            Kuis modul ini belum pernah dikerjakan.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-medium">
                                Nilai Terbaik:
                              </span>
                              <span
                                className={`font-black text-sm ${
                                  (bestScore ?? 0) >= nilaiLulus
                                    ? "text-emerald-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {bestScore} / 100
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                              {attempts.map((att) => (
                                <div
                                  key={att.id}
                                  className={`p-2 rounded-xl border text-[11px] flex justify-between items-center ${
                                    att.lulus
                                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                                      : "bg-slate-50 border-slate-200 text-slate-700"
                                  }`}
                                >
                                  <span>Percobaan #{att.nomor_percobaan}</span>
                                  <span className="font-bold">
                                    {att.nilai} ({att.jumlah_benar}/{att.jumlah_soal})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
