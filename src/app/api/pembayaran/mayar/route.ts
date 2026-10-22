import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMayarInvoice } from "@/lib/mayar";

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

    // 2. Baca Body Request
    const body = await request.json();
    const { pendaftaran_id } = body;

    if (!pendaftaran_id) {
      return NextResponse.json(
        { error: "Parameter pendaftaran_id wajib disertakan." },
        { status: 400 }
      );
    }

    // 3. Ambil data pendaftaran beserta profil dan kursus
    const { data: reg, error: regErr } = await supabase
      .from("pendaftaran")
      .select(`
        id, user_id, status_pembayaran, batas_pembayaran,
        kursus (id, judul, slug, harga, kuota),
        profiles:profiles!pendaftaran_user_id_fkey (id, nama_lengkap, email, no_hp)
      `)
      .eq("id", pendaftaran_id)
      .single();

    if (regErr || !reg) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // Pastikan kepemilikan
    if (reg.user_id !== user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke pendaftaran ini." },
        { status: 403 }
      );
    }

    // Jika sudah aktif
    if (reg.status_pembayaran === "aktif") {
      return NextResponse.json({
        success: true,
        alreadyActive: true,
        message: "Pendaftaran kursus ini sudah aktif dan lunas.",
        redirectUrl: "/kursus-saya",
      });
    }

    // Jika status pendaftaran dibatalkan
    if (reg.status_pembayaran === "dibatalkan") {
      return NextResponse.json(
        { error: "Pendaftaran ini telah dibatalkan. Silakan mendaftar kembali." },
        { status: 400 }
      );
    }

    const kursus = reg.kursus as any;
    const profile = reg.profiles as any;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

    // 4. Jika Kursus Gratis (harga 0), langsung aktifkan via RPC
    if (!kursus.harga || kursus.harga === 0) {
      const { data: konfData, error: konfErr } = await supabase.rpc(
        "konfirmasi_pembayaran_manual",
        {
          p_pendaftaran_id: reg.id,
        }
      );

      if (konfErr) {
        throw new Error(konfErr.message);
      }

      return NextResponse.json({
        success: true,
        alreadyActive: true,
        message: "Kursus gratis berhasil diaktifkan seketika!",
        redirectUrl: `/kursus-saya`,
      });
    }

    // 5. Buat Invoice Mayar Sandbox
    const expiredAt =
      reg.batas_pembayaran ||
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const invoice = await createMayarInvoice({
      amount: kursus.harga,
      customerName: profile?.nama_lengkap || user.email || "Peserta Kursus",
      customerEmail: profile?.email || user.email || "peserta@pijaraksara.id",
      customerMobile: profile?.no_hp || undefined,
      description: `Pendaftaran Kursus: ${kursus.judul}`,
      redirectUrl: `${appUrl}/kursus-saya`,
      expiredAt,
      externalId: reg.id,
    });

    return NextResponse.json({
      success: true,
      paymentUrl: invoice.link,
      invoiceId: invoice.id,
      amount: invoice.amount,
      expiredAt,
    });
  } catch (err) {
    console.error("[API Mayar Payment] Error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses gerbang pembayaran.",
      },
      { status: 500 }
    );
  }
}
