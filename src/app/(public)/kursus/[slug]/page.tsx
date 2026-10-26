import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  Clock,
  Users,
  Award,
  CheckCircle2,
  ShieldCheck,
  User,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-brand-600 transition">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/" className="hover:text-brand-600 transition">
              Katalog
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-md">
              {kursus.judul}
            </span>
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Kolom Kiri: Informasi Utama Kursus & Silabus */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Judul */}
            <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                  {kursus.kategori}
                </span>

                {isPenuh ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    Kuota Penuh
                  </span>
                ) : isHampirPenuh ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 animate-pulse">
                    Sisa {sisaKursi} Kursi!
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium text-slate-600 bg-slate-100">
                    Sisa {sisaKursi} kursi
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {kursus.judul}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                {kursus.ringkasan}
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    Instruktur Pengampu
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {kursus.instruktur_nama}
                  </span>
                </div>
              </div>
            </div>

            {/* Deskripsi Lengkap */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                Tentang Kursus Ini
              </h2>
              <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {kursus.deskripsi}
              </div>
            </div>

            {/* Silabus Kurikulum (US-01: Judul dan Durasi Modul) */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Silabus Kurikulum
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Dipelaari secara berurutan dan terarah per modul.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  {kursus.modul.length} Modul Pembelajaran
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {kursus.modul.map((m: any) => (
                  <div
                    key={m.urutan}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {m.urutan}
                      </div>
                      <span className="font-semibold text-slate-800 text-sm sm:text-base">
                        {m.judul}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.durasi_menit} Menit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Standar Evaluasi & Sertifikat */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-900 to-slate-900 text-white space-y-4 shadow-md">
              <div className="flex items-center gap-2 text-accent-300 font-bold text-sm">
                <Award className="w-5 h-5" /> Standar Kelulusan & Sertifikat Resmi
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Setiap modul dilengkapi kuis pilihan ganda dengan syarat nilai kelulusan minimal{" "}
                <span className="text-white font-bold">{kursus.nilai_lulus}/100</span>.
                Setelah seluruh modul selesai, sistem secara otomatis menerbitkan sertifikat digital resmi bernomor unik terverifikasi (format <code className="text-accent-300 bg-white/10 px-1 py-0.5 rounded text-xs">PA-TAHUN-NOMOR</code>).
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Kartu Pendaftaran Sticky */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50 p-6 space-y-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Biaya Kursus
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-extrabold ${
                      kursus.harga === 0 ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {formatRupiah(kursus.harga)}
                  </span>
                  {kursus.harga > 0 && (
                    <span className="text-xs text-slate-500 font-medium">
                      / peserta
                    </span>
                  )}
                </div>
              </div>

              {/* Status Kuota */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Kapasitas Kursus:</span>
                  <span className="font-bold text-slate-800">{kursus.kuota} Kursi</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Kursi Terisi:</span>
                  <span className="font-bold text-slate-800">
                    {kursus.kursi_terpakai} Peserta
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200">
                  <span className="text-slate-700">Sisa Kuota:</span>
                  <span
                    className={
                      isPenuh
                        ? "text-rose-600"
                        : isHampirPenuh
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }
                  >
                    {isPenuh ? "Habis (Penuh)" : `${sisaKursi} Kursi Tersedia`}
                  </span>
                </div>
              </div>

              {/* Tombol Aksi Pendaftaran */}
              <TombolDaftarKursus
                kursusId={kursus.id}
                slug={kursus.slug}
                harga={kursus.harga}
                isPenuh={isPenuh}
              />

              {/* Garansi & Keunggulan */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Akses materi modul terstruktur & mandiri</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Kuis evaluasi server-side anti-bocor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Sertifikat digital terbit otomatis saat selesai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
