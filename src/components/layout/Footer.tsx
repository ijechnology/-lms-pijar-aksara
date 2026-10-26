import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40 print:hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              PA
            </span>
            <span className="text-base font-semibold tracking-tight">
              Pijar Aksara
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Platform kursus singkat terpadu di Depok untuk staf kantor dan
            pelaku UMKM yang ingin meningkatkan keahlian praktis.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Tautan Cepat</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/kursus" className="transition-colors hover:text-foreground">
                Katalog
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="transition-colors hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/masuk" className="transition-colors hover:text-foreground">
                Masuk
              </Link>
            </li>
            <li>
              <Link href="/daftar" className="transition-colors hover:text-foreground">
                Daftar
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Lokasi</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Depok, Jawa Barat
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Lembaga Kursus Pijar Aksara
          </p>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {year} Lembaga Kursus Pijar Aksara. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
