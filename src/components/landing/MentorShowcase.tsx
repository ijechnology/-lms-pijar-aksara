import React from "react";
import { CheckCircle, BookOpen } from "lucide-react";

export default function MentorShowcase() {
  const mentors = [
    {
      nama: "Yudha Pratama",
      inisial: "YP",
      role: "Praktisi Akuntansi & Microsoft Excel",
      kursusDiajar: "Excel Administrasi & Pembukuan UMKM",
      keahlian: ["Formula & Pivot Table", "Pencatatan Arus Kas", "Laporan Keuangan"],
      deskripsi:
        "Berpengalaman lebih dari 7 tahun dalam penyusunan sistem pembukuan usaha kecil serta otomatisasi laporan kerja harian kantor.",
      color: "from-blue-600 to-indigo-700",
    },
    {
      nama: "Laras Wulandari",
      inisial: "LW",
      role: "Kreator Konten & Desainer Promosi",
      kursusDiajar: "Desain Konten Promosi dengan Canva",
      keahlian: ["Canva Visual Branding", "Materi Media Sosial", "Banner Promosi UMKM"],
      deskripsi:
        "Fasilitator desain digital yang aktif mendampingi wirausahawan lokal dalam membuat materi promosi mandiri yang menarik dan profesional.",
      color: "from-amber-500 to-rose-600",
    },
    {
      nama: "Michael Sitorus",
      inisial: "MS",
      role: "Instruktur Komunikasi & Bahasa Inggris Bisnis",
      kursusDiajar: "Bahasa Inggris Komunikasi Kerja",
      keahlian: ["Email Profesional", "Percakapan Kerja", "Etika Komunikasi Formal"],
      deskripsi:
        "Pengajar bahasa Inggris aplikatif dengan fokus pada rasa percaya diri bertutur dan etika komunikasi formal di lingkungan kantor modern.",
      color: "from-emerald-600 to-teal-700",
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Tanpa Badge Pill AI-Slop */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Belajar Langsung dari Instruktur Praktisi
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Materi tidak hanya sekadar teori buku, melainkan pengalaman nyata dari para profesional yang aktif di bidangnya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mentors.map((mentor, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-brand-400 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${mentor.color} text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-slate-200 shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {mentor.inisial}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-bold text-slate-900">
                        {mentor.nama}
                      </h3>
                      <CheckCircle className="w-4 h-4 text-brand-600 fill-brand-50" />
                    </div>
                    <p className="text-xs font-semibold text-brand-600">
                      {mentor.role}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed pt-1">
                  {mentor.deskripsi}
                </p>

                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Fokus Materi Kursus:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.keahlian.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                <span className="truncate">{mentor.kursusDiajar}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
