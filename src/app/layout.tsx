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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
