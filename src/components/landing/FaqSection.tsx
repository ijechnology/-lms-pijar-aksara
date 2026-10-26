import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqSection() {
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

  return (
    <section
      id="faq"
      className="scroll-mt-20 border-b bg-muted/30 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Temukan jawaban cepat seputar tata cara belajar, sertifikasi resmi,
            batas kuota, dan metode pembayaran di Pijar Aksara.
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.tanya}
              value={`faq-${index}`}
              className="rounded-lg border bg-card px-4 sm:px-6"
            >
              <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline sm:text-lg">
                {faq.tanya}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {faq.jawab}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
