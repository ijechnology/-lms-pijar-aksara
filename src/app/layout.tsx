import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    template: "%s | LMS Pijar Aksara",
    default: "LMS Lembaga Kursus Pijar Aksara - Tingkatkan Keahlian Praktis Anda",
  },
  description:
    "Platform kursus singkat terpadu di Depok untuk staf kantor dan pelaku UMKM: Excel, Canva, Bahasa Inggris Kerja, dan Pembukuan.",
  keywords: [
    "LMS",
    "Pijar Aksara",
    "Kursus Depok",
    "Pelatihan UMKM",
    "Kursus Excel",
    "Kursus Pembukuan",
  ],
};

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Lewati ke konten
        </a>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
