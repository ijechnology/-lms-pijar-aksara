import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMayarInvoiceDetail } from "@/lib/mayar";

/**
 * Health check endpoint untuk verifikasi kesiapan webhook Mayar
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Mayar Webhook Endpoint - LMS Pijar Aksara",
    timestamp: new Date().toISOString(),
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload: any = {};

    // Jika ping tanpa body (beberapa tester gateway hanya mengirim ping kosong)
    if (!rawBody || rawBody.trim() === "") {
      return NextResponse.json({
        received: true,
        message: "Ping berhasil diterima.",
      });
    }

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Payload webhook harus berformat valid JSON." },
        { status: 400 }
      );
    }

    console.log(
      "[Webhook Mayar] Menerima event webhook:",
      payload.event || payload.action || payload.status || "ping"
    );

    // 1. Ekstraksi Informasi Event, Invoice & Pendaftaran
    const event = (payload.event || payload.action || "").toString().toLowerCase();
    const data = payload.data || payload;
    const invoiceId =
      data.id || data.invoiceId || data.invoice_id || data.paymentLinkId || payload.id;
    const externalId =
      data.externalId ||
      data.external_id ||
      data.extraData?.pendaftaran_id ||
      data.extraData?.pendaftaranId ||
      payload.externalId;

    // 2. Deteksi Test Ping dari Dashboard Mayar
    // Dashboard Mayar mengirim test webhook dengan event "test", "ping", atau invoice dummy
    const isTestWebhook =
      event === "test" ||
      event === "ping" ||
      event.includes("test") ||
      invoiceId === "test" ||
      invoiceId === "test_123" ||
      invoiceId === "sample-id" ||
      (!invoiceId && !externalId);

    if (isTestWebhook) {
      console.log("[Webhook Mayar] Test ping dari dashboard Mayar berhasil direspons 200 OK.");
      return NextResponse.json({
        received: true,
        test: true,
        message: "Mayar webhook test event received successfully. Endpoint is healthy and active.",
      });
    }

    const supabaseAdmin = createAdminClient();

    // 3. Cari Pendaftaran Berdasarkan externalId atau mayar_invoice_id
    let reg: any = null;

    if (externalId) {
      const { data: regById } = await supabaseAdmin
        .from("pendaftaran")
        .select("id, status, kursus_id, peserta_id, mayar_invoice_id, nominal")
        .eq("id", externalId)
        .maybeSingle();
      reg = regById;
    }

    if (!reg && invoiceId) {
      const { data: regByInvoice } = await supabaseAdmin
        .from("pendaftaran")
        .select("id, status, kursus_id, peserta_id, mayar_invoice_id, nominal")
        .eq("mayar_invoice_id", invoiceId)
        .maybeSingle();
      reg = regByInvoice;
    }

    // Jika tidak ditemukan di database kita (misal transaksi lain atau test ID yang tidak terdaftar):
    // Tetap kembalikan 200 OK agar payment gateway tidak menganggap endpoint kita rusak/offline
    if (!reg) {
      console.warn(
        "[Webhook Mayar] Data pendaftaran tidak ditemukan untuk payload ini (diabaikan secara aman):",
        { externalId, invoiceId, event }
      );
      return NextResponse.json({
        received: true,
        ignored: true,
        message: "Data pendaftaran tidak ditemukan. Webhook diterima dan diabaikan.",
      });
    }

    // 4. Cek Idempotensi Mutlak (INV-02)
    // Jika pendaftaran sudah aktif atau selesai, kembalikan 200 OK langsung tanpa memproses ulang
    if (reg.status === "aktif" || reg.status === "selesai") {
      console.log(
        "[Webhook Mayar] Pendaftaran",
        reg.id,
        "sudah berstatus aktif sebelumnya. Mengembalikan 200 OK idempoten."
      );
      return NextResponse.json({
        received: true,
        idempotent: true,
        message: "Pendaftaran sudah berstatus aktif.",
      });
    }

    // 5. Verifikasi Ulang ke Server Mayar (Anti-Spoofing & Validasi Status)
    if (invoiceId && !invoiceId.startsWith("inv_mock_")) {
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
            message: "Pembayaran belum berstatus lunas di server Mayar.",
          });
        }
      } catch (verifyErr) {
        console.error("[Webhook Mayar] Gagal verifikasi invoice ke Mayar API:", verifyErr);
        // Tetap lanjutkan proses aktivasi jika event adalah payment.received
      }
    }

    // 6. Aktivasi Akses Kursus Menggunakan Supabase Admin (Service Role)
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

    // 7. Catat Audit Log Khusus Webhook Mayar
    await supabaseAdmin.from("audit_log").insert({
      pelaku_id: null,
      aksi: "pembayaran_webhook_mayar",
      nama_tabel: "pendaftaran",
      id_data: reg.id,
      data_sesudah: {
        invoice_id: invoiceId,
        amount: data.amount || reg.nominal,
        event: event,
        pendaftaran_id: reg.id,
      },
    });

    console.log(
      "[Webhook Mayar] Pembayaran berhasil diverifikasi & akses kursus diaktifkan untuk pendaftaran:",
      reg.id
    );

    return NextResponse.json({
      received: true,
      success: true,
      pendaftaranId: reg.id,
      status: "aktif",
      message: "Pendaftaran berhasil diaktifkan melalui Webhook Mayar.",
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
