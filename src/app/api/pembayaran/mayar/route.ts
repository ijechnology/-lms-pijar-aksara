import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMayarInvoice, getMayarInvoiceDetail } from "@/lib/mayar";

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
        id, peserta_id, status, nominal, batas_bayar, mayar_invoice_id, metode_bayar,
        kursus (id, judul, slug, harga, kuota),
        profiles:profiles!pendaftaran_peserta_id_fkey (id, nama_lengkap, email, no_hp)
      `)
      .eq("id", pendaftaran_id)
      .single();

    if (regErr || !reg) {
      console.error("[API Mayar Payment] Fetch pendaftaran error:", regErr);
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

    // Jika sudah aktif
    if (reg.status === "aktif" || reg.status === "selesai") {
      return NextResponse.json({
        success: true,
        alreadyActive: true,
        message: "Pendaftaran kursus ini sudah aktif dan lunas.",
        redirectUrl: "/kursus-saya",
      });
    }

    // Jika status pendaftaran dibatalkan atau kadaluwarsa
    if (reg.status === "dibatalkan" || reg.status === "kedaluwarsa") {
      return NextResponse.json(
        { error: "Pendaftaran ini telah dibatalkan atau kedaluwarsa. Silakan mendaftar kembali." },
        { status: 400 }
      );
    }

    // Auto-Verification: Jika pendaftaran sudah punya invoice Mayar, cek langsung ke server Mayar apakah sudah dibayar
    if (reg.mayar_invoice_id) {
      try {
        const verifiedInvoice = await getMayarInvoiceDetail(reg.mayar_invoice_id);
        const invoiceStatus = (verifiedInvoice.status || "").toUpperCase();
        const paidStatuses = ["PAID", "SETTLED", "SUCCESS", "CLOSED"];

        if (paidStatuses.includes(invoiceStatus)) {
          const supabaseAdmin = createAdminClient();
          await supabaseAdmin
            .from("pendaftaran")
            .update({
              status: "aktif",
              dibayar_pada: new Date().toISOString(),
              metode_bayar: "mayar",
            })
            .eq("id", reg.id);

          await supabaseAdmin.from("audit_log").insert({
            pelaku_id: user.id,
            aksi: "verifikasi_langsung_mayar",
            nama_tabel: "pendaftaran",
            id_data: reg.id,
            data_sesudah: {
              status: "aktif",
              invoice_id: reg.mayar_invoice_id,
              kursus: (reg.kursus as any)?.judul,
            },
          });

          return NextResponse.json({
            success: true,
            alreadyActive: true,
            message: "Pembayaran telah terverifikasi lunas! Akses ruang belajar telah dibuka.",
            redirectUrl: "/kursus-saya",
          });
        } else if (verifiedInvoice.paymentUrl || verifiedInvoice.link) {
          // Jika invoice belum lunas dan masih aktif, gunakan kembali link pembayaran yang ada
          const paymentLink =
            verifiedInvoice.paymentUrl ||
            (typeof verifiedInvoice.link === "string" && verifiedInvoice.link.startsWith("http")
              ? verifiedInvoice.link
              : undefined);

          if (paymentLink) {
            return NextResponse.json({
              success: true,
              paymentUrl: paymentLink,
              invoiceId: reg.mayar_invoice_id,
              amount: verifiedInvoice.amount || reg.nominal,
              expiredAt: reg.batas_bayar,
              isMock: reg.mayar_invoice_id.startsWith("inv_mock_"),
            });
          }
        }
      } catch (checkErr) {
        console.warn("[API Mayar Payment] Gagal cek invoice Mayar yang ada:", checkErr);
      }
    }

    // Jika metode pendaftaran adalah transfer_manual, tidak perlu diproses ke gateway Mayar
    if (reg.metode_bayar === "transfer_manual") {
      return NextResponse.json({
        success: true,
        isTransferManual: true,
        message:
          "Pendaftaran ini menggunakan metode Transfer Bank Manual. Silakan lakukan pembayaran ke rekening resmi lembaga dan tunggu verifikasi Admin.",
      });
    }

    const kursus = reg.kursus as any;
    const profile = reg.profiles as any;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

    // 4. Jika Kursus Gratis (harga 0), langsung aktifkan menggunakan admin client
    const nominalBayar = reg.nominal ?? kursus?.harga ?? 0;
    if (nominalBayar === 0) {
      const supabaseAdmin = createAdminClient();
      const { error: konfErr } = await supabaseAdmin
        .from("pendaftaran")
        .update({
          status: "aktif",
          dibayar_pada: new Date().toISOString(),
          metode_bayar: "gratis",
        })
        .eq("id", reg.id);

      if (konfErr) {
        throw new Error(konfErr.message);
      }

      await supabaseAdmin.from("audit_log").insert({
        pelaku_id: user.id,
        aksi: "aktivasi_kursus_gratis",
        nama_tabel: "pendaftaran",
        id_data: reg.id,
        data_sesudah: { status: "aktif", kursus: kursus?.judul },
      });

      return NextResponse.json({
        success: true,
        alreadyActive: true,
        message: "Kursus gratis berhasil diaktifkan seketika!",
        redirectUrl: `/kursus-saya`,
      });
    }

    // 5. Buat Invoice Mayar Sandbox / Production
    const expiredAt =
      reg.batas_bayar ||
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const invoice = await createMayarInvoice({
      amount: nominalBayar,
      customerName: profile?.nama_lengkap || user.email || "Peserta Kursus",
      customerEmail: profile?.email || user.email || "peserta@pijaraksara.id",
      customerMobile: profile?.no_hp || undefined,
      description: `Pendaftaran Kursus: ${kursus.judul}`,
      redirectUrl: `${appUrl}/kursus-saya?pembayaran=selesai&pendaftaran_id=${reg.id}`,
      expiredAt,
      externalId: reg.id,
    });

    // Simpan id invoice Mayar ke pendaftaran
    if (invoice.id) {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin
        .from("pendaftaran")
        .update({
          mayar_invoice_id: invoice.id,
          metode_bayar: "mayar",
        })
        .eq("id", reg.id);
    }

    return NextResponse.json({
      success: true,
      paymentUrl: invoice.link,
      invoiceId: invoice.id,
      amount: invoice.amount,
      expiredAt,
      isMock: invoice.id.startsWith("inv_mock_"),
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
