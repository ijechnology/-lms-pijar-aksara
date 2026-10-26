"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import MascotInteractive from "./MascotInteractive";

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

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Background Pendaran Cahaya Halus Selaras Tema Pijar Aksara (Tanpa Garis Grid) */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Kolom Kiri: Headline Identitas, Animasi Cycling Phrase, & Aksi Cepat (7 Kolom) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
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
                href="/daftar"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md transition-all duration-200"
              >
                Daftar Akun Baru
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </Link>
            </div>
            {/* AREA BAWAH TOMBOL CTA BERSIH TOTAL TANPA TEKS APA PUN */}
          </div>

          {/* Kolom Kanan: Maskot Pembelajar Interaktif Murni Visual Tanpa Tulisan (5 Kolom) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <MascotInteractive />
          </div>

        </div>
      </div>
    </section>
  );
}
