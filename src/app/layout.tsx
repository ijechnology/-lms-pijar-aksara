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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
