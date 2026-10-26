"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export interface TransferRegistrationData {
  id: string;
  nominal: number;
  batas_bayar?: string | null;
  kursus?: {
    judul: string;
    slug?: string;
  };
}

interface ModalPetunjukTransferProps {
  isOpen: boolean;
  onClose: () => void;
  data: TransferRegistrationData | null;
  onOpenUpload?: () => void;
}

export function ModalPetunjukTransfer({
  isOpen,
  onClose,
  data,
  onOpenUpload,
}: ModalPetunjukTransferProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const transferCode = `PA-REG-${data.id.slice(0, 8).toUpperCase()}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Petunjuk Transfer Bank Manual
              </h2>
              <p className="text-xs text-slate-500">
                Lembaga Kursus Pijar Aksara
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Ringkasan Kursus & Tagihan */}
          <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100/80 space-y-2">
            <div className="text-xs text-brand-800 font-medium">
              Kursus: <span className="font-bold text-slate-900">{data.kursus?.judul || "Kursus"}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-brand-100">
              <div>
                <span className="text-xs text-slate-500 block">Total Tagihan Transfer:</span>
                <span className="text-xl font-extrabold text-brand-700 tracking-tight">
                  {formatRupiah(data.nominal)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(data.nominal.toString(), "nominal")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-brand-200 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition shadow-sm"
              >
                {copiedField === "nominal" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Jumlah
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rekening Tujuan */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Rekening Bank Resmi Lembaga
            </label>

            {/* Rekening BCA */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-brand-200 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Bank Central Asia (BCA)</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Verifikasi Cepat
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-mono font-bold text-slate-900 tracking-wider">
                    8830-1928-441
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    a.n. Lembaga Kursus Pijar Aksara
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("88301928441", "bca")}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                  title="Salin Nomor Rekening"
                >
                  {copiedField === "bca" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Rekening Bank Mandiri */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-brand-200 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Bank Mandiri</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Verifikasi Cepat
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-mono font-bold text-slate-900 tracking-wider">
                    137-00-9821-4412
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    a.n. Lembaga Kursus Pijar Aksara
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("1370098214412", "mandiri")}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                  title="Salin Nomor Rekening"
                >
                  {copiedField === "mandiri" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Berita Transfer / Referensi */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 block">Berita / Catatan Transfer:</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-bold text-slate-800">
                {transferCode}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(transferCode, "code")}
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold"
              >
                {copiedField === "code" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Kode
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Batas Bayar & Panduan Alur */}
          <div className="space-y-2 text-xs text-slate-600">
            {data.batas_bayar && (
              <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>
                  Batas Waktu Bayar:{" "}
                  <strong>
                    {new Date(data.batas_bayar).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>{" "}
                  (24 jam)
                </span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Alur Verifikasi Pembayaran:</p>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">
                  Setelah Anda melakukan transfer, silakan unggah foto/berkas struk bukti pembayaran pada tab <strong>Menunggu Pembayaran</strong>. Tim Administrator Lembaga Pijar Aksara akan memverifikasi bukti tersebut dan modul belajar akan otomatis terbuka seketika.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          {onOpenUpload ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              Sudah Transfer? Unggah Bukti
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
