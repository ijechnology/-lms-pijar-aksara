"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import KursusCard, { KursusItem } from "@/components/kursus/KursusCard";
import KursusFilter from "@/components/kursus/KursusFilter";
import { Sparkles, BookOpen, ShieldCheck, Award, MapPin, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Data awal cadangan resmi dari Data_Contoh_LMS.xlsx (4 Kursus Terbit)
const INITIAL_COURSES: KursusItem[] = [
  {
    id: "00000000-0000-4000-b000-000000000001",
    judul: "Excel untuk Administrasi Perkantoran",
    slug: "excel-administrasi-perkantoran",
    kategori: "Administrasi",
    ringkasan: "Kuasai rumus penting, tabel data, dan laporan kerja harian dengan Microsoft Excel.",
    harga: 150000,
    kuota: 25,
    kursi_terpakai: 18,
    nilai_lulus: 70,
    status: "terbit",
    instruktur_nama: "Yudha Pratama",
    total_modul: 3,
  },
  {
    id: "00000000-0000-4000-b000-000000000002",
    judul: "Dasar Pembukuan dan Laporan Keuangan UMKM",
    slug: "dasar-pembukuan-umkm",
    kategori: "Bisnis & Keuangan",
    ringkasan: "Pencatatan arus kas, laba rugi sederhana, dan pemisahan uang usaha bagi pemilik toko dan UMKM.",
    harga: 200000,
    kuota: 12,
    kursi_terpakai: 11, // Kasus batas: Sisa 1 kursi!
    nilai_lulus: 70,
    status: "terbit",
    instruktur_nama: "Yudha Pratama",
    total_modul: 3,
  },
  {
    id: "00000000-0000-4000-b000-000000000003",
    judul: "Desain Konten Promosi dengan Canva",
    slug: "desain-konten-canva",
    kategori: "Desain Konten",
    ringkasan: "Membuat poster promosi, materi media sosial, dan banner jualan menarik dalam hitungan menit.",
    harga: 0,
    kuota: 30,
    kursi_terpakai: 12,
    nilai_lulus: 70,
    status: "terbit",
    instruktur_nama: "Laras Wulandari",
    total_modul: 2,
  },
  {
    id: "00000000-0000-4000-b000-000000000005",
    judul: "Bahasa Inggris Praktis untuk Komunikasi Kerja",
    slug: "bahasa-inggris-komunikasi-kerja",
    kategori: "Bahasa Asing",
    ringkasan: "Percakapan profesional, etika email formal, dan istilah umum kantor untuk karier yang lebih luas.",
    harga: 250000,
    kuota: 20,
    kursi_terpakai: 14,
    nilai_lulus: 75,
    status: "terbit",
    instruktur_nama: "Michael Sitorus",
    total_modul: 3,
  },
];

export default function HomePage() {
  const [courses, setCourses] = useState<KursusItem[]>(INITIAL_COURSES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [selectedPrice, setSelectedPrice] = useState("semua");

  useEffect(() => {
    async function loadKursusFromSupabase() {
      try {
        const supabase = createClient();
        // Ambil kursus berstatus 'terbit' (BR-01)
        const { data: kursusData, error } = await supabase
          .from("kursus")
          .select(`
            id, judul, slug, kategori, ringkasan, harga, kuota, nilai_lulus, status,
            profiles:instruktur_id(nama_lengkap),
            modul(id)
          `)
          .eq("status", "terbit")
          .order("dibuat_pada", { ascending: false });

        if (!error && kursusData && kursusData.length > 0) {
          // Ambil kursi terpakai untuk setiap kursus
          const coursesWithSeats: KursusItem[] = await Promise.all(
            kursusData.map(async (k: any) => {
              const { count } = await supabase
                .from("pendaftaran")
                .select("id", { count: "exact", head: true })
                .eq("kursus_id", k.id)
                .or("status.in.(aktif,selesai),and(status.eq.menunggu_bayar,batas_bayar.gt.now())");

              return {
                id: k.id,
                judul: k.judul,
                slug: k.slug,
                kategori: k.kategori,
                ringkasan: k.ringkasan,
                harga: k.harga,
                kuota: k.kuota,
                kursi_terpakai: count ?? 0,
                nilai_lulus: k.nilai_lulus,
                status: k.status,
                instruktur_nama: k.profiles?.nama_lengkap || "Instruktur Lembaga",
                total_modul: k.modul?.length || 0,
              };
            })
          );
          setCourses(coursesWithSeats);
        }
      } catch (err) {
        console.warn("Menggunakan data contoh kursus publik:", err);
      } finally {
        setLoading(false);
      }
    }

    loadKursusFromSupabase();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(c.kategori));
    return Array.from(set);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Filter kata kunci pencarian
      const matchQuery =
        !searchQuery ||
        c.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ringkasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.kategori.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter kategori
      const matchCategory =
        selectedCategory === "semua" || c.kategori === selectedCategory;

      // Filter harga
      const matchPrice =
        selectedPrice === "semua" ||
        (selectedPrice === "gratis" && c.harga === 0) ||
        (selectedPrice === "berbayar" && c.harga > 0);

      return matchQuery && matchCategory && matchPrice;
    });
  }, [courses, searchQuery, selectedCategory, selectedPrice]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2),transparent_50%)]" />
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-accent-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Lembaga Kursus Resmi di Depok
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Kembangkan Keahlian Praktis untuk{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 via-accent-400 to-amber-200">
              Karier & Usaha Anda
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Pelatihan singkat terarah untuk staf kantor dan pelaku UMKM: Excel,
            Canva, Bahasa Inggris Komunikasi Kerja, dan Pembukuan praktis.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Kurikulum Berurutan
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Kuis & Sertifikat Resmi
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Kuota Terbatas Anti-Bentrok
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main id="katalog" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Katalog Kursus Pilihan
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Pilih kursus intensif sesuai kebutuhan peningkatan keterampilan Anda.
            </p>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-800">{filteredCourses.length}</span> kursus aktif
          </div>
        </div>

        {/* Filter Bar */}
        <KursusFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPrice={selectedPrice}
          onPriceChange={setSelectedPrice}
          categories={categories}
        />

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredCourses.map((kursus) => (
              <KursusCard key={kursus.id} kursus={kursus} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              Tidak Ada Kursus yang Sesuai
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Cobalah ubah kata kunci pencarian atau reset filter kategori dan harga Anda.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("semua");
                setSelectedPrice("semua");
              }}
              className="px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20 py-10 px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-xs space-y-2">
        <p className="font-semibold text-slate-700">
          Lembaga Kursus Pijar Aksara Depok
        </p>
        <p>
          Menyelenggarakan kursus singkat terpadu untuk pekerja kantor dan UMKM di Kota Depok, Jawa Barat.
        </p>
        <p className="pt-2 text-slate-400">
          &copy; {new Date().getFullYear()} LMS Pijar Aksara. Hak cipta dilindungi undang-undang.
        </p>
      </footer>
    </div>
  );
}
