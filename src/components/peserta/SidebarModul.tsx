"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle, BookOpen, Award } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ModulStatusItem {
  id: string;
  urutan: number;
  judul: string;
  durasi_menit: number;
  isLulus: boolean;
  isUnlocked: boolean;
  isCurrent: boolean;
}

interface SidebarModulProps {
  pendaftaranId: string;
  modulList: ModulStatusItem[];
  currentUrutan: number;
  hideHeader?: boolean;
}

export default function SidebarModul({
  pendaftaranId,
  modulList,
  currentUrutan,
  hideHeader = false,
}: SidebarModulProps) {
  const allLulus = modulList.length > 0 && modulList.every((m) => m.isLulus);

  return (
    <Card>
      {!hideHeader && (
        <CardHeader className="border-b p-4 sm:p-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5 text-primary" />
            Daftar Modul Belajar
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className="space-y-3 p-4 sm:p-5">
        <nav className="space-y-1.5" aria-label="Daftar modul belajar">
          {modulList.map((m) => {
            const isCurrent = m.urutan === currentUrutan;

            if (!m.isUnlocked) {
              return (
                <div
                  key={m.id}
                  className="flex cursor-not-allowed select-none items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm text-muted-foreground"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                      {m.urutan}
                    </span>
                    <span className="truncate">{m.judul}</span>
                  </div>
                  <Lock className="h-4 w-4 shrink-0" />
                </div>
              );
            }

            return (
              <Link
                key={m.id}
                href={`/kursus-saya/${pendaftaranId}/modul/${m.urutan}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isCurrent
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                      m.isLulus
                        ? "bg-emerald-100 text-emerald-700"
                        : isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {m.urutan}
                  </span>
                  <span className="truncate">{m.judul}</span>
                </div>

                {m.isLulus ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : isCurrent ? (
                  <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {allLulus && (
          <div className="border-t pt-3">
            <Button asChild variant="outline" className="w-full">
              <Link href={`/kursus-saya/${pendaftaranId}/sertifikat`}>
                <Award className="text-emerald-600" />
                Lihat Sertifikat Kelulusan
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
