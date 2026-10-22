"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  HelpCircle,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Lock,
  Sparkles,
} from "lucide-react";

interface SoalItem {
  id: string;
  urutan: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
}

interface FormKuisProps {
  pendaftaranId: string;
  modulId: string;
  nilaiLulus: number;
  isLulusModul: boolean;
  materiDibacaPada: string | null;
  onLulusSuccess?: () => void;
}

export default function FormKuis({
  pendaftaranId,
  modulId,
  nilaiLulus,
  isLulusModul,
  materiDibacaPada,
  onLulusSuccess,
}: FormKuisProps) {
  const supabase = createClient();

  const [soalList, setSoalList] = useState<SoalItem[]>([]);
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [loadingSoal, setLoadingSoal] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [riwayatPercobaan, setRiwayatPercobaan] = useState<any[]>([]);
  const [hasilTerakhir, setHasilTerakhir] = useState<any | null>(null);

  // Ambil riwayat percobaan dan daftar soal
  useEffect(() => {
    async function initKuis() {
      setLoadingSoal(true);
      setErrorMsg(null);
      try {
        // 1. Ambil riwayat percobaan kuis
        const { data: riwayat } = await supabase
          .from("percobaan_kuis")
          .select("*")
          .eq("pendaftaran_id", pendaftaranId)
          .eq("modul_id", modulId)
          .order("nomor_percobaan", { ascending: true });

        if (riwayat) {
          setRiwayatPercobaan(riwayat);
        }

        // 2. Ambil soal kuis tanpa kunci jawaban via RPC (INV-05)
        const { data: soalData, error: soalErr } = await supabase.rpc(
          "get_soal_kuis",
          {
            p_pendaftaran_id: pendaftaranId,
            p_modul_id: modulId,
          }
        );

        if (!soalErr && Array.isArray(soalData)) {
          setSoalList(soalData);
        } else if (soalErr) {
          console.warn("RPC get_soal_kuis error:", soalErr);
        }
      } catch (err) {
        console.error("Gagal inisialisasi kuis:", err);
      } finally {
        setLoadingSoal(false);
      }
    }

    if (materiDibacaPada) {
      initKuis();
    } else {
      setLoadingSoal(false);
    }
  }, [pendaftaranId, modulId, materiDibacaPada, supabase]);

  const jumlahPercobaan = riwayatPercobaan.length;
  const sisaPercobaan = Math.max(0, 3 - jumlahPercobaan);
  const isSudahLulus = isLulusModul || riwayatPercobaan.some((r) => r.lulus);
  const isPercobaanHabis = jumlahPercobaan >= 3 && !isSudahLulus;

  const handlePilihJawaban = (soalId: string, opsi: string) => {
    setJawaban((prev) => ({
      ...prev,
      [soalId]: opsi,
    }));
  };

  const handleKirimKuis = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validasi semua soal wajib dijawab (BR-09)
    for (const s of soalList) {
      if (!jawaban[s.id]) {
        setErrorMsg(`Soal nomor ${s.urutan} belum Anda jawab. Semua soal wajib dijawab!`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Panggil RPC database atomik kirim_jawaban_kuis (INV-04, INV-05, INV-06)
      const { data, error } = await supabase.rpc("kirim_jawaban_kuis", {
        p_pendaftaran_id: pendaftaranId,
        p_modul_id: modulId,
        p_jawaban: jawaban,
      });

      if (error) {
        setErrorMsg(error.message || "Gagal mengevaluasi kuis di database.");
        setSubmitting(false);
        return;
      }

      setHasilTerakhir(data);

      // Perbarui riwayat
      setRiwayatPercobaan((prev) => [
        ...prev,
        {
          nomor_percobaan: data.nomor_percobaan,
          nilai: data.nilai,
          jumlah_benar: data.jumlah_benar,
          jumlah_soal: data.jumlah_soal,
          lulus: data.lulus,
        },
      ]);

      if (data.lulus && onLulusSuccess) {
        onLulusSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan evaluasi kuis.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Kondisi jika materi belum ditandai dibaca (BR-08)
  if (!materiDibacaPada) {
    return (
      <div className="p-6 sm:p-8 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-3">
        <Lock className="w-8 h-8 text-amber-600 mx-auto" />
        <h4 className="font-bold text-slate-800 text-base">
          Kuis Masih Terkunci
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Silakan pelajari materi bacaan dan video di atas, kemudian tekan tombol{" "}
          <span className="font-bold text-brand-700">
            &quot;Tandai Materi Sudah Dibaca&quot;
          </span>{" "}
          untuk membuka lembar evaluasi kuis modul ini.
        </p>
      </div>
    );
  }

  // 2. Kondisi jika modul sudah lulus (INV-04: Modul lulus tidak bisa diuji ulang)
  if (isSudahLulus) {
    const highestScore = Math.max(
      ...riwayatPercobaan.map((r) => r.nilai),
      nilaiLulus
    );
    return (
      <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <Award className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-900 text-lg">
            Selamat! Anda Telah Lulus Modul Ini
          </h4>
          <p className="text-xs sm:text-sm text-emerald-800">
            Nilai Terbaik: <span className="font-extrabold text-base">{highestScore}</span> / 100 (Syarat Lulus: {nilaiLulus})
          </p>
        </div>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Sesuai aturan kurikulum, kuis pada modul yang telah berstatus lulus tidak dapat diulang kembali. Silakan lanjutkan ke modul berikutnya.
        </p>
      </div>
    );
  }

  // 3. Kondisi jika batas 3 kali percobaan habis (BR-10)
  if (isPercobaanHabis) {
    return (
      <div className="p-6 sm:p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <XCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-900 text-lg">
            Batas Percobaan Kuis Telah Habis
          </h4>
          <p className="text-xs sm:text-sm text-rose-800">
            Anda telah menggunakan seluruh 3 kali batas percobaan untuk modul ini tanpa mencapai nilai kelulusan {nilaiLulus}.
          </p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-rose-100 max-w-xs mx-auto text-xs text-slate-600 space-y-1">
          <span className="font-semibold block text-slate-700">Riwayat Nilai:</span>
          {riwayatPercobaan.map((r) => (
            <div key={r.nomor_percobaan} className="flex justify-between">
              <span>Percobaan ke-{r.nomor_percobaan}:</span>
              <span className="font-bold text-rose-600">{r.nilai} / 100</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kartu Header Kuis & Sisa Percobaan */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Kuis Evaluasi Modul
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Semua soal pilihan ganda dinilai langsung di server. Kunci jawaban tidak pernah dibocorkan.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Syarat Lulus: {nilaiLulus} / 100
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl font-bold border ${
              sisaPercobaan === 1
                ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                : "bg-brand-50 text-brand-700 border-brand-200"
            }`}
          >
            Sisa {sisaPercobaan} Percobaan
          </span>
        </div>
      </div>

      {/* Tampilan Hasil Evaluasi Kuis Terakhir */}
      {hasilTerakhir && (
        <div
          className={`p-6 rounded-2xl border text-center space-y-3 ${
            hasilTerakhir.lulus
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-amber-50 border-amber-300 text-amber-900"
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-lg font-extrabold">
            {hasilTerakhir.lulus ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>Selamat! Anda LULUS Kuis Ini</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <span>Belum Mencapai Nilai Kelulusan</span>
              </>
            )}
          </div>

          <div className="flex justify-center gap-6 text-sm">
            <div>
              <span className="text-xs block opacity-80">Nilai Anda:</span>
              <span className="text-2xl font-black">{hasilTerakhir.nilai}</span>
            </div>
            <div>
              <span className="text-xs block opacity-80">Jawaban Benar:</span>
              <span className="text-2xl font-black">
                {hasilTerakhir.jumlah_benar} / {hasilTerakhir.jumlah_soal}
              </span>
            </div>
          </div>

          {hasilTerakhir.kursus_selesai && (
            <div className="p-4 rounded-xl bg-white shadow-md border border-emerald-200 mt-3 space-y-2">
              <Sparkles className="w-6 h-6 text-accent-500 mx-auto" />
              <p className="font-bold text-slate-900 text-sm">
                Seluruh modul kursus telah Anda selesaikan!
              </p>
              <Link
                href={`/kursus-saya/${pendaftaranId}/sertifikat`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:bg-brand-700 transition"
              >
                <Award className="w-4 h-4" /> Buka & Cetak Sertifikat Resmi
              </Link>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Formulir Lembar Soal Kuis */}
      {loadingSoal ? (
        <div className="p-12 text-center text-slate-400 text-sm space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-600" />
          <p>Memuat butir soal kuis...</p>
        </div>
      ) : soalList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          Soal kuis untuk modul ini belum dikonfigurasi oleh instruktur.
        </div>
      ) : (
        <form onSubmit={handleKirimKuis} className="space-y-6">
          {soalList.map((soal) => {
            const jawabanAktif = jawaban[soal.id];
            const opsiList = [
              { label: "A", text: soal.pilihan_a },
              { label: "B", text: soal.pilihan_b },
              { label: "C", text: soal.pilihan_c },
              { label: "D", text: soal.pilihan_d },
            ];

            return (
              <div
                key={soal.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {soal.urutan}
                  </span>
                  <p className="font-semibold text-slate-800 text-sm sm:text-base leading-relaxed">
                    {soal.pertanyaan}
                  </p>
                </div>

                <div className="space-y-2 pl-10">
                  {opsiList.map((opsi) => {
                    const isSelected = jawabanAktif === opsi.label;
                    return (
                      <label
                        key={opsi.label}
                        onClick={() => handlePilihJawaban(soal.id, opsi.label)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition ${
                          isSelected
                            ? "bg-brand-50/80 border-brand-500 text-brand-900 shadow-xs"
                            : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center flex-shrink-0 transition ${
                            isSelected
                              ? "bg-brand-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {opsi.label}
                        </span>
                        <span className="flex-1 leading-relaxed">
                          {opsi.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-brand-500/25 disabled:opacity-50 transition flex items-center justify-center gap-2 group"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Mengevaluasi Jawaban di Server...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition" />
                  <span>Kirim Jawaban Kuis Sekarang</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Sistem akan mengunci percobaan secara atomik. Pastikan seluruh jawaban telah Anda periksa.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
