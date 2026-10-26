import React from "react";
import { Star, Quote } from "lucide-react";

export default function TestimonialSection() {
  const testimonials = [
    {
      nama: "Budi Santoso",
      profesi: "Pemilik Usaha Kuliner, Sukmajaya - Depok",
      kursus: "Dasar Pembukuan & Laporan Keuangan UMKM",
      avatarBg: "bg-emerald-600",
      inisial: "BS",
      komentar:
        "Sebelumnya uang pribadi dan uang jualan warung selalu campur aduk. Lewat kursus ini, pencatatan arus kas dan laba rugi dijelaskan dengan sangat sederhana. Sekarang pembukuan warung saya jadi rapi dan jelas ke mana uangnya berputar.",
    },
    {
      nama: "Siti Rahmawati",
      profesi: "Pelaku Toko Online & Wirausaha Kreatif",
      kursus: "Desain Konten Promosi dengan Canva",
      avatarBg: "bg-amber-600",
      inisial: "SR",
      komentar:
        "Materi Canva-nya langsung to the point untuk kebutuhan jualan online. Dalam hitungan jam saya sudah bisa bikin poster promo WhatsApp dan katalog produk yang menarik tanpa perlu sewa desainer mahal.",
    },
    {
      nama: "Rizky Firmansyah",
      profesi: "Fresh Graduate / Pencari Kerja, Depok",
      kursus: "Excel Administrasi & Bahasa Inggris Kerja",
      avatarBg: "bg-blue-600",
      inisial: "RF",
      komentar:
        "Sertifikat resmi dari Lembaga Kursus Pijar Aksara dan latihan studi kasus rumus Excel kantor sangat menambah rasa percaya diri saya saat tes kerja administrasi. Sangat merekomendasikan untuk fresh graduate!",
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Tanpa Badge Pill AI-Slop */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cerita Nyata dari Peserta & Pelaku Usaha
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Dampak nyata peningkatan keahlian praktis dalam memajukan usaha mandiri dan kesiapan memasuki dunia kerja.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:bg-white hover:border-brand-300 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Rating & Kutipan */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-300" />
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{t.komentar}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-full ${t.avatarBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}
                >
                  {t.inisial}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {t.nama}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {t.profesi}
                  </p>
                  <span className="inline-block mt-0.5 text-[11px] font-semibold text-brand-600 truncate max-w-full">
                    {t.kursus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
