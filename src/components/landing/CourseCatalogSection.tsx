"use client";

import React from "react";
import KursusCard, { KursusItem } from "@/components/kursus/KursusCard";
import { Search, X, BookOpen, Filter } from "lucide-react";

interface CourseCatalogSectionProps {
  courses: KursusItem[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedPrice: string;
  onPriceChange: (val: string) => void;
  categories: string[];
}

export default function CourseCatalogSection({
  courses,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPrice,
  onPriceChange,
  categories,
}: CourseCatalogSectionProps) {
  const allCategories = ["semua", ...categories];

  const priceOptions = [
    { id: "semua", label: "Semua Harga" },
    { id: "gratis", label: "Gratis" },
    { id: "berbayar", label: "Berbayar" },
  ];

  const hasActiveFilter =
    searchQuery !== "" || selectedCategory !== "semua" || selectedPrice !== "semua";

  const handleResetFilters = () => {
    onSearchChange("");
    onCategoryChange("semua");
    onPriceChange("semua");
  };

  return (
    <section id="katalog" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header Seksi (Tanpa Badge Pill AI-Slop) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Katalog Kursus Keterampilan Praktis
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Pilih kursus intensif bersertifikat resmi sesuai kebutuhan peningkatan keahlian kerja dan bisnis Anda.
          </p>
        </div>
        <div className="text-sm text-slate-500 font-medium shrink-0">
          Menampilkan <span className="font-bold text-slate-900">{courses.length}</span> kursus aktif
        </div>
      </div>

      {/* Filter Kontrol Interaktif */}
      <div className="space-y-4">
        {/* Baris Pencarian & Filter Harga */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Kolom Pencarian */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kursus (misal: Excel, Canva, Pembukuan)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle Harga */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0 self-start sm:self-auto">
            {priceOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPriceChange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPrice === opt.id
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pill Category Tabs (Pilihan Program & Jalur Belajar ala Ruangguru & Zenius) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {cat === "semua" ? "Semua Kategori" : cat}
              </button>
            );
          })}

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 underline underline-offset-2 ml-2 whitespace-nowrap shrink-0"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Grid Kursus */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {courses.map((kursus) => (
            <KursusCard key={kursus.id} kursus={kursus} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            Tidak Ada Kursus yang Sesuai
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Cobalah gunakan kata kunci lain atau klik tombol reset filter untuk melihat semua kursus yang tersedia.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
    </section>
  );
}
