"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Users,
  HelpCircle,
  MoreVertical,
  Edit,
  Eye,
  Send,
  Trash2,
  AlertCircle,
} from "lucide-react";

export interface KursusInstrukturItem {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan: string;
  harga: number;
  kuota: number;
  nilai_lulus: number;
  status: "draf" | "ditinjau" | "terbit" | "ditutup";
  catatan_tinjauan: string | null;
  dibuat_pada: string;
  modul_count: number;
  total_soal: number;
  peserta_count: number;
}

interface KursusCardInstrukturProps {
  kursus: KursusInstrukturItem;
  onAjukanReview?: (kursus: KursusInstrukturItem) => void;
  onDeleteDraf?: (kursus: KursusInstrukturItem) => void;
  isSubmitting?: boolean;
}

export default function KursusCardInstruktur({
  kursus,
  onAjukanReview,
  onDeleteDraf,
  isSubmitting = false,
}: KursusCardInstrukturProps) {
  const getStatusBadge = (status: KursusInstrukturItem["status"]) => {
    switch (status) {
      case "terbit":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
            Terbit
          </Badge>
        );
      case "ditinjau":
        return (
          <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-700 font-medium">
            Ditinjau Admin
          </Badge>
        );
      case "ditutup":
        return <Badge variant="secondary">Ditutup</Badge>;
      case "draf":
      default:
        return (
          <Badge variant="outline" className="border-slate-300 text-muted-foreground font-medium">
            Draf
          </Badge>
        );
    }
  };

  const formattedPrice =
    kursus.harga === 0
      ? "Gratis"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(kursus.harga);

  return (
    <Card className="flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-primary/50 group">
      <div>
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs font-semibold">
              {kursus.kategori}
            </Badge>
            <div className="flex items-center gap-1">
              {getStatusBadge(kursus.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Menu aksi</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/instruktur/kursus/${kursus.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                      <span>{kursus.status === "draf" ? "Edit Kurikulum" : "Lihat Kurikulum"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/instruktur/kursus/${kursus.id}/peserta?from=kelola`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Peserta & Nilai</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/kursus/${kursus.slug}`}
                      target="_blank"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>Pratinjau Publik</span>
                    </Link>
                  </DropdownMenuItem>

                  {kursus.status === "draf" && onDeleteDraf && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteDraf(kursus)}
                        className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Hapus Draf</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CardTitle className="text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/instruktur/kursus/${kursus.id}`}>
              {kursus.judul}
            </Link>
          </CardTitle>

          <CardDescription className="text-xs line-clamp-2 leading-relaxed">
            {kursus.ringkasan || "Belum ada ringkasan materi untuk kursus ini."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Catatan Penolakan Admin (Jika ada) */}
          {kursus.status === "draf" && kursus.catatan_tinjauan && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
              <span className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Catatan Tinjauan Admin:
              </span>
              <p className="italic leading-relaxed">{kursus.catatan_tinjauan}</p>
            </div>
          )}

          {/* Statistik Kursus */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y text-center">
            <div className="p-2 bg-muted/50 rounded-md">
              <span className="text-[10px] text-muted-foreground block">Modul</span>
              <span className="text-xs font-semibold text-foreground flex items-center justify-center gap-1 mt-0.5">
                <BookOpen className="h-3 w-3 text-primary" />
                {kursus.modul_count}
              </span>
            </div>
            <div className="p-2 bg-muted/50 rounded-md">
              <span className="text-[10px] text-muted-foreground block">Total Soal</span>
              <span className="text-xs font-semibold text-foreground flex items-center justify-center gap-1 mt-0.5">
                <HelpCircle className="h-3 w-3 text-amber-500" />
                {kursus.total_soal}
              </span>
            </div>
            <div className="p-2 bg-muted/50 rounded-md">
              <span className="text-[10px] text-muted-foreground block">Peserta</span>
              <span className="text-xs font-semibold text-foreground flex items-center justify-center gap-1 mt-0.5">
                <Users className="h-3 w-3 text-emerald-600" />
                {kursus.peserta_count}
              </span>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-foreground text-sm">
          {formattedPrice}
        </span>

        <div className="flex items-center gap-2">
          {kursus.status === "draf" && onAjukanReview && (
            <Button
              size="sm"
              variant="default"
              disabled={isSubmitting}
              onClick={() => onAjukanReview(kursus)}
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? "Mengajukan..." : "Ajukan Review"}
            </Button>
          )}

          {kursus.status !== "draf" && (
            <Button asChild size="sm" variant="outline" className="h-8 text-xs font-medium">
              <Link href={`/instruktur/kursus/${kursus.id}`}>
                Kelola Kurikulum
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
