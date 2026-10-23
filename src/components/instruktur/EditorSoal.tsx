"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, HelpCircle, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";

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

      if (!error && data) {
        setSoalList(data);
      }
    } catch (err) {
      console.error("Gagal load soal:", err);
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
      } else {
        const nextUrutan = soalList.length + 1;
        if (nextUrutan > 20) {
          setErrorMsg("Maksimal 20 butir soal kuis per modul (BR-03).");
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
      }

      setModalOpen(false);
      await loadSoal();
      if (onSoalCountChanged) onSoalCountChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan soal.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; urutan: number } | null>(null);
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

  const confirmDelete = (id: string, urutan: number) => {
    if (isLocked) return;
    setDeleteTarget({ id, urutan });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    try {
      const { error } = await supabase.from("soal").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setDeleteTarget(null);
      await loadSoal();
      if (onSoalCountChanged) onSoalCountChanged();
    } catch (err: unknown) {
      setAlertModal({
        isOpen: true,
        title: "Gagal Menghapus Soal",
        message: err instanceof Error ? err.message : String(err),
        type: "error",
      });
    }
  };

  const countOk = soalList.length >= 3 && soalList.length <= 20;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Soal Kuis: {modulJudul}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Syarat BR-03: Minimal 3 dan maksimal 20 butir soal per modul.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              countOk
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
            }`}
          >
            {soalList.length} / 20 Soal ({countOk ? "Memenuhi BR-03" : "Kurang (< 3)"})
          </span>

          {!isLocked && (
            <button
              onClick={openAddModal}
              disabled={soalList.length >= 20}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Tambah Soal
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          Memuat soal kuis...
        </div>
      ) : soalList.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <p>Belum ada soal pada modul ini. Tambahkan minimal 3 butir soal.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {soalList.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50/50 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-brand-100 text-brand-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {s.urutan}
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {s.pertanyaan}
                  </p>
                </div>

                {!isLocked && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1 rounded-md text-slate-500 hover:text-brand-600 hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(s.id, s.urutan)}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 text-xs">
                <div
                  className={`p-2 rounded-lg border ${
                    s.kunci_jawaban === "A"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  A: {s.pilihan_a}
                </div>
                <div
                  className={`p-2 rounded-lg border ${
                    s.kunci_jawaban === "B"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  B: {s.pilihan_b}
                </div>
                <div
                  className={`p-2 rounded-lg border ${
                    s.kunci_jawaban === "C"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  C: {s.pilihan_c}
                </div>
                <div
                  className={`p-2 rounded-lg border ${
                    s.kunci_jawaban === "D"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  D: {s.pilihan_d}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Soal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingSoal ? `Edit Soal Nomor ${editingSoal.urutan}` : "Tambah Butir Soal Kuis"}
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
                  Pertanyaan
                </label>
                <textarea
                  rows={3}
                  required
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  placeholder="Tuliskan pertanyaan kuis..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Empat Pilihan Jawaban & Tandai Kunci Jawaban Benar
                </label>

                {[
                  { key: "A", val: pilihanA, setVal: setPilihanA },
                  { key: "B", val: pilihanB, setVal: setPilihanB },
                  { key: "C", val: pilihanC, setVal: setPilihanC },
                  { key: "D", val: pilihanD, setVal: setPilihanD },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <label
                      title="Tandai sebagai Kunci Jawaban Benar"
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs cursor-pointer border transition flex-shrink-0 ${
                        kunciJawaban === opt.key
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
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
                    <input
                      type="text"
                      required
                      value={opt.val}
                      onChange={(e) => opt.setVal(e.target.value)}
                      placeholder={`Teks Pilihan Jawaban ${opt.key}`}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                ))}
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
                  {saving ? "Menyimpan..." : "Simpan Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Soal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="Hapus Butir Soal?"
        message={`Apakah Anda yakin ingin menghapus butir soal kuis nomor ${deleteTarget?.urutan}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Soal"
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
