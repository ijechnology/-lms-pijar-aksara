import Link from "next/link";
import { BookOpen, Sparkles, Award, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-8 md:p-16 max-w-6xl mx-auto">
      <header className="flex justify-between items-center py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md">
            PA
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">
            Pijar Aksara
          </span>
        </div>
        <nav className="flex gap-4">
          <Link
            href="/masuk"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow transition"
          >
            Daftar Akun
          </Link>
        </nav>
      </header>

      <section className="py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-100 text-accent-800 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Lembaga Kursus Terpercaya di Depok
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Tingkatkan Keahlian Praktis untuk Karier dan Usaha Anda
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Kursus intensif dan terarah untuk staf kantor dan pelaku UMKM: Excel,
          Canva, Bahasa Inggris Kerja, dan Pembukuan praktis.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <a
            href="#kursus"
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg shadow-brand-500/20 transition flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" /> Jelajahi Kursus
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-t border-slate-200">
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-800 text-lg">Kurikulum Terstruktur</h2>
          <p className="text-slate-600 text-sm">
            Modul pembelajaran bertahap dengan studi kasus nyata dunia kerja dan bisnis.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-accent-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-800 text-lg">Evaluasi Objektif</h2>
          <p className="text-slate-600 text-sm">
            Kuis komprehensif server-side untuk memastikan pemahaman mendalam setiap materi.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-800 text-lg">Sertifikat Resmi</h2>
          <p className="text-slate-600 text-sm">
            Nomor sertifikat unik tahunan yang terverifikasi resmi oleh Lembaga Kursus Pijar Aksara.
          </p>
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200">
        &copy; {new Date().getFullYear()} Lembaga Kursus Pijar Aksara Depok. Hak cipta dilindungi.
      </footer>
    </main>
  );
}
