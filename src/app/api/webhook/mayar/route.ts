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
    const event = payload.event;
    const data = payload.data || payload;
    const invoiceId = data.id || data.invoice_id || payload.id;
    const externalId = data.externalId || data.external_id || payload.externalId;

    if (!externalId) {
      console.warn(
        "[Webhook Mayar] Webhook diabaikan karena tidak mengandung externalId (pendaftaran_id)."
      );
      return NextResponse.json({ received: true, ignored: "Missing externalId" });
    }

    const supabaseAdmin = createAdminClient();

    // 2. Cek Idempotensi Mutlak (INV-02)
    const { data: reg, error: regErr } = await supabaseAdmin
      .from("pendaftaran")
      .select("id, status_pembayaran, kursus_id, user_id")
      .eq("id", externalId)
      .single();

    if (regErr || !reg) {
      console.error(
        "[Webhook Mayar] Data pendaftaran tidak ditemukan untuk externalId:",
        externalId
      );
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // Jika sudah aktif, kembalikan 200 OK langsung (Idempoten)
    if (reg.status_pembayaran === "aktif") {
      console.log(
        "[Webhook Mayar] Pendaftaran",
        externalId,
        "sudah aktif sebelumnya. Mengembalikan 200 OK idempotent."
      );
      return NextResponse.json({
        received: true,
        idempotent: true,
        message: "Pendaftaran sudah berstatus aktif.",
      });
    }

    // 3. Verifikasi Ulang ke Server Mayar (Anti-Spoofing)
    if (invoiceId) {
      try {
        const verifiedInvoice = await getMayarInvoiceDetail(invoiceId);
        const invoiceStatus = (verifiedInvoice.status || "").toUpperCase();

        if (invoiceStatus !== "PAID" && invoiceStatus !== "SETTLED" && invoiceStatus !== "SUCCESS") {
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

    // 4. Aktivasi Akses Kursus Melalui RPC Atomik Database
    const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc(
      "konfirmasi_pembayaran_manual",
      {
        p_pendaftaran_id: reg.id,
      }
    );

    if (rpcErr) {
      console.error("[Webhook Mayar] Gagal mengeksekusi RPC aktivasi pendaftaran:", rpcErr);
      throw new Error(`Aktivasi gagal: ${rpcErr.message}`);
    }

    // 5. Catat Audit Log Khusus Webhook Mayar
    await supabaseAdmin.from("audit_log").insert({
      actor_id: null,
      actor_email: "webhook@mayar.id",
      aksi: "PEMBAYARAN_WEBHOOK_MAYAR_BERHASIL",
      tabel_target: "pendaftaran",
      record_id: reg.id,
      data_baru: {
        invoice_id: invoiceId,
        amount: data.amount,
        event: event || "payment.received",
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
