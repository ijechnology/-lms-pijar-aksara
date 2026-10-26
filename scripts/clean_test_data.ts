import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Baca kredensial dari .env.local
const envFile = fs.readFileSync(".env.local", "utf-8");
const envVars: Record<string, string> = {};
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.trim().split("=");
  if (k && v.length) envVars[k] = v.join("=");
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseServiceKey = envVars["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase URL atau Service Role Key tidak ditemukan.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function cleanTestData() {
  console.log("=================================================");
  console.log("  MEMBERSIHKAN DATA TESTING MANUAL DARI SUPABASE ");
  console.log("=================================================");

  // 1. Hapus Sertifikat Manual Testing
  console.log("\n1. Membersihkan sertifikat non-seed...");
  const { data: allSertifikat } = await supabase.from("sertifikat").select("id, nomor_sertifikat");
  const testSertifikat = allSertifikat?.filter(s => !s.id.startsWith("00000000-0000-4000-")) || [];
  if (testSertifikat.length > 0) {
    const ids = testSertifikat.map(s => s.id);
    const { error } = await supabase.from("sertifikat").delete().in("id", ids);
    if (error) console.error("   Gagal menghapus sertifikat:", error);
    else console.log(`   ✓ Berhasil menghapus ${testSertifikat.length} sertifikat testing.`);
  } else {
    console.log("   - Tidak ada sertifikat testing.");
  }

  // 2. Hapus Percobaan Kuis Manual Testing
  console.log("\n2. Membersihkan percobaan kuis non-seed...");
  const { data: allKuis } = await supabase.from("percobaan_kuis").select("id");
  const testKuis = allKuis?.filter(k => !k.id.startsWith("00000000-0000-4000-")) || [];
  if (testKuis.length > 0) {
    const ids = testKuis.map(k => k.id);
    const { error } = await supabase.from("percobaan_kuis").delete().in("id", ids);
    if (error) console.error("   Gagal menghapus percobaan kuis:", error);
    else console.log(`   ✓ Berhasil menghapus ${testKuis.length} percobaan kuis testing.`);
  } else {
    console.log("   - Tidak ada percobaan kuis testing.");
  }

  // 3. Hapus Progres Modul Manual Testing
  console.log("\n3. Membersihkan progres modul non-seed...");
  const { data: allProgres } = await supabase.from("progres_modul").select("id");
  const testProgres = allProgres?.filter(p => !p.id.startsWith("00000000-0000-4000-")) || [];
  if (testProgres.length > 0) {
    const ids = testProgres.map(p => p.id);
    const { error } = await supabase.from("progres_modul").delete().in("id", ids);
    if (error) console.error("   Gagal menghapus progres modul:", error);
    else console.log(`   ✓ Berhasil menghapus ${testProgres.length} progres modul testing.`);
  } else {
    console.log("   - Tidak ada progres modul testing.");
  }

  // 4. Hapus Pendaftaran Manual Testing
  console.log("\n4. Membersihkan pendaftaran non-seed...");
  const { data: allPendaftaran } = await supabase.from("pendaftaran").select("id, kursus_id, peserta_id");
  const testPendaftaran = allPendaftaran?.filter(p => !p.id.startsWith("00000000-0000-4000-")) || [];
  if (testPendaftaran.length > 0) {
    const ids = testPendaftaran.map(p => p.id);
    const { error } = await supabase.from("pendaftaran").delete().in("id", ids);
    if (error) console.error("   Gagal menghapus pendaftaran:", error);
    else console.log(`   ✓ Berhasil menghapus ${testPendaftaran.length} pendaftaran testing.`);
  } else {
    console.log("   - Tidak ada pendaftaran testing.");
  }

  // 5. Hapus Soal Kuis Manual Testing
  console.log("\n5. Membersihkan soal kuis non-seed...");
  const { data: allSoal } = await supabase.from("soal").select("id");
  const testSoal = allSoal?.filter(s => !s.id.startsWith("00000000-0000-4000-")) || [];
  if (testSoal.length > 0) {
    const ids = testSoal.map(s => s.id);
    const { error } = await supabase.from("soal").delete().in("id", ids);
    if (error) console.error("   Gagal menghapus soal kuis:", error);
    else console.log(`   ✓ Berhasil menghapus ${testSoal.length} soal kuis testing.`);
  } else {
    console.log("   - Tidak ada soal testing.");
  }

  // 6. Hapus Modul Manual Testing
  console.log("\n6. Membersihkan modul non-seed...");
  const { data: allModul } = await supabase.from("modul").select("id, judul");
  const testModul = allModul?.filter(m => !m.id.startsWith("00000000-0000-4000-")) || [];
  if (testModul.length > 0) {
    const ids = testModul.map(m => m.id);
    const { error } = await supabase.from("modul").delete().in("id", ids);
    if (error) console.error("   Gagal menghapus modul:", error);
    else console.log(`   ✓ Berhasil menghapus ${testModul.length} modul testing (${testModul.map(m=>m.judul).join(", ")}).`);
  } else {
    console.log("   - Tidak ada modul testing.");
  }

  // 7. Hapus Kursus Manual Testing
  console.log("\n7. Membersihkan kursus non-seed...");
  const { data: allKursus } = await supabase.from("kursus").select("id, judul");
  const testKursus = allKursus?.filter(k => !k.id.startsWith("00000000-0000-4000-")) || [];
  if (testKursus.length > 0) {
    const ids = testKursus.map(k => k.id);
    const { error } = await supabase.from("kursus").delete().in("id", ids);
    if (error) console.error("   Gagal menghapus kursus:", error);
    else console.log(`   ✓ Berhasil menghapus ${testKursus.length} kursus testing (${testKursus.map(k=>k.judul).join(", ")}).`);
  } else {
    console.log("   - Tidak ada kursus testing.");
  }

  // 8. Hapus Akun Pengguna Testing (auth.users & profiles)
  console.log("\n8. Membersihkan akun pengguna manual testing...");
  const { data: allProfiles } = await supabase.from("profiles").select("id, nama_lengkap, email, peran");
  const testProfiles = allProfiles?.filter(p => !p.id.startsWith("00000000-0000-4000-")) || [];
  if (testProfiles.length > 0) {
    for (const user of testProfiles) {
      // Hapus audit log terkait pengguna ini terlebih dahulu jika ada
      await supabase.from("audit_log").delete().eq("pelaku_id", user.id);
      
      // Hapus dari auth.users via admin API
      const { error: authErr } = await supabase.auth.admin.deleteUser(user.id);
      if (authErr) {
        console.warn(`   Peringatan auth deleteUser (${user.email}):`, authErr.message);
      }
      // Hapus dari profiles
      const { error: profErr } = await supabase.from("profiles").delete().eq("id", user.id);
      if (profErr) {
        console.warn(`   Peringatan profile delete (${user.email}):`, profErr.message);
      } else {
        console.log(`   ✓ Berhasil menghapus akun: ${user.nama_lengkap} (${user.email})`);
      }
    }
  } else {
    console.log("   - Tidak ada akun pengguna testing.");
  }

  // 9. Bersihkan audit_log terkait data yang sudah dihapus
  console.log("\n9. Merapikan audit log dari sisa testing...");
  const { error: auditErr } = await supabase.from("audit_log").delete().is("pelaku_id", null);
  if (auditErr) {
    console.warn("   Peringatan audit log:", auditErr.message);
  } else {
    console.log("   ✓ Audit log testing dirapikan.");
  }

  console.log("\n=================================================");
  console.log("  PEMBERSIHAN SELESAI! DATA KEMBALI KE DATA AWAL  ");
  console.log("=================================================");
}

cleanTestData().catch(console.error);
