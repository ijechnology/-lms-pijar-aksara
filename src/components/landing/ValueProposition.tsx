import React from "react";
import { Briefcase, UserCheck, Award, Clock } from "lucide-react";

export default function ValueProposition() {
  const benefits = [
    {
      icon: Briefcase,
      title: "Kurikulum Praktis & Aplikatif",
      description:
        "Fokus pada studi kasus harian dunia kerja perkantoran dan toko UMKM. Materi terstruktur langsung siap pakai tanpa teori berbelit.",
      iconBg: "bg-blue-50 text-brand-600 border-blue-100",
    },
    {
      icon: UserCheck,
      title: "Instruktur Praktisi Berpengalaman",
      description:
        "Dibimbing langsung oleh praktisi aktif di bidang akuntansi keuangan, desainer konten kreatif, dan komunikasi bisnis profesional.",
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      icon: Award,
      title: "Ujian Kuis & Sertifikat Resmi",
      description:
        "Evaluasi pemahaman berbasis standar kelulusan terukur serta penerbitan e-sertifikat resmi dari Lembaga Kursus Pijar Aksara Depok.",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      icon: Clock,
      title: "Kuota Terjadwal Anti-Bentrok",
      description:
        "Setiap kelas memiliki batasan kuota peserta teratur untuk menjaga proses belajar yang fokus dan pendampingan yang optimal.",
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Tanpa Badge Pill AI-Slop */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kenapa Memilih Belajar di Pijar Aksara?
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Metode pelatihan intensif terpadu yang dirancang untuk mempercepat penguasaan keterampilan siap kerja bagi staf dan pemilik usaha.
          </p>
        </div>

        {/* 4 Pilar Keunggulan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:bg-white hover:border-brand-400 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.iconBg} group-hover:scale-105 transition-transform`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
