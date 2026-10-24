import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMayarInvoiceDetail } from "@/lib/mayar";
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
        { error: "Autentikasi diperlukan." },
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
      .select("id, peserta_id, status, nominal, mayar_invoice_id, kursus (id, judul), peserta:peserta_id (nama_lengkap, email)")
      .eq("id", pendaftaran_id)
      .single();

    if (regErr || !reg) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // Pastikan kepemilikan pendaftaran
    if (reg.peserta_id !== user.id) {
      return NextResponse.json(
        { error: "Akses ditolak." },
        { status: 403 }
      );
    }

    // Jika sudah aktif
    if (reg.status === "aktif" || reg.status === "selesai") {
      return NextResponse.json({
        success: true,
        alreadyActive: true,
        status: "aktif",
        message: "Pendaftaran sudah aktif dan lunas.",
      });
    }

    // 3. Jika memiliki invoice Mayar, cek status terkini ke server Mayar
    if (reg.mayar_invoice_id) {
      try {
        const verifiedInvoice = await getMayarInvoiceDetail(reg.mayar_invoice_id);
        const invoiceStatus = (verifiedInvoice.status || "").toUpperCase();
        const paidStatuses = ["PAID", "SETTLED", "SUCCESS", "CLOSED"];

        if (paidStatuses.includes(invoiceStatus)) {
          const nowIso = new Date().toISOString();
          const { error: updateErr } = await supabaseAdmin
            .from("pendaftaran")
            .update({
              status: "aktif",
              dibayar_pada: nowIso,
              metode_bayar: "mayar",
            })
            .eq("id", reg.id);

          if (updateErr) {
            throw updateErr;
          }

          // Catat audit log verifikasi
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

          // Kirim Notifikasi Email Pendaftaran Aktif
          const pesertaData = (reg.peserta as any) || {};
          const kursusData = (reg.kursus as any) || {};
          const recipientEmail = pesertaData.email || user.email;

          if (recipientEmail) {
            console.log("[Verifikasi Mayar] Mengirim email pendaftaran aktif ke:", recipientEmail);
            await kirimEmailPendaftaranAktif({
              to: recipientEmail,
              namaPeserta: pesertaData.nama_lengkap || user.user_metadata?.nama_lengkap || "Peserta LMS",
              judulKursus: kursusData.judul || "Kursus Pijar Aksara",
              pendaftaranId: reg.id,
              nominal: reg.nominal,
              metodeBayar: "Mayar Payment Gateway",
            }).catch((emailErr) => {
              console.error("[Verifikasi Mayar] Gagal kirim email pendaftaran aktif:", emailErr);
            });
          }

          return NextResponse.json({
            success: true,
            status: "aktif",
            message: "Pembayaran terverifikasi lunas! Ruang belajar telah aktif.",
          });
        } else {
          return NextResponse.json({
            success: false,
            status: reg.status,
            mayarStatus: invoiceStatus,
            message: "Pembayaran belum berstatus lunas di gerbang pembayaran Mayar.",
          });
        }
      } catch (verifyErr) {
        console.error("[API Verifikasi Mayar] Error verifikasi ke Mayar:", verifyErr);
        return NextResponse.json(
          {
            error:
              verifyErr instanceof Error
                ? verifyErr.message
                : "Gagal memverifikasi status ke Mayar.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: false,
      status: reg.status,
      message: "Belum ada invoice Mayar untuk pendaftaran ini.",
    });
  } catch (err) {
    console.error("[API Verifikasi Mayar] Error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memverifikasi pembayaran.",
      },
      { status: 500 }
    );
  }
}
