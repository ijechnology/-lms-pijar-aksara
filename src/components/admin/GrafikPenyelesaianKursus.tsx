"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";
import { Filter, ArrowUpDown } from "lucide-react";

export interface PenyelesaianKursusItem {
  id: string;
  kursus: string;
  persenSelesai: number;
  selesai: number;
  aktif: number;
  totalBelajar: number;
}

interface Props {
  data: PenyelesaianKursusItem[];
}

export default function GrafikPenyelesaianKursus({ data }: Props) {
  const [tampilanLimit, setTampilanLimit] = useState<"5" | "10" | "semua">("5");

  // Filter jumlah kursus yang ditampilkan agar tidak padat & tetap fokus
  const displayedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Selalu urutkan dari yang terendah ke tertinggi (prioritas evaluasi)
    const sorted = [...data].sort((a, b) => a.persenSelesai - b.persenSelesai);
    if (tampilanLimit === "5") return sorted.slice(0, 5);
    if (tampilanLimit === "10") return sorted.slice(0, 10);
    return sorted;
  }, [data, tampilanLimit]);

  // Format nama kursus jika panjang
  const chartData = useMemo(() => {
    return displayedData.map((d) => ({
      ...d,
      labelSingkat: d.kursus.length > 24 ? d.kursus.substring(0, 22) + "..." : d.kursus,
    }));
  }, [displayedData]);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>Belum ada data aktivitas belajar kursus untuk dihitung tingkat penyelesaiannya.</p>
      </div>
    );
  }

  const getBarColor = (pct: number) => {
    if (pct >= 75) return "#10B981"; // Emerald
    if (pct >= 50) return "#6366F1"; // Indigo
    if (pct >= 25) return "#F59E0B"; // Amber
    return "#EF4444"; // Rose
  };

  // Hitung tinggi chart secara dinamis agar setiap batang memiliki ruang lega (48px per bar)
  const dynamicHeight = Math.max(220, chartData.length * 52);

  return (
    <div className="space-y-4">
      {/* Kontrol Pilihan Tampilan agar Tidak Padat */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <ArrowUpDown className="w-3.5 h-3.5 text-brand-600" />
          <span>Urutan: Tingkat kelulusan terendah &rarr; tertinggi</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <span className="text-[11px] text-slate-500 px-2 font-semibold">Tampilkan:</span>
          <button
            type="button"
            onClick={() => setTampilanLimit("5")}
            className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
              tampilanLimit === "5"
                ? "bg-white text-brand-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            5 Terendah
          </button>
          <button
            type="button"
            onClick={() => setTampilanLimit("10")}
            className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
              tampilanLimit === "10"
                ? "bg-white text-brand-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            10 Terendah
          </button>
          <button
            type="button"
            onClick={() => setTampilanLimit("semua")}
            className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
              tampilanLimit === "semua"
                ? "bg-white text-brand-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({data.length})
          </button>
        </div>
      </div>

      {/* Container Grafik dengan Tinggi Dinamis & Scroll Halus bila Menampilkan Semua */}
      <div
        className={`w-full overflow-y-auto pr-1 ${
          chartData.length > 6 ? "max-h-[460px] custom-scrollbar" : ""
        }`}
      >
        <div style={{ width: "100%", height: `${dynamicHeight}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 45, left: 20, bottom: 10 }}
              barCategoryGap={12}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
              />
              <YAxis
                type="category"
                dataKey="labelSingkat"
                tick={{ fontSize: 11, fill: "#1E293B", fontWeight: 600 }}
                width={140}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as PenyelesaianKursusItem;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 max-w-xs">
                        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                          {item.kursus}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">Rasio Penyelesaian:</span>
                          <span className="font-extrabold text-emerald-400 text-sm">
                            {item.persenSelesai}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 pt-1 space-y-0.5 border-t border-slate-800">
                          <div className="flex justify-between">
                            <span>Peserta Lulus:</span>
                            <span className="font-semibold text-emerald-400">
                              {item.selesai} orang
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Peserta Belajar Aktif:</span>
                            <span className="font-semibold text-indigo-400">
                              {item.aktif} orang
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400 pt-0.5">
                            <span>Total (Aktif + Selesai):</span>
                            <span className="font-semibold text-slate-200">
                              {item.totalBelajar} orang
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="persenSelesai" radius={[0, 6, 6, 0]} maxBarSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.persenSelesai)} />
                ))}
                <LabelList
                  dataKey="persenSelesai"
                  position="right"
                  formatter={(val: number) => `${val}%`}
                  style={{ fontSize: "11px", fontWeight: "700", fill: "#475569" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
