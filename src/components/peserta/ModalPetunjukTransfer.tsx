"use client";

import { useState } from "react";
import { Building2, Check, Clock, Copy, ShieldCheck } from "lucide-react";

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

export interface TransferRegistrationData {
  id: string;
  nominal: number;
  batas_bayar?: string | null;
  kursus?: {
    judul: string;
    slug?: string;
  };
}

interface ModalPetunjukTransferProps {
  isOpen: boolean;
  onClose: () => void;
  data: TransferRegistrationData | null;
  onOpenUpload?: () => void;
}

export function ModalPetunjukTransfer({
  isOpen,
  onClose,
  data,
  onOpenUpload,
}: ModalPetunjukTransferProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const transferCode = `PA-REG-${data.id.slice(0, 8).toUpperCase()}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4 pr-14">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="break-words">
                Petunjuk Transfer Bank Manual
              </DialogTitle>
              <DialogDescription>
                Lembaga Kursus Pijar Aksara
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 min-w-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-6 py-5">
          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <div className="text-xs text-muted-foreground">
              Kursus:{" "}
              <span className="font-medium text-foreground">
                {data.kursus?.judul || "Kursus"}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-2">
              <div>
                <span className="block text-xs text-muted-foreground">
                  Total Tagihan Transfer
                </span>
                <span className="text-xl font-semibold tracking-tight">
                  {formatRupiah(data.nominal)}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(data.nominal.toString(), "nominal")
                }
              >
                {copiedField === "nominal" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Salin Jumlah
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rekening Bank Resmi Lembaga
            </p>

            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">
                  Bank Central Asia (BCA)
                </span>
                <Badge variant="secondary">Verifikasi Cepat</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-base font-semibold tracking-wider">
                    8830-1928-441
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    a.n. Lembaga Kursus Pijar Aksara
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => copyToClipboard("88301928441", "bca")}
                  aria-label="Salin nomor rekening BCA"
                >
                  {copiedField === "bca" ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">Bank Mandiri</span>
                <Badge variant="secondary">Verifikasi Cepat</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-base font-semibold tracking-wider">
                    137-00-9821-4412
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    a.n. Lembaga Kursus Pijar Aksara
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => copyToClipboard("1370098214412", "mandiri")}
                  aria-label="Salin nomor rekening Mandiri"
                >
                  {copiedField === "mandiri" ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1 rounded-lg border bg-muted/30 p-3.5">
            <span className="block text-xs text-muted-foreground">
              Berita / Catatan Transfer
            </span>
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 break-all font-mono text-sm font-semibold">
                {transferCode}
              </span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => copyToClipboard(transferCode, "code")}
              >
                {copiedField === "code" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Salin Kode
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            {data.batas_bayar && (
              <div className="flex items-center gap-1.5 font-medium text-highlight-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Batas Waktu Bayar:{" "}
                  <strong>
                    {new Date(data.batas_bayar).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>{" "}
                  (24 jam)
                </span>
              </div>
            )}

            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-900">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium">Alur Verifikasi Pembayaran</p>
                <p className="mt-0.5 leading-relaxed text-emerald-800">
                  Setelah Anda melakukan transfer, silakan unggah foto/berkas
                  struk bukti pembayaran pada tab{" "}
                  <strong>Menunggu Pembayaran</strong>. Tim Administrator
                  Lembaga Pijar Aksara akan memverifikasi bukti tersebut dan
                  modul belajar akan otomatis terbuka seketika.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-col gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:justify-between sm:space-x-0">
          {onOpenUpload ? (
            <Button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
            >
              Sudah Transfer? Unggah Bukti
            </Button>
          ) : (
            <div />
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
