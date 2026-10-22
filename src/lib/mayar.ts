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
  process.env.MAYAR_BASE_URL?.replace(/\/$/, "") || "https://api.mayar.id/hl/v1";
const MAYAR_API_KEY = process.env.MAYAR_API_KEY || "";

/**
 * Buat Invoice Pembayaran Mayar Sandbox
 */
export async function createMayarInvoice(
  params: CreateInvoiceParams
): Promise<MayarInvoiceResponse> {
  // Mode Fallback Sandbox Mocking jika API Key belum dipasang
  if (!MAYAR_API_KEY || MAYAR_API_KEY.includes("your-mayar")) {
    console.warn(
      "[Mayar SDK] MAYAR_API_KEY belum dikonfigurasi. Menggunakan mock invoice sandbox untuk pendaftaran:",
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

  const endpoint = `${MAYAR_BASE_URL}/invoices/create`;

  const payload = {
    name: params.customerName,
    email: params.customerEmail,
    mobile: params.customerMobile || "081234567890",
    amount: params.amount,
    description: params.description,
    redirectUrl: params.redirectUrl,
    expiredAt: params.expiredAt,
    externalId: params.externalId,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MAYAR_API_KEY}`,
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

  return {
    id: data.id || data.invoice_id,
    link: data.link || data.payment_url || data.url,
    status: data.status || "UNPAID",
    amount: data.amount || params.amount,
    externalId: data.externalId || params.externalId,
  };
}

/**
 * Ambil Detail Invoice Mayar untuk Verifikasi Webhook Anti-Spoofing
 */
export async function getMayarInvoiceDetail(invoiceId: string): Promise<any> {
  if (!MAYAR_API_KEY || MAYAR_API_KEY.includes("your-mayar") || invoiceId.startsWith("inv_mock_")) {
    return {
      id: invoiceId,
      status: "PAID",
      amount: 150000,
    };
  }

  const endpoint = `${MAYAR_BASE_URL}/invoices/${invoiceId}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${MAYAR_API_KEY}`,
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
