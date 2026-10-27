"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, HelpCircle, AlertCircle, Loader2 } from "lucide-react";
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

export interface SoalData {
  id: string;
  modul_id: string;
  urutan: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  kunci_jawaban: string;
}

interface EditorSoalProps {
  modulId: string;
  modulJudul: string;
  isLocked: boolean; // True jika status kursus bukan 'draf' (INV-03, BR-04)
  onSoalCountChanged?: () => void;
}

export default function EditorSoal({
  modulId,
  modulJudul,
  isLocked,
  onSoalCountChanged,
}: EditorSoalProps) {
  const supabase = createClient();
  const [soalList, setSoalList] = useState<SoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSoal, setEditingSoal] = useState<SoalData | null>(null);

  const [pertanyaan, setPertanyaan] = useState("");
  const [pilihanA, setPilihanA] = useState("");
  const [pilihanB, setPilihanB] = useState("");
  const [pilihanC, setPilihanC] = useState("");
  const [pilihanD, setPilihanD] = useState("");
  const [kunciJawaban, setKunciJawaban] = useState<string>("A");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSoal = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("soal")
        .select("*")
        .eq("modul_id", modulId)
        .order("urutan", { ascending: true });

      if (error) throw error;
      if (data) {
        setSoalList(data);
      }
    } catch (err) {
      console.error("Gagal load soal:", err);
      toast.error("Gagal memuat soal kuis.");
    } finally {
      setLoading(false);
    }
  }, [modulId, supabase]);

  useEffect(() => {
    loadSoal();
  }, [loadSoal]);

  const openAddModal = () => {
    if (isLocked) return;
    setEditingSoal(null);
    setPertanyaan("");
    setPilihanA("");
    setPilihanB("");
    setPilihanC("");
    setPilihanD("");
    setKunciJawaban("A");
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (s: SoalData) => {
    if (isLocked) return;
    setEditingSoal(s);
    setPertanyaan(s.pertanyaan);
    setPilihanA(s.pilihan_a);
    setPilihanB(s.pilihan_b);
    setPilihanC(s.pilihan_c);
    setPilihanD(s.pilihan_d);
    setKunciJawaban(s.kunci_jawaban);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingSoal) {
        const { error } = await supabase
          .from("soal")
          .update({
            pertanyaan: pertanyaan.trim(),
            pilihan_a: pilihanA.trim(),
            pilihan_b: pilihanB.trim(),
            pilihan_c: pilihanC.trim(),
            pilihan_d: pilihanD.trim(),
            kunci_jawaban: kunciJawaban,
          })
          .eq("id", editingSoal.id);

        if (error) throw error;
        toast.success(`Soal nomor ${editingSoal.urutan} berhasil diperbarui.`);
      } else {
        const nextUrutan = soalList.length + 1;
        if (nextUrutan > 20) {
          setErrorMsg("Maksimal 20 butir soal kuis per modul.");
          setSaving(false);
          return;
        }

        const { error } = await supabase.from("soal").insert({
          modul_id: modulId,
          urutan: nextUrutan,
          pertanyaan: pertanyaan.trim(),
          pilihan_a: pilihanA.trim(),
          pilihan_b: pilihanB.trim(),
          pilihan_c: pilihanC.trim(),
          pilihan_d: pilihanD.trim(),
          kunci_jawaban: kunciJawaban,
        });

        if (error) throw error;
        toast.success(`Soal nomor ${nextUrutan} berhasil ditambahkan.`);
      }

      setModalOpen(false);
      await loadSoal();
      if (onSoalCountChanged) onSoalCountChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan soal.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; urutan: number } | null>(null);

  const confirmDelete = (id: string, urutan: number) => {
    if (isLocked) return;
    setDeleteTarget({ id, urutan });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    try {
      const { error } = await supabase.from("soal").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success(`Soal nomor ${deleteTarget.urutan} berhasil dihapus.`);
      setDeleteTarget(null);
      await loadSoal();
      if (onSoalCountChanged) onSoalCountChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus soal.";
      toast.error(msg);
    }
  };

  const countOk = soalList.length >= 3 && soalList.length <= 20;

  return (
    <div className="rounded-xl border bg-card text-card-foreground p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              Soal Kuis: {modulJudul}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ketentuan: Minimal 3 dan maksimal 20 butir soal per modul.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={countOk ? "default" : "destructive"}
            className="text-xs font-medium"
          >
            {soalList.length} / 20 Soal ({countOk ? "Memenuhi syarat" : "Kurang (< 3)"})
          </Badge>

          {!isLocked && (
            <Button
              size="sm"
              onClick={openAddModal}
              disabled={soalList.length >= 20}
              className="gap-1.5 h-8 text-xs font-medium"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Soal
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground text-xs">
          Memuat soal kuis...
        </div>
      ) : soalList.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground text-xs space-y-2">
          <HelpCircle className="h-8 w-8 text-muted-foreground/60 mx-auto" />
          <p>Belum ada soal pada modul ini. Tambahkan minimal 3 butir soal pilihan ganda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {soalList.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl border hover:bg-accent/30 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-secondary text-foreground font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {s.urutan}
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {s.pertanyaan}
                  </p>
                </div>

                {!isLocked && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditModal(s)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit soal</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => confirmDelete(s.id, s.urutan)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Hapus soal</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 text-xs">
                <div
                  className={`p-2.5 rounded-md border ${
                    s.kunci_jawaban === "A"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                      : "bg-muted/40 border-border text-muted-foreground"
                  }`}
                >
                  <span className="font-bold mr-1">A.</span> {s.pilihan_a}
                </div>
                <div
                  className={`p-2.5 rounded-md border ${
                    s.kunci_jawaban === "B"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                      : "bg-muted/40 border-border text-muted-foreground"
                  }`}
                >
                  <span className="font-bold mr-1">B.</span> {s.pilihan_b}
                </div>
                <div
                  className={`p-2.5 rounded-md border ${
                    s.kunci_jawaban === "C"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                      : "bg-muted/40 border-border text-muted-foreground"
                  }`}
                >
                  <span className="font-bold mr-1">C.</span> {s.pilihan_c}
                </div>
                <div
                  className={`p-2.5 rounded-md border ${
                    s.kunci_jawaban === "D"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                      : "bg-muted/40 border-border text-muted-foreground"
                  }`}
                >
                  <span className="font-bold mr-1">D.</span> {s.pilihan_d}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Soal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSoal ? `Edit Soal Nomor ${editingSoal.urutan}` : "Tambah Butir Soal Kuis"}
            </DialogTitle>
            <DialogDescription>
              Tuliskan pertanyaan, empat pilihan jawaban, dan tentukan kunci jawaban yang benar.
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
              <Label htmlFor="pertanyaanSoal">Pertanyaan Kuis</Label>
              <Textarea
                id="pertanyaanSoal"
                rows={3}
                required
                value={pertanyaan}
                onChange={(e) => setPertanyaan(e.target.value)}
                placeholder="Tuliskan pertanyaan evaluasi..."
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pilihan Jawaban & Tandai Kunci Jawaban Benar
              </Label>

              {[
                { key: "A", val: pilihanA, setVal: setPilihanA },
                { key: "B", val: pilihanB, setVal: setPilihanB },
                { key: "C", val: pilihanC, setVal: setPilihanC },
                { key: "D", val: pilihanD, setVal: setPilihanD },
              ].map((opt) => (
                <div key={opt.key} className="flex items-center gap-2">
                  <label
                    title="Tandai sebagai Kunci Jawaban Benar"
                    className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs cursor-pointer border transition-colors shrink-0 ${
                      kunciJawaban === opt.key
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-muted text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="kunci"
                      value={opt.key}
                      checked={kunciJawaban === opt.key}
                      onChange={() => setKunciJawaban(opt.key)}
                      className="sr-only"
                    />
                    {opt.key}
                  </label>
                  <Input
                    type="text"
                    required
                    value={opt.val}
                    onChange={(e) => opt.setVal(e.target.value)}
                    placeholder={`Pilihan Jawaban ${opt.key}`}
                    className="flex-1"
                  />
                </div>
              ))}
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
                {saving ? "Menyimpan..." : "Simpan Soal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Soal */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Butir Soal?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              <p>
                Apakah Anda yakin ingin menghapus butir soal kuis nomor <strong>{deleteTarget?.urutan}</strong>?
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
              Ya, Hapus Soal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
