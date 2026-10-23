import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMayarInvoiceDetail } from "@/lib/mayar";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload: any = {};

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Payload webhook harus berformat valid JSON." },
        { status: 400 }
      );
    }

    console.log("[Webhook Mayar] Menerima event webhook:", payload.event || payload.status);

    // 1. Ekstraksi Informasi Invoice & Pendaftaran
    const event = payload.event || payload.action || "payment.received";
    const data = payload.data || payload;
    const invoiceId =
      data.id || data.invoiceId || data.invoice_id || data.paymentLinkId || payload.id;
    const externalId =
      data.externalId ||
      data.external_id ||
      data.extraData?.pendaftaran_id ||
      data.extraData?.pendaftaranId ||
      payload.externalId;

    const supabaseAdmin = createAdminClient();

    // 2. Cari Pendaftaran Berdasarkan externalId atau mayar_invoice_id
    let reg: any = null;

    if (externalId) {
      const { data: regById } = await supabaseAdmin
        .from("pendaftaran")
        .select("id, status, kursus_id, peserta_id, mayar_invoice_id")
        .eq("id", externalId)
        .maybeSingle();
      reg = regById;
    }

    if (!reg && invoiceId) {
      const { data: regByInvoice } = await supabaseAdmin
        .from("pendaftaran")
        .select("id, status, kursus_id, peserta_id, mayar_invoice_id")
        .eq("mayar_invoice_id", invoiceId)
        .maybeSingle();
      reg = regByInvoice;
    }

    if (!reg) {
      console.warn(
        "[Webhook Mayar] Data pendaftaran tidak ditemukan untuk payload webhook:",
        { externalId, invoiceId }
      );
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // 3. Cek Idempotensi Mutlak (INV-02)
    // Jika sudah aktif / selesai, kembalikan 200 OK langsung (Idempoten)
    if (reg.status === "aktif" || reg.status === "selesai") {
      console.log(
        "[Webhook Mayar] Pendaftaran",
        reg.id,
        "sudah aktif sebelumnya. Mengembalikan 200 OK idempotent."
      );
      return NextResponse.json({
        received: true,
        idempotent: true,
        message: "Pendaftaran sudah berstatus aktif.",
      });
    }

    // 4. Verifikasi Ulang ke Server Mayar (Anti-Spoofing)
    if (invoiceId) {
      try {
        const verifiedInvoice = await getMayarInvoiceDetail(invoiceId);
        const invoiceStatus = (verifiedInvoice.status || "").toUpperCase();

        const paidStatuses = ["PAID", "SETTLED", "SUCCESS", "CLOSED"];
        if (!paidStatuses.includes(invoiceStatus)) {
          console.warn(
            "[Webhook Mayar] Status invoice terverifikasi dari Mayar belum lunas:",
            invoiceStatus
          );
          return NextResponse.json({
            received: true,
            status: invoiceStatus,
            message: "Pembayaran belum berstatus lunas.",
          });
        }
      } catch (verifyErr) {
        console.error("[Webhook Mayar] Gagal memverifikasi invoice ke Mayar API:", verifyErr);
        // Tetap lanjutkan jika dalam mode sandbox mock
      }
    }

    // 5. Aktivasi Akses Kursus Menggunakan Service Role
    const nowIso = new Date().toISOString();
    const { error: updateErr } = await supabaseAdmin
      .from("pendaftaran")
      .update({
        status: "aktif",
        dibayar_pada: nowIso,
        metode_bayar: "mayar",
        mayar_invoice_id: invoiceId || reg.mayar_invoice_id,
      })
      .eq("id", reg.id);

    if (updateErr) {
      console.error("[Webhook Mayar] Gagal mengaktifkan pendaftaran:", updateErr);
      throw new Error(`Aktivasi gagal: ${updateErr.message}`);
    }

    // 6. Catat Audit Log Khusus Webhook Mayar
    await supabaseAdmin.from("audit_log").insert({
      pelaku_id: null,
      aksi: "pembayaran_webhook_mayar",
      nama_tabel: "pendaftaran",
      id_data: reg.id,
      data_sesudah: {
        invoice_id: invoiceId,
        amount: data.amount,
        event: event,
        pendaftaran_id: reg.id,
      },
    });

    console.log(
      "[Webhook Mayar] Pembayaran berhasil diverifikasi & akses kursus aktif untuk pendaftaran:",
      reg.id
    );

    return NextResponse.json({
      received: true,
      success: true,
      pendaftaranId: reg.id,
      status: "aktif",
    });
  } catch (err) {
    console.error("[Webhook Mayar] Terjadi error internal:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan internal webhook handler.",
      },
      { status: 500 }
    );
  }
}
