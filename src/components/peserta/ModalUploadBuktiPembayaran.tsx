"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileCheck,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentBuktiUrl || null);
  const [catatan, setCatatan] = useState<string>(currentCatatan || "");
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      return;
    }

    // Validasi tipe berkas
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Format berkas harus berupa JPG, PNG, WEBP, atau PDF.");
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
    setSuccessMsg(null);

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
      const { error: rpcError } = await supabase.rpc("unggah_bukti_pembayaran", {
        p_pendaftaran_id: pendaftaranId,
        p_bukti_bayar_url: finalBuktiUrl,
        p_catatan: catatan.trim() || null,
      });

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
          throw new Error(`Gagal menyimpan data pembayaran: ${updateError.message || rpcError.message}`);
        }
      }

      setSuccessMsg("Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah bukti.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Unggah Bukti Pembayaran
              </h2>
              <p className="text-xs text-slate-500">
                Lembaga Kursus Pijar Aksara
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleUpload} className="p-6 space-y-5 overflow-y-auto">
          {/* Ringkasan Tagihan */}
          <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100/80 space-y-1">
            <span className="text-xs text-slate-500 block">Kursus yang Didaftarkan:</span>
            <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{kursusJudul}</h4>
            <div className="flex items-center justify-between pt-2 border-t border-brand-100/60 text-xs">
              <span className="text-slate-600 font-medium">Total Nominal Transfer:</span>
              <span className="text-base font-black text-brand-700">{formatRupiah(nominal)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Area Upload File */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Berkas Bukti Transfer / Struk Bank <span className="text-rose-500">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                selectedFile || previewUrl
                  ? "border-emerald-400 bg-emerald-50/30"
                  : "border-slate-200 hover:border-brand-400 hover:bg-slate-50"
              }`}
            >
              {previewUrl ? (
                <div className="space-y-3">
                  <div className="relative mx-auto max-h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview Bukti Pembayaran"
                      className="max-h-48 object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
                    <FileCheck className="w-4 h-4" />
                    <span>{selectedFile ? selectedFile.name : "Bukti pembayaran siap diunggah"}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Klik untuk memilih berkas gambar lain</span>
                </div>
              ) : selectedFile ? (
                <div className="space-y-2 py-2">
                  <FileCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {(selectedFile.size / 1024).toFixed(0)} KB • Klik untuk mengganti
                  </p>
                </div>
              ) : (
                <div className="space-y-2 py-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-700 hover:underline">
                      Pilih foto atau dokumen struk transfer
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      JPG, PNG, WEBP, atau PDF (Maks. 5 MB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Catatan / Rekening Pengirim */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Catatan Pengirim (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Transfer via BCA an Rizki Pratama"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition"
            />
            <p className="text-[11px] text-slate-400">
              Sertakan nama pemilik rekening atau bank pengirim untuk mempercepat proses verifikasi oleh Admin.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={uploading || (!selectedFile && !currentBuktiUrl)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Simpan &amp; Kirim Bukti
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
