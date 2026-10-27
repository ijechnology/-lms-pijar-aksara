import { BookOpen, CheckCircle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MentorShowcase() {
  const mentors = [
    {
      nama: "Yudha Pratama",
      inisial: "YP",
      role: "Praktisi Akuntansi & Microsoft Excel",
      kursusDiajar: "Excel Administrasi & Pembukuan UMKM",
      keahlian: [
        "Formula & Pivot Table",
        "Pencatatan Arus Kas",
        "Laporan Keuangan",
      ],
      deskripsi:
        "Berpengalaman lebih dari 7 tahun dalam penyusunan sistem pembukuan usaha kecil serta otomatisasi laporan kerja harian kantor.",
    },
    {
      nama: "Laras Wulandari",
      inisial: "LW",
      role: "Kreator Konten & Desainer Promosi",
      kursusDiajar: "Desain Konten Promosi dengan Canva",
      keahlian: [
        "Canva Visual Branding",
        "Materi Media Sosial",
        "Banner Promosi UMKM",
      ],
      deskripsi:
        "Fasilitator desain digital yang aktif mendampingi wirausahawan lokal dalam membuat materi promosi mandiri yang menarik dan profesional.",
    },
    {
      nama: "Michael Sitorus",
      inisial: "MS",
      role: "Instruktur Komunikasi & Bahasa Inggris Bisnis",
      kursusDiajar: "Bahasa Inggris Komunikasi Kerja",
      keahlian: [
        "Email Profesional",
        "Percakapan Kerja",
        "Etika Komunikasi Formal",
      ],
      deskripsi:
        "Pengajar bahasa Inggris aplikatif dengan fokus pada rasa percaya diri bertutur dan etika komunikasi formal di lingkungan kantor modern.",
    },
  ];

  return (
    <section id="instruktur" className="scroll-mt-16 border-b bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Belajar Langsung dari Instruktur Praktisi
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Materi tidak hanya sekadar teori buku, melainkan pengalaman nyata
            dari para profesional yang aktif di bidangnya.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {mentors.map((mentor) => (
            <Card key={mentor.nama} className="flex h-full flex-col">
              <CardHeader className="space-y-4 p-6">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {mentor.inisial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-base font-semibold leading-snug">
                        {mentor.nama}
                      </CardTitle>
                      <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                    </div>
                    <p className="text-xs font-medium text-primary">
                      {mentor.role}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {mentor.deskripsi}
                </p>
              </CardHeader>

              <CardContent className="flex-1 px-6 pb-6 pt-0">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Fokus Materi Kursus
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.keahlian.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="mt-auto flex items-center gap-2 border-t px-6 py-4 text-xs text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{mentor.kursusDiajar}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
