"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";

import CourseCatalogSection from "@/components/landing/CourseCatalogSection";
import FaqSection from "@/components/landing/FaqSection";
import HeroSection from "@/components/landing/HeroSection";
import MentorShowcase from "@/components/landing/MentorShowcase";
import TestimonialSection from "@/components/landing/TestimonialSection";
import ValueProposition from "@/components/landing/ValueProposition";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useKatalogFilters } from "@/hooks/useKatalogFilters";
import { useKursusCatalog } from "@/hooks/useKursusCatalog";
import { filterKursus } from "@/lib/kursus";

function HomeContent() {
  const { courses, categories, loading } = useKursusCatalog();
  const filters = useKatalogFilters();
  const { q, kategori, harga, setQ, setKategori, setHarga, reset } = filters;

  const filtered = useMemo(
    () => filterKursus(courses, { q, kategori, harga }),
    [courses, q, kategori, harga]
  );

  return (
    <>
      <HeroSection />
      <ValueProposition />
      <CourseCatalogSection
        courses={filtered}
        searchQuery={q}
        onSearchChange={setQ}
        selectedCategory={kategori}
        onCategoryChange={setKategori}
        selectedPrice={harga}
        onPriceChange={setHarga}
        categories={categories}
        loading={loading}
        onReset={reset}
      />
      <MentorShowcase />
      <TestimonialSection />
      <FaqSection />

      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-lg border bg-card p-8 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Siap mulai belajar keterampilan baru?
              </h2>
              <p className="text-sm text-muted-foreground">
                Pilih kursus singkat bersertifikat resmi sesuai kebutuhan kerja
                atau usaha Anda.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/kursus">Jelajahi Katalog</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/daftar">Daftar Akun</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function LandingSkeleton() {
  return (
    <>
      <div className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
          <div className="space-y-4 lg:col-span-7">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-11 w-48" />
          </div>
          <Skeleton className="aspect-square w-full max-w-md justify-self-center lg:col-span-5" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full" />
          ))}
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
