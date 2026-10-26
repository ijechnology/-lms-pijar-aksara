import Link from "next/link";
import { ArrowRight, BookOpen, User, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KursusItem } from "@/types/kursus";

export type { KursusItem } from "@/types/kursus";

export default function KursusCard({ kursus }: { kursus: KursusItem }) {
  const kursiTerpakai = kursus.kursi_terpakai ?? 0;
  const sisaKursi = Math.max(0, kursus.kuota - kursiTerpakai);
  const isPenuh = sisaKursi <= 0;
  const isHampirPenuh = sisaKursi > 0 && sisaKursi <= 2;

  const formatRupiah = (val: number) => {
    if (val === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Card className="group flex h-full flex-col transition-colors hover:border-primary/30">
      <CardHeader className="space-y-3 p-6 pb-0">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="max-w-[65%] truncate">
            {kursus.kategori}
          </Badge>

          {isPenuh ? (
            <Badge variant="destructive">Kuota penuh</Badge>
          ) : isHampirPenuh ? (
            <Badge variant="highlight">Sisa {sisaKursi} kursi</Badge>
          ) : (
            <Badge variant="secondary" className="font-normal">
              <Users className="mr-1 h-3 w-3" />
              Sisa {sisaKursi} kursi
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <Link
            href={`/kursus/${kursus.slug}`}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <CardTitle className="line-clamp-2 text-lg leading-snug transition-colors group-hover:text-primary">
              {kursus.judul}
            </CardTitle>
          </Link>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {kursus.ringkasan}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-6 pb-6 pt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {kursus.instruktur_nama || "Instruktur Pijar Aksara"}
            </span>
          </span>
          {kursus.total_modul ? (
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              {kursus.total_modul} modul
            </span>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-3 border-t px-6 py-4">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Investasi
          </span>
          <span
            className={cn(
              "text-lg font-semibold",
              kursus.harga === 0 ? "text-emerald-700" : "text-foreground"
            )}
          >
            {formatRupiah(kursus.harga)}
          </span>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href={`/kursus/${kursus.slug}`}>
            Lihat Detail
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
