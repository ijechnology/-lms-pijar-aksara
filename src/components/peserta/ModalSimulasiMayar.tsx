"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export interface MayarSimulasiData {
  id: string;
  nominal: number;
  kursus?: {
    judul: string;
  };
}

interface ModalSimulasiMayarProps {
  isOpen: boolean;
  onClose: () => void;
  data: MayarSimulasiData | null;
  onSuccess: (message: string) => void;
}

export function ModalSimulasiMayar({
  isOpen,
  onClose,
  data,
  onSuccess,
}: ModalSimulasiMayarProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSimulasiBayar = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/pembayaran/mayar/simulasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaran_id: data.id }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memproses simulasi pembayaran Mayar.");
      }

      onSuccess(result.message || "Simulasi pembayaran Mayar berhasil! Akses kursus telah dibuka.");
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Mayar Gateway Sandbox
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 uppercase tracking-wider">
                Mode Simulasi Pengujian
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-xs text-slate-500 block">Pendaftaran Kursus:</span>
            <span className="text-sm font-bold text-slate-900 block leading-snug">
              {data.kursus?.judul || "Kursus"}
            </span>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-600">Nominal Tagihan:</span>
              <span className="text-lg font-extrabold text-amber-700">
                {formatRupiah(data.nominal)}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" /> Kunci API Mayar Belum Dikonfigurasi
            </p>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Sistem berjalan dalam mode Sandbox Mock. Anda dapat langsung menguji keberhasilan pembayaran gerbang Mayar secara instan tanpa perlu akun merchant Mayar asli.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
            <QrCode className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">
              Simulasi QRIS / Virtual Account Sandbox
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSimulasiBayar}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Simulasikan Lunas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
