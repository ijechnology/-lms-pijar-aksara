import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";

export default function HeroSection() {
  const handleScrollToKatalog = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const katalogEl = document.getElementById("katalog");
    if (katalogEl) {
      katalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-brand-900 to-slate-900 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-brand-800/40">
      {/* Background Glow Elegan */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(52,104,243,0.25),rgba(255,255,255,0))]" />

      <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-accent-300 text-xs sm:text-sm font-semibold tracking-wide">
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span>Lembaga Kursus Resmi di Kota Depok</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white max-w-4xl mx-auto">
          Tingkatkan Keahlian Praktis,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 via-accent-400 to-amber-200">
            Kembangkan Karier & Usaha Anda
          </span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          Pelatihan intensif terarah yang dirancang untuk kebutuhan nyata dunia kerja dan pelaku usaha:
          Microsoft Excel, Pembukuan Kas UMKM, Desain Canva, dan Bahasa Inggris Komunikasi Kerja.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <a
            href="#katalog"
            onClick={handleScrollToKatalog}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <BookOpen className="w-4 h-4" />
            Eksplorasi Katalog Kursus
          </a>
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md transition-all duration-200"
          >
            Daftar Akun Gratis
            <ArrowRight className="w-4 h-4 text-slate-300" />
          </Link>
        </div>

        {/* Checklist Keunggulan Cepat */}
        <div className="pt-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs sm:text-sm text-slate-300 border-t border-white/10 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Kurikulum Berurutan & Praktis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Kuis Evaluasi & Sertifikat Resmi</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Kuota Terbatas Anti-Bentrok</span>
          </div>
        </div>
      </div>
    </section>
  );
}
