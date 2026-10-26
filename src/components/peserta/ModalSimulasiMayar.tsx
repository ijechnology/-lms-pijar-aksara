"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  QrCode,
  ShieldCheck,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface MayarSimulasiData {
  id: string;
  nominal: number;
  kursus?: {
    judul: string;
  };
}

interface ModalSimulasiMayarProps {
  isOpen: boolean;
  onClose: () => void;
  data: MayarSimulasiData | null;
  onSuccess: (message: string) => void;
}

export function ModalSimulasiMayar({
  isOpen,
  onClose,
  data,
  onSuccess,
}: ModalSimulasiMayarProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setLoading(false);
    }
  }, [isOpen, data?.id]);

  if (!isOpen || !data) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSimulasiBayar = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/pembayaran/mayar/simulasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaran_id: data.id }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Gagal memproses simulasi pembayaran Mayar."
        );
      }

      onSuccess(
        result.message ||
          "Simulasi pembayaran Mayar berhasil! Akses kursus telah dibuka."
      );
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Terjadi kesalahan sistem."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) onClose();
      }}
    >
      <DialogContent
        className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 overflow-hidden p-0"
        onEscapeKeyDown={(event) => {
          if (loading) event.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 border-b bg-highlight/30 px-6 py-4 pr-14">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-highlight text-highlight-foreground">
              <CreditCard className="h-5 w-5" />
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="break-words">
                Gerbang Pembayaran Mayar
              </DialogTitle>
              <DialogDescription>
                Selesaikan pembayaran pendaftaran kursus Anda.
              </DialogDescription>
              <Badge variant="highlight" className="w-fit">
                Verifikasi Langsung
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-6 py-5">
          <div className="space-y-1.5 rounded-lg border bg-muted/30 p-4">
            <span className="block text-xs text-muted-foreground">
              Pendaftaran Kursus
            </span>
            <span className="block text-sm font-semibold leading-snug">
              {data.kursus?.judul || "Kursus"}
            </span>
            <div className="flex items-baseline justify-between gap-3 border-t pt-2">
              <span className="text-xs text-muted-foreground">
                Nominal Tagihan
              </span>
              <span className="text-lg font-semibold">
                {formatRupiah(data.nominal)}
              </span>
            </div>
          </div>

          <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs">
            <p className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Kanal Pembayaran Terintegrasi
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Sistem telah terhubung dengan kanal Mayar. Klik tombol di bawah
              untuk menyelesaikan proses verifikasi pembayaran pendaftaran
              kursus Anda secara instan.
            </p>
          </div>

          {errorMsg && (
            <Alert variant="destructive">
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 rounded-lg border border-dashed p-4 text-center">
            <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">
              Kanal Pembayaran QRIS / Virtual Account &amp; E-Wallet
            </p>
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-col gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="sm:flex-1"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSimulasiBayar}
            disabled={loading}
            className="bg-highlight text-highlight-foreground hover:bg-highlight/80 sm:flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Konfirmasi Pembayaran Selesai
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
