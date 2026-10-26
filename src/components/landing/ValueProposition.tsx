import { Briefcase, UserCheck, Award, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function ValueProposition() {
  const benefits = [
    {
      icon: Briefcase,
      title: "Kurikulum Praktis & Aplikatif",
      description:
        "Fokus pada studi kasus harian dunia kerja perkantoran dan toko UMKM. Materi terstruktur langsung siap pakai tanpa teori berbelit.",
    },
    {
      icon: UserCheck,
      title: "Instruktur Praktisi Berpengalaman",
      description:
        "Dibimbing langsung oleh praktisi aktif di bidang akuntansi keuangan, desainer konten kreatif, dan komunikasi bisnis profesional.",
    },
    {
      icon: Award,
      title: "Ujian Kuis & Sertifikat Resmi",
      description:
        "Evaluasi pemahaman berbasis standar kelulusan terukur serta penerbitan e-sertifikat resmi dari Lembaga Kursus Pijar Aksara Depok.",
    },
    {
      icon: Clock,
      title: "Kuota Terjadwal Anti-Bentrok",
      description:
        "Setiap kelas memiliki batasan kuota peserta teratur untuk menjaga proses belajar yang fokus dan pendampingan yang optimal.",
    },
  ];

  return (
    <section className="border-b bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Kenapa Memilih Belajar di Pijar Aksara?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Metode pelatihan intensif terpadu yang dirancang untuk mempercepat
            penguasaan keterampilan siap kerja bagi staf dan pemilik usaha.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="h-full">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
