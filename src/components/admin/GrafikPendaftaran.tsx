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

interface PendaftaranStatData {
  nama: string;
  total: number;
  aktif: number;
}

interface GrafikPendaftaranProps {
  data: PendaftaranStatData[];
}

export default function GrafikPendaftaran({ data }: GrafikPendaftaranProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Belum ada data transaksi pendaftaran untuk divisualisasikan.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="nama"
            tick={{ fontSize: 11, fill: "#64748B" }}
            interval={0}
            angle={-20}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              borderRadius: "8px",
              border: "none",
              color: "#FFFFFF",
              fontSize: "12px",
            }}
            formatter={(value: any, name: any) => [
              `${value} peserta`,
              name === "total" || name === "Total Pendaftar"
                ? "Total Pendaftar"
                : "Peserta Aktif (Lunas)",
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
          />
          <Bar dataKey="total" fill="#93C5FD" radius={[4, 4, 0, 0]} name="Total Pendaftar" />
          <Bar dataKey="aktif" fill="#2563EB" radius={[4, 4, 0, 0]} name="Peserta Aktif (Lunas)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
