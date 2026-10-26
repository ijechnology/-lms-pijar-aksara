import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Star, Award, CheckCircle2, TrendingUp } from "lucide-react";

export default function HeroSection() {
  const handleScrollToKatalog = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const katalogEl = document.getElementById("katalog");
    if (katalogEl) {
      katalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Background Decorative Mesh ala Zenius & Ruangguru */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Kolom Kiri: Copywriting & Aksi Cepat (7 Kolom) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Tingkatkan Keahlian Praktis,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-yellow-200">
                Kuasai Keterampilan Siap Kerja
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              LMS resmi Lembaga Kursus Pijar Aksara Kota Depok. Pelatihan terstruktur intensif untuk staf kantor dan pelaku UMKM: Microsoft Excel, Pembukuan Kas Toko, Desain Promosi Canva, dan Bahasa Inggris Komunikasi Kerja.
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

            {/* Social Proof Ringkas ala Zenius/Ruangguru */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-semibold">Pendaftaran Gelombang Aktif</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-accent-400" />
                <span>Sertifikat Resmi Terverifikasi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-400" />
                <span>Lembaga Kursus Resmi Kota Depok</span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Card Showcase Interaktif ala Ruangguru & Zenius (5 Kolom) */}
          <div className="lg:col-span-5 relative">
            {/* Kartu Utama: Preview Kursus Nyata */}
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 shadow-2xl backdrop-blur-xl space-y-5 relative">
              {/* Header Kartu */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs font-mono text-slate-400 ml-2">lms.pijaraksara.id</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Kelas Terbit
                </span>
              </div>

              {/* Konten Highlight */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Program Pelatihan Unggulan</span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 (Peserta Aktif)
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  Excel untuk Administrasi Perkantoran
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Kuasai rumus esensial IF, VLOOKUP/XLOOKUP, Pivot Table, dan pembuatan laporan kerja harian.
                </p>

                {/* Progress Bar & Modul */}
                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Kurikulum 3 Modul + Kuis</span>
                    <span className="text-brand-400 font-bold">100% Praktis</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-500 to-accent-400 h-2 rounded-full w-4/5" />
                  </div>
                  <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                    <span>Instruktur: <strong className="text-white">Yudha Pratama</strong></span>
                    <span className="text-emerald-400 font-bold">Sertifikat Resmi</span>
                  </div>
                </div>
              </div>

              {/* Status Sisa Kursi Urgensi Nyata */}
              <div className="pt-2 flex items-center justify-between bg-brand-950/40 rounded-xl p-3 border border-brand-500/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Kuota Kursi Terbatas</div>
                    <div className="text-[11px] text-slate-400">18 dari 25 kursi terisi</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-slate-950">
                  Sisa 7 Kursi!
                </span>
              </div>
            </div>

            {/* Floating Glass Pill Kiri Bawah */}
            <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-slate-800/95 border border-slate-700 rounded-xl p-3 shadow-xl backdrop-blur-md items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Ujian Kuis Terstandar</div>
                <div className="text-slate-400 text-[11px]">Batas nilai lulus 70+</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
