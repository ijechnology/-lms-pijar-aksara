export interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan: string;
  harga: number;
  kuota: number;
  kursi_terpakai?: number;
  nilai_lulus: number;
  status: string;
  instruktur_nama?: string;
  total_modul?: number;
}

export type HargaFilter = "semua" | "gratis" | "berbayar";
