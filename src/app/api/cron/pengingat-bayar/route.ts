import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kirimEmailBatasBayar } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Handler utama untuk mengecek dan mengirim email pengingat batas bayar tinggal 3 jam
 */
async function prosesPengingatBatasBayar(request: NextRequest) {
  try {
    // 1. Verifikasi Keamanan Cron Secret (opsional di dev, wajib jika diset di .env)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[Cron Pengingat Bayar] Ditolak: Authorization token tidak valid.");
      return NextResponse.json(
        { error: "Akses ditolak: Token Cron Secret tidak valid." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const now = new Date();
    // 3 jam ke depan dari sekarang
    const tigaJamKeDepan = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    console.log("[Cron Pengingat Bayar] Menjalankan pengecekan sisa batas bayar 3 jam...", {
      waktuSekarang: now.toISOString(),
      jendelaBatas: tigaJamKeDepan.toISOString(),
    });

    // 2. Ambil pendaftaran yang statusnya 'menunggu_bayar', batas bayar belum lewat,
    //    jatuh tempo dalam rentang <= 3 jam dari sekarang, dan belum pernah dikirimi email pengingat
    const { data: tagihanList, error: queryErr } = await supabaseAdmin
      .from("pendaftaran")
      .select(`
        id,
        nominal,
        batas_bayar,
        mayar_invoice_id,
        notifikasi_pengingat_terkirim,
        kursus:kursus_id (id, judul),
        peserta:peserta_id (id, nama_lengkap, email)
      `)
      .eq("status", "menunggu_bayar")
      .not("batas_bayar", "is", null)
      .eq("notifikasi_pengingat_terkirim", false)
      .gt("batas_bayar", now.toISOString())
      .lte("batas_bayar", tigaJamKeDepan.toISOString());

    if (queryErr) {
      console.error("[Cron Pengingat Bayar] Error query data pendaftaran:", queryErr);
      throw queryErr;
    }

    const totalDitemukan = tagihanList?.length || 0;
    console.log(`[Cron Pengingat Bayar] Ditemukan ${totalDitemukan} pendaftaran yang perlu dikirimi pengingat.`);

    if (totalDitemukan === 0) {
      return NextResponse.json({
        success: true,
        checkedAt: now.toISOString(),
        totalPending: 0,
        sent: 0,
        message: "Tidak ada pendaftaran dengan batas bayar sisa 3 jam saat ini.",
      });
    }

    const hasilKirim: Array<{
      id: string;
      email: string;
      kursus: string;
      status: string;
    }> = [];

    // 3. Iterasi dan kirimkan email ke masing-masing peserta
    for (const item of tagihanList) {
      const peserta = item.peserta as any;
      const kursus = item.kursus as any;

      if (!peserta?.email) {
        console.warn(`[Cron Pengingat Bayar] Dilewati: Peserta ID ${item.id} tidak memiliki email.`);
        continue;
      }

      try {
        const sendResult = await kirimEmailBatasBayar({
          to: peserta.email,
          namaPeserta: peserta.nama_lengkap || "Peserta LMS",
          judulKursus: kursus?.judul || "Kursus Pijar Aksara",
          pendaftaranId: item.id,
          nominal: item.nominal,
          batasBayar: item.batas_bayar,
        });

        // 4. Tandai bahwa notifikasi pengingat sudah dikirimkan agar tidak berulang
        await supabaseAdmin
          .from("pendaftaran")
          .update({ notifikasi_pengingat_terkirim: true })
          .eq("id", item.id);

        // Catat audit log pengingat
        await supabaseAdmin.from("audit_log").insert({
          pelaku_id: null,
          aksi: "kirim_email_pengingat_3jam",
          nama_tabel: "pendaftaran",
          id_data: item.id,
          data_sesudah: {
            email: peserta.email,
            kursus: kursus?.judul,
            batas_bayar: item.batas_bayar,
          },
        });

        hasilKirim.push({
          id: item.id,
          email: peserta.email,
          kursus: kursus?.judul,
          status: "terkirim",
        });
      } catch (sendErr) {
        console.error(`[Cron Pengingat Bayar] Gagal kirim email ke ${peserta.email}:`, sendErr);
        hasilKirim.push({
          id: item.id,
          email: peserta.email,
          kursus: kursus?.judul,
          status: "gagal",
        });
      }
    }

    return NextResponse.json({
      success: true,
      checkedAt: now.toISOString(),
      totalDitemukan,
      sent: hasilKirim.filter((h) => h.status === "terkirim").length,
      detail: hasilKirim,
    });
  } catch (err) {
    console.error("[Cron Pengingat Bayar] Fatal Error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan internal pada Cron Pengingat Bayar.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return prosesPengingatBatasBayar(request);
}

export async function POST(request: NextRequest) {
  return prosesPengingatBatasBayar(request);
}
