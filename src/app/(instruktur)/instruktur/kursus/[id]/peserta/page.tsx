"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  BookOpen,
  FileText,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface ModulItem {
  id: string;
  urutan: number;
  judul: string;
}

interface PesertaRow {
  pendaftaranId: string;
  userId: string;
  namaLengkap: string;
  email: string;
  noHp: string | null;
  statusPembayaran: "menunggu_pembayaran" | "menunggu_konfirmasi" | "aktif" | "dibatalkan";
  tanggalDaftar: string;
  modulSelesaiCount: number;
  persenProgres: number;
  kuisScores: { [modulId: string]: { nilai: number; statusLulus: boolean; percobaanCount: number } };
  sertifikat: {
    nomor: string;
    tanggalTerbit: string;
  } | null;
}

export default function RekapPesertaKursusPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  const kursusId = params.id as string;

  const [kursus, setKursus] = useState<any | null>(null);
  const [modulList, setModulList] = useState<ModulItem[]>([]);
  const [pesertaList, setPesertaList] = useState<PesertaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  const loadData = useCallback(async () => {
    if (!kursusId || !user) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Ambil detail kursus
      const { data: kursusData, error: kErr } = await supabase
        .from("kursus")
        .select("id, judul, kategori, nilai_lulus, status, instruktur_id")
        .eq("id", kursusId)
        .single();

      if (kErr || !kursusData) {
        throw new Error(kErr?.message || "Kursus tidak ditemukan.");
      }

      if (kursusData.instruktur_id !== user.id && role !== "admin") {
        throw new Error("Anda tidak memiliki akses melihat data peserta kursus ini.");
      }

      setKursus(kursusData);

      // 2. Ambil daftar modul untuk kursus ini
      const { data: moduls, error: mErr } = await supabase
        .from("modul")
        .select("id, urutan, judul")
        .eq("kursus_id", kursusId)
        .order("urutan", { ascending: true });

      if (mErr) throw new Error(mErr.message);
      const sortedModuls = moduls || [];
      setModulList(sortedModuls);

      // 3. Ambil pendaftaran beserta profil, progres_modul, percobaan_kuis, dan sertifikat
      const { data: regs, error: rErr } = await supabase
        .from("pendaftaran")
        .select(`
          id, user_id, status_pembayaran, dibuat_pada,
          profiles (id, nama_lengkap, email, no_hp),
          progres_modul (modul_id, status_baca),
          percobaan_kuis (modul_id, nilai, status_lulus, nomor_percobaan),
          sertifikat (nomor_sertifikat, dibuat_pada)
        `)
        .eq("kursus_id", kursusId)
        .order("dibuat_pada", { ascending: false });

      if (rErr) throw new Error(rErr.message);

      const totalModulsCount = sortedModuls.length || 1;

      const formatted: PesertaRow[] = (regs || []).map((r: any) => {
        const prof = r.profiles || {};
        const progresArr = r.progres_modul || [];
        const kuisArr = r.percobaan_kuis || [];
        const certArr = r.sertifikat || [];

        const modulSelesai = progresArr.filter((p: any) => p.status_baca === "selesai").length;
        const persen = Math.min(100, Math.round((modulSelesai / totalModulsCount) * 100));

        // Group kuis per modul (ambil nilai tertinggi)
        const kuisMap: { [modulId: string]: { nilai: number; statusLulus: boolean; percobaanCount: number } } = {};
        kuisArr.forEach((k: any) => {
          if (!kuisMap[k.modul_id] || k.nilai > kuisMap[k.modul_id].nilai) {
            kuisMap[k.modul_id] = {
              nilai: k.nilai,
              statusLulus: k.status_lulus,
              percobaanCount: (kuisMap[k.modul_id]?.percobaanCount || 0) + 1,
            };
          } else {
            kuisMap[k.modul_id].percobaanCount += 1;
          }
        });

        const certObj =
          certArr.length > 0
            ? {
                nomor: certArr[0].nomor_sertifikat,
                tanggalTerbit: certArr[0].dibuat_pada,
              }
            : null;

        return {
          pendaftaranId: r.id,
          userId: r.user_id,
          namaLengkap: prof.nama_lengkap || "Peserta Tanpa Nama",
          email: prof.email || "-",
          noHp: prof.no_hp || null,
          statusPembayaran: r.status_pembayaran,
          tanggalDaftar: r.dibuat_pada,
          modulSelesaiCount: modulSelesai,
          persenProgres: persen,
          kuisScores: kuisMap,
          sertifikat: certObj,
        };
      });

      setPesertaList(formatted);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memuat rekap peserta.");
    } finally {
      setLoading(false);
    }
  }, [kursusId, user, role, supabase]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/masuk");
      } else {
        loadData();
      }
    }
  }, [isLoading, user, loadData, router]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    const totalPeserta = pesertaList.length;
    const pesertaAktif = pesertaList.filter((p) => p.statusPembayaran === "aktif").length;
    const lulusBersertifikat = pesertaList.filter((p) => p.sertifikat !== null).length;
    const rataRataProgres =
      pesertaAktif > 0
        ? Math.round(
            pesertaList
              .filter((p) => p.statusPembayaran === "aktif")
              .reduce((acc, curr) => acc + curr.persenProgres, 0) / pesertaAktif
          )
        : 0;

    return { totalPeserta, pesertaAktif, lulusBersertifikat, rataRataProgres };
  }, [pesertaList]);

  // Filter & Search Logic
  const filteredPeserta = useMemo(() => {
    return pesertaList.filter((p) => {
      const matchSearch =
        p.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === "aktif") return p.statusPembayaran === "aktif";
      if (statusFilter === "lulus") return p.sertifikat !== null;
      if (statusFilter === "menunggu")
        return (
          p.statusPembayaran === "menunggu_pembayaran" ||
          p.statusPembayaran === "menunggu_konfirmasi"
        );
      if (statusFilter === "dibatalkan") return p.statusPembayaran === "dibatalkan";

      return true;
    });
  }, [pesertaList, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Memuat rekap data peserta kursus...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !kursus) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-16 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h1>
          <p className="text-slate-600 mb-6">{errorMsg || "Kursus tidak ditemukan."}</p>
          <Link
            href="/instruktur/kursus"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kursus
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigasi Atas */}
        <div className="flex items-center gap-3">
          <Link
            href={`/instruktur/kursus/${kursus.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Kurikulum
          </Link>
          <div className="h-4 w-px bg-slate-300" />
          <span className="text-xs font-medium text-slate-500">
            Rekap Peserta & Nilai Kuis
          </span>
        </div>

        {/* Header Kursus */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                {kursus.kategori}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {kursus.judul}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Passing Grade Kuis:{" "}
                <span className="font-bold text-slate-800">{kursus.nilai_lulus}%</span> |
                Total Modul:{" "}
                <span className="font-bold text-slate-800">{modulList.length} Modul</span>
              </p>
            </div>
          </div>

          {/* Cards Statistik */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Total Pendaftar
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {stats.totalPeserta}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-50 border border-brand-200">
              <div className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
                Peserta Aktif
              </div>
              <div className="text-2xl font-extrabold text-brand-900">
                {stats.pesertaAktif}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Lulus Bersertifikat
              </div>
              <div className="text-2xl font-extrabold text-emerald-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                {stats.lulusBersertifikat}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                Rata-rata Progres
              </div>
              <div className="text-2xl font-extrabold text-indigo-900 flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                {stats.rataRataProgres}%
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Peserta Aktif</option>
              <option value="lulus">Lulus Bersertifikat</option>
              <option value="menunggu">Menunggu Pembayaran</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Tabel Rekap Peserta */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Peserta</th>
                  <th className="px-5 py-4">Status Akun</th>
                  <th className="px-5 py-4 min-w-[160px]">Progres Materi</th>
                  {modulList.map((m) => (
                    <th key={m.id} className="px-4 py-4 text-center min-w-[90px]">
                      M{m.urutan} Kuis
                    </th>
                  ))}
                  <th className="px-5 py-4">Sertifikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPeserta.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4 + modulList.length}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="text-sm font-medium">Belum ada peserta yang cocok dengan filter pencarian.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPeserta.map((p) => {
                    return (
                      <tr key={p.pendaftaranId} className="hover:bg-slate-50/80 transition">
                        {/* Peserta Info */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">{p.namaLengkap}</div>
                          <div className="text-xs text-slate-500">{p.email}</div>
                          {p.noHp && (
                            <div className="text-[11px] text-slate-400 mt-0.5">{p.noHp}</div>
                          )}
                        </td>

                        {/* Status Pembayaran */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {p.statusPembayaran === "aktif" && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              Aktif
                            </span>
                          )}
                          {p.statusPembayaran === "menunggu_pembayaran" && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              Belum Bayar
                            </span>
                          )}
                          {p.statusPembayaran === "menunggu_konfirmasi" && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                              Konfirmasi
                            </span>
                          )}
                          {p.statusPembayaran === "dibatalkan" && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                              Batal
                            </span>
                          )}
                        </td>

                        {/* Progres Belajar */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-between text-xs mb-1 font-semibold text-slate-700">
                            <span>
                              {p.modulSelesaiCount} / {modulList.length} Modul
                            </span>
                            <span>{p.persenProgres}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-brand-600 rounded-full transition-all duration-300"
                              style={{ width: `${p.persenProgres}%` }}
                            />
                          </div>
                        </td>

                        {/* Nilai Kuis Tiap Modul */}
                        {modulList.map((m) => {
                          const kuis = p.kuisScores[m.id];
                          if (!kuis) {
                            return (
                              <td
                                key={m.id}
                                className="px-4 py-4 text-center text-xs text-slate-400"
                              >
                                -
                              </td>
                            );
                          }
                          return (
                            <td key={m.id} className="px-4 py-4 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                  kuis.statusLulus
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                                title={`Percobaan: ${kuis.percobaanCount}x`}
                              >
                                {kuis.nilai}
                              </span>
                            </td>
                          );
                        })}

                        {/* Sertifikat */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {p.sertifikat ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                              <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span className="font-mono text-[11px]">{p.sertifikat.nomor}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Belum Lulus</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
