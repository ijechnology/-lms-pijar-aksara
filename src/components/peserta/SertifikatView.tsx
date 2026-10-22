"use client";

import React from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Award, CheckCircle2, ShieldCheck } from "lucide-react";

export interface SertifikatData {
  nomor_sertifikat: string;
  nama_peserta: string;
  judul_kursus: string;
  diterbitkan_pada: string;
  tahun: number;
}

export default function SertifikatView({
  sertifikat,
  pendaftaranId,
}: {
  sertifikat: SertifikatData;
  pendaftaranId?: string;
}) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sertifikat.diterbitkan_pada).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div className="space-y-6">
      {/* Action Toolbar (Hidden in Print) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {pendaftaranId ? (
          <Link
            href={`/kursus-saya`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Kursus Saya
          </Link>
        ) : (
          <div />
        )}

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition"
        >
          <Printer className="w-4 h-4" /> Cetak / Simpan PDF
        </button>
      </div>

      {/* Official Certificate Paper */}
      <div className="bg-white rounded-2xl border-8 border-double border-slate-300 shadow-2xl p-8 sm:p-14 max-w-4xl mx-auto relative overflow-hidden print:border-4 print:shadow-none print:m-0 print:p-8">
        {/* Background Ornamental Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <Award className="w-[450px] h-[450px] text-brand-900" />
        </div>

        <div className="relative z-10 text-center space-y-8">
          {/* Institution Header */}
          <div className="space-y-1 border-b-2 border-slate-200 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md mb-2">
              PA
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-900">
              LEMBAGA KURSUS PIJAR AKSARA
            </h2>
            <p className="text-xs text-slate-500 tracking-wider">
              Kota Depok, Jawa Barat · SK Pendirian Lembaga Kursus & Pelatihan Kerja
            </p>
          </div>

          {/* Certificate Title */}
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest uppercase text-accent-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              SERTIFIKAT KELULUSAN RESMI
            </span>
            <p className="text-xs text-slate-500 font-mono tracking-wider pt-1">
              Nomor: <span className="font-bold text-slate-800">{sertifikat.nomor_sertifikat}</span>
            </p>
          </div>

          {/* Statement */}
          <div className="space-y-4 max-w-2xl mx-auto py-2">
            <p className="text-sm text-slate-600 italic">
              Dengan bangga diberikan kepada:
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight underline decoration-accent-500 decoration-2 underline-offset-8">
              {sertifikat.nama_peserta}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed pt-2">
              Atas prestasinya menyelesaikan seluruh modul pembelajaran, praktik studi kasus, dan evaluasi kuis kelulusan pada kursus:
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-brand-800">
              &quot;{sertifikat.judul_kursus}&quot;
            </h3>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 grid grid-cols-2 gap-8 items-end max-w-xl mx-auto border-t border-slate-100">
            <div className="space-y-12">
              <div className="text-xs text-slate-500">
                Depok, {formattedDate}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm border-b border-slate-300 pb-1 max-w-[160px] mx-auto">
                  Ratna Kusumawati, M.Pd.
                </p>
                <p className="text-[11px] text-slate-500">Direktur Lembaga</p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Terverifikasi Sistem
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm border-b border-slate-300 pb-1 max-w-[160px] mx-auto">
                  Penguji Akademik
                </p>
                <p className="text-[11px] text-slate-500">Divisi Kurikulum</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
