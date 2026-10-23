"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Lock, FileText, Video, Download, Upload, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";

export interface ModulData {
  id: string;
  kursus_id: string;
  urutan: number;
  judul: string;
  isi_materi: string;
  video_url: string | null;
  lampiran_path: string | null;
  durasi_menit: number;
  soal_count?: number;
}

interface EditorModulProps {
  kursusId: string;
  isLocked: boolean; // True jika status kursus bukan 'draf' (INV-03, BR-04)
  modulList: ModulData[];
  onRefresh: () => Promise<void>;
  onSelectModulForSoal: (modul: ModulData) => void;
  selectedModulId: string | null;
}

export default function EditorModul({
  kursusId,
  isLocked,
  modulList,
  onRefresh,
  onSelectModulForSoal,
  selectedModulId,
}: EditorModulProps) {
  const supabase = createClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModul, setEditingModul] = useState<ModulData | null>(null);

  const [judul, setJudul] = useState("");
  const [isiMateri, setIsiMateri] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durasiMenit, setDurasiMenit] = useState(45);
  const [lampiranPath, setLampiranPath] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openAddModal = () => {
    if (isLocked) return;
    setEditingModul(null);
    setJudul("");
    setIsiMateri("");
    setVideoUrl("");
    setDurasiMenit(45);
    setLampiranPath(null);
    setFileToUpload(null);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (m: ModulData) => {
    if (isLocked) return;
    setEditingModul(m);
    setJudul(m.judul);
    setIsiMateri(m.isi_materi);
    setVideoUrl(m.video_url || "");
    setDurasiMenit(m.durasi_menit);
    setLampiranPath(m.lampiran_path);
    setFileToUpload(null);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      let finalLampiranPath = lampiranPath;

      // Upload file PDF ke Supabase Storage (bucket privat modul-lampiran) jika ada file baru
      if (fileToUpload) {
        if (fileToUpload.size > 10 * 1024 * 1024) {
          setErrorMsg("Ukuran file PDF maksimal 10 MB.");
          setSaving(false);
          return;
        }

        const ext = fileToUpload.name.split(".").pop();
        const cleanName = fileToUpload.name.replace(/[^a-zA-Z0-9_-]/g, "_");
        const filePath = `${kursusId}/${Date.now()}_${cleanName}`;

        const { error: uploadErr } = await supabase.storage
          .from("modul-lampiran")
          .upload(filePath, fileToUpload, { upsert: true });

        if (uploadErr) {
          setErrorMsg("Gagal mengunggah PDF: " + uploadErr.message);
          setSaving(false);
          return;
        }

        finalLampiranPath = filePath;
      }

      if (editingModul) {
        // Update modul
        const { error } = await supabase
          .from("modul")
          .update({
            judul: judul.trim(),
            isi_materi: isiMateri.trim(),
            video_url: videoUrl.trim() || null,
            lampiran_path: finalLampiranPath,
            durasi_menit: durasiMenit,
          })
          .eq("id", editingModul.id);

        if (error) throw error;
      } else {
        // Insert modul baru (urutan = modulList.length + 1)
        const nextUrutan = modulList.length + 1;
        if (nextUrutan > 10) {
          setErrorMsg("Maksimal 10 modul per kursus.");
          setSaving(false);
          return;
        }

        const { error } = await supabase.from("modul").insert({
          kursus_id: kursusId,
          urutan: nextUrutan,
          judul: judul.trim(),
          isi_materi: isiMateri.trim(),
          video_url: videoUrl.trim() || null,
          lampiran_path: finalLampiranPath,
          durasi_menit: durasiMenit,
        });

        if (error) throw error;
      }

      setModalOpen(false);
      await onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan modul.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; judul: string } | null>(null);
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

  const confirmDelete = (id: string, judulModul: string) => {
    if (isLocked) return;
    setDeleteTarget({ id, judul: judulModul });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    try {
      const { error } = await supabase.from("modul").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setDeleteTarget(null);
      await onRefresh();
    } catch (err: unknown) {
      setAlertModal({
        isOpen: true,
        title: "Gagal Menghapus Modul",
        message: err instanceof Error ? err.message : String(err),
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Daftar Modul Kurikulum ({modulList.length} / 10)
          </h3>
          <p className="text-xs text-slate-500">
            Syarat pengajuan kursus: 2 sampai 10 modul berurutan.
          </p>
        </div>

        {!isLocked && (
          <button
            onClick={openAddModal}
            disabled={modulList.length >= 10}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Tambah Modul
          </button>
        )}
      </div>

      {isLocked && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>
            Kurikulum terkunci (mode hanya-baca) karena kursus tidak sedang berstatus Draf (BR-04).
          </span>
        </div>
      )}

      {modulList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-2">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <p>Belum ada modul kurikulum yang dibuat.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {modulList.map((m) => {
            const isSelected = selectedModulId === m.id;
            return (
              <div
                key={m.id}
                onClick={() => onSelectModulForSoal(m)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-brand-50/80 border-brand-400 shadow-xs"
                    : "bg-white border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${
                      isSelected
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {m.urutan}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{m.judul}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{m.durasi_menit} Menit</span>
                      {m.video_url && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Video className="w-3.5 h-3.5" /> Ada Video
                        </span>
                      )}
                      {m.lampiran_path && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Download className="w-3.5 h-3.5" /> Ada PDF
                        </span>
                      )}
                      <span className="font-semibold text-slate-700">
                        {m.soal_count ?? 0} Butir Soal Kuis
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectModulForSoal(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isLocked ? "Lihat Detail" : "Lihat & Kelola"}
                  </button>

                  {!isLocked && (
                    <>
                      <button
                        onClick={() => openEditModal(m)}
                        title="Edit Modul"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(m.id, m.judul)}
                        title="Hapus Modul"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Modul */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingModul ? `Edit Modul ${editingModul.urutan}` : "Tambah Modul Baru"}
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Modul
                </label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Misal: Format Tabel dan Rumus VLOOKUP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Durasi Pembelajaran (Menit)
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  required
                  value={durasiMenit}
                  onChange={(e) => setDurasiMenit(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tautan Video Pembelajaran (Opsional, YouTube https://)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Isi Materi Bacaan
                </label>
                <textarea
                  rows={5}
                  required
                  value={isiMateri}
                  onChange={(e) => setIsiMateri(e.target.value)}
                  placeholder="Tuliskan materi pembelajaran modul secara lengkap di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Berkas Lampiran PDF (Maks 10 MB, Opsional)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                {lampiranPath && !fileToUpload && (
                  <p className="text-[11px] text-emerald-600 mt-1 truncate">
                    File saat ini: {lampiranPath}
                  </p>
                )}
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
                  {saving ? "Menyimpan..." : "Simpan Modul"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Modul */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="Hapus Modul Kurikulum?"
        message={`Apakah Anda yakin ingin menghapus modul "${deleteTarget?.judul}" beserta seluruh butir soal kuis di dalamnya? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Modul"
        cancelLabel="Batal"
        variant="danger"
      />

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
