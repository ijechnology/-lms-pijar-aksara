"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { HargaFilter } from "@/types/kursus";

function parseHarga(value: string | null): HargaFilter {
  return value === "gratis" || value === "berbayar" ? value : "semua";
}

export function useKatalogFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const q = searchParams.get("q") ?? "";
  const kategori = searchParams.get("kategori") ?? "semua";
  const harga = parseHarga(searchParams.get("harga"));

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const setQ = useCallback(
    (value: string) => {
      replaceParams((params) => {
        if (value === "") {
          params.delete("q");
        } else {
          params.set("q", value);
        }
      });
    },
    [replaceParams]
  );

  const setKategori = useCallback(
    (value: string) => {
      replaceParams((params) => {
        if (value === "" || value === "semua") {
          params.delete("kategori");
        } else {
          params.set("kategori", value);
        }
      });
    },
    [replaceParams]
  );

  const setHarga = useCallback(
    (value: HargaFilter) => {
      replaceParams((params) => {
        if (value === "semua") {
          params.delete("harga");
        } else {
          params.set("harga", value);
        }
      });
    },
    [replaceParams]
  );

  const reset = useCallback(() => {
    replaceParams((params) => {
      params.delete("q");
      params.delete("kategori");
      params.delete("harga");
    });
  }, [replaceParams]);

  return useMemo(
    () => ({
      q,
      kategori,
      harga,
      setQ,
      setKategori,
      setHarga,
      reset,
    }),
    [q, kategori, harga, setQ, setKategori, setHarga, reset]
  );
}
