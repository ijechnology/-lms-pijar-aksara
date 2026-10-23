import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // 1. Verifikasi Sesi Pengguna
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pendaftaran_id } = body;

    if (!pendaftaran_id) {
      return NextResponse.json(
        { error: "Parameter pendaftaran_id wajib disertakan." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 2. Ambil data pendaftaran
    const { data: reg, error: regErr } = await supabaseAdmin
      .from("pendaftaran")
      .select("id, peserta_id, status, nominal, kursus (id, judul)")
      .eq("id", pendaftaran_id)
      .single();

    if (regErr || !reg) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // Pastikan kepemilikan
    if (reg.peserta_id !== user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke pendaftaran ini." },
        { status: 403 }
      );
    }

    if (reg.status === "aktif" || reg.status === "selesai") {
      return NextResponse.json({
        success: true,
        alreadyActive: true,
        message: "Pendaftaran sudah berstatus aktif.",
      });
    }

    // 3. Update status pendaftaran menjadi aktif (Simulasi Sandbox Mayar)
    const { error: updateErr } = await supabaseAdmin
      .from("pendaftaran")
      .update({
        status: "aktif",
        dibayar_pada: new Date().toISOString(),
      })
      .eq("id", pendaftaran_id);

    if (updateErr) {
      throw updateErr;
    }

    // 4. Catat ke audit_log
    await supabaseAdmin.from("audit_log").insert({
      pelaku_id: user.id,
      aksi: "pembayaran_simulasi_mayar",
      nama_tabel: "pendaftaran",
      id_data: pendaftaran_id,
      data_sesudah: {
        metode: "mayar_sandbox_simulasi",
        status: "aktif",
        kursus: (reg.kursus as any)?.judul,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Simulasi pembayaran Mayar berhasil! Akses kursus telah dibuka.",
    });
  } catch (err) {
    console.error("[Simulasi Mayar] Error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan pada simulasi pembayaran Mayar.",
      },
      { status: 500 }
    );
  }
}
