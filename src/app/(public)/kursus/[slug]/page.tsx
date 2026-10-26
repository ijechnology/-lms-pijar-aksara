import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Award, CheckCircle2, Clock, User } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import TombolDaftarKursus from "./TombolDaftarKursus";

// Data cadangan modul resmi untuk render static / fallback
const FALLBACK_MODULES: Record<string, any[]> = {
  "excel-administrasi-perkantoran": [
    {
      urutan: 1,
      judul: "Navigasi, Format Tabel, dan Input Data Cepat",
      durasi_menit: 45,
    },
    {
      urutan: 2,
      judul: "Rumus Esensial Kantor: SUM, AVERAGE, IF, dan VLOOKUP",
      durasi_menit: 60,
    },
    {
      urutan: 3,
      judul: "Pivot Table dan Pembuatan Laporan Kerja Ringkas",
      durasi_menit: 60,
    },
  ],
  "dasar-pembukuan-umkm": [
    {
      urutan: 1,
      judul: "Pemisahan Keuangan Pribadi dan Usaha",
      durasi_menit: 40,
    },
    {
      urutan: 2,
      judul: "Pencatatan Buku Kas Harian dan Arus Kas",
      durasi_menit: 50,
    },
    {
      urutan: 3,
      judul: "Laporan Laba Rugi Sederhana dan Neraca Dasar",
      durasi_menit: 60,
    },
  ],
  "desain-konten-canva": [
    {
      urutan: 1,
      judul: "Pengenalan Tools Canva dan Prinsip Desain Visual",
      durasi_menit: 45,
    },
    {
      urutan: 2,
      judul: "Membuat Poster Promo Produk dan Story Instagram",
      durasi_menit: 60,
    },
  ],
  "bahasa-inggris-komunikasi-kerja": [
    {
      urutan: 1,
      judul: "Professional Greetings dan Telepon Kantor",
      durasi_menit: 45,
    },
    {
      urutan: 2,
      judul: "Penulisan Email Formal dan Etika Korespondensi",
      durasi_menit: 50,
    },
    {
      urutan: 3,
      judul: "Menghadiri Rapat dan Berpendapat dalam Bahasa Inggris",
      durasi_menit: 60,
    },
  ],
};

