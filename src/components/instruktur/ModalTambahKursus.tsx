"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";

interface ModalTambahKursusProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  userId: string;
  supabase: any;
}

const KATEGORI_OPTIONS = [
  "Administrasi",
  "Bisnis",
  "Desain",
  "Kuliner",
  "Teknologi",
  "Bahasa",
];

export default function ModalTambahKursus({
  open,
  onOpenChange,
  onCreated,
  userId,
  supabase,
}: ModalTambahKursusProps) {
  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [kategori, setKategori] = useState("Administrasi");
  const [ringkasan, setRingkasan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState<number>(150000);
  const [kuota, setKuota] = useState<number>(20);
  const [nilaiLulus, setNilaiLulus] = useState<number>(70);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleJudulChange = (val: string) => {
    setJudul(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
  };

  const resetForm = () => {
    setJudul("");
    setSlug("");
    setKategori("Administrasi");
    setRingkasan("");
    setDeskripsi("");
    setHarga(150000);
    setKuota(20);
    setNilaiLulus(70);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (judul.trim().length < 5) {
      setFormError("Judul kursus minimal 5 karakter.");
      return;
    }
    if (kuota < 1) {
      setFormError("Kuota peserta minimal 1 orang.");
      return;
    }
    if (harga < 0) {
      setFormError("Harga tidak boleh negatif (isi 0 jika gratis).");
      return;
    }

    setSaving(true);
    try {
      const { data: existingSlug } = await supabase
        .from("kursus")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

      const { data, error } = await supabase
        .from("kursus")
        .insert({
          instruktur_id: userId,
          judul: judul.trim(),
          slug: finalSlug,
          kategori,
          ringkasan: ringkasan.trim(),
          deskripsi: deskripsi.trim(),
          harga,
          kuota,
          nilai_lulus: nilaiLulus,
          status: "draf",
        })
        .select()
        .single();

      if (error) throw error;

      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      console.error("Gagal membuat kursus baru:", err);
      setFormError(err.message || "Gagal membuat kursus baru.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Kursus Baru</DialogTitle>
          <DialogDescription>
            Kursus baru otomatis berstatus <strong>Draf</strong>. Anda dapat melengkapi kurikulum sebelum mengajukannya ke admin.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="judul">Judul Kursus (5–120 Karakter)</Label>
            <Input
              id="judul"
              required
              minLength={5}
              maxLength={120}
              value={judul}
              onChange={(e) => handleJudulChange(e.target.value)}
              placeholder="Misal: Mahir Excel Perkantoran"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug URL Kursus</Label>
            <Input
              id="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="mahir-excel-perkantoran"
              className="font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="kategori">Kategori</Label>
              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger id="kategori">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map((kat) => (
                    <SelectItem key={kat} value={kat}>
                      {kat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="harga">Harga (Rp)</Label>
              <Input
                id="harga"
                type="number"
                min={0}
                step={5000}
                required
                value={harga}
                onChange={(e) => setHarga(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="kuota">Kuota Peserta</Label>
              <Input
                id="kuota"
                type="number"
                min={1}
                max={500}
                required
                value={kuota}
                onChange={(e) => setKuota(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nilaiLulus">Nilai Lulus Kuis (0–100)</Label>
              <Input
                id="nilaiLulus"
                type="number"
                min={10}
                max={100}
                required
                value={nilaiLulus}
                onChange={(e) => setNilaiLulus(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ringkasan">Ringkasan Singkat</Label>
            <Textarea
              id="ringkasan"
              rows={2}
              required
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value)}
              placeholder="Deskripsi singkat untuk kartu kursus..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Menyimpan..." : "Buat Draf Kursus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
