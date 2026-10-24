"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

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
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>Belum ada data aktivitas belajar kursus untuk dihitung tingkat penyelesaiannya.</p>
      </div>
    );
  }

  // Format nama kursus jika panjang
  const chartData = data.map((d) => ({
    ...d,
    labelSingkat: d.kursus.length > 22 ? d.kursus.substring(0, 20) + "..." : d.kursus,
  }));

  const getBarColor = (pct: number) => {
    if (pct >= 75) return "#10B981"; // Emerald
    if (pct >= 50) return "#6366F1"; // Indigo
    if (pct >= 25) return "#F59E0B"; // Amber
    return "#EF4444"; // Rose
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
          <XAxis
            type="number"
            domain={[0, 100]}
            unit="%"
            tick={{ fontSize: 11, fill: "#64748B" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="labelSingkat"
            tick={{ fontSize: 11, fill: "#334155" }}
            width={130}
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
                      <span className="font-bold text-emerald-400 text-sm">
                        {item.persenSelesai}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 pt-1 space-y-0.5 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span>Peserta Lulus:</span>
                        <span className="font-semibold text-emerald-400">{item.selesai} orang</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sedang Aktif:</span>
                        <span className="font-semibold text-indigo-400">{item.aktif} orang</span>
                      </div>
                      <div className="flex justify-between text-slate-400 pt-0.5">
                        <span>Total (Aktif + Selesai):</span>
                        <span className="font-semibold text-slate-200">{item.totalBelajar} orang</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="persenSelesai" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.persenSelesai)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
