import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { kirimEmailSertifikatTerbit } from "@/lib/email";

/**
 * POST /api/notifikasi/sertifikat
 * Mengirimkan email ucapan selamat & tautan sertifikat resmi yang baru saja terbit
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pendaftaran_id } = body;

    if (!pendaftaran_id) {
      return NextResponse.json(
        { error: "Parameter pendaftaran_id wajib diisi." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Ambil data sertifikat berdasarkan pendaftaran_id
    const { data: cert, error: certErr } = await supabaseAdmin
      .from("sertifikat")
      .select(`
        id,
        nomor_sertifikat,
        nama_peserta,
        judul_kursus,
        diterbitkan_pada,
        pendaftaran:pendaftaran_id (
          id,
          peserta_id,
          peserta:peserta_id (email, nama_lengkap)
        )
      `)
      .eq("pendaftaran_id", pendaftaran_id)
      .order("diterbitkan_pada", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (certErr || !cert) {
      return NextResponse.json(
        { error: "Data sertifikat belum ditemukan untuk pendaftaran ini." },
        { status: 404 }
      );
    }

    const pendaftaranData = Array.isArray(cert.pendaftaran)
      ? cert.pendaftaran[0]
      : (cert.pendaftaran as any);

    const pesertaData = Array.isArray(pendaftaranData?.peserta)
      ? pendaftaranData.peserta[0]
      : (pendaftaranData?.peserta as any);

    const pesertaId = pendaftaranData?.peserta_id;

    // Keamanan: pastikan yang meminta adalah pemilik sertifikat atau admin
    if (pesertaId !== user.id) {
      // Cek apakah admin
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("peran")
        .eq("id", user.id)
        .single();

      if (profile?.peran !== "admin") {
        return NextResponse.json(
          { error: "Akses ditolak: Anda tidak memiliki izin untuk sertifikat ini." },
          { status: 403 }
        );
      }
    }

    const recipientEmail = pesertaData?.email;
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Alamat email penerima tidak ditemukan." },
        { status: 400 }
      );
    }

    console.log(`[API Notifikasi Sertifikat] Mengirim email sertifikat ke: ${recipientEmail} (${cert.nomor_sertifikat})`);

    const result = await kirimEmailSertifikatTerbit({
      to: recipientEmail,
      namaPeserta: cert.nama_peserta || pesertaData?.nama_lengkap || "Peserta",
      judulKursus: cert.judul_kursus,
      pendaftaranId: pendaftaran_id,
      nomorSertifikat: cert.nomor_sertifikat,
      diterbitkanPada: cert.diterbitkan_pada,
    });

    return NextResponse.json({
      success: true,
      message: "Email sertifikat terbit berhasil dikirimkan.",
      nomorSertifikat: cert.nomor_sertifikat,
      result,
    });
  } catch (error) {
    console.error("[API Notifikasi Sertifikat] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan pengiriman email sertifikat.",
      },
      { status: 500 }
    );
  }
}
