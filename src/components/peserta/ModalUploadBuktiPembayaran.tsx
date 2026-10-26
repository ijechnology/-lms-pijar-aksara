"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileCheck,
  Image as ImageIcon,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface ModalUploadBuktiPembayaranProps {
  isOpen: boolean;
  onClose: () => void;
  pendaftaranId: string;
  kursusJudul: string;
  nominal: number;
  currentBuktiUrl?: string | null;
  currentCatatan?: string | null;
  onSuccess: () => void;
}

export function ModalUploadBuktiPembayaran({
  isOpen,
  onClose,
  pendaftaranId,
  kursusJudul,
  nominal,
  currentBuktiUrl,
  currentCatatan,
  onSuccess,
}: ModalUploadBuktiPembayaranProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentBuktiUrl || null
  );
  const [catatan, setCatatan] = useState<string>(currentCatatan || "");
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasi ukuran maks 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran berkas maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    // Validasi tipe berkas
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Format berkas harus berupa JPG, PNG, WEBP, atau PDF.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !currentBuktiUrl) {
      setErrorMsg("Silakan pilih berkas bukti pembayaran terlebih dahulu.");
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    try {
      let finalBuktiUrl = currentBuktiUrl || "";

      // Jika ada berkas baru yang dipilih, upload ke Supabase Storage
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${pendaftaranId}_${Date.now()}.${fileExt}`;
        const filePath = `bukti/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("bukti-pembayaran")
          .upload(filePath, selectedFile, {
            upsert: true,
            contentType: selectedFile.type,
          });

        if (uploadError) {
          throw new Error(`Gagal mengunggah berkas: ${uploadError.message}`);
        }

        // Ambil Public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("bukti-pembayaran").getPublicUrl(filePath);

        finalBuktiUrl = publicUrl;
      }

      // Simpan URL bukti bayar ke database via RPC (aman & terisolasi)
      const { error: rpcError } = await supabase.rpc(
        "unggah_bukti_pembayaran",
        {
          p_pendaftaran_id: pendaftaranId,
          p_bukti_bayar_url: finalBuktiUrl,
          p_catatan: catatan.trim() || null,
        }
      );

      if (rpcError) {
        // Fallback ke update langsung jika RPC belum tersedia
        const { error: updateError } = await supabase
          .from("pendaftaran")
          .update({
            bukti_bayar_url: finalBuktiUrl,
            bukti_bayar_pada: new Date().toISOString(),
            catatan_pembayaran: catatan.trim() || null,
          })
          .eq("id", pendaftaranId);

        if (updateError) {
          throw new Error(
            `Gagal menyimpan data pembayaran: ${
              updateError.message || rpcError.message
            }`
          );
        }
      }

      toast.success(
        "Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin."
      );
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengunggah bukti."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !uploading) onClose();
      }}
    >
      <DialogContent
        className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-0"
        onEscapeKeyDown={(event) => {
          if (uploading) event.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 border-b bg-muted/30 px-6 py-4 pr-14">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="break-words">
                Unggah Bukti Pembayaran
              </DialogTitle>
              <DialogDescription>
                Lembaga Kursus Pijar Aksara
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleUpload}
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-6 py-5">
          <div className="space-y-1 rounded-lg border bg-muted/30 p-4">
            <span className="block text-xs text-muted-foreground">
              Kursus yang Didaftarkan
            </span>
            <p className="line-clamp-1 text-sm font-semibold">{kursusJudul}</p>
            <div className="flex items-center justify-between gap-3 border-t pt-2 text-xs">
              <span className="text-muted-foreground">
                Total Nominal Transfer
              </span>
              <span className="text-base font-semibold">
                {formatRupiah(nominal)}
              </span>
            </div>
          </div>

          {errorMsg && (
            <Alert variant="destructive">
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="bukti-pembayaran">
              Berkas Bukti Transfer / Struk Bank{" "}
              <span className="text-destructive">*</span>
            </Label>

            <input
              id="bukti-pembayaran"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full rounded-lg border-2 border-dashed p-5 text-center transition ${
                selectedFile || previewUrl
                  ? "border-emerald-400 bg-emerald-50/30"
                  : "border-input hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              {previewUrl ? (
                <span className="block space-y-3">
                  <span className="mx-auto flex max-h-48 max-w-full items-center justify-center overflow-hidden rounded-md border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview Bukti Pembayaran"
                      className="max-h-48 object-contain"
                    />
                  </span>
                  <span className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-700">
                    <FileCheck className="h-4 w-4" />
                    <span className="truncate">
                      {selectedFile
                        ? selectedFile.name
                        : "Bukti pembayaran siap diunggah"}
                    </span>
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Klik untuk memilih berkas gambar lain
                  </span>
                </span>
              ) : selectedFile ? (
                <span className="block space-y-2 py-2">
                  <FileCheck className="mx-auto h-8 w-8 text-emerald-600" />
                  <span className="block truncate text-xs font-medium">
                    {selectedFile.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(0)} KB • Klik untuk
                    mengganti
                  </span>
                </span>
              ) : (
                <span className="block space-y-2 py-3">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <ImageIcon className="h-5 w-5" />
                  </span>
                  <span className="block">
                    <span className="text-xs font-medium text-primary hover:underline">
                      Pilih foto atau dokumen struk transfer
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      JPG, PNG, WEBP, atau PDF (Maks. 5 MB)
                    </span>
                  </span>
                </span>
              )}
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="catatan-pembayaran">
              Catatan Pengirim (Opsional)
            </Label>
            <Input
              id="catatan-pembayaran"
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Transfer via BCA an Rizki Pratama"
            />
            <p className="text-[11px] text-muted-foreground">
              Sertakan nama pemilik rekening atau bank pengirim untuk
              mempercepat proses verifikasi oleh Admin.
            </p>
          </div>
          </div>

          <DialogFooter className="shrink-0 flex-col gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:justify-end sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              className="w-full sm:w-auto sm:flex-1"
            >
              Tutup
            </Button>
            <Button
              type="submit"
              disabled={uploading || (!selectedFile && !currentBuktiUrl)}
              className="w-full sm:w-auto sm:flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Simpan &amp; Kirim Bukti
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
