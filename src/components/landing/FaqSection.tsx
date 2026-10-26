"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Buka yang pertama secara default

  const faqs = [
    {
      tanya: "Apakah sertifikat dari LMS Pijar Aksara resmi dan terverifikasi?",
      jawab:
        "Ya, setiap peserta yang telah menyelesaikan seluruh modul pembelajaran dan mencapai batas nilai kelulusan kuis minimal akan diterbitkan sertifikat digital resmi bernomor unik dari Lembaga Kursus Pijar Aksara Kota Depok.",
    },
    {
      tanya: "Bagaimana jika kuota kelas kursus sudah penuh?",
      jawab:
        "Sistem kami membatasi pendaftaran secara otomatis begitu kuota maksimal tercapai guna menjaga kualitas pendampingan. Ketersediaan sisa kursi dapat Anda pantau langsung secara real-time pada setiap kartu kursus.",
    },
    {
      tanya: "Apakah materi kursus dapat diakses secara fleksibel?",
      jawab:
        "Tentu. Anda dapat belajar kapan saja dan di mana saja melalui perangkat laptop maupun smartphone. Alur pembelajaran disusun berurutan agar Anda menguasai fondasi konsep secara bertahap sebelum membuka kuis evaluasi.",
    },
    {
      tanya: "Metode pembayaran apa saja yang didukung untuk kursus berbayar?",
      jawab:
        "Kami menyediakan sistem pembayaran otomatis yang aman via Mayar, mendukung pembayaran instan menggunakan QRIS (semua e-wallet dan aplikasi mobile banking) serta Virtual Account bank ternama dengan verifikasi instan.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
            <HelpCircle className="w-3.5 h-3.5" />
            Tanya Jawab Umum
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Temukan jawaban cepat seputar tata cara belajar, sertifikasi resmi, batas kuota, dan metode pembayaran di Pijar Aksara.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-brand-600 transition-colors focus:outline-none"
                >
                  <span className="text-base sm:text-lg">{faq.tanya}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-brand-50 text-brand-600 rotate-180"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.jawab}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
