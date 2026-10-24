import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { kirimEmailPendaftaranAktif } from "@/lib/email";

/**
 * POST /api/notifikasi/pendaftaran-aktif
 * Mengirimkan email konfirmasi pendaftaran aktif ke peserta
 * Dapat dipanggil oleh Admin atau sistem internal setelah aktivasi berhasil
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

    // Ambil data pendaftaran beserta kursus dan peserta
    const { data: reg, error: regErr } = await supabaseAdmin
      .from("pendaftaran")
      .select(`
        id,
        status,
        nominal,
        metode_bayar,
        peserta_id,
        kursus:kursus_id (judul),
        peserta:peserta_id (email, nama_lengkap)
      `)
      .eq("id", pendaftaran_id)
      .single();

    if (regErr || !reg) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // Pastikan pendaftaran sudah berstatus aktif
    if (reg.status !== "aktif" && reg.status !== "selesai") {
      return NextResponse.json(
        { error: "Pendaftaran belum berstatus aktif." },
        { status: 400 }
      );
    }

    const peserta = reg.peserta as any;
    const kursus = reg.kursus as any;

    if (!peserta?.email) {
      return NextResponse.json(
        { error: "Email peserta tidak ditemukan." },
        { status: 400 }
      );
    }

    const result = await kirimEmailPendaftaranAktif({
      to: peserta.email,
      namaPeserta: peserta.nama_lengkap || "Peserta LMS",
      judulKursus: kursus?.judul || "Kursus Pijar Aksara",
      pendaftaranId: reg.id,
      nominal: reg.nominal,
      metodeBayar: reg.metode_bayar?.toUpperCase() || "Online Transfer",
    });

    return NextResponse.json({
      success: true,
      message: "Email pendaftaran aktif berhasil dikirimkan.",
      result,
    });
  } catch (error) {
    console.error("[API Notifikasi Pendaftaran Aktif] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan pengiriman email pendaftaran aktif.",
      },
      { status: 500 }
    );
  }
}
