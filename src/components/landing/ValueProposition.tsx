import React from "react";
import { Briefcase, UserCheck, Award, Clock } from "lucide-react";

export default function ValueProposition() {
  const benefits = [
    {
      icon: Briefcase,
      title: "Kurikulum Praktis & Aplikatif",
      description:
        "Fokus pada studi kasus nyata di dunia kerja harian dan usaha UMKM, dirancang langsung siap diterapkan tanpa teori berbelit.",
      color: "text-brand-600 bg-brand-50 border-brand-100",
    },
    {
      icon: UserCheck,
      title: "Instruktur Praktisi Ahli",
      description:
        "Dibimbing langsung oleh para profesional aktif di bidang akuntansi, desain promosi, dan komunikasi bisnis profesional.",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      icon: Award,
      title: "Ujian Kuis & Sertifikat Resmi",
      description:
        "Dilengkapi evaluasi pemahaman berbasis standar kelulusan terukur serta e-sertifikat resmi dari Lembaga Kursus Pijar Aksara Depok.",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      icon: Clock,
      title: "Kuota Terjadwal Anti-Bentrok",
      description:
        "Setiap kelas memiliki batasan kuota teratur untuk menjamin pendampingan yang intensif dan alur belajar yang nyaman.",
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
            Nilai Keunggulan
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kenapa Memilih Belajar di Pijar Aksara?
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Metode pelatihan terstruktur yang dirancang khusus untuk mempercepat penguasaan keterampilan esensial bagi profesional dan pelaku usaha.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:bg-white hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color} group-hover:scale-105 transition-transform`}
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
