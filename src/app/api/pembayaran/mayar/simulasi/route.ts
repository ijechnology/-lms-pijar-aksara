import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kirimEmailPendaftaranAktif } from "@/lib/email";

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

    // 2. Ambil data pendaftaran beserta profil peserta
    const { data: reg, error: regErr } = await supabaseAdmin
      .from("pendaftaran")
      .select("id, peserta_id, status, nominal, kursus (id, judul), peserta:peserta_id (nama_lengkap, email)")
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

    // 5. Kirim Notifikasi Email Pendaftaran Aktif
    const pesertaData = (reg.peserta as any) || {};
    const kursusData = (reg.kursus as any) || {};
    const recipientEmail = pesertaData.email || user.email;

    if (recipientEmail) {
      console.log("[Simulasi Mayar] Memulai pengiriman email pendaftaran aktif ke:", recipientEmail);
      await kirimEmailPendaftaranAktif({
        to: recipientEmail,
        namaPeserta: pesertaData.nama_lengkap || user.user_metadata?.nama_lengkap || "Peserta LMS",
        judulKursus: kursusData.judul || "Kursus Pijar Aksara",
        pendaftaranId: pendaftaran_id,
        nominal: reg.nominal,
        metodeBayar: "Simulasi Pembayaran (Sandbox)",
      }).catch((emailErr) => {
        console.error("[Simulasi Mayar] Gagal kirim email notifikasi aktif:", emailErr);
      });
    }

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
