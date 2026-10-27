"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export interface PendaftaranMingguanItem {
  minggu: string;
  tanggal: string;
  gratis: number;
  berbayar: number;
  total: number;
}

interface Props {
  data: PendaftaranMingguanItem[];
}

export default function GrafikPendaftaranMingguan({ data }: Props) {
  if (!data || data.length === 0 || data.every((d) => d.total === 0)) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-sm">
        <p>Belum ada data pendaftaran pada rentang periode yang dipilih.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="minggu"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as PendaftaranMingguanItem;
                return (
                  <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-md text-xs space-y-1.5 border border-border">
                    <p className="font-semibold text-foreground border-b border-border pb-1">
                      {label} ({item.tanggal})
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-xs bg-sky-400 inline-block" />
                        Kursus Gratis:
                      </span>
                      <span className="font-semibold text-foreground">{item.gratis} pendaftar</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-xs bg-primary inline-block" />
                        Kursus Berbayar:
                      </span>
                      <span className="font-semibold text-foreground">{item.berbayar} pendaftar</span>
                    </div>
                    <div className="pt-1 border-t border-border flex items-center justify-between font-semibold text-foreground">
                      <span>Total Pendaftar:</span>
                      <span>{item.total} orang</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", paddingBottom: "12px" }}
          />
          <Bar
            dataKey="gratis"
            fill="#38bdf8"
            radius={[4, 4, 0, 0]}
            name="Kursus Gratis"
            maxBarSize={32}
          />
          <Bar
            dataKey="berbayar"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            name="Kursus Berbayar"
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
