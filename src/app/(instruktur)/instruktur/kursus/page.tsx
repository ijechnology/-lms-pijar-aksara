"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  BookOpen,
  Plus,
  Users,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface KursusInstrukturItem {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan: string;
  harga: number;
  kuota: number;
  nilai_lulus: number;
  status: "draf" | "ditinjau" | "terbit" | "ditutup";
  catatan_tinjauan: string | null;
  dibuat_pada: string;
  modul_count: number;
  total_soal: number;
  peserta_count: number;
}

export default function InstrukturKursusPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  const [kursusList, setKursusList] = useState<KursusInstrukturItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form Buat Kursus Baru
  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [kategori, setKategori] = useState("Administrasi");
  const [ringkasan, setRingkasan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState<number>(150000);
  const [kuota, setKuota] = useState<number>(20);
  const [nilaiLulus, setNilaiLulus] = useState<number>(70);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Ajukan Kursus
  const [submittingCourseId, setSubmittingCourseId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadKursus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("kursus")
        .select(`
          id, judul, slug, kategori, ringkasan, harga, kuota, nilai_lulus,
          status, catatan_tinjauan, dibuat_pada,
          modul (id, soal (id)),
          pendaftaran (id)
        `)
        .eq("instruktur_id", user.id)
        .order("dibuat_pada", { ascending: false });

      if (!error && data) {
        const formatted: KursusInstrukturItem[] = data.map((k: any) => {
          const moduls = k.modul || [];
          let totalSoal = 0;
          moduls.forEach((m: any) => {
            totalSoal += (m.soal || []).length;
          });

          return {
            id: k.id,
            judul: k.judul,
            slug: k.slug,
            kategori: k.kategori,
            ringkasan: k.ringkasan,
            harga: k.harga,
            kuota: k.kuota,
            nilai_lulus: k.nilai_lulus,
            status: k.status,
            catatan_tinjauan: k.catatan_tinjauan,
            dibuat_pada: k.dibuat_pada,
            modul_count: moduls.length,
            total_soal: totalSoal,
            peserta_count: (k.pendaftaran || []).length,
          };
        });
        setKursusList(formatted);
      }
    } catch (err) {
      console.error("Gagal load kursus instruktur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKursus();
  }, [user]);

  const handleJudulChange = (val: string) => {
    setJudul(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setSlug(generatedSlug);
  };

  const handleCreateKursus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setFormError(null);

    try {
      const { data, error } = await supabase.from("kursus").insert({
        instruktur_id: user.id,
        judul: judul.trim(),
        slug: slug.trim(),
        kategori: kategori.trim(),
        ringkasan: ringkasan.trim(),
        deskripsi: deskripsi.trim(),
        harga,
        kuota,
        nilai_lulus: nilaiLulus,
        status: "draf",
      }).select().single();

      if (error) throw error;

      setModalOpen(false);
      setJudul("");
      setSlug("");
      setRingkasan("");
      setDeskripsi("");
      await loadKursus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat kursus baru.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const [targetAjukan, setTargetAjukan] = useState<KursusInstrukturItem | null>(null);

  const handleAjukan = async () => {
    if (!targetAjukan) return;

    setSubmittingCourseId(targetAjukan.id);
    setActionNotice(null);

    try {
      const { data, error } = await supabase.rpc("ajukan_kursus", {
        p_kursus_id: targetAjukan.id,
      });

      if (error) {
        setActionNotice({
          type: "error",
          text: error.message || "Pengajuan gagal. Pastikan memenuhi standar kurikulum (2–10 modul, 3–20 soal per modul).",
        });
      } else {
        setActionNotice({
          type: "success",
          text: data?.pesan || "Kursus berhasil diajukan untuk ditinjau oleh Admin.",
        });
        setTargetAjukan(null);
        await loadKursus();
      }
    } catch (err: unknown) {
      setActionNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan sistem saat mengajukan kursus.",
      });
    } finally {
      setSubmittingCourseId(null);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "draf":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            Draf
          </span>
        );
      case "ditinjau":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 animate-pulse">
            Sedang Ditinjau
          </span>
        );
      case "terbit":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            Terbit di Katalog
          </span>
        );
      case "ditutup":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            Ditutup
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Kursus Instruktur
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Susun modul, butir soal, ajukan review kurikulum, dan pantau nilai peserta.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Buat Kursus Baru
          </button>
        </div>

        {actionNotice && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
              actionNotice.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {actionNotice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            )}
            <span>{actionNotice.text}</span>
          </div>
        )}

        {loading || isLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm">Memuat daftar kursus Anda...</p>
          </div>
        ) : kursusList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              Belum Ada Kursus yang Dibuat
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Mulai buat kursus pelatihan pertama Anda dengan kurikulum terstruktur (2–10 modul).
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm"
            >
              Buat Kursus Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kursusList.map((kursus) => {
              const meetsBR03 = kursus.modul_count >= 2 && kursus.modul_count <= 10;

              return (
                <div
                  key={kursus.id}
                  onClick={() => router.push(`/instruktur/kursus/${kursus.id}`)}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5 flex flex-col justify-between hover:border-brand-400 hover:shadow-md transition duration-200 cursor-pointer group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                        {kursus.kategori}
                      </span>
                      {getStatusBadge(kursus.status)}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug">
                      {kursus.judul}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {kursus.ringkasan}
                    </p>

                    {/* Catatan Penolakan Admin (BR-02) */}
                    {kursus.status === "draf" && kursus.catatan_tinjauan && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                        <span className="font-bold flex items-center gap-1.5 text-rose-700">
                          <AlertCircle className="w-3.5 h-3.5" /> Catatan Tinjauan Admin:
                        </span>
                        <p className="italic leading-relaxed">{kursus.catatan_tinjauan}</p>
                      </div>
                    )}

                    {/* Statistik Kursus */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-[11px] text-slate-400 block">Modul</span>
                        <span className="text-sm font-bold text-slate-800">
                          {kursus.modul_count} Modul
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-[11px] text-slate-400 block">Total Soal</span>
                        <span className="text-sm font-bold text-slate-800">
                          {kursus.total_soal} Soal
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-[11px] text-slate-400 block">Peserta</span>
                        <span className="text-sm font-bold text-slate-800">
                          {kursus.peserta_count} Orang
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500 group-hover:text-brand-600 transition inline-flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition" />
                        {kursus.status === "draf" ? "Edit Kurikulum" : "Lihat Kurikulum"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/instruktur/kursus/${kursus.id}/peserta?from=kelola`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                      >
                        Peserta & Nilai
                      </Link>

                      {kursus.status === "draf" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetAjukan(kursus);
                          }}
                          disabled={submittingCourseId === kursus.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {submittingCourseId === kursus.id ? "Mengajukan..." : "Ajukan Review"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Buat Kursus Baru */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              Buat Kursus Baru (Status Awal: Draf)
            </h3>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateKursus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Kursus (5–120 Karakter)
                </label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={120}
                  value={judul}
                  onChange={(e) => handleJudulChange(e.target.value)}
                  placeholder="Misal: Mahir Excel Perkantoran"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Slug URL Kursus
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="mahir-excel-perkantoran"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kategori
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Administrasi">Administrasi</option>
                    <option value="Bisnis & Keuangan">Bisnis & Keuangan</option>
                    <option value="Desain Konten">Desain Konten</option>
                    <option value="Bahasa Asing">Bahasa Asing</option>
                    <option value="Teknologi Informasi">Teknologi Informasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Harga (Rp0 atau Rp50rb–5jt)
                  </label>
                  <input
                    type="number"
                    step={10000}
                    value={harga}
                    onChange={(e) => setHarga(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kuota Kursi (1–100)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={kuota}
                    onChange={(e) => setKuota(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nilai Kelulusan (50–100)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    required
                    value={nilaiLulus}
                    onChange={(e) => setNilaiLulus(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ringkasan Singkat (Maks 200 Karakter)
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={ringkasan}
                  onChange={(e) => setRingkasan(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu katalog..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Lengkap
                </label>
                <textarea
                  rows={4}
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Penjelasan mendalam tentang kursus, target peserta, dan hasil belajar..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Buat Kursus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Pengajuan Kursus */}
      <ConfirmModal
        isOpen={targetAjukan !== null}
        onClose={() => setTargetAjukan(null)}
        onConfirm={handleAjukan}
        title="Ajukan Kursus untuk Ditinjau?"
        message={`Apakah Anda yakin ingin mengajukan kursus "${targetAjukan?.judul}" untuk ditinjau oleh Admin? Setelah diajukan, kurikulum kursus akan terkunci dari pengeditan hingga proses review selesai.`}
        confirmLabel="Ya, Ajukan Review"
        cancelLabel="Batal"
        variant="primary"
        loading={submittingCourseId !== null}
      />
    </div>
  );
}
