import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: "",
          ...options,
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Header noindex untuk seluruh halaman internal selain katalog dan detail kursus publik
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/kursus" ||
    (pathname.startsWith("/kursus/") && !pathname.includes("/kursus-saya")) ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api");

  if (!isPublicRoute) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Jika belum login dan mengakses halaman terproteksi
  if (!user) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/instruktur") ||
      pathname.startsWith("/kursus-saya")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/masuk";
      url.searchParams.set("kembali", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Ambil profil pengguna untuk verifikasi peran
  const { data: profile } = await supabase
    .from("profiles")
    .select("peran, aktif")
    .eq("id", user.id)
    .single();

  const peran = profile?.peran || (user.user_metadata?.peran as string) || "peserta";
  const aktif = profile?.aktif ?? true;

  // Jika akun dinonaktifkan
  if (!aktif && !pathname.startsWith("/akses-ditolak") && !pathname.startsWith("/masuk")) {
    const url = request.nextUrl.clone();
    url.pathname = "/akses-ditolak";
    url.searchParams.set("alasan", "akun_nonaktif");
    return NextResponse.redirect(url);
  }

  // Pengalihan jika sudah login dan membuka /masuk atau /daftar
  if (pathname === "/masuk" || pathname === "/daftar") {
    const url = request.nextUrl.clone();
    if (peran === "admin") {
      url.pathname = "/admin/dashboard";
    } else if (peran === "instruktur") {
      url.pathname = "/instruktur/kursus";
    } else {
      url.pathname = "/kursus-saya";
    }
    return NextResponse.redirect(url);
  }

  // Proteksi rute admin
  if (pathname.startsWith("/admin") && peran !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/akses-ditolak";
    return NextResponse.redirect(url);
  }

  // Proteksi rute instruktur
  if (pathname.startsWith("/instruktur") && peran !== "instruktur" && peran !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/akses-ditolak";
    return NextResponse.redirect(url);
  }

  // Proteksi rute peserta
  if (pathname.startsWith("/kursus-saya") && peran !== "peserta" && peran !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/akses-ditolak";
    return NextResponse.redirect(url);
  }

  return response;
}
