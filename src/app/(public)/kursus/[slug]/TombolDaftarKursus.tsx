"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Building,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [checkingExisting, setCheckingExisting] = useState(false);
  const [existingPendaftaran, setExistingPendaftaran] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metodeBayar, setMetodeBayar] = useState<string>(
    harga === 0 ? "gratis" : "transfer_manual"
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

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
      toast.error("Hanya akun dengan peran Peserta yang dapat mendaftar kursus.");
      return;
    }
    setErrorMsg(null);
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

      // Jika pendaftaran langsung aktif (misal kursus gratis), kirim notifikasi email
      if (data?.status === "aktif" && data?.pendaftaran_id) {
        fetch("/api/notifikasi/pendaftaran-aktif", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pendaftaran_id: data.pendaftaran_id }),
        }).catch((nErr) =>
          console.warn(
            "Gagal mengirim email notifikasi pendaftaran aktif:",
            nErr
          )
        );
      }

      // Jika metode bayar Mayar, kita buat invoice tagihan
      if (metodeBayar === "mayar" && data?.pendaftaran_id) {
        try {
          const res = await fetch("/api/pembayaran/mayar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pendaftaran_id: data.pendaftaran_id }),
          });
          const mayarResult = await res.json();
          const paymentLink =
            mayarResult?.paymentUrl || mayarResult?.payment_url;
          if (paymentLink) {
            window.location.href = paymentLink;
            return;
          }
        } catch (mErr) {
          console.warn(
            "Gagal inisialisasi Mayar, tetap lanjutkan pendaftaran:",
            mErr
          );
        }
      }

      const targetTab = data?.status === "aktif" ? "aktif" : "menunggu_bayar";
      setTimeout(() => {
        router.push(
          `/kursus-saya?tab=${targetTab}${
            data?.pendaftaran_id
              ? `&pendaftaran_id=${data.pendaftaran_id}`
              : ""
          }`
        );
      }, 1200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat pendaftaran.";
      setErrorMsg(msg);
      setSubmitting(false);
    }
  };

  if (isPenuh) {
    return (
      <Button disabled className="w-full">
        Kuota Kursus Penuh
      </Button>
    );
  }

  if (user && role !== "peserta") {
    return (
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>
          Akun {role === "admin" ? "Admin" : "Instruktur"}
        </AlertTitle>
        <AlertDescription>
          Hanya akun dengan peran <strong>Peserta</strong> yang dapat mendaftar
          kursus.
        </AlertDescription>
      </Alert>
    );
  }

  if (existingPendaftaran) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 [&>svg]:text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle className="text-sm">Sudah terdaftar</AlertTitle>
            <AlertDescription>
              Anda sudah terdaftar di kursus ini (
              {existingPendaftaran.status}).
            </AlertDescription>
          </Alert>
          <Button
            type="button"
            className="w-full"
            onClick={() => router.push("/kursus-saya")}
          >
            Buka Ruang Belajar Saya
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        className="w-full"
        onClick={handleDaftarClick}
        disabled={checkingExisting || isLoading}
      >
        {checkingExisting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memeriksa pendaftaran...
          </>
        ) : (
          <>
            {user ? "Daftar Kursus Sekarang" : "Masuk untuk Mendaftar"}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-h-[85vh] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Konfirmasi Pendaftaran Kursus</DialogTitle>
            <DialogDescription>
              Lembaga Kursus Pijar Aksara Depok
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pendaftaran gagal</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {successData ? (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 [&>svg]:text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <AlertTitle>Pendaftaran tercatat</AlertTitle>
              <AlertDescription>
                {successData.status === "aktif"
                  ? "Pendaftaran berhasil aktif! Mengalihkan ke ruang belajar..."
                  : "Pendaftaran tercatat. Mengalihkan ke tagihan Anda..."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Total Biaya</span>
                  <span className="font-semibold">
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
                  <p className="text-sm font-medium">
                    Pilih Metode Pembayaran
                  </p>

                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                      metodeBayar === "transfer_manual"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="metode"
                      value="transfer_manual"
                      checked={metodeBayar === "transfer_manual"}
                      onChange={() => setMetodeBayar("transfer_manual")}
                      className="mt-1 h-4 w-4 accent-primary"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Building className="h-4 w-4 text-primary" />
                        Transfer Bank Manual
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Transfer langsung ke rekening lembaga &amp; dikonfirmasi
                        admin.
                      </p>
                    </div>
                  </label>

                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                      metodeBayar === "mayar"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="metode"
                      value="mayar"
                      checked={metodeBayar === "mayar"}
                      onChange={() => setMetodeBayar("mayar")}
                      className="mt-1 h-4 w-4 accent-primary"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Mayar Payment Gateway (Instan QRIS/VA)
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Pembayaran otomatis terverifikasi instan via QRIS,
                        Virtual Account, &amp; E-Wallet.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:space-x-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleKonfirmasiDaftar}
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Setuju & Daftar"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