const FALLBACK_COURSES: Record<string, any> = {
  "excel-administrasi-perkantoran": {
    id: "00000000-0000-4000-b000-000000000001",
    judul: "Excel untuk Administrasi Perkantoran",
    slug: "excel-administrasi-perkantoran",
    kategori: "Administrasi",
    ringkasan: "Kuasai rumus penting, tabel data, dan laporan kerja harian dengan Microsoft Excel.",
    deskripsi:
      "Kursus intensif ini dirancang khusus untuk staf administrasi, sekretaris, dan staf operasional kantor yang ingin meningkatkan kecepatan serta ketepatan pengolahan data dokumen kantor. Pembelajaran dimulai dari format data standar, penggunaan rumus IF bersarang dan VLOOKUP/XLOOKUP, hingga visualisasi laporan menggunakan Pivot Table.",
    harga: 150000,
    kuota: 25,
    kursi_terpakai: 18,
    nilai_lulus: 70,
    status: "terbit",
    instruktur_nama: "Yudha Pratama",
  },
  "dasar-pembukuan-umkm": {
    id: "00000000-0000-4000-b000-000000000002",
    judul: "Dasar Pembukuan dan Laporan Keuangan UMKM",
    slug: "dasar-pembukuan-umkm",
    kategori: "Bisnis & Keuangan",
    ringkasan: "Pencatatan arus kas, laba rugi sederhana, dan pemisahan uang usaha bagi pemilik toko dan UMKM.",
    deskripsi:
      "Banyak pelaku UMKM mengalami kesulitan memantau keuntungan sebenarnya karena keuangan pribadi masih bercampur dengan uang usaha. Di kursus ini, Anda akan dipandu langkah demi langkah mencatat transaksi harian, menyusun buku kas masuk dan kas keluar, serta membaca laporan laba rugi sederhana tanpa ribet.",
    harga: 200000,
    kuota: 12,
    kursi_terpakai: 11, // Sisa 1 kursi
    nilai_lulus: 70,
    status: "terbit",
    instruktur_nama: "Yudha Pratama",
  },
  "desain-konten-canva": {
    id: "00000000-0000-4000-b000-000000000003",
    judul: "Desain Konten Promosi dengan Canva",
    slug: "desain-konten-canva",
    kategori: "Desain Konten",
    ringkasan: "Membuat poster promosi, materi media sosial, dan banner jualan menarik dalam hitungan menit.",
    deskripsi:
      "Tingkatkan daya tarik visual promosi bisnis Anda dengan Canva. Pelajari kombinasi tipografi, pemilihan palet warna yang harmonis, serta teknik menyusun banner promosi diskon, brosur digital, dan konten feed Instagram yang memikat calon pelanggan.",
    harga: 0,
    kuota: 30,
    kursi_terpakai: 12,
    nilai_lulus: 70,
    status: "terbit",
    instruktur_nama: "Laras Wulandari",
  },
  "bahasa-inggris-komunikasi-kerja": {
    id: "00000000-0000-4000-b000-000000000005",
    judul: "Bahasa Inggris Praktis untuk Komunikasi Kerja",
    slug: "bahasa-inggris-komunikasi-kerja",
    kategori: "Bahasa Asing",
    ringkasan: "Percakapan profesional, etika email formal, dan istilah umum kantor untuk karier yang lebih luas.",
    deskripsi:
      "Tingkatkan rasa percaya diri saat berkomunikasi dalam lingkungan kerja profesional. Kursus ini memfokuskan pada percakapan telepon dengan klien, penulisan email resmi yang sopan dan ringkas, serta perbendaharaan kata kunci saat mempresentasikan laporan kerja.",
    harga: 250000,
    kuota: 20,
    kursi_terpakai: 14,
    nilai_lulus: 75,
    status: "terbit",
    instruktur_nama: "Michael Sitorus",
  },
};

async function getKursusData(slug: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("kursus")
      .select(`
        id, judul, slug, kategori, ringkasan, deskripsi, harga, kuota, nilai_lulus, status,
        profiles:instruktur_id(nama_lengkap),
        modul(id, urutan, judul, durasi_menit)
      `)
      .eq("slug", slug)
      .single();

    if (!error && data) {
      // BR-01: Hanya kursus terbit yang boleh diakses publik
      if (data.status !== "terbit") {
        return null;
      }

      const { count } = await supabase
        .from("pendaftaran")
        .select("id", { count: "exact", head: true })
        .eq("kursus_id", data.id)
        .or("status.in.(aktif,selesai),and(status.eq.menunggu_bayar,batas_bayar.gt.now())");

      return {
        id: data.id,
        judul: data.judul,
        slug: data.slug,
        kategori: data.kategori,
        ringkasan: data.ringkasan,
        deskripsi: data.deskripsi,
        harga: data.harga,
        kuota: data.kuota,
        kursi_terpakai: count ?? 0,
        nilai_lulus: data.nilai_lulus,
        status: data.status,
        instruktur_nama: (data.profiles as any)?.nama_lengkap || "Instruktur Lembaga",
        modul: ((data.modul as any[]) || []).sort((a, b) => a.urutan - b.urutan),
      };
    }
  } catch (err) {
    console.warn("Fallback query detail kursus:", err);
  }

  // Fallback ke data contoh
  const fallback = FALLBACK_COURSES[slug];
  if (fallback && fallback.status === "terbit") {
    return {
      ...fallback,
      modul: FALLBACK_MODULES[slug] || [],
    };
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const kursus = await getKursusData(params.slug);

  if (!kursus) {
    return {
      title: "Kursus Tidak Ditemukan",
    };
  }

  return {
    title: `${kursus.judul}`,
    description: kursus.ringkasan,
    openGraph: {
      title: `${kursus.judul} | Kursus Pijar Aksara`,
      description: kursus.ringkasan,
      type: "website",
    },
  };
}

