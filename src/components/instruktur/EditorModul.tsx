"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Lock, FileText, Video, Download, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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

      if (fileToUpload) {
        if (fileToUpload.size > 10 * 1024 * 1024) {
          setErrorMsg("Ukuran file PDF maksimal 10 MB.");
          setSaving(false);
          return;
        }

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
        toast.success(`Modul ${editingModul.urutan} berhasil diperbarui.`);
      } else {
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
        toast.success(`Modul ${nextUrutan} berhasil ditambahkan.`);
      }

      setModalOpen(false);
      await onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan modul.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; judul: string } | null>(null);

  const confirmDelete = (id: string, judulModul: string) => {
    if (isLocked) return;
    setDeleteTarget({ id, judul: judulModul });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    try {
      const { error } = await supabase.from("modul").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success(`Modul "${deleteTarget.judul}" berhasil dihapus.`);
      setDeleteTarget(null);
      await onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus modul.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Daftar Modul Kurikulum ({modulList.length} / 10)
          </h3>
          <p className="text-xs text-muted-foreground">
            Syarat pengajuan kursus: 2 sampai 10 modul berurutan.
          </p>
        </div>

        {!isLocked && (
          <Button
            size="sm"
            onClick={openAddModal}
            disabled={modulList.length >= 10}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Modul
          </Button>
        )}
      </div>

      {isLocked && (
        <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Kurikulum terkunci (mode hanya-baca) karena status kursus bukan Draf.
          </span>
        </div>
      )}

      {modulList.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed text-muted-foreground text-xs space-y-2">
          <FileText className="h-8 w-8 text-muted-foreground/60 mx-auto" />
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
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-secondary/70 border-primary shadow-xs"
                    : "bg-card border-border hover:bg-accent/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {m.urutan}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{m.judul}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{m.durasi_menit} Menit</span>
                      {m.video_url && (
                        <span className="flex items-center gap-1 text-sky-600">
                          <Video className="h-3.5 w-3.5" /> Video
                        </span>
                      )}
                      {m.lampiran_path && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Download className="h-3.5 w-3.5" /> PDF
                        </span>
                      )}
                      <Badge variant="outline" className="font-medium text-[11px] h-5">
                        {m.soal_count ?? 0} Soal Kuis
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => onSelectModulForSoal(m)}
                    className="h-8 text-xs font-medium"
                  >
                    {isLocked ? "Lihat Detail" : isSelected ? "Aktif Dipilih" : "Kelola Kuis"}
                  </Button>

                  {!isLocked && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(m)}
                        title="Edit Modul"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit modul</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => confirmDelete(m.id, m.judul)}
                        title="Hapus Modul"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Hapus modul</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Modul */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingModul ? `Edit Modul ${editingModul.urutan}` : "Tambah Modul Baru"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi materi bacaan, durasi, dan video pembelajaran untuk modul ini.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="judulModul">Judul Modul</Label>
              <Input
                id="judulModul"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Misal: Format Tabel dan Rumus VLOOKUP"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="durasiMenit">Durasi Pembelajaran (Menit)</Label>
              <Input
                id="durasiMenit"
                type="number"
                min={5}
                max={240}
                required
                value={durasiMenit}
                onChange={(e) => setDurasiMenit(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="videoUrl">Tautan Video Pembelajaran (YouTube https://, Opsional)</Label>
              <Input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="isiMateri">Isi Materi Pembelajaran</Label>
              <Textarea
                id="isiMateri"
                rows={5}
                required
                value={isiMateri}
                onChange={(e) => setIsiMateri(e.target.value)}
                placeholder="Tuliskan materi pembelajaran modul secara lengkap di sini..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fileLampiran">Berkas Lampiran PDF (Maks 10 MB, Opsional)</Label>
              <Input
                id="fileLampiran"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                className="cursor-pointer file:font-medium file:text-xs file:bg-secondary file:border-0 file:rounded-md file:px-2 file:py-1"
              />
              {lampiranPath && !fileToUpload && (
                <p className="text-[11px] text-emerald-600 truncate mt-1">
                  File saat ini: {lampiranPath}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan Modul"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Modul */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Modul Kurikulum?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              <p>
                Apakah Anda yakin ingin menghapus modul <strong>&quot;{deleteTarget?.judul}&quot;</strong> beserta seluruh butir soal kuis di dalamnya?
              </p>
              <p className="text-xs text-muted-foreground">
                Tindakan ini permanen dan tidak dapat dibatalkan.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Ya, Hapus Modul
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
