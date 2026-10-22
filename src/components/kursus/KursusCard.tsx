import React from "react";
import Link from "next/link";
import { BookOpen, User, Clock, Users, ArrowRight } from "lucide-react";

export interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan: string;
  harga: number;
  kuota: number;
  kursi_terpakai?: number;
  nilai_lulus: number;
  status: string;
  instruktur_nama?: string;
  total_modul?: number;
}

export default function KursusCard({ kursus }: { kursus: KursusItem }) {
  const kursiTerpakai = kursus.kursi_terpakai ?? 0;
  const sisaKursi = Math.max(0, kursus.kuota - kursiTerpakai);
  const isPenuh = sisaKursi <= 0;
  const isHampirPenuh = sisaKursi > 0 && sisaKursi <= 2;

  const formatRupiah = (val: number) => {
    if (val === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-brand-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div className="p-6 space-y-4">
        {/* Kategori & Status Sisa Kursi */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
            {kursus.kategori}
          </span>

          {isPenuh ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              Kuota Penuh
            </span>
          ) : isHampirPenuh ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 animate-pulse">
              Sisa {sisaKursi} Kursi!
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-500 bg-slate-100 flex items-center gap-1">
              <Users className="w-3 h-3" /> Sisa {sisaKursi} kursi
            </span>
          )}
        </div>

        {/* Judul & Ringkasan */}
        <div className="space-y-1.5">
          <Link href={`/kursus/${kursus.slug}`}>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug line-clamp-2">
              {kursus.judul}
            </h3>
          </Link>
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {kursus.ringkasan}
          </p>
        </div>

        {/* Instruktur & Info */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[150px]">
              {kursus.instruktur_nama || "Instruktur Pijar Aksara"}
            </span>
          </div>
          {kursus.total_modul && (
            <div className="flex items-center gap-1 text-slate-500">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{kursus.total_modul} Modul</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Harga & Tombol Aksi */}
      <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
            Investasi
          </span>
          <span
            className={`text-lg font-extrabold ${
              kursus.harga === 0 ? "text-emerald-600" : "text-slate-900"
            }`}
          >
            {formatRupiah(kursus.harga)}
          </span>
        </div>

        <Link
          href={`/kursus/${kursus.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-600 hover:text-white transition group/btn"
        >
          Lihat Detail
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}
