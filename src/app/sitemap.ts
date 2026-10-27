import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/client";

// Fallback slugs for published courses in Data_Contoh_LMS.xlsx
const FALLBACK_PUBLISHED_SLUGS = [
  "excel-administrasi-perkantoran",
  "dasar-pembukuan-umkm",
  "desain-konten-canva",
  "bahasa-inggris-komunikasi-kerja",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lms-pijaraksara.netlify.app";

  let publishedSlugs: { slug: string; updated_at?: string }[] = [];

  try {
    const supabase = createClient();
    // BR-01 & SEO: Hanya kursus berstatus 'terbit' yang dimasukkan ke sitemap
    const { data: kursusList, error } = await supabase
      .from("kursus")
      .select("slug, diubah_pada")
      .eq("status", "terbit");

    if (!error && kursusList && kursusList.length > 0) {
      publishedSlugs = kursusList.map((k) => ({
        slug: k.slug,
        updated_at: k.diubah_pada,
      }));
    } else {
      publishedSlugs = FALLBACK_PUBLISHED_SLUGS.map((slug) => ({ slug }));
    }
  } catch (err) {
    console.warn("Menggunakan fallback sitemap slugs:", err);
    publishedSlugs = FALLBACK_PUBLISHED_SLUGS.map((slug) => ({ slug }));
  }

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...publishedSlugs.map((item) => ({
      url: `${baseUrl}/kursus/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return sitemapEntries;
}
