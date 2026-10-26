"use client";

import {
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  User,
  XCircle,
} from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ModulItem {
  id: string;
  urutan: number;
  judul: string;
  durasi_menit: number;
}

interface PercobaanKuisItem {
  id: string;
  modul_id: string;
  nomor_percobaan: number;
  nilai: number;
  lulus: boolean;
  jumlah_benar: number;
  jumlah_soal: number;
  dikerjakan_pada: string;
}

interface ProgresModulItem {
  id: string;
  modul_id: string;
  lulus_pada: string | null;
  materi_dibaca_pada: string | null;
}

export interface RekapNilaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  pesertaData: {
    nama_lengkap: string;
    email: string;
    no_hp?: string | null;
  };
  kursusJudul: string;
  nilaiLulus: number;
  modulList: ModulItem[];
  progresList: ProgresModulItem[];
  percobaanList: PercobaanKuisItem[];
}

export function ModalRekapNilai({
  isOpen,
  onClose,
  pesertaData,
  kursusJudul,
  nilaiLulus,
  modulList,
  progresList,
  percobaanList,
}: RekapNilaiModalProps) {
  if (!isOpen) return null;

  const sortedModul = [...modulList].sort((a, b) => a.urutan - b.urutan);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b bg-muted/30 px-6 py-4 pr-14">
          <div className="space-y-1">
            <Badge variant="secondary" className="w-fit">
              Transkrip Akademik Resmi
            </Badge>
            <DialogTitle>Rekap Nilai Kuis &amp; Data Peserta</DialogTitle>
            <DialogDescription>
              Kursus:{" "}
              <span className="font-medium text-foreground">
                {kursusJudul}
              </span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Identitas Peserta Pemilik Akun
            </h4>
            <div className="grid grid-cols-1 gap-3 pt-1 text-xs sm:grid-cols-3">
              <div className="flex items-center gap-2 text-foreground">
                <User className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate font-medium">
                  {pesertaData.nama_lengkap}
                </span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{pesertaData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate font-mono">
                  {pesertaData.no_hp || "Belum diisi"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <h4 className="font-medium text-foreground">
                Daftar Evaluasi per Modul
              </h4>
              <span className="text-muted-foreground">
                Syarat lulus: {nilaiLulus}/100 • Maksimal 3x percobaan
              </span>
            </div>

            <div className="min-w-0 overflow-hidden">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Modul</TableHead>
                    <TableHead className="whitespace-nowrap">Durasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Nilai Terbaik
                    </TableHead>
                    <TableHead>Percobaan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedModul.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Belum ada modul yang terdaftar pada kursus ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedModul.map((modul) => {
                    const progres = progresList.find(
                      (p) => p.modul_id === modul.id
                    );
                    const isLulus =
                      progres?.lulus_pada !== null &&
                      progres?.lulus_pada !== undefined;
                    const attempts = percobaanList
                      .filter((p) => p.modul_id === modul.id)
                      .sort(
                        (a, b) => a.nomor_percobaan - b.nomor_percobaan
                      );
                    const bestScore =
                      attempts.length > 0
                        ? Math.max(...attempts.map((a) => a.nilai))
                        : null;

                    return (
                      <TableRow key={modul.id}>
                        <TableCell>
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                              {modul.urutan}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium leading-snug">
                                {modul.judul}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {modul.durasi_menit} menit
                        </TableCell>
                        <TableCell>
                          {isLulus ? (
                            <Badge
                              variant="secondary"
                              className="gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Lulus
                            </Badge>
                          ) : attempts.length >= 3 ? (
                            <Badge
                              variant="destructive"
                              className="gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Belum Lulus
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              Belum Selesai
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {bestScore === null ? (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          ) : (
                            <span
                              className={`text-sm font-semibold ${
                                bestScore >= nilaiLulus
                                  ? "text-emerald-600"
                                  : "text-highlight-foreground"
                              }`}
                            >
                              {bestScore}/100
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attempts.length === 0 ? (
                            <span className="text-xs italic text-muted-foreground">
                              Belum dikerjakan
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {attempts.map((attempt) => (
                                <Badge
                                  key={attempt.id}
                                  variant={
                                    attempt.lulus ? "secondary" : "outline"
                                  }
                                  className={`text-[11px] ${
                                    attempt.lulus
                                      ? "bg-emerald-50 text-emerald-800"
                                      : ""
                                  }`}
                                >
                                  #{attempt.nomor_percobaan}: {attempt.nilai} (
                                  {attempt.jumlah_benar}/
                                  {attempt.jumlah_soal})
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t bg-muted/30 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
