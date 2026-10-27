"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import KursusCardInstruktur, { KursusInstrukturItem } from "@/components/instruktur/KursusCardInstruktur";
import ModalTambahKursus from "@/components/instruktur/ModalTambahKursus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Search,
  BookOpen,
  Send,
  Trash2,
  Filter,
} from "lucide-react";

function InstrukturKursusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  const [kursusList, setKursusList] = useState<KursusInstrukturItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter & Search State
  const statusParam = searchParams.get("status") || "semua";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(statusParam);

  // Dialog Konfirmasi Ajukan Review
  const [targetAjukan, setTargetAjukan] = useState<KursusInstrukturItem | null>(null);
  const [submittingCourseId, setSubmittingCourseId] = useState<string | null>(null);

  // Dialog Konfirmasi Hapus Draf
  const [targetHapus, setTargetHapus] = useState<KursusInstrukturItem | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const loadKursus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("kursus")
        .select(`
          id, judul, slug, kategori, ringkasan, harga, kuota, nilai_lulus,
          status, catatan_tinjauan, dibuat_pada,
          modul (id, soal (id)),
          pendaftaran (id)
        `)
        .eq("instruktur_id", user.id)
        .order("dibuat_pada", { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted: KursusInstrukturItem[] = data.map((k: any) => {
          const moduls = k.modul || [];
          let totalSoal = 0;
          moduls.forEach((m: any) => {
            totalSoal += (m.soal || []).length;
          });

          return {
            id: k.id,
            judul: k.judul,
            slug: k.slug,
            kategori: k.kategori,
            ringkasan: k.ringkasan,
            harga: k.harga,
            kuota: k.kuota,
            nilai_lulus: k.nilai_lulus,
            status: k.status,
            catatan_tinjauan: k.catatan_tinjauan,
            dibuat_pada: k.dibuat_pada,
            modul_count: moduls.length,
            total_soal: totalSoal,
            peserta_count: (k.pendaftaran || []).length,
          };
        });
        setKursusList(formatted);
      }
    } catch (err: any) {
      console.error("Gagal memuat kursus instruktur:", err);
      toast.error("Gagal memuat daftar kursus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user) {
      loadKursus();
    }
  }, [user, isLoading]);

  // Sync URL search param
  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val === "semua") {
      params.delete("status");
    } else {
      params.set("status", val);
    }
    router.replace(`/instruktur/kursus?${params.toString()}`, { scroll: false });
  };

  // Filtered List
  const filteredKursus = useMemo(() => {
    return kursusList.filter((k) => {
      const matchesSearch =
        k.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.kategori.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "semua" ? true : k.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [kursusList, searchQuery, selectedStatus]);

  // Handler Ajukan Review (BR-02)
  const handleConfirmAjukan = async () => {
    if (!targetAjukan) return;

    if (targetAjukan.modul_count < 1) {
      toast.error("Gagal mengajukan: Kursus harus memiliki minimal 1 modul materi.");
      setTargetAjukan(null);
      return;
    }
    if (targetAjukan.total_soal < 1) {
      toast.error("Gagal mengajukan: Setiap modul harus memiliki minimal 1 soal evaluasi kuis.");
      setTargetAjukan(null);
      return;
    }

    setSubmittingCourseId(targetAjukan.id);
    try {
      const { error } = await supabase
        .from("kursus")
        .update({
          status: "ditinjau",
          catatan_tinjauan: null,
        })
        .eq("id", targetAjukan.id);

      if (error) throw error;

      toast.success(
        `Kursus "${targetAjukan.judul}" berhasil diajukan untuk ditinjau oleh Admin.`
      );
      setTargetAjukan(null);
      loadKursus();
    } catch (err: any) {
      console.error("Gagal mengajukan kursus:", err);
      toast.error(err.message || "Gagal mengajukan kursus untuk ditinjau.");
    } finally {
      setSubmittingCourseId(null);
    }
  };

  // Handler Hapus Draf Kursus
  const handleConfirmHapus = async () => {
    if (!targetHapus) return;

    setDeletingCourseId(targetHapus.id);
    try {
      const { error } = await supabase
        .from("kursus")
        .delete()
        .eq("id", targetHapus.id)
        .eq("status", "draf");

      if (error) throw error;

      toast.success(`Draf kursus "${targetHapus.judul}" berhasil dihapus.`);
      setTargetHapus(null);
      loadKursus();
    } catch (err: any) {
      console.error("Gagal menghapus draf kursus:", err);
      toast.error(err.message || "Gagal menghapus draf kursus.");
    } finally {
      setDeletingCourseId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="Kelola Kursus Saya"
          description="Pantau, kelola silabus materi, buat soal evaluasi, dan ajukan penerbitan kursus pelatihan kerja Anda."
          actions={
            <Button onClick={() => setModalOpen(true)} className="gap-2 font-medium">
              <Plus className="h-4 w-4" />
              <span>Buat Kursus Baru</span>
            </Button>
          }
        />

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari kursus berdasarkan judul atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline" />
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="draf">Draf</SelectItem>
                <SelectItem value="ditinjau">Ditinjau</SelectItem>
                <SelectItem value="terbit">Terbit</SelectItem>
                <SelectItem value="ditutup">Ditutup</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredKursus.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Tidak ada kursus ditemukan</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {searchQuery || selectedStatus !== "semua"
                  ? "Coba ubah kata kunci pencarian atau ganti filter status Anda."
                  : "Anda belum memiliki kursus yang diampu. Mulai dengan membuat draf kursus baru."}
              </p>
            </div>
            {kursusList.length === 0 && (
              <Button onClick={() => setModalOpen(true)} className="gap-2 mt-2">
                <Plus className="h-4 w-4" />
                <span>Buat Kursus Pertama</span>
              </Button>
            )}
          </div>
        )}

        {/* Course Cards Grid */}
        {!loading && filteredKursus.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKursus.map((kursus) => (
              <KursusCardInstruktur
                key={kursus.id}
                kursus={kursus}
                onAjukanReview={(k) => setTargetAjukan(k)}
                onDeleteDraf={(k) => setTargetHapus(k)}
                isSubmitting={submittingCourseId === kursus.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal Buat Kursus Baru */}
      {user && (
        <ModalTambahKursus
          open={modalOpen}
          onOpenChange={setModalOpen}
          onCreated={loadKursus}
          userId={user.id}
          supabase={supabase}
        />
      )}

      {/* Dialog Konfirmasi Ajukan Review */}
      <AlertDialog open={!!targetAjukan} onOpenChange={(open) => !open && setTargetAjukan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              <span>Ajukan Kursus untuk Ditinjau?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              <p>
                Anda akan mengajukan kursus <strong>&quot;{targetAjukan?.judul}&quot;</strong> kepada Admin lembaga untuk proses verifikasi kurikulum.
              </p>
              <div className="p-3 rounded-md bg-muted text-xs space-y-1">
                <p className="font-semibold">Perhatian Aturan Bisnis (BR-02):</p>
                <p className="text-muted-foreground">
                  Setelah diajukan, status kursus menjadi <strong>Ditinjau</strong> dan materi tidak dapat diubah sementara hingga Admin menyetujui atau memberikan catatan perbaikan.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!submittingCourseId}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAjukan}
              disabled={!!submittingCourseId}
            >
              {submittingCourseId ? "Mengajukan..." : "Ya, Ajukan Kursus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Hapus Draf */}
      <AlertDialog open={!!targetHapus} onOpenChange={(open) => !open && setTargetHapus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Draf Kursus?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              <p>
                Apakah Anda yakin ingin menghapus draf kursus <strong>&quot;{targetHapus?.judul}&quot;</strong>?
              </p>
              <p className="text-xs text-muted-foreground">
                Tindakan ini permanen dan akan menghapus semua modul serta butir kuis yang tersimpan di dalam draf ini.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingCourseId}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmHapus}
              disabled={!!deletingCourseId}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deletingCourseId ? "Menghapus..." : "Ya, Hapus Draf"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function InstrukturKursusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <Skeleton className="h-10 w-72" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </main>
        </div>
      }
    >
      <InstrukturKursusContent />
    </Suspense>
  );
}

