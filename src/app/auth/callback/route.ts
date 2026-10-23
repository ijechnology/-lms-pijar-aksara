import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/kursus-saya";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Periksa profil pengguna untuk mengarahkan ke dashboard yang sesuai
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("peran")
          .eq("id", user.id)
          .single();

        if (profile?.peran === "admin") {
          return NextResponse.redirect(`${origin}/admin/dashboard`);
        } else if (profile?.peran === "instruktur") {
          return NextResponse.redirect(`${origin}/instruktur/kursus`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Jika kode gagal diexchange atau kadaluarsa, arahkan ke halaman masuk dengan pesan
  return NextResponse.redirect(`${origin}/masuk?pesan=verifikasi_gagal`);
}
