"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, FileSpreadsheet, Calculator, Palette, Globe } from "lucide-react";

const CYCLING_PHRASES = [
  "Belajar Keterampilan Kerja Nyata",
  "Kurikulum Intensif Siap Pakai",
  "Sertifikat Resmi Berstandar",
];

export default function HeroSection() {
  const [wordIx, setWordIx] = useState(0);
  const [wordOut, setWordOut] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    const interval = setInterval(() => {
      setWordOut(true);
      timeoutId = window.setTimeout(() => {
        setWordIx((prev) => (prev + 1) % CYCLING_PHRASES.length);
        setWordOut(false);
      }, 400);
    }, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleScrollToKatalog = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const katalogEl = document.getElementById("katalog");
    if (katalogEl) {
      katalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const competencies = [
    {
      title: "Microsoft Excel Perkantoran",
      code: "01",
      icon: FileSpreadsheet,
      badge: "Administrasi",
      color: "hover:border-blue-400 group-hover:text-blue-400",
    },
    {
      title: "Pembukuan Kas & Laba UMKM",
      code: "02",
      icon: Calculator,
      badge: "Bisnis Keuangan",
      color: "hover:border-emerald-400 group-hover:text-emerald-400",
    },
    {
      title: "Desain Konten Promosi Canva",
      code: "03",
      icon: Palette,
      badge: "Desain Grafis",
      color: "hover:border-amber-400 group-hover:text-amber-400",
    },
    {
      title: "Bahasa Inggris Komunikasi Kerja",
      code: "04",
      icon: Globe,
      badge: "Bahasa Asing",
      color: "hover:border-purple-400 group-hover:text-purple-400",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Background Geometri Garis Perspektif Editorial */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <line x1="100" y1="100" x2="900" y2="100" />
            <line x1="100" y1="900" x2="900" y2="900" />
            <line x1="100" y1="100" x2="100" y2="900" />
            <line x1="900" y1="100" x2="900" y2="900" />
            <line x1="500" y1="100" x2="500" y2="900" />
            <line x1="100" y1="500" x2="900" y2="500" />
            <line x1="100" y1="100" x2="0" y2="0" />
            <line x1="900" y1="100" x2="1000" y2="0" />
            <line x1="100" y1="900" x2="0" y2="1000" />
            <line x1="900" y1="900" x2="1000" y2="1000" />
          </g>
        </svg>
      </div>

      {/* Pendaran Cahaya Brand di Belakang */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Kolom Kiri: Headline Identitas, Animasi Cycling Phrase, & Aksi Cepat (7 Kolom) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-mono block">
                Sistem LMS Resmi · Kota Depok
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                <span className="block text-white">Lembaga Kursus</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-indigo-200">
                  Pijar Aksara
                </span>
                {/* Baris Cycling Phrase dengan transisi halus blur/fade */}
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold text-accent-300 pt-2 min-h-[1.3em]">
                  <span
                    className={`inline-block transition-all duration-300 transform ${
                      wordOut
                        ? "opacity-0 blur-sm -translate-y-2"
                        : "opacity-100 blur-0 translate-y-0"
                    }`}
                  >
                    {CYCLING_PHRASES[wordIx]}
                  </span>
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Sistem pembelajaran online resmi untuk pelatihan vokasi dan kecakapan kerja di Kota Depok, menghubungkan materi praktis industri dengan kebutuhan dunia usaha harian.
            </p>

            {/* Tombol Navigasi Utama */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a
                href="#katalog"
                onClick={handleScrollToKatalog}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <BookOpen className="w-4 h-4" />
                Jelajahi Katalog Kursus
              </a>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md transition-all duration-200"
              >
                Daftar Akun Baru
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </Link>
            </div>
            {/* AREA BAWAH TOMBOL CTA BERSIH TOTAL TANPA TEKS APA PUN */}
          </div>

          {/* Kolom Kanan: Visual Kanvas Editorial Bidang Kompetensi (5 Kolom) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 backdrop-blur-md shadow-2xl relative space-y-6">
              
              {/* Header Visual Kanvas */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Fokus Pembelajaran
                  </div>
                  <div className="text-sm font-bold text-white">
                    4 Pilar Kompetensi Siap Terap
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-accent-400 text-xs font-mono font-bold">
                  PA
                </div>
              </div>

              {/* 4 Kartu Vokasi Editorial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {competencies.map((comp, idx) => {
                  const IconComp = comp.icon;
                  return (
                    <div
                      key={idx}
                      className="group bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:bg-slate-800/60 transition-all duration-200"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                          <span>{comp.code}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {comp.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <IconComp className={`w-5 h-5 text-slate-400 transition-colors ${comp.color}`} />
                          <h4 className="text-xs sm:text-sm font-bold text-slate-200 leading-snug">
                            {comp.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stampel Kredibilitas Minimalis Bagian Bawah */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Kota Depok, Jawa Barat</span>
                <span className="text-emerald-400 font-semibold">100% Bersertifikat</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
