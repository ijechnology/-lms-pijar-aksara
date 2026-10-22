"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface PendapatanStatData {
  periode: string;
  pendapatan: number;
}

interface GrafikPendapatanProps {
  data: PendapatanStatData[];
}

export default function GrafikPendapatan({ data }: GrafikPendapatanProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Belum ada data pendapatan pendaftaran untuk divisualisasikan.
      </div>
    );
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 15, bottom: 20 }}>
          <defs>
            <linearGradient id="pendapatanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="periode"
            tick={{ fontSize: 11, fill: "#64748B" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748B" }}
            tickFormatter={(val) => `Rp${(val / 1000).toLocaleString("id-ID")}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              borderRadius: "8px",
              border: "none",
              color: "#FFFFFF",
              fontSize: "12px",
            }}
            formatter={(value: any) => [formatRupiah(Number(value)), "Pendapatan"]}
          />
          <Area
            type="monotone"
            dataKey="pendapatan"
            stroke="#059669"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#pendapatanGrad)"
            name="Pendapatan"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