export default async function KursusDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const kursus = await getKursusData(params.slug);

  // BR-01: Kursus non-terbit atau slug tidak ada -> HTTP 404
  if (!kursus) {
    notFound();
  }

  const sisaKursi = Math.max(0, kursus.kuota - kursus.kursi_terpakai);
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

  const initials = kursus.instruktur_nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase();

  const quotaBadge = isPenuh ? (
    <Badge variant="destructive">Kuota penuh</Badge>
  ) : isHampirPenuh ? (
    <Badge variant="highlight">Sisa {sisaKursi} kursi</Badge>
  ) : (
    <Badge variant="secondary">Sisa {sisaKursi} kursi</Badge>
  );

  return (
    <div className="bg-muted/30">
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader
            title={kursus.judul}
            breadcrumbs={[
              { label: "Beranda", href: "/" },
              { label: "Katalog", href: "/kursus" },
              { label: kursus.judul },
            ]}
          />
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="space-y-4 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{kursus.kategori}</Badge>
                  {quotaBadge}
                </div>

                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {kursus.ringkasan}
                </p>

                <Separator />

                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {initials || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Instruktur Pengampu
                    </p>
                    <p className="text-sm font-semibold">
                      {kursus.instruktur_nama}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tentang Kursus Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {kursus.deskripsi}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">Silabus Kurikulum</CardTitle>
                  <CardDescription>
                    Dipelaari secara berurutan dan terarah per modul.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {kursus.modul.length} Modul Pembelajaran
                </Badge>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {kursus.modul.map((m: any, index: number) => (
                    <AccordionItem
                      key={m.urutan}
                      value={`modul-${m.urutan}`}
                      className={index === kursus.modul.length - 1 ? "border-b-0" : ""}
                    >
                      <AccordionTrigger className="gap-3 py-4 hover:no-underline">
                        <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground">
                            {m.urutan}
                          </span>
                          <span className="text-sm font-medium sm:text-base">
                            {m.judul}
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pl-11 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {m.durasi_menit} menit
                        </span>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-3 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Award className="h-5 w-5" />
                  Standar Kelulusan &amp; Sertifikat Resmi
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Setiap modul dilengkapi kuis pilihan ganda dengan syarat nilai
                  kelulusan minimal{" "}
                  <span className="font-semibold text-foreground">
                    {kursus.nilai_lulus}/100
                  </span>
                  . Setelah seluruh modul selesai, sistem secara otomatis
                  menerbitkan sertifikat digital resmi bernomor unik
                  terverifikasi (format{" "}
                  <code className="rounded bg-background px-1 py-0.5 text-xs text-primary">
                    PA-TAHUN-NOMOR
                  </code>
                  ).
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardHeader className="space-y-1 p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Biaya Kursus
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-3xl font-semibold tracking-tight",
                      kursus.harga === 0
                        ? "text-emerald-700"
                        : "text-foreground"
                    )}
                  >
                    {formatRupiah(kursus.harga)}
                  </span>
                  {kursus.harga > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">
                      / peserta
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 px-6 pb-6 pt-0">
                <Separator />

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Kapasitas kursus</dt>
                    <dd className="font-medium">{kursus.kuota} kursi</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Kursi terisi</dt>
                    <dd className="font-medium">
                      {kursus.kursi_terpakai} peserta
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t pt-2">
                    <dt className="font-medium">Sisa kuota</dt>
                    <dd
                      className={cn(
                        "font-semibold",
                        isPenuh
                          ? "text-destructive"
                          : isHampirPenuh
                          ? "text-amber-700"
                          : "text-emerald-700"
                      )}
                    >
                      {isPenuh ? "Habis (penuh)" : `${sisaKursi} kursi tersedia`}
                    </dd>
                  </div>
                </dl>

                <Separator />

                <TombolDaftarKursus
                  kursusId={kursus.id}
                  slug={kursus.slug}
                  harga={kursus.harga}
                  isPenuh={isPenuh}
                />

                <div className="space-y-2 pt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Akses materi modul terstruktur &amp; mandiri</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Kuis evaluasi server-side anti-bocor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Sertifikat digital terbit otomatis saat selesai</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
