"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle, BookOpen, Award } from "lucide-react";

export interface ModulStatusItem {
  id: string;
  urutan: number;
  judul: string;
  durasi_menit: number;
  isLulus: boolean;
  isUnlocked: boolean;
  isCurrent: boolean;
}

interface SidebarModulProps {
  pendaftaranId: string;
  modulList: ModulStatusItem[];
  currentUrutan: number;
}

export default function SidebarModul({
  pendaftaranId,
  modulList,
  currentUrutan,
}: SidebarModulProps) {
  return (
    <aside className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <BookOpen className="w-5 h-5 text-brand-600" />
        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
          Daftar Modul Belajar
        </h3>
      </div>

      <nav className="space-y-1.5">
        {modulList.map((m) => {
          const isCurrent = m.urutan === currentUrutan;

          if (!m.isUnlocked) {
            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 cursor-not-allowed select-none text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {m.urutan}
                  </div>
                  <span className="truncate">{m.judul}</span>
                </div>
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            );
          }

          return (
            <Link
              key={m.id}
              href={`/kursus-saya/${pendaftaranId}/modul/${m.urutan}`}
              className={`flex items-center justify-between p-3 rounded-xl transition text-xs sm:text-sm font-medium ${
                isCurrent
                  ? "bg-brand-50 border border-brand-200 text-brand-800 font-semibold shadow-xs"
                  : "hover:bg-slate-50 border border-transparent text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    m.isLulus
                      ? "bg-emerald-100 text-emerald-700"
                      : isCurrent
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {m.urutan}
                </div>
                <span className="truncate">{m.judul}</span>
              </div>

              {m.isLulus ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : isCurrent ? (
                <PlayCircle className="w-4 h-4 text-brand-600 flex-shrink-0 animate-pulse" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {modulList.length > 0 && modulList.every((m) => m.isLulus) && (
        <div className="pt-3 border-t border-slate-100">
          <Link
            href={`/kursus-saya/${pendaftaranId}/sertifikat`}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs shadow-xs transition"
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Lihat Sertifikat Kelulusan</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
