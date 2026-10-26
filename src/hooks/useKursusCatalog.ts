"use client";

import { useEffect, useMemo, useState } from "react";

import { INITIAL_COURSES } from "@/lib/data/kursus-fallback";
import { createClient } from "@/lib/supabase/client";
import type { KursusItem } from "@/types/kursus";

export function useKursusCatalog() {
  const supabase = useMemo(() => createClient(), []);
  const [courses, setCourses] = useState<KursusItem[]>(INITIAL_COURSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKursusFromSupabase() {
      try {
        const { data: kursusData, error } = await supabase
          .from("kursus")
          .select(
            `
            id, judul, slug, kategori, ringkasan, harga, kuota, nilai_lulus, status,
            profiles:instruktur_id(nama_lengkap),
            modul(id)
          `
          )
          .eq("status", "terbit")
          .order("dibuat_pada", { ascending: false });

        if (!error && kursusData && kursusData.length > 0) {
          const coursesWithSeats: KursusItem[] = await Promise.all(
            kursusData.map(async (k: any) => {
              const { count } = await supabase
                .from("pendaftaran")
                .select("id", { count: "exact", head: true })
                .eq("kursus_id", k.id)
                .or(
                  "status.in.(aktif,selesai),and(status.eq.menunggu_bayar,batas_bayar.gt.now())"
                );

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

    void loadKursusFromSupabase();
  }, [supabase]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((course) => set.add(course.kategori));
    return Array.from(set);
  }, [courses]);

  return { courses, categories, loading };
}
