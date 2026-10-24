"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface PendapatanMingguanItem {
  minggu: string;
  tanggal: string;
  pendapatan: number;
}

interface Props {
  data: PendapatanMingguanItem[];
}

export default function GrafikPendapatanMingguan({ data }: Props) {
  if (!data || data.length === 0 || data.every((d) => d.pendapatan === 0)) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>Belum ada pendapatan terkonfirmasi pada rentang periode yang dipilih.</p>
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
        <LineChart data={data} margin={{ top: 15, right: 15, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="minggu"
            tick={{ fontSize: 11, fill: "#64748B" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748B" }}
            tickFormatter={(val) => {
              if (val >= 1000000) return `Rp${(val / 1000000).toFixed(1)}jt`;
              if (val >= 1000) return `Rp${(val / 1000).toLocaleString("id-ID")}k`;
              return `Rp${val}`;
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as PendapatanMingguanItem;
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                    <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                      {label} ({item.tanggal})
                    </p>
                    <div className="pt-1 flex items-center justify-between gap-4">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        Pendapatan Lunas:
                      </span>
                      <span className="font-bold text-white">
                        {formatRupiah(item.pendapatan)}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="pendapatan"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#FFFFFF" }}
            activeDot={{ r: 7, stroke: "#059669", strokeWidth: 2 }}
            name="Pendapatan (Lunas)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
