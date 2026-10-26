import type { KursusItem } from "@/types/kursus";

// Data cadangan jika koneksi database sedang tidak tersedia.
export const INITIAL_COURSES: KursusItem[] = [
  {
    id: "00000000-0000-4000-b000-000000000001",
    judul: "Excel untuk Administrasi Perkantoran",
    slug: "excel-administrasi-perkantoran",
    kategori: "Administrasi",
    ringkasan:
      "Kuasai rumus penting, tabel data, dan laporan kerja harian dengan Microsoft Excel.",
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
    ringkasan:
      "Pencatatan arus kas, laba rugi sederhana, dan pemisahan uang usaha bagi pemilik toko dan UMKM.",
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
    ringkasan:
      "Membuat poster promosi, materi media sosial, dan banner jualan menarik dalam hitungan menit.",
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
    ringkasan:
      "Percakapan profesional, etika email formal, dan istilah umum kantor untuk karier yang lebih luas.",
    harga: 250000,
    kuota: 20,
    kursi_terpakai: 14,
    nilai_lulus: 75,
    status: "terbit",
    instruktur_nama: "Michael Sitorus",
    total_modul: 3,
  },
];
