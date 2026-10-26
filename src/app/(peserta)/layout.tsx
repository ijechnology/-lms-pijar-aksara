import Navbar from "@/components/layout/Navbar";

export default function PesertaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div id="konten" className="flex-1">
        {children}
      </div>
    </div>
  );
}
