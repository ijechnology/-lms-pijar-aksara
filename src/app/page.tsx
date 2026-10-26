"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import { KursusItem } from "@/components/kursus/KursusCard";
import { createClient } from "@/lib/supabase/client";

// Modular Landing Page Components
import HeroSection from "@/components/landing/HeroSection";
import ValueProposition from "@/components/landing/ValueProposition";
import CourseCatalogSection from "@/components/landing/CourseCatalogSection";
import MentorShowcase from "@/components/landing/MentorShowcase";
import TestimonialSection from "@/components/landing/TestimonialSection";
import FaqSection from "@/components/landing/FaqSection";

// Data cadangan resmi jika koneksi database offline (4 Kursus Terbit)
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
    kursi_terpakai: 11,
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

      {/* 1. Hero Section Modern ala Ruangguru & Zenius */}
      <HeroSection />

      {/* 2. Value Proposition (Pilar Keunggulan Pijar Aksara) */}
      <ValueProposition />

      {/* 3. Katalog Kursus Interaktif */}
      <CourseCatalogSection
        courses={filteredCourses}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPrice={selectedPrice}
        onPriceChange={setSelectedPrice}
        categories={categories}
      />

      {/* 4. Showcase Instruktur Praktisi */}
      <MentorShowcase />

      {/* 5. Testimoni Peserta (Fokus UMKM & Peserta Mandiri) */}
      <TestimonialSection />

      {/* 6. Tanya Jawab Umum (FAQ Interaktif) */}
      <FaqSection />

      {/* Footer Resmi */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-xs sm:text-sm space-y-2">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-bold text-slate-800 text-base">
            Lembaga Kursus Pijar Aksara Kota Depok
          </p>
          <p className="text-slate-500">
            Menyelenggarakan kursus singkat terpadu vokasi dan kecakapan kerja untuk pekerja kantor, pencari kerja, dan pelaku UMKM di Kota Depok, Jawa Barat.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            <span>&copy; {new Date().getFullYear()} LMS Pijar Aksara. Hak cipta dilindungi undang-undang.</span>
            <span>Depok, Jawa Barat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
