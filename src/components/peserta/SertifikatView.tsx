"use client";

import React from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Download } from "lucide-react";

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
      {/* Action Toolbar (Disembunyikan saat mencetak) */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        {pendaftaranId ? (
          <Link
            href={`/kursus-saya`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Kursus Saya
          </Link>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak / Unduh PDF Resmi
          </button>
        </div>
      </div>

      {/* Kontainer Lembar Sertifikat A4 Landscape Proporsional */}
      <div className="certificate-page-wrapper w-full overflow-x-auto py-2">
        <div
          id="sertifikat-resmi"
          className="certificate-sheet bg-[#FFFDF9] text-slate-900 border-[6px] border-[#1E3A8A] shadow-2xl mx-auto relative overflow-hidden flex flex-col justify-between"
          style={{
            width: "100%",
            maxWidth: "1024px",
            aspectRatio: "297 / 210",
            padding: "36px 48px",
            boxSizing: "border-box",
          }}
        >
          {/* Bingkai Garis Emas Ganda Interior */}
          <div className="absolute inset-3 border border-[#C59B27] pointer-events-none" />
          <div className="absolute inset-4 border border-[#C59B27]/40 pointer-events-none" />

          {/* Ornamen Sudut Klasik (Vector SVG) */}
          <svg
            className="absolute top-5 left-5 w-10 h-10 text-[#C59B27] pointer-events-none select-none"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 38V2H38" stroke="currentColor" strokeWidth="2" />
            <path d="M6 34V6H34" stroke="currentColor" strokeWidth="1" />
            <circle cx="10" cy="10" r="2.5" fill="currentColor" />
          </svg>

          <svg
            className="absolute top-5 right-5 w-10 h-10 text-[#C59B27] pointer-events-none select-none"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M38 38V2H2" stroke="currentColor" strokeWidth="2" />
            <path d="M34 34V6H6" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="10" r="2.5" fill="currentColor" />
          </svg>

          <svg
            className="absolute bottom-5 left-5 w-10 h-10 text-[#C59B27] pointer-events-none select-none"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 2V38H38" stroke="currentColor" strokeWidth="2" />
            <path d="M6 6V34H34" stroke="currentColor" strokeWidth="1" />
            <circle cx="10" cy="30" r="2.5" fill="currentColor" />
          </svg>

          <svg
            className="absolute bottom-5 right-5 w-10 h-10 text-[#C59B27] pointer-events-none select-none"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M38 2V38H2" stroke="currentColor" strokeWidth="2" />
            <path d="M34 6V34H6" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="30" r="2.5" fill="currentColor" />
          </svg>

          {/* Watermark Garis Keamanan Guilloche di Latar Belakang */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
            <svg
              className="w-[500px] h-[500px]"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="100" cy="100" r="90" fill="none" stroke="#1E3A8A" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="75" fill="none" stroke="#1E3A8A" strokeWidth="2" />
              <polygon points="100,15 125,75 190,80 140,120 155,185 100,150 45,185 60,120 10,80 75,75" fill="none" stroke="#1E3A8A" strokeWidth="1.5" />
            </svg>
          </div>

          {/* BAGIAN 1: KOP LEMBAGA RESMI */}
          <header className="relative z-10 text-center pt-2">
            <div className="flex items-center justify-center gap-3.5 mb-1.5">
              {/* Lambang / Emblem Resmi */}
              <div className="w-12 h-12 rounded-full border-2 border-[#C59B27] bg-[#1E3A8A] text-[#FFFDF9] flex items-center justify-center font-serif font-black text-lg shadow-sm">
                PA
              </div>
              <div className="text-left">
                <h2 className="text-base sm:text-lg font-serif font-bold tracking-wider text-[#1E3A8A] uppercase leading-tight">
                  Lembaga Pelatihan &amp; Kursus Pijar Aksara
                </h2>
                <p className="text-[10px] text-slate-500 font-sans tracking-wide">
                  Izin Operasional Dinas Pendidikan Kota Depok · SK No. 421.9/042-LKP/2024
                </p>
              </div>
            </div>

            {/* Garis Pemisah Emas Klasik dengan Berlian Tengah */}
            <div className="flex items-center justify-center gap-3 my-2 opacity-80">
              <div className="w-24 sm:w-36 h-[1px] bg-gradient-to-r from-transparent to-[#C59B27]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#C59B27]" />
              <div className="w-24 sm:w-36 h-[1px] bg-gradient-to-l from-transparent to-[#C59B27]" />
            </div>
          </header>

          {/* BAGIAN 2: JUDUL SERTIFIKAT & NOMOR REGISTRASI */}
          <div className="relative z-10 text-center my-1 space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold tracking-widest text-[#1E3A8A] uppercase">
              Sertifikat Kelulusan
            </h1>
            <p className="text-[11px] sm:text-xs text-[#C59B27] font-serif tracking-[0.25em] uppercase font-bold">
              Certificate of Completion
            </p>
            <p className="text-[11px] text-slate-600 font-mono tracking-wider pt-0.5">
              Nomor Registrasi: <span className="font-semibold text-slate-900">{sertifikat.nomor_sertifikat}</span>
            </p>
          </div>

          {/* BAGIAN 3: PERNYATAAN PENERIMA & KURSUS */}
          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-2 py-1">
            <p className="text-xs sm:text-sm text-slate-600 font-serif italic">
              Dengan penuh kehormatan diberikan kepada:
            </p>

            <div className="py-0.5">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 tracking-tight leading-snug">
                {sertifikat.nama_peserta}
              </h3>
              <div className="w-48 sm:w-64 h-[1.5px] bg-[#C59B27] mx-auto mt-1" />
            </div>

            <p className="text-xs sm:text-[13px] text-slate-700 font-serif leading-relaxed px-4 pt-1">
              Atas keberhasilannya menyelesaikan seluruh rangkaian modul pembelajaran terstruktur, penugasan studi kasus, serta dinyatakan memenuhi syarat kelulusan evaluasi kompetensi pada program kursus:
            </p>

            <div className="pt-0.5">
              <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1E3A8A] tracking-normal">
                &ldquo;{sertifikat.judul_kursus}&rdquo;
              </h4>
            </div>
          </div>

          {/* BAGIAN 4: PENGESAHAN, TANDA TANGAN & CAP RESMI */}
          <footer className="relative z-10 pt-4 border-t border-slate-200/80 grid grid-cols-3 items-end text-center">
            {/* Tanda Tangan 1: Direktur Lembaga */}
            <div className="space-y-1 relative">
              <p className="text-[11px] text-slate-500 font-serif">Depok, {formattedDate}</p>

              {/* Cap Stempel Resmi Digital */}
              <div className="relative h-14 flex items-center justify-center">
                <div className="absolute w-20 h-20 rounded-full border-2 border-dashed border-rose-700/80 text-rose-800 text-[7px] font-sans font-bold flex flex-col items-center justify-center rotate-[-12deg] pointer-events-none select-none opacity-85 leading-tight">
                  <span className="tracking-widest uppercase">LKP PIJAR</span>
                  <span className="text-[9px] font-black my-0.5">★ RESMI ★</span>
                  <span className="uppercase text-[6px]">KOTA DEPOK</span>
                </div>
                {/* Tanda Tangan Direktur */}
                <span className="font-serif italic font-bold text-slate-800 text-sm tracking-widest relative z-10">
                  Ratna Kusumawati
                </span>
              </div>

              <div>
                <p className="font-serif font-bold text-xs text-slate-900 border-t border-slate-300 pt-0.5 inline-block px-4">
                  Ratna Kusumawati, M.Pd.
                </p>
                <p className="text-[10px] text-slate-500 font-sans">Direktur Lembaga</p>
              </div>
            </div>

            {/* Verifikasi Keamanan Dokumen & QR Code */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-16 h-16 p-1 border border-slate-300 bg-white rounded-lg shadow-2xs flex items-center justify-center">
                <svg
                  className="w-full h-full text-slate-800"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="5" height="5" x="3" y="3" rx="1" />
                  <rect width="5" height="5" x="16" y="3" rx="1" />
                  <rect width="5" height="5" x="3" y="16" rx="1" />
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                  <path d="M21 21v.01" />
                  <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                  <path d="M3 12h.01" />
                  <path d="M12 3h.01" />
                  <path d="M12 16v.01" />
                  <path d="M16 12h1" />
                  <path d="M21 12v.01" />
                  <path d="M12 21v-1" />
                </svg>
              </div>
              <p className="text-[9px] text-slate-500 font-sans tracking-tight">
                Verifikasi Keaslian Dokumen
              </p>
              <p className="text-[8px] font-mono text-slate-400">
                lms.pijaraksara.id/verify/{sertifikat.nomor_sertifikat}
              </p>
            </div>

            {/* Tanda Tangan 2: Penguji Akademik / Instruktur */}
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500 font-serif">Bidang Akademik</p>

              <div className="h-14 flex items-center justify-center">
                <span className="font-serif italic font-bold text-slate-800 text-sm tracking-widest">
                  Divisi Kurikulum
                </span>
              </div>

              <div>
                <p className="font-serif font-bold text-xs text-slate-900 border-t border-slate-300 pt-0.5 inline-block px-4">
                  Penguji Akademik
                </p>
                <p className="text-[10px] text-slate-500 font-sans">Divisi Penjaminan Mutu</p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* CSS Khusus Cetak A4 Landscape Standar Industri */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print,
          nav,
          header,
          footer:not(.certificate-sheet footer) {
            display: none !important;
          }

          .certificate-page-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .certificate-sheet {
            width: 297mm !important;
            height: 210mm !important;
            max-width: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border-width: 6mm !important;
            margin: 0 auto !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
    </div>
  );
}
