"use client";

import { Suspense, useMemo } from "react";

import CourseCatalogSection from "@/components/landing/CourseCatalogSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useKatalogFilters } from "@/hooks/useKatalogFilters";
import { useKursusCatalog } from "@/hooks/useKursusCatalog";
import { filterKursus } from "@/lib/kursus";

function KatalogContent() {
  const { courses, categories, loading } = useKursusCatalog();
  const filters = useKatalogFilters();
  const { q, kategori, harga, setQ, setKategori, setHarga, reset } = filters;

  const filtered = useMemo(
    () => filterKursus(courses, { q, kategori, harga }),
    [courses, q, kategori, harga]
  );

  return (
    <main className="w-full">
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
    </main>
  );
}

function CatalogSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="space-y-3 border-b pb-6">
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full" />
        ))}
      </div>
    </main>
  );
}

export default function KursusPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <KatalogContent />
    </Suspense>
  );
}
