"use client";

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface KursusFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedPrice: string;
  onPriceChange: (p: string) => void;
  categories: string[];
}

export default function KursusFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPrice,
  onPriceChange,
  categories,
}: KursusFilterProps) {
  return (
    <div className="space-y-4">
      {/* Search Input & Price Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari materi kursus (misal: Excel, Canva, Pembukuan)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPrice}
            onChange={(e) => onPriceChange(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="semua">Semua Harga</option>
            <option value="gratis">Gratis (Rp0)</option>
            <option value="berbayar">Berbayar</option>
          </select>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => onCategoryChange("semua")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
            selectedCategory === "semua"
              ? "bg-brand-600 text-white shadow-sm shadow-brand-500/30"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua Kategori
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedCategory === cat
                ? "bg-brand-600 text-white shadow-sm shadow-brand-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
