"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface LandingStats {
  kursusTerbit: number;
  pesertaAktif: number;
  available: boolean;
  loading: boolean;
}

const EMPTY_STATS: LandingStats = {
  kursusTerbit: 0,
  pesertaAktif: 0,
  available: false,
  loading: true,
};

export function useLandingStats() {
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState<LandingStats>(EMPTY_STATS);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const [kursus, peserta] = await Promise.all([
          supabase
            .from("kursus")
            .select("id", { count: "exact", head: true })
            .eq("status", "terbit"),
          supabase
            .from("pendaftaran")
            .select("id", { count: "exact", head: true })
            .in("status", ["aktif", "selesai"]),
        ]);

        if (!active) return;

        if (kursus.error || peserta.error) {
          setStats({
            kursusTerbit: 0,
            pesertaAktif: 0,
            available: false,
            loading: false,
          });
          return;
        }

        setStats({
          kursusTerbit: kursus.count ?? 0,
          pesertaAktif: peserta.count ?? 0,
          available: true,
          loading: false,
        });
      } catch {
        if (active) {
          setStats({
            kursusTerbit: 0,
            pesertaAktif: 0,
            available: false,
            loading: false,
          });
        }
      }
    }

    void loadStats();

    return () => {
      active = false;
    };
  }, [supabase]);

  return stats;
}
