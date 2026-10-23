"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import AlertModal from "@/components/ui/AlertModal";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";

interface TombolDaftarKursusProps {
  kursusId: string;
  slug: string;
  harga: number;
  isPenuh: boolean;
}

export default function TombolDaftarKursus({
  kursusId,
  slug,
  harga,
  isPenuh,
}: TombolDaftarKursusProps) {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  const [checkingExisting, setCheckingExisting] = useState(false);
  const [existingPendaftaran, setExistingPendaftaran] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metodeBayar, setMetodeBayar] = useState<string>(
    harga === 0 ? "gratis" : "transfer_manual"
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);
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

  // Periksa apakah peserta sudah terdaftar di kursus ini
  useEffect(() => {
    async function checkRegistration() {
      if (!user || role !== "peserta") return;
      setCheckingExisting(true);
      try {
        const { data } = await supabase
          .from("pendaftaran")
          .select("id, status, nominal, batas_bayar")
          .eq("kursus_id", kursusId)
          .eq("peserta_id", user.id)
          .in("status", ["menunggu_bayar", "aktif", "selesai"])
          .order("didaftarkan_pada", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          // BR-05 & BR-07: Cek apakah pendaftaran menunggu_bayar telah lewat batas waktu (kedaluwarsa)
          const isExpired =
            data.status === "menunggu_bayar" &&
            data.batas_bayar &&
            new Date(data.batas_bayar) <= new Date();

          if (!isExpired) {
            setExistingPendaftaran(data);
          } else {
            // Sesuai BR-05: Peserta boleh mendaftar lagi bila pendaftaran sebelumnya kedaluwarsa
            setExistingPendaftaran(null);
          }
        }
      } catch (err) {
        console.warn("Gagal cek pendaftaran:", err);
      } finally {
        setCheckingExisting(false);
      }
    }

    checkRegistration();
  }, [user, role, kursusId, supabase]);

  const handleDaftarClick = () => {
    if (!user) {
      router.push(`/masuk?kembali=${encodeURIComponent(`/kursus/${slug}`)}`);
      return;
    }
    if (role !== "peserta") {
      setAlertModal({
        isOpen: true,
        title: "Peran Tidak Sesuai",
        message: "Hanya akun dengan peran Peserta yang dapat mendaftar kursus.",
        type: "info",
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleKonfirmasiDaftar = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Panggil RPC database atomik daftar_kursus (SECURITY DEFINER + FOR UPDATE)
      const { data, error } = await supabase.rpc("daftar_kursus", {
        p_kursus_id: kursusId,
        p_metode_bayar: metodeBayar,
      });

      if (error) {
        setErrorMsg(error.message || "Gagal mendaftar kursus.");
        setSubmitting(false);
        return;
      }

      setSuccessData(data);

      // Jika metode bayar Mayar, kita buat invoice tagihan
      if (metodeBayar === "mayar" && data?.pendaftaran_id) {
        try {
          const res = await fetch("/api/pembayaran/mayar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pendaftaran_id: data.pendaftaran_id }),
          });
          const mayarResult = await res.json();
          const paymentLink = mayarResult?.paymentUrl || mayarResult?.payment_url;
          if (paymentLink) {
            window.location.href = paymentLink;
            return;
          }
        } catch (mErr) {
          console.warn("Gagal inisialisasi Mayar, tetap lanjutkan pendaftaran:", mErr);
        }
      }

      setTimeout(() => {
        router.push("/kursus-saya");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran.";
      setErrorMsg(msg);
      setSubmitting(false);
    }
  };

  if (isPenuh) {
    return (
      <button
        disabled
        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-slate-200 text-slate-500 cursor-not-allowed text-center"
      >
        Kuota Kursus Penuh
      </button>
    );
  }

  if (user && role !== "peserta") {
    return (
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-slate-800">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Akun {role === "admin" ? "Admin" : "Instruktur"}</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Sesuai aturan sistem (BR-05), hanya akun berperan <strong>Peserta</strong> yang dapat mendaftar kursus.
        </p>
      </div>
    );
  }

  if (existingPendaftaran) {
    return (
      <div className="space-y-2">
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Anda sudah terdaftar di kursus ini ({existingPendaftaran.status})</span>
        </div>
        <button
          onClick={() => router.push("/kursus-saya")}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25 transition flex items-center justify-center gap-2"
        >
          Buka Ruang Belajar Saya <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleDaftarClick}
        disabled={checkingExisting}
        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2 group"
      >
        <Sparkles className="w-4 h-4 text-accent-300 group-hover:rotate-12 transition" />
        {user ? "Daftar Kursus Sekarang" : "Masuk untuk Mendaftar"}
      </button>

      {/* Modal Pilihan Metode Pembayaran & Konfirmasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Pendaftaran Kursus
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lembaga Kursus Pijar Aksara Depok
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successData && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  {successData.status === "aktif"
                    ? "Pendaftaran berhasil aktif! Mengalihkan ke ruang belajar..."
                    : "Pendaftaran tercatat. Mengalihkan ke tagihan Anda..."}
                </span>
              </div>
            )}

            {!successData && (
              <>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Biaya:</span>
                    <span className="font-bold text-slate-900">
                      {harga === 0
                        ? "Gratis (Rp 0)"
                        : new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(harga)}
                    </span>
                  </div>
                </div>

                {harga > 0 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Pilih Metode Pembayaran
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        metodeBayar === "transfer_manual"
                          ? "border-brand-500 bg-brand-50/50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="metode"
                        value="transfer_manual"
                        checked={metodeBayar === "transfer_manual"}
                        onChange={() => setMetodeBayar("transfer_manual")}
                        className="mt-1 text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-brand-600" /> Transfer Bank Manual
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Transfer langsung ke rekening lembaga & dikonfirmasi admin.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        metodeBayar === "mayar"
                          ? "border-brand-500 bg-brand-50/50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="metode"
                        value="mayar"
                        checked={metodeBayar === "mayar"}
                        onChange={() => setMetodeBayar("mayar")}
                        className="mt-1 text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-brand-600" /> Mayar Sandbox (Instan QRIS/VA)
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pembayaran otomatis terverifikasi via Mayar Sandbox Gateway.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleKonfirmasiDaftar}
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Setuju & Daftar"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Alert */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </>
  );
}
