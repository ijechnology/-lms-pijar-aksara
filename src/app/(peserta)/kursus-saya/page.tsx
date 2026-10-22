"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Clock,
  Award,
  AlertCircle,
  ArrowRight,
  CreditCard,
  XCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface PendaftaranItem {
  id: string;
  kursus_id: string;
  status: "menunggu_bayar" | "aktif" | "selesai" | "kedaluwarsa" | "dibatalkan";
  nominal: number;
  metode_bayar: string;
  batas_bayar: string | null;
  didaftarkan_pada: string;
  kursus: {
    id: string;
    judul: string;
    slug: string;
    kategori: string;
    nilai_lulus: number;
    modul?: { id: string }[];
  };
  total_modul: number;
  modul_lulus: number;
  sertifikat?: { nomor_sertifikat: string } | null;
}

export default function KursusSayaPage() {
  const { user, isLoading } = useAuth();
  const supabase = createClient();

  const [pendaftaranList, setPendaftaranList] = useState<PendaftaranItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoadingData(true);
      try {
        const { data, error } = await supabase
          .from("pendaftaran")
          .select(`
            id, kursus_id, status, nominal, metode_bayar, batas_bayar, didaftarkan_pada,
            kursus:kursus_id (id, judul, slug, kategori, nilai_lulus, modul (id)),
            sertifikat (nomor_sertifikat),
            progres_modul (id, lulus_pada)
          `)
          .eq("peserta_id", user.id)
          .order("didaftarkan_pada", { ascending: false });

        if (!error && data) {
          const formatted: PendaftaranItem[] = data.map((item: any) => {
            const totalModul = item.kursus?.modul?.length || 0;
            const modulLulus = (item.progres_modul || []).filter(
              (p: any) => p.lulus_pada !== null
            ).length;

            return {
              id: item.id,
              kursus_id: item.kursus_id,
              status: item.status,
              nominal: item.nominal,
              metode_bayar: item.metode_bayar,
              batas_bayar: item.batas_bayar,
              didaftarkan_pada: item.didaftarkan_pada,
              kursus: item.kursus,
              total_modul: totalModul,
              modul_lulus: modulLulus,
              sertifikat: item.sertifikat?.[0] || null,
            };
          });
          setPendaftaranList(formatted);
        }
      } catch (err) {
        console.error("Gagal memuat kursus saya:", err);
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [user, supabase]);

  const handleBatalPendaftaran = async (pendaftaranId: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pendaftaran yang belum dibayar ini?")) {
      return;
    }

    setCancelingId(pendaftaranId);
    try {
      const { error } = await supabase
        .from("pendaftaran")
        .update({
          status: "dibatalkan",
          dibatalkan_pada: new Date().toISOString(),
          alasan_batal: "Dibatalkan sendiri oleh peserta sebelum pembayaran",
        })
        .eq("id", pendaftaranId);

      if (error) {
        alert("Gagal membatalkan pendaftaran: " + error.message);
      } else {
        setPendaftaranList((prev) =>
          prev.map((p) =>
            p.id === pendaftaranId ? { ...p, status: "dibatalkan" } : p
          )
        );
      }
    } catch (err) {
      console.error("Gagal batalkan pendaftaran:", err);
    } finally {
      setCancelingId(null);
    }
  };

  const formatRupiah = (val: number) => {
    if (val === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ruang Kursus Saya
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau progres belajar, status pembayaran, dan akses modul kursus Anda.
          </p>
        </div>

        {loadingData || isLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm">Memuat data kursus Anda...</p>
          </div>
        ) : pendaftaranList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                Belum Ada Kursus yang Diikuti
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Anda belum mendaftar di kursus mana pun. Buka katalog untuk melihat kursus singkat pilihan dari Lembaga Kursus Pijar Aksara.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20 hover:bg-brand-700 transition"
            >
              Jelajahi Katalog Kursus
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendaftaranList.map((item) => {
              const progressPct =
                item.total_modul > 0
                  ? Math.floor((item.modul_lulus / item.total_modul) * 100)
                  : 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Header Card Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                        {item.kursus?.kategori || "Kursus"}
                      </span>

                      {item.status === "aktif" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      )}
                      {item.status === "selesai" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Lulus Selesai
                        </span>
                      )}
                      {item.status === "menunggu_bayar" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" /> Menunggu Bayar
                        </span>
                      )}
                      {item.status === "kedaluwarsa" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                          Kedaluwarsa
                        </span>
                      )}
                      {item.status === "dibatalkan" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          Dibatalkan
                        </span>
                      )}
                    </div>

                    {/* Judul Kursus */}
                    <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                      {item.kursus?.judul}
                    </h3>

                    {/* Kondisi Aktif / Selesai: Tampilkan Progress Bar */}
                    {(item.status === "aktif" || item.status === "selesai") && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs font-medium text-slate-600">
                          <span>Progres Belajar:</span>
                          <span className="font-bold text-slate-800">
                            {item.modul_lulus} / {item.total_modul} Modul ({progressPct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              item.status === "selesai"
                                ? "bg-emerald-500"
                                : "bg-brand-600"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Kondisi Menunggu Bayar: Info Batas Bayar & Tagihan */}
                    {item.status === "menunggu_bayar" && (
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-700">
                          <span>Tagihan:</span>
                          <span className="font-extrabold text-slate-900">
                            {formatRupiah(item.nominal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Metode:</span>
                          <span className="capitalize font-semibold">
                            {item.metode_bayar.replace("_", " ")}
                          </span>
                        </div>
                        {item.batas_bayar && (
                          <div className="flex justify-between text-amber-900 font-bold pt-1 border-t border-amber-200">
                            <span>Batas Bayar:</span>
                            <span>
                              {new Date(item.batas_bayar).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    {item.status === "aktif" && (
                      <Link
                        href={`/kursus-saya/${item.id}/modul/1`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        Lanjutkan Belajar <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {item.status === "selesai" && (
                      <div className="w-full flex gap-2">
                        <Link
                          href={`/kursus-saya/${item.id}/modul/1`}
                          className="flex-1 text-center py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          Ulas Materi
                        </Link>
                        <Link
                          href={`/kursus-saya/${item.id}/sertifikat`}
                          className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" /> Sertifikat
                        </Link>
                      </div>
                    )}

                    {item.status === "menunggu_bayar" && (
                      <div className="w-full flex gap-2">
                        <button
                          onClick={() => handleBatalPendaftaran(item.id)}
                          disabled={cancelingId === item.id}
                          className="flex-1 py-2 px-3 rounded-xl border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                        >
                          {cancelingId === item.id ? "Membatalkan..." : "Batalkan"}
                        </button>
                        <Link
                          href={`/kursus/${item.kursus?.slug}`}
                          className="flex-1 text-center py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
                        >
                          Bayar
                        </Link>
                      </div>
                    )}

                    {(item.status === "kedaluwarsa" || item.status === "dibatalkan") && (
                      <Link
                        href={`/kursus/${item.kursus?.slug}`}
                        className="w-full text-center py-2 px-4 rounded-xl border border-brand-200 text-xs font-bold text-brand-600 hover:bg-brand-50 transition"
                      >
                        Daftar Ulang Kursus Ini
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
