import { Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function TestimonialSection() {
  const testimonials = [
    {
      nama: "Budi Santoso",
      profesi: "Pemilik Usaha Kuliner, Sukmajaya - Depok",
      kursus: "Dasar Pembukuan & Laporan Keuangan UMKM",
      inisial: "BS",
      komentar:
        "Sebelumnya uang pribadi dan uang jualan warung selalu campur aduk. Lewat kursus ini, pencatatan arus kas dan laba rugi dijelaskan dengan sangat sederhana. Sekarang pembukuan warung saya jadi rapi dan jelas ke mana uangnya berputar.",
    },
    {
      nama: "Siti Rahmawati",
      profesi: "Pelaku Toko Online & Wirausaha Kreatif",
      kursus: "Desain Konten Promosi dengan Canva",
      inisial: "SR",
      komentar:
        "Materi Canva-nya langsung to the point untuk kebutuhan jualan online. Dalam hitungan jam saya sudah bisa bikin poster promo WhatsApp dan katalog produk yang menarik tanpa perlu sewa desainer mahal.",
    },
    {
      nama: "Rizky Firmansyah",
      profesi: "Fresh Graduate / Pencari Kerja, Depok",
      kursus: "Excel Administrasi & Bahasa Inggris Kerja",
      inisial: "RF",
      komentar:
        "Sertifikat resmi dari Lembaga Kursus Pijar Aksara dan latihan studi kasus rumus Excel kantor sangat menambah rasa percaya diri saya saat tes kerja administrasi. Sangat merekomendasikan untuk fresh graduate!",
    },
  ];

  return (
    <section id="testimoni" className="scroll-mt-16 border-b bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Cerita Nyata dari Peserta & Pelaku Usaha
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Dampak nyata peningkatan keahlian praktis dalam memajukan usaha
            mandiri dan kesiapan memasuki dunia kerja.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.nama} className="h-full min-w-0">
              <CardContent className="flex h-full flex-col p-6">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.komentar}&rdquo;
                </p>

                <div className="mt-6 flex items-center gap-3 border-t pt-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {testimonial.inisial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {testimonial.nama}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {testimonial.profesi}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-primary">
                      {testimonial.kursus}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
