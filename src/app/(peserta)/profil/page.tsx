"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import AlertModal from "@/components/ui/AlertModal";
import Pagination from "@/components/ui/Pagination";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Save,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RefreshCw,
  Shield,
  ShieldAlert,
  CreditCard,
  Users,
  LayoutDashboard,
  Search,
  Activity,
  FileCode,
  Eye,
  Database,
  X,
} from "lucide-react";

interface ModulItem {
  id: string;
  urutan: number;
  judul: string;
  durasi_menit: number;
}

interface ProgresModulItem {
  id: string;
  modul_id: string;
  lulus_pada: string | null;
  materi_dibaca_pada: string | null;
}

interface PercobaanKuisItem {
  id: string;
  modul_id: string;
  nomor_percobaan: number;
  nilai: number;
  lulus: boolean;
  jumlah_benar: number;
  jumlah_soal: number;
  dikerjakan_pada: string;
}

interface KursusEnrollment {
  id: string;
  kursus_id: string;
  status: string;
  didaftarkan_pada: string;
  kursus: {
    id: string;
    judul: string;
    slug: string;
    kategori: string;
    nilai_lulus: number;
    modul: ModulItem[];
  };
  total_modul: number;
  modul_lulus: number;
  sertifikat?: { nomor_sertifikat: string } | null;
  progres_modul: ProgresModulItem[];
  percobaan_kuis: PercobaanKuisItem[];
}

interface AdminAuditLogItem {
  id: string | number;
  dibuat_pada: string;
  pelaku_id: string | null;
  aksi: string;
  nama_tabel: string;
  id_data: string | null;
  data_sebelum: any;
  data_sesudah: any;
}

