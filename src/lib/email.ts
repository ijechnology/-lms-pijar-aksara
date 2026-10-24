import nodemailer from "nodemailer";
import { Resend } from "resend";

/**
 * Mendapatkan transporter Gmail SMTP secara dinamis
 */
function getSmtpConfig() {
  const user = (process.env.SMTP_USER || "").trim();
  const rawPass = (process.env.SMTP_PASS || "").trim();
  // Hapus semua spasi dari password aplikasi Google
  const pass = rawPass.replace(/\s+/g, "");

  if (user && pass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
    return { transporter, user };
  }
  return { transporter: null, user: null };
}

const getBaseAppUrl = () => {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://lms-pijar-aksara.netlify.app")
  );
};

/**
 * Pengirim email universal:
 * 1. Prioritas utama: SMTP Gmail (Nodemailer) -> Kirim ke semua email user mana saja tanpa perlu domain kustom!
 * 2. Prioritas kedua: Resend API.
 */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { transporter, user } = getSmtpConfig();

  // 1. Jika konfigurasi SMTP Gmail tersedia, gunakan Nodemailer
  if (transporter && user) {
    try {
      const fromAddress = `LMS Pijar Aksara <${user}>`;
      console.log(`[Email SMTP Gmail] Mengirim email dari "${fromAddress}" ke "${to}"...`);
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
      });
      console.log(`[Email SMTP Gmail] SUKSES terkirim ke ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, provider: "smtp" };
    } catch (smtpErr) {
      console.error(`[Email SMTP Gmail] Gagal kirim email ke ${to}:`, smtpErr);
      // Lanjutkan mencoba via Resend jika ada
    }
  }

  // 2. Jika Resend tersedia
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resendClient = new Resend(resendApiKey);
      const emailFrom = process.env.EMAIL_FROM || "LMS Pijar Aksara <onboarding@resend.dev>";
      const { data, error } = await resendClient.emails.send({
        from: emailFrom,
        to,
        subject,
        html,
      });
      if (error) {
        console.error("[Email Resend] Error:", error);
        return { success: false, error, provider: "resend" };
      }
      console.log(`[Email Resend] SUKSES terkirim ke ${to}:`, data?.id);
      return { success: true, data, provider: "resend" };
    } catch (resendErr) {
      console.error("[Email Resend] Gagal kirim via Resend:", resendErr);
      return { success: false, error: resendErr, provider: "resend" };
    }
  }

  console.warn(
    `[Email Service: MOCK] Mengirim email ke ${to} (Subject: ${subject}). Belum ada SMTP_USER atau RESEND_API_KEY aktif.`
  );
  return { success: true, mocked: true };
}

/**
 * Komponen pembungkus layout email HTML standar Pijar Aksara
 */
function emailLayout({
  previewText,
  headerBadge,
  headerBadgeColor = "#2563eb",
  headerTitle,
  children,
}: {
  previewText: string;
  headerBadge: string;
  headerBadgeColor?: string;
  headerTitle: string;
  children: string;
}) {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding: 30px 10px;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      max-width: 600px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px 28px;
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 9999px;
      color: #ffffff;
      background-color: ${headerBadgeColor};
      margin-bottom: 12px;
    }
    .title {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.3;
    }
    .subtitle {
      margin: 8px 0 0 0;
      font-size: 13px;
      color: #94a3b8;
    }
    .content {
      padding: 32px 28px;
      line-height: 1.6;
      font-size: 15px;
    }
    .card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .card-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #edf2f7;
      font-size: 14px;
    }
    .card-row:last-child {
      border-bottom: none;
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background-color: #1d4ed8;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      border-radius: 10px;
      text-align: center;
      margin: 10px 0;
    }
    .footer {
      padding: 24px 28px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #f1f5f9;
      background-color: #fafafa;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <table class="wrapper" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center">
        <table class="main" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td class="header">
              <span class="badge">${headerBadge}</span>
              <h1 class="title">${headerTitle}</h1>
              <p class="subtitle">Platform Belajar &amp; Pelatihan Terpadu LMS Pijar Aksara</p>
            </td>
          </tr>
          <tr>
            <td class="content">
              ${children}
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #334155;">Lembaga Pelatihan &amp; Kursus Pijar Aksara</p>
              <p style="margin: 0;">Email ini dikirim secara otomatis oleh sistem LMS Pijar Aksara. Mohon tidak membalas langsung ke email ini.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 1. Kirim Email Notifikasi Saat Pendaftaran Aktif
 */
export async function kirimEmailPendaftaranAktif({
  to,
  namaPeserta,
  judulKursus,
  pendaftaranId,
  nominal,
  metodeBayar = "Online Gateway",
}: {
  to: string;
  namaPeserta: string;
  judulKursus: string;
  pendaftaranId: string;
  nominal: number;
  metodeBayar?: string;
}) {
  const appUrl = getBaseAppUrl();
  const kursusUrl = `${appUrl}/kursus-saya`;

  const html = emailLayout({
    previewText: `Pendaftaran kursus "${judulKursus}" telah aktif. Mulai belajar sekarang!`,
    headerBadge: "Akses Kursus Aktif",
    headerBadgeColor: "#16a34a",
    headerTitle: "Selamat Datang di Program Pelatihan!",
    children: `
      <p style="margin-top:0;">Halo <strong>${namaPeserta}</strong>,</p>
      <p>Kabar gembira! Pembayaran dan pendaftaran Anda untuk kursus <strong>&ldquo;${judulKursus}&rdquo;</strong> telah berhasil diverifikasi dan saat ini <strong>berstatus Aktif</strong>.</p>
      
      <div class="card">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 12px; font-size: 15px;">Detail Pendaftaran:</div>
        <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
          <tr>
            <td style="color: #64748b; width: 40%;">Judul Kursus:</td>
            <td style="font-weight: 600; color: #0f172a;">${judulKursus}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Nominal:</td>
            <td style="font-weight: 600; color: #16a34a;">${
              nominal === 0 ? "Gratis (Rp 0)" : `Rp ${nominal.toLocaleString("id-ID")}`
            }</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Metode:</td>
            <td style="font-weight: 600; color: #0f172a;">${metodeBayar}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Status:</td>
            <td style="font-weight: 700; color: #16a34a;">Lunas / Aktif</td>
          </tr>
        </table>
      </div>

      <p>Anda sudah dapat mengakses modul materi, mengikuti video pembelajaran, dan mengerjakan evaluasi kuis untuk meraih sertifikat resmi.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${kursusUrl}" class="btn" style="background-color: #1d4ed8;">
          Mulai Belajar di Kursus Saya &rarr;
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
        Tips: Simpan progres belajar Anda secara bertahap. Jika mengalami kendala saat mengakses materi, tim dukungan kami siap membantu.
      </p>
    `,
  });

  return sendEmail({
    to,
    subject: `🎉 Pendaftaran Aktif: Selamat Belajar di Kursus "${judulKursus}"`,
    html,
  });
}

/**
 * 2. Kirim Email Pengingat Batas Bayar Tinggal 3 Jam
 */
export async function kirimEmailBatasBayar({
  to,
  namaPeserta,
  judulKursus,
  pendaftaranId,
  nominal,
  batasBayar,
  paymentUrl,
}: {
  to: string;
  namaPeserta: string;
  judulKursus: string;
  pendaftaranId: string;
  nominal: number;
  batasBayar: string;
  paymentUrl?: string | null;
}) {
  const appUrl = getBaseAppUrl();
  const ctaUrl = paymentUrl || `${appUrl}/kursus-saya`;

  // Format tanggal batas bayar ke Bahasa Indonesia
  const formattedDeadline = new Date(batasBayar).toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const html = emailLayout({
    previewText: `Penting: Sisa waktu pembayaran kursus "${judulKursus}" tersisa kurang dari 3 jam!`,
    headerBadge: "Perhatian Pembayaran",
    headerBadgeColor: "#d97706",
    headerTitle: "Batas Waktu Pembayaran Tersisa 3 Jam",
    children: `
      <p style="margin-top:0;">Halo <strong>${namaPeserta}</strong>,</p>
      <p>Ini adalah pengingat penting mengenai pendaftaran Anda pada kursus <strong>&ldquo;${judulKursus}&rdquo;</strong>.</p>
      
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e; font-weight: 700; font-size: 15px;">
          ⏳ Batas akhir pembayaran Anda tersisa kurang dari 3 jam lagi!
        </p>
        <p style="margin: 6px 0 0 0; color: #b45309; font-size: 13px;">
          Setelah batas waktu terlewati, tagihan akan kedaluwarsa otomatis dan kuota pendaftaran akan dilepas ke peserta lain.
        </p>
      </div>

      <div class="card">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 12px; font-size: 15px;">Ringkasan Tagihan:</div>
        <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
          <tr>
            <td style="color: #64748b; width: 40%;">Judul Kursus:</td>
            <td style="font-weight: 600; color: #0f172a;">${judulKursus}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Total Tagihan:</td>
            <td style="font-weight: 800; color: #dc2626; font-size: 16px;">
              Rp ${nominal.toLocaleString("id-ID")}
            </td>
          </tr>
          <tr>
            <td style="color: #64748b;">Batas Terakhir:</td>
            <td style="font-weight: 700; color: #b45309;">${formattedDeadline}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${ctaUrl}" class="btn" style="background-color: #d97706;">
          Selesaikan Pembayaran Sekarang &rarr;
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
        *Jika Anda sudah menyelesaikan transfer dalam beberapa saat terakhir, mohon abaikan email ini. Status akan diperbarui otomatis setelah verifikasi selesai.
      </p>
    `,
  });

  return sendEmail({
    to,
    subject: `⏰ Pengingat: Batas Waktu Pembayaran Kursus "${judulKursus}" Tersisa 3 Jam`,
    html,
  });
}

/**
 * 3. Kirim Email Notifikasi Saat Sertifikat Terbit
 */
export async function kirimEmailSertifikatTerbit({
  to,
  namaPeserta,
  judulKursus,
  pendaftaranId,
  nomorSertifikat,
  diterbitkanPada,
}: {
  to: string;
  namaPeserta: string;
  judulKursus: string;
  pendaftaranId: string;
  nomorSertifikat: string;
  diterbitkanPada?: string;
}) {
  const appUrl = getBaseAppUrl();
  const sertifikatUrl = `${appUrl}/kursus-saya/${pendaftaranId}/sertifikat`;
  const verifikasiUrl = `${appUrl}/verify/${nomorSertifikat}`;

  const tanggalStr = diterbitkanPada
    ? new Date(diterbitkanPada).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const html = emailLayout({
    previewText: `Selamat! Sertifikat resmi kelulusan Anda untuk "${judulKursus}" telah resmi diterbitkan.`,
    headerBadge: "Sertifikat Kelulusan Resmi",
    headerBadgeColor: "#059669",
    headerTitle: "🎓 Selamat Atas Kelulusan Anda!",
    children: `
      <p style="margin-top:0;">Yth. <strong>${namaPeserta}</strong>,</p>
      <p>Selamat dan apresiasi setinggi-tingginya! Anda telah berhasil menuntaskan seluruh materi modul pelatihan dan lulus evaluasi kuis pada kursus <strong>&ldquo;${judulKursus}&rdquo;</strong>.</p>
      
      <div style="background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">
          Nomor Sertifikat Resmi Terverifikasi:
        </span>
        <div style="font-size: 20px; font-weight: 900; color: #14532d; font-family: monospace; letter-spacing: 0.05em;">
          ${nomorSertifikat}
        </div>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #15803d;">
          Diterbitkan pada: ${tanggalStr}
        </p>
      </div>

      <p>Dokumen sertifikat kelulusan digital Anda telah ditandatangani secara resmi oleh Direktur Lembaga Pelatihan Pijar Aksara dan terdaftar dalam basis data verifikasi publik kami.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${sertifikatUrl}" class="btn" style="background-color: #059669;">
          Buka &amp; Unduh Sertifikat Resmi &rarr;
        </a>
      </div>

      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 14px; font-size: 12px; color: #64748b; text-align: center;">
        Tautan Verifikasi Keaslian Dokumen untuk Portofolio/LinkedIn: <br />
        <a href="${verifikasiUrl}" style="color: #2563eb; font-weight: 600; text-decoration: underline;">
          ${verifikasiUrl}
        </a>
      </div>
    `,
  });

  return sendEmail({
    to,
    subject: `🎓 Selamat! Sertifikat Resmi Anda untuk Kursus "${judulKursus}" Telah Terbit`,
    html,
  });
}
