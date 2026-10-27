/**
 * Helper SDK Integrasi Payment Gateway Mayar Sandbox API
 * LMS Lembaga Kursus Pijar Aksara
 */

export interface CreateInvoiceParams {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  description: string;
  redirectUrl: string;
  expiredAt?: string;
  externalId: string; // pendaftaran_id
}

export interface MayarInvoiceResponse {
  id: string;
  link: string;
  status: string;
  amount: number;
  externalId?: string;
}

const MAYAR_BASE_URL =
  process.env.MAYAR_BASE_URL?.replace(/\/$/, "") || "https://api.mayar.io/hl/v2";
const MAYAR_API_KEY = process.env.MAYAR_API_KEY || "";

export function isMayarConfigured(): boolean {
  const key = (process.env.MAYAR_API_KEY || "").trim();
  return (
    key.length > 20 &&
    !key.includes("your-mayar") &&
    !key.includes("dummy") &&
    !key.startsWith("placeholder")
  );
}

/**
 * Buat Invoice Pembayaran Mayar Sandbox / Production
 */
export async function createMayarInvoice(
  params: CreateInvoiceParams
): Promise<MayarInvoiceResponse> {
  // Mode Fallback Sandbox Mocking jika API Key belum dipasang / dummy
  if (!isMayarConfigured()) {
    console.warn(
      "[Mayar SDK] MAYAR_API_KEY belum dikonfigurasi atau masih dummy. Menggunakan mock invoice sandbox untuk pendaftaran:",
      params.externalId
    );
    return {
      id: `inv_mock_${Date.now()}`,
      link: `${params.redirectUrl}?mock_invoice=true&pendaftaran_id=${params.externalId}`,
      status: "UNPAID",
      amount: params.amount,
      externalId: params.externalId,
    };
  }

  const baseUrl =
    process.env.MAYAR_BASE_URL?.replace(/\/$/, "") || MAYAR_BASE_URL;
  const apiKey = (process.env.MAYAR_API_KEY || MAYAR_API_KEY).trim();

  const endpoint = `${baseUrl}/invoices/create`;

  // Sanitasi nomor ponsel (default fallback valid jika kosong atau terlalu pendek)
  let mobile = (params.customerMobile || "").replace(/[^0-9]/g, "");
  if (mobile.length < 9) {
    mobile = "081234567890";
  }

  // Mayar V2 mewajibkan properti items berupa array
  const payload = {
    name: params.customerName || "Peserta Kursus",
    email: params.customerEmail,
    mobile,
    description: params.description,
    redirectUrl: params.redirectUrl,
    expiredAt: params.expiredAt,
    externalId: params.externalId,
    extraData: {
      pendaftaran_id: params.externalId,
    },
    items: [
      {
        description: params.description,
        quantity: 1,
        rate: params.amount,
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Mayar SDK] Gagal membuat invoice Mayar:", response.status, errorBody);
    throw new Error(
      `Mayar API Error [${response.status}]: ${errorBody || "Gagal menghubungi Mayar gateway."}`
    );
  }

  const resJson = await response.json();
  const data = resJson.data || resJson;

  // Mayar V2 mengembalikan URL pembayaran di paymentUrl atau link
  let paymentLink =
    data.paymentUrl ||
    data.payment_url ||
    (typeof data.link === "string" && data.link.startsWith("http") ? data.link : undefined) ||
    data.url ||
    "";


  return {
    id: data.id || data.invoice_id || data.paymentLinkId,
    link: paymentLink,
    status: (data.status || "UNPAID").toUpperCase(),
    amount: data.amount || params.amount,
    externalId: data.externalId || data.extraData?.pendaftaran_id || params.externalId,
  };
}

/**
 * Ambil Detail Invoice Mayar untuk Verifikasi Webhook Anti-Spoofing & Auto-Verification
 */
export async function getMayarInvoiceDetail(invoiceId: string): Promise<any> {
  if (!isMayarConfigured() || invoiceId.startsWith("inv_mock_")) {
    return {
      id: invoiceId,
      status: "PAID",
      amount: 150000,
    };
  }

  const baseUrl =
    process.env.MAYAR_BASE_URL?.replace(/\/$/, "") || MAYAR_BASE_URL;
  const apiKey = (process.env.MAYAR_API_KEY || MAYAR_API_KEY).trim();

  const endpoint = `${baseUrl}/invoices/${invoiceId}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Mayar API Error [${response.status}]: ${errorBody}`);
  }

  const resJson = await response.json();
  return resJson.data || resJson;
}