export default function ProfilPesertaPage() {
  const { user, profile, refreshProfile, isLoading: authLoading, role } = useAuth();
  const supabase = createClient();

  const [namaLengkap, setNamaLengkap] = useState("");
  const [noHp, setNoHp] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [enrollments, setEnrollments] = useState<KursusEnrollment[]>([]);
  const [instrukturCourses, setInstrukturCourses] = useState<any[]>([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLogItem[]>([]);
  const [searchAdminLog, setSearchAdminLog] = useState("");
  const [selectedAdminLog, setSelectedAdminLog] = useState<AdminAuditLogItem | null>(null);
  const [adminLogPage, setAdminLogPage] = useState(1);
  const adminLogsPerPage = 5;

  const [loadingData, setLoadingData] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<Record<string, boolean>>({});

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Isi data form dari profil saat tersedia
  useEffect(() => {
    if (profile) {
      setNamaLengkap(profile.nama_lengkap || "");
      setNoHp(profile.no_hp || "");
    }
  }, [profile]);

  // Reset pagination saat pencarian log berubah
  useEffect(() => {
    setAdminLogPage(1);
  }, [searchAdminLog]);

  // Muat riwayat kursus dan nilai kuis peserta & kursus instruktur / log admin
  const loadData = useCallback(async () => {
    if (!user) return;
    if (role === "admin") {
      setLoadingData(true);
      try {
        const { data: logs, error: logErr } = await supabase
          .from("audit_log")
          .select(`
            id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
          `)
          .eq("pelaku_id", user.id)
          .order("dibuat_pada", { ascending: false })
          .limit(100);

        if (!logErr && logs) {
          setAdminAuditLogs(logs);
        }
      } catch (err) {
        console.error("Gagal memuat log audit admin:", err);
      } finally {
        setLoadingData(false);
      }
      return;
    }
    setLoadingData(true);
    try {
      // 1. Jika instruktur, ambil kursus yang diampu
      if (role === "instruktur") {
        const { data: taughtCourses } = await supabase
          .from("kursus")
          .select(`
            id, judul, slug, kategori, status,
            modul (id),
            pendaftaran (id)
          `)
          .eq("instruktur_id", user.id)
          .order("dibuat_pada", { ascending: false });

        if (taughtCourses) {
          setInstrukturCourses(
            taughtCourses.map((c: any) => ({
              id: c.id,
              judul: c.judul,
              slug: c.slug,
              kategori: c.kategori,
              status: c.status,
              modulCount: (c.modul || []).length,
              pesertaCount: (c.pendaftaran || []).length,
            }))
          );
        }
      }

      // 2. Ambil riwayat pendaftaran sebagai peserta jika ada
      const { data, error } = await supabase
        .from("pendaftaran")
        .select(`
          id, kursus_id, status, didaftarkan_pada,
          kursus:kursus_id (
            id, judul, slug, kategori, nilai_lulus,
            modul (id, urutan, judul, durasi_menit)
          ),
          sertifikat (nomor_sertifikat),
          progres_modul (id, modul_id, lulus_pada, materi_dibaca_pada),
          percobaan_kuis (id, modul_id, nomor_percobaan, nilai, lulus, jumlah_benar, jumlah_soal, dikerjakan_pada)
        `)
        .eq("peserta_id", user.id)
        .order("didaftarkan_pada", { ascending: false });

      if (!error && data) {
        const formatted: KursusEnrollment[] = data.map((item: any) => {
          const totalModul = item.kursus?.modul?.length || 0;
          const modulLulus = (item.progres_modul || []).filter(
            (p: any) => p.lulus_pada !== null
          ).length;

          return {
            id: item.id,
            kursus_id: item.kursus_id,
            status: item.status,
            didaftarkan_pada: item.didaftarkan_pada,
            kursus: item.kursus,
            total_modul: totalModul,
            modul_lulus: modulLulus,
            sertifikat: item.sertifikat?.[0] || null,
            progres_modul: item.progres_modul || [],
            percobaan_kuis: item.percobaan_kuis || [],
          };
        });

        setEnrollments(formatted);

        // Buka kursus pertama secara bawaan
        if (formatted.length > 0) {
          setExpandedCourse({ [formatted[0].id]: true });
        }
      }
    } catch (err) {
      console.error("Gagal memuat rekap data profil:", err);
    } finally {
      setLoadingData(false);
    }
  }, [user?.id, role, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simpan perubahan profil peserta (nama & no_hp) sesuai kebijakan RLS profiles_update_self
  const handleSimpanProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!namaLengkap.trim()) {
      setAlertModal({
        isOpen: true,
        title: "Validasi Gagal",
        message: "Nama lengkap wajib diisi.",
        type: "error",
      });
      return;
    }

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nama_lengkap: namaLengkap.trim(),
          no_hp: noHp.trim() || null,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      setAlertModal({
        isOpen: true,
        title: "Profil Diperbarui",
        message: "Data profil Anda berhasil disimpan ke sistem.",
        type: "success",
      });
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: "Gagal Menyimpan",
        message: err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan profil.",
        type: "error",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleCourseExpand = (id: string) => {
    setExpandedCourse((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Tampilan Khusus Administrator: Layout Kanan-Kiri Seragam Berukuran Sama dengan Pagination
  if (role === "admin") {
    const filteredAdminLogs = adminAuditLogs.filter((log) => {
      if (!searchAdminLog) return true;
      const q = searchAdminLog.toLowerCase();
      return (
        log.aksi.toLowerCase().includes(q) ||
        log.nama_tabel.toLowerCase().includes(q) ||
        JSON.stringify(log.data_sesudah || {}).toLowerCase().includes(q)
      );
    });

    const paginatedAdminLogs = filteredAdminLogs.slice(
      (adminLogPage - 1) * adminLogsPerPage,
      adminLogPage * adminLogsPerPage
    );

    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Profil &amp; Log Aktivitas Administrator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola data identitas akun dan pantau rekam jejak audit aktivitas yang Anda lakukan di sistem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Kolom Kiri: Card Identitas Profil Admin (Ringkas & Proporsional) */}
            <div className="lg:col-span-1 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-13 h-13 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-black text-xl shadow-xs">
                  {profile?.nama_lengkap
                    ? profile.nama_lengkap
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "AD"}
                </div>
                <div className="space-y-1">
                  <h2 className="font-extrabold text-slate-900 text-base">
                    {profile?.nama_lengkap || "Administrator"}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Administrator Sistem
                  </span>
                </div>
              </div>

              {/* Ringkasan Status Administratif */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status Akun</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Hak Akses</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                    Penuh (Sistem)
                  </span>
                </div>
              </div>

              <form onSubmit={handleSimpanProfil} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Alamat Email (Akun)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Email akun terhubung dengan autentikasi Anda.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor HP / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{savingProfile ? "Menyimpan Perubahan..." : "Simpan Profil Saya"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Kolom Kanan: Audit Log Hanya Milik Akun Admin Ini */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-brand-600" />
                      <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                        Log Aktivitas Akun Saya
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500">
                      Rekam jejak tindakan administratif akun Anda ({user?.email}).
                    </p>
                  </div>

                  <button
                    onClick={loadData}
                    disabled={loadingData}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition self-start sm:self-auto cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
                    <span>Segarkan</span>
                  </button>
                </div>

                {/* Search Bar Log */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchAdminLog}
                    onChange={(e) => setSearchAdminLog(e.target.value)}
                    placeholder="Cari aksi (misal: verifikasi, kursus, kuota)..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-hidden"
                  />
                </div>

                {/* Konten Log */}
                {loadingData ? (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs">Memuat rekam jejak aktivitas akun Anda...</p>
                  </div>
                ) : filteredAdminLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Activity className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">Belum Ada Catatan Aktivitas</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {searchAdminLog
                        ? "Tidak ada aktivitas yang sesuai dengan kata kunci pencarian Anda."
                        : "Aktivitas administratif yang Anda lakukan akan tercatat otomatis di sini."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {paginatedAdminLogs.map((log) => {
                      const formattedDate = new Date(log.dibuat_pada).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      let actionBadgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                      let actionLabel = log.aksi;
                      if (log.aksi.includes("konfirmasi") || log.aksi.includes("bayar")) {
                        actionBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                        actionLabel = "Konfirmasi Pembayaran";
                      } else if (log.aksi.includes("setujui")) {
                        actionBadgeColor = "bg-blue-50 text-blue-800 border-blue-200";
                        actionLabel = "Setujui Kursus";
                      } else if (log.aksi.includes("tolak")) {
                        actionBadgeColor = "bg-rose-50 text-rose-800 border-rose-200";
                        actionLabel = "Tolak Kursus";
                      } else if (log.aksi.includes("kuota") || log.aksi.includes("harga")) {
                        actionBadgeColor = "bg-purple-50 text-purple-800 border-purple-200";
                        actionLabel = "Ubah Kuota / Biaya";
                      } else if (log.aksi.includes("batal")) {
                        actionBadgeColor = "bg-rose-50 text-rose-800 border-rose-200";
                        actionLabel = "Batalkan Pendaftaran";
                      }

                      return (
                        <div
                          key={log.id}
                          className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition space-y-2 shadow-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${actionBadgeColor}`}
                              >
                                {actionLabel}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                                {log.nama_tabel}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">{formattedDate}</span>
                          </div>

                          {log.data_sesudah && typeof log.data_sesudah === "object" && (
                            <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                              <p className="line-clamp-1 text-[11px]">
                                {log.data_sesudah.kursus
                                  ? `Kursus: ${log.data_sesudah.kursus}`
                                  : log.data_sesudah.status
                                  ? `Status diubah ke: ${log.data_sesudah.status}`
                                  : `Target ID: ${log.id_data || "-"}`}
                              </p>
                              <button
                                onClick={() => setSelectedAdminLog(log)}
                                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 whitespace-nowrap inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> Detail
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination Log */}
              {!loadingData && filteredAdminLogs.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <Pagination
                    currentPage={adminLogPage}
                    totalItems={filteredAdminLogs.length}
                    itemsPerPage={adminLogsPerPage}
                    onPageChange={setAdminLogPage}
                    className="border-none px-0 py-0 bg-transparent rounded-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Modal Detail JSON Payload */}
          {selectedAdminLog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-brand-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Rincian Log: {selectedAdminLog.aksi}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAdminLog(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Tabel Target:</span>
                      <span className="font-bold text-slate-800">{selectedAdminLog.nama_tabel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">ID Data:</span>
                      <span className="font-mono text-slate-800 truncate block">{selectedAdminLog.id_data || "-"}</span>
                    </div>
                  </div>

                  {selectedAdminLog.data_sebelum && (
                    <div>
                      <span className="text-slate-500 font-bold block mb-1">Data Sebelum:</span>
                      <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
                        {JSON.stringify(selectedAdminLog.data_sebelum, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedAdminLog.data_sesudah && (
                    <div>
                      <span className="text-slate-500 font-bold block mb-1">Data Sesudah:</span>
                      <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
                        {JSON.stringify(selectedAdminLog.data_sesudah, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedAdminLog(null)}
                    className="py-2 px-4 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          <AlertModal
            isOpen={alertModal.isOpen}
            onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
            title={alertModal.title}
            message={alertModal.message}
            type={alertModal.type}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {role === "instruktur"
              ? "Profil & Pengaturan Akun Instruktur"
              : "Profil & Transkrip Akademik"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {role === "instruktur"
              ? "Kelola data profil pengajar Anda dan pantau ikhtisar kursus yang Anda ampu."
              : "Data pribadi Anda (nama, email, nomor HP) dan rekapitulasi nilai kuis kelulusan."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Kolom Kiri: Formulir Data Diri Peserta / Instruktur */}
          <div className="lg:col-span-1 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg bg-brand-50 text-brand-700">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">
                  Data Pribadi {role === "instruktur" ? "Instruktur" : "Peserta"}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />{" "}
                  {role === "instruktur"
                    ? "Instruktur Terverifikasi"
                    : "Terverifikasi Sistem"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSimpanProfil} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {role === "instruktur"
                    ? "Nama ini ditampilkan sebagai pengampu kursus di katalog publik."
                    : "Nama ini digunakan pada dokumen sertifikat kelulusan resmi."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Email (Akun)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Email akun terhubung dengan login Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor HP / WhatsApp
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Digunakan untuk pemberitahuan status dan konfirmasi pembayaran.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{savingProfile ? "Menyimpan Perubahan..." : "Simpan Profil Saya"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Kolom Kanan: Kursus Instruktur & Rekapitulasi Nilai */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bagian Khusus Instruktur: Kursus yang Diampu */}
            {role === "instruktur" && (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      Kursus yang Anda Ampu
                    </h2>
                    <p className="text-xs text-slate-500">
                      Kelola modul materi, evaluasi butir soal, dan pantau perkembangan nilai peserta kursus.
                    </p>
                  </div>

                  <Link
                    href="/instruktur/kursus"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    Kelola Semua Kursus
                  </Link>
                </div>

                {loadingData || authLoading ? (
                  <div className="py-10 text-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs">Memuat data kursus Anda...</p>
                  </div>
                ) : instrukturCourses.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">Belum Ada Kursus</p>
                    <p className="text-xs max-w-sm mx-auto">
                      Anda belum membuat kursus pelatihan di LMS Pijar Aksara.
                    </p>
                    <Link
                      href="/instruktur/kursus"
                      className="inline-block mt-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                    >
                      Buat Kursus Sekarang
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {instrukturCourses.map((c) => (
                      <Link
                        key={c.id}
                        href={`/instruktur/kursus/${c.id}`}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-brand-400 hover:shadow-md transition duration-200 group flex flex-col justify-between space-y-3 cursor-pointer"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                              {c.kategori}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-200/70 px-2 py-0.5 rounded-full">
                              {c.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-brand-600 transition">
                            {c.judul}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {c.modulCount} Modul · {c.pesertaCount} Peserta Terdaftar
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bagian Transkrip Nilai Belajar (Peserta atau jika instruktur ikut kursus) */}
            {(role !== "instruktur" || enrollments.length > 0) && (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {role === "instruktur" ? "Kursus yang Anda Ikuti (Sebagai Peserta)" : "Transkrip Nilai Belajar Peserta"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rekap nilai kuis hanya dapat diakses oleh Anda, instruktur pengampu, dan administrator lembaga.
                    </p>
                  </div>

                  <Link
                    href="/kursus-saya"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    Buka Kursus Saya
                  </Link>
                </div>

                {loadingData || authLoading ? (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs">Memuat rekap transkrip nilai...</p>
                  </div>
                ) : enrollments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">Belum Ada Kursus yang Diikuti</p>
                    <p className="text-xs max-w-sm mx-auto">
                      Anda belum memiliki riwayat pendaftaran atau evaluasi kuis di LMS Pijar Aksara.
                    </p>
                  </div>
                ) : (
                <div className="space-y-4">
                  {enrollments.map((enr) => {
                    const isExpanded = !!expandedCourse[enr.id];
                    const progressPct =
                      enr.total_modul > 0
                        ? Math.floor((enr.modul_lulus / enr.total_modul) * 100)
                        : 0;

                    const sortedModul = [...(enr.kursus?.modul || [])].sort(
                      (a, b) => a.urutan - b.urutan
                    );

                    return (
                      <div
                        key={enr.id}
                        className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/40"
                      >
                        {/* Header Kartu Kursus */}
                        <div
                          onClick={() => toggleCourseExpand(enr.id)}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 text-brand-700">
                                {enr.kursus?.kategori}
                              </span>
                              {enr.status === "selesai" ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Lulus Selesai
                                </span>
                              ) : enr.status === "aktif" ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800">
                                  Aktif
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 capitalize">
                                  {enr.status.replace("_", " ")}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                              {enr.kursus?.judul}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              Progres: {enr.modul_lulus} dari {enr.total_modul} Modul ({progressPct}%) · Syarat Lulus: {enr.kursus?.nilai_lulus}/100
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {enr.status === "selesai" && (
                              <Link
                                href={`/kursus-saya/${enr.id}/sertifikat`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                              >
                                <Award className="w-3.5 h-3.5" /> Sertifikat
                              </Link>
                            )}
                            <button
                              type="button"
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Rincian Evaluasi Nilai Kuis Tiap Modul */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Rincian Nilai Kuis per Modul
                            </h4>

                            {sortedModul.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">
                                Belum ada modul pada kursus ini.
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {sortedModul.map((m) => {
                                  const prog = enr.progres_modul.find(
                                    (p) => p.modul_id === m.id
                                  );
                                  const isLulus =
                                    prog?.lulus_pada !== null &&
                                    prog?.lulus_pada !== undefined;
                                  const attempts = enr.percobaan_kuis
                                    .filter((p) => p.modul_id === m.id)
                                    .sort(
                                      (a, b) =>
                                        a.nomor_percobaan - b.nomor_percobaan
                                    );

                                  const bestScore =
                                    attempts.length > 0
                                      ? Math.max(...attempts.map((a) => a.nilai))
                                      : null;

                                  return (
                                    <div
                                      key={m.id}
                                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs space-y-2"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="w-5 h-5 rounded-md bg-brand-50 text-brand-700 font-bold text-[10px] flex items-center justify-center">
                                            {m.urutan}
                                          </span>
                                          <span className="font-semibold text-slate-800">
                                            {m.judul}
                                          </span>
                                        </div>

                                        <div>
                                          {isLulus ? (
                                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{" "}
                                              Lulus ({bestScore}/100)
                                            </span>
                                          ) : attempts.length >= 3 ? (
                                            <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                                              <XCircle className="w-3.5 h-3.5 text-rose-600" />{" "}
                                              Gagal ({bestScore ?? 0}/100)
                                            </span>
                                          ) : (
                                            <span className="text-slate-400">
                                              Belum Selesai
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Baris Riwayat Percobaan */}
                                      {attempts.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 text-[11px]">
                                          {attempts.map((att) => (
                                            <span
                                              key={att.id}
                                              className={`px-2 py-0.5 rounded-md border font-mono ${
                                                att.lulus
                                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                                  : "bg-slate-100 border-slate-200 text-slate-600"
                                              }`}
                                            >
                                              Percobaan #{att.nomor_percobaan}:{" "}
                                              <strong>{att.nilai}</strong> (Benar:{" "}
                                              {att.jumlah_benar}/{att.jumlah_soal})
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>

      {/* Modal Notifikasi */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
