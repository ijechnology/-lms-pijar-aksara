import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import { randomUUID } from "crypto";

// 1. Baca kredensial dari .env.local
const envFile = fs.readFileSync(".env.local", "utf-8");
const envVars: Record<string, string> = {};
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.trim().split("=");
  if (k && v.length) envVars[k] = v.join("=");
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseServiceKey = envVars["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase URL atau Service Role Key tidak ditemukan di .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("==============================================================");
  console.log("  MENYIAPKAN DATA SIMULASI UJI CRON JOB (AKUN NADIA PUTRI)   ");
  console.log("==============================================================");

  // 2. Ambil data profil Nadia Putri
  const targetEmail = "nadia.putri@pijaraksara.test";
  const { data: nadia, error: errNadia } = await supabase
    .from("profiles")
    .select("id, nama_lengkap, email")
    .eq("email", targetEmail)
    .single();

  if (errNadia || !nadia) {
    console.error(`Gagal menemukan akun ${targetEmail}:`, errNadia);
    process.exit(1);
  }

  // 3. Ambil 1 kursus berbayar (Bahasa Inggris untuk Percakapan Kerja)
  const targetKursusId = "00000000-0000-4000-b000-000000000003";
  const { data: kursus, error: errKursus } = await supabase
    .from("kursus")
    .select("id, judul, harga")
    .eq("id", targetKursusId)
    .single();

  if (errKursus || !kursus) {
    console.error(`Gagal menemukan kursus berbayar:`, errKursus);
    process.exit(1);
  }

  // 4. Hitung batas bayar: 2 jam ke depan dari detik ini
  const now = new Date();
  const duaJamKeDepan = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // 5. Cek apakah sudah ada pendaftaran pengujian sebelumnya
  const { data: existingReg } = await supabase
    .from("pendaftaran")
    .select("id")
    .eq("peserta_id", nadia.id)
    .eq("kursus_id", kursus.id)
    .maybeSingle();

  if (existingReg) {
    // Reset pendaftaran yang ada agar siap diproses cron
    const { error: errUpdate } = await supabase
      .from("pendaftaran")
      .update({
        status: "menunggu_bayar",
        batas_bayar: duaJamKeDepan.toISOString(),
        notifikasi_pengingat_terkirim: false,
        nominal: kursus.harga,
        metode_bayar: "mayar",
      })
      .eq("id", existingReg.id);

    if (errUpdate) {
      console.error("Gagal memperbarui pendaftaran:", errUpdate);
      process.exit(1);
    }
    console.log(`\n✓ Berhasil me-reset transaksi yang sudah ada (ID: ${existingReg.id})`);
  } else {
    // Buat data pendaftaran uji baru (menggunakan UUID standar agar otomatis dibersihkan clean_test_data.ts)
    const newId = randomUUID();
    const { error: errInsert } = await supabase.from("pendaftaran").insert({
      id: newId,
      peserta_id: nadia.id,
      kursus_id: kursus.id,
      status: "menunggu_bayar",
      nominal: kursus.harga,
      metode_bayar: "mayar",
      batas_bayar: duaJamKeDepan.toISOString(),
      notifikasi_pengingat_terkirim: false,
      didaftarkan_pada: now.toISOString(),
    });

    if (errInsert) {
      console.error("Gagal membuat pendaftaran baru:", errInsert);
      process.exit(1);
    }
    console.log(`\n✓ Berhasil membuat transaksi pendaftaran uji baru (ID: ${newId})`);
  }

  console.log("\n--- RINGKASAN DATA SIMULASI CRON ---");
  console.log(`• Peserta Target   : ${nadia.nama_lengkap} (${nadia.email})`);
  console.log(`• Kursus Target    : ${kursus.judul}`);
  console.log(`• Status Tagihan   : menunggu_bayar`);
  console.log(`• Waktu Sekarang   : ${now.toLocaleTimeString("id-ID")} WIB`);
  console.log(`• Batas Bayar      : ${duaJamKeDepan.toLocaleTimeString("id-ID")} WIB (Sisa ~2 Jam)`);
  console.log(`• Status Pengingat : Belum Terkirim (false)`);
  console.log("-------------------------------------");
  console.log("\nKondisi terpenuhi! Saat Anda menekan tombol 'Uji Cron (3 Jam)' di /admin/dashboard nanti:");
  console.log("1. Sistem akan mendeteksi tagihan Nadia Putri ini.");
  console.log("2. Menampilkan notifikasi: '1 email pengingat (sisa <= 3 jam) terkirim.'");
  console.log("3. Menambahkan catatan otomatis di Tab Audit Log.");
  console.log("==============================================================");
}

main().catch(console.error);
