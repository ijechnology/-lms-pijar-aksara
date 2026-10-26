import type { HargaFilter, KursusItem } from "@/types/kursus";

export interface KursusFilters {
  q: string;
  kategori: string;
  harga: HargaFilter;
}

export function filterKursus(
  courses: KursusItem[],
  filters: KursusFilters
): KursusItem[] {
  const q = filters.q.trim().toLowerCase();

  return courses.filter((k) => {
    const matchQ =
      !q ||
      [k.judul, k.ringkasan, k.kategori, k.instruktur_nama ?? ""].some((value) =>
        value.toLowerCase().includes(q)
      );

    const matchKategori =
      filters.kategori === "semua" || k.kategori === filters.kategori;

    const matchHarga =
      filters.harga === "semua" ||
      (filters.harga === "gratis" ? k.harga === 0 : k.harga > 0);

    return matchQ && matchKategori && matchHarga;
  });
}
