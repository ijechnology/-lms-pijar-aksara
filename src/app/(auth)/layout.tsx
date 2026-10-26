import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground font-bold text-primary">
            PA
          </div>
          <span className="text-lg font-semibold">Pijar Aksara</span>
        </Link>
        <div className="space-y-4">
          <p className="max-w-sm text-2xl font-semibold leading-snug">
            Belajar keterampilan kerja yang langsung bisa dipakai.
          </p>
          <ul className="space-y-2 text-sm text-primary-foreground">
            <li>Kurikulum praktis untuk kantor dan UMKM.</li>
            <li>Instruktur praktisi dan evaluasi terukur.</li>
            <li>Sertifikat resmi setelah seluruh modul lulus.</li>
          </ul>
        </div>
        <p className="text-xs text-primary-foreground">
          Lembaga Kursus Pijar Aksara · Depok
        </p>
      </aside>
      <main
        id="konten"
        className="flex items-center justify-center bg-background p-4 sm:p-8"
      >
        {children}
      </main>
    </div>
  );
}
