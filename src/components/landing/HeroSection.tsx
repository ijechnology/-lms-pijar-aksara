"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLandingStats } from "@/hooks/useLandingStats";

import MascotInteractive from "./MascotInteractive";

const CYCLING_PHRASES = [
  "Belajar Keterampilan Kerja Nyata",
  "Kurikulum Intensif Siap Pakai",
  "Sertifikat Resmi Berstandar",
];

export default function HeroSection() {
  const [wordIx, setWordIx] = useState(0);
  const [wordOut, setWordOut] = useState(false);
  const { kursusTerbit, pesertaAktif, available, loading } = useLandingStats();

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
    <section className="border-b bg-muted/30">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-24">
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Sistem LMS Resmi · Kota Depok
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block">Lembaga Kursus</span>
              <span className="block text-primary">Pijar Aksara</span>
              <span className="mt-3 block min-h-[1.4em] text-2xl font-semibold tracking-tight text-primary sm:text-3xl lg:text-4xl">
                <span
                  className={`inline-block transition-all duration-300 ${
                    wordOut
                      ? "translate-y-2 opacity-0"
                      : "translate-y-0 opacity-100"
                  }`}
                >
                  {CYCLING_PHRASES[wordIx]}
                </span>
              </span>
            </h1>
          </div>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Sistem pembelajaran online resmi untuk pelatihan vokasi dan
            kecakapan kerja di Kota Depok, menghubungkan materi praktis industri
            dengan kebutuhan dunia usaha harian.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#katalog" onClick={handleScrollToKatalog}>
                <BookOpen className="h-4 w-4" />
                Jelajahi Katalog Kursus
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/daftar">
                Daftar Akun Baru
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {available && !loading && (
            <dl className="flex items-center gap-4 pt-1">
              <div className="space-y-0.5">
                <dt className="text-xs text-muted-foreground">Kursus terbit</dt>
                <dd className="text-lg font-semibold">{kursusTerbit}</dd>
              </div>
              <Separator orientation="vertical" className="h-9" />
              <div className="space-y-0.5">
                <dt className="text-xs text-muted-foreground">Peserta aktif</dt>
                <dd className="text-lg font-semibold">{pesertaAktif}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="flex items-center justify-center lg:col-span-5">
          <MascotInteractive />
        </div>
      </div>
    </section>
  );
}
