"use client";

import { BookOpen, RotateCcw, Search, X } from "lucide-react";

import KursusCard from "@/components/kursus/KursusCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { HargaFilter, KursusItem } from "@/types/kursus";

interface CourseCatalogSectionProps {
  courses: KursusItem[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedPrice: HargaFilter;
  onPriceChange: (val: HargaFilter) => void;
  categories: string[];
  loading?: boolean;
  onReset?: () => void;
}

const priceOptions: { id: HargaFilter; label: string }[] = [
  { id: "semua", label: "Semua Harga" },
  { id: "gratis", label: "Gratis" },
  { id: "berbayar", label: "Berbayar" },
];

export default function CourseCatalogSection({
  courses,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPrice,
  onPriceChange,
  categories,
  loading = false,
  onReset,
}: CourseCatalogSectionProps) {
  const allCategories = ["semua", ...categories];

  const hasActiveFilter =
    searchQuery !== "" ||
    selectedCategory !== "semua" ||
    selectedPrice !== "semua";

  const handleResetFilters = () => {
    if (onReset) {
      onReset();
      return;
    }

    onSearchChange("");
    onCategoryChange("semua");
    onPriceChange("semua");
  };

  return (
    <section
      id="katalog"
      className="mx-auto w-full max-w-7xl scroll-mt-20 space-y-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="flex flex-col gap-3 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Katalog Kursus Keterampilan Praktis
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Pilih kursus intensif bersertifikat resmi sesuai kebutuhan
            peningkatan keahlian kerja dan bisnis Anda.
          </p>
        </div>
        <p className="shrink-0 text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-medium text-foreground">{courses.length}</span>{" "}
          kursus aktif
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari kursus (misal: Excel, Canva, Pembukuan)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-9"
                aria-label="Cari kursus"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onSearchChange("")}
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  aria-label="Hapus pencarian"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Select
              value={selectedPrice}
              onValueChange={(value) => onPriceChange(value as HargaFilter)}
            >
              <SelectTrigger
                className="w-full sm:w-44"
                aria-label="Filter harga"
              >
                <SelectValue placeholder="Semua Harga" />
              </SelectTrigger>
              <SelectContent>
                {priceOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              Kategori
            </span>
            {allCategories.map((category) => (
              <Button
                key={category}
                type="button"
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category)}
              >
                {category === "semua" ? "Semua Kategori" : category}
              </Button>
            ))}

            {hasActiveFilter && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="ml-auto"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((kursus) => (
            <KursusCard key={kursus.id} kursus={kursus} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Tidak ada kursus yang sesuai"
          description="Cobalah gunakan kata kunci lain atau reset filter untuk melihat semua kursus yang tersedia."
          action={
            <Button type="button" variant="outline" onClick={handleResetFilters}>
              <RotateCcw className="h-4 w-4" />
              Reset filter
            </Button>
          }
        />
      )}
    </section>
  );
}
