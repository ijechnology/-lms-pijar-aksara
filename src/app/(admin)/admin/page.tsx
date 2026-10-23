"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import TabTinjauanKursus from "@/components/admin/TabTinjauanKursus";
import TabPendaftaranBayar from "@/components/admin/TabPendaftaranBayar";
import TabPengguna from "@/components/admin/TabPengguna";
import TabAuditLog from "@/components/admin/TabAuditLog";
import {
  BookOpen,
  CreditCard,
  Users,
  ShieldAlert,
  LayoutDashboard,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "tinjauan" | "pendaftaran" | "pengguna" | "audit"
  >("tinjauan");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/masuk");
      } else if (role !== "admin") {
        router.push("/akses-ditolak");
      }
    }
  }, [user, role, isLoading, router]);

  if (isLoading || !user || role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Panel Admin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" /> Manajemen Operasional LMS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Panel Administrator
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Kelola moderasi kurikulum kursus, verifikasi pembayaran, hak akses pengguna, dan audit log sistem.
            </p>
          </div>
        </div>

        {/* Tab Navigasi Panel Admin */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("tinjauan")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "tinjauan"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Tinjauan Kursus
          </button>
          <button
            onClick={() => setActiveTab("pendaftaran")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "pendaftaran"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Pendaftaran & Pembayaran
          </button>
          <button
            onClick={() => setActiveTab("pengguna")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "pengguna"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" /> Manajemen Pengguna
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "audit"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Audit Log
          </button>
        </div>

        {/* Konten Tab Aktif */}
        <div className="pt-2">
          {activeTab === "tinjauan" && <TabTinjauanKursus />}
          {activeTab === "pendaftaran" && <TabPendaftaranBayar />}
          {activeTab === "pengguna" && <TabPengguna />}
          {activeTab === "audit" && <TabAuditLog />}
        </div>
      </main>
    </div>
  );
}
