#!/usr/bin/env python3
"""
seed.py
LMS Lembaga Kursus Pijar Aksara
Skrip ekstraksi Data_Contoh_LMS.xlsx menjadi skrip migrasi seed.sql untuk Supabase.
Mendukung seeding langsung via Supabase Admin API atau ekspor ke berkas SQL.
"""

import os
import sys
import json
import datetime
from pathlib import Path
import openpyxl

def escape_sql_str(val):
    if val is None:
        return "NULL"
    s = str(val).replace("'", "''")
    return f"'{s}'"

def format_sql_val(val, col_type="text"):
    if val is None or val == "" or str(val).strip() == "":
        return "NULL"
    
    if col_type == "boolean":
        if isinstance(val, bool):
            return "true" if val else "false"
        s = str(val).strip().lower()
        return "true" if s in ["true", "1", "t", "ya", "yes"] else "false"
    
    if col_type in ["integer", "smallint", "bigint"]:
        return str(int(float(val)))
    
    if col_type == "jsonb":
        if isinstance(val, (dict, list)):
            s = json.dumps(val).replace("'", "''")
            return f"'{s}'::jsonb"
        s = str(val).strip()
        # Verify if valid json or wrap
        try:
            parsed = json.loads(s)
            dumped = json.dumps(parsed).replace("'", "''")
            return f"'{dumped}'::jsonb"
        except Exception:
            s_escaped = s.replace("'", "''")
            return f"'{s_escaped}'::jsonb"
            
    if col_type == "timestamptz":
        if isinstance(val, (datetime.datetime, datetime.date)):
            # Jika naive, beri offset +07:00 (WIB)
            iso = val.isoformat()
            if "+" not in iso and "Z" not in iso:
                iso += "+07:00"
            return f"'{iso}'::timestamptz"
        s = str(val).strip()
        if "+" not in s and "Z" not in s:
            s += "+07:00"
        return f"'{s}'::timestamptz"
        
    return escape_sql_str(val)

def main():
    base_dir = Path(__file__).resolve().parent.parent
    project_root = base_dir.parent
    excel_path = project_root / "docs-lms" / "Data_Contoh_LMS.xlsx"
    
    if not excel_path.exists():
        excel_path = base_dir / "docs" / "Data_Contoh_LMS.xlsx"
        
    if not excel_path.exists():
        print(f"Error: Berkas Excel tidak ditemukan di {excel_path}", file=sys.stderr)
        sys.exit(1)
        
    print(f"Membaca berkas data contoh: {excel_path}")
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    
    seed_sql_path = base_dir / "supabase" / "seed.sql"
    os.makedirs(seed_sql_path.parent, exist_ok=True)
    
    lines = []
    lines.append("-- ==============================================================================")
    lines.append("-- seed.sql")
    lines.append("-- LMS Lembaga Kursus Pijar Aksara")
    lines.append("-- Data Contoh Lengkap dan Akun Uji (35 Akun, 7 Kursus, 18 Modul, 70 Soal)")
    lines.append("-- Dihasilkan otomatis oleh scripts/seed.py dari Data_Contoh_LMS.xlsx")
    lines.append("-- ==============================================================================\n")
    lines.append("BEGIN;\n")
    lines.append("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";\n")
    
    # 1. AKUN UJI & AUTH.USERS
    print("Memproses sheet 'Akun Uji' & 'profiles'...")
    ws_akun = wb["Akun Uji"]
    ws_profiles = wb["profiles"]
    
    # Ambil map profiles id by email
    email_to_profile = {}
    for row in ws_profiles.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        # id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada
        email_to_profile[str(row[2]).strip().lower()] = {
            "id": row[0],
            "nama_lengkap": row[1],
            "email": row[2],
            "no_hp": row[3],
            "peran": row[4],
            "aktif": row[5],
            "dibuat_pada": row[6]
        }
    
    lines.append("-- ------------------------------------------------------------------------------")
    lines.append("-- 1. SEED AUTH.USERS & PROFILES (35 AKUN RESMI)")
    lines.append("-- Kata sandi default untuk seluruh akun uji: Latihan#2026")
    lines.append("-- ------------------------------------------------------------------------------")
    
    for row in ws_akun.iter_rows(min_row=2, values_only=True):
        if not row or not row[1]:
            continue
        nama = row[0]
        email = str(row[1]).strip().lower()
        peran = row[2]
        kata_sandi = row[3] or "Latihan#2026"
        
        prof = email_to_profile.get(email)
        user_id = prof["id"] if prof else "gen_random_uuid()"
        dibuat_pada = prof["dibuat_pada"] if prof else datetime.datetime.now()
        no_hp = prof["no_hp"] if prof else None
        
        # User meta
        meta_json = json.dumps({"nama_lengkap": nama, "peran": peran, "no_hp": no_hp}).replace("'", "''")
        
        lines.append(f"""INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '{user_id}',
    '00000000-0000-0000-0000-000000000000',
    '{email}',
    crypt('{kata_sandi}', gen_salt('bf')),
    {format_sql_val(dibuat_pada, 'timestamptz')},
    '{{"provider":"email","providers":["email"]}}'::jsonb,
    '{meta_json}'::jsonb,
    {format_sql_val(dibuat_pada, 'timestamptz')},
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;""")

    lines.append("\n-- PROFILES")
    for row in ws_profiles.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        pid, nama, email, no_hp, peran, aktif, dibuat = row[:7]
        lines.append(f"""INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ({escape_sql_str(pid)}, {escape_sql_str(nama)}, {escape_sql_str(email)}, {format_sql_val(no_hp)}, {escape_sql_str(peran)}::public.peran_pengguna, {format_sql_val(aktif, 'boolean')}, {format_sql_val(dibuat, 'timestamptz')})
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;""")

    # 2. KURSUS (Dipasang dulu dengan status 'draf' agar kurikulum modul & soal dapat dimasukkan - BR-04)
    print("Memproses sheet 'kursus'...")
    ws_kursus = wb["kursus"]
    lines.append("\n-- ------------------------------------------------------------------------------")
    lines.append("-- 2. SEED KURSUS (STATUS AWAL DRAF SESUAI ATURAN BR-04)")
    lines.append("-- ------------------------------------------------------------------------------")
    kursus_original_status = {}
    
    for row in ws_kursus.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        kid, inst_id, judul, slug, kat, ringkasan, deskripsi, harga, kuota, lulus, status, catatan, diajukan, diterbitkan, dibuat, diubah = row[:16]
        kursus_original_status[kid] = {
            "status": status,
            "catatan": catatan,
            "diajukan": diajukan,
            "diterbitkan": diterbitkan
        }
        lines.append(f"""INSERT INTO public.kursus (
    id, instruktur_id, judul, slug, kategori, ringkasan, deskripsi,
    harga, kuota, nilai_lulus, status, dibuat_pada, diubah_pada
) VALUES (
    {escape_sql_str(kid)}, {escape_sql_str(inst_id)}, {escape_sql_str(judul)}, {escape_sql_str(slug)},
    {escape_sql_str(kat)}, {escape_sql_str(ringkasan)}, {escape_sql_str(deskripsi)},
    {format_sql_val(harga, 'integer')}, {format_sql_val(kuota, 'integer')}, {format_sql_val(lulus, 'smallint')},
    'draf'::public.status_kursus, {format_sql_val(dibuat, 'timestamptz')}, {format_sql_val(diubah, 'timestamptz')}
) ON CONFLICT (id) DO NOTHING;""")

    # 3. MODUL
    print("Memproses sheet 'modul'...")
    ws_modul = wb["modul"]
    lines.append("\n-- ------------------------------------------------------------------------------")
    lines.append("-- 3. SEED MODUL (18 MODUL)")
    lines.append("-- ------------------------------------------------------------------------------")
    for row in ws_modul.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        mid, kid, urutan, judul, isi, video, lampiran, durasi, dibuat = row[:9]
        lines.append(f"""INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    {escape_sql_str(mid)}, {escape_sql_str(kid)}, {format_sql_val(urutan, 'smallint')},
    {escape_sql_str(judul)}, {escape_sql_str(isi)}, {format_sql_val(video)},
    {format_sql_val(lampiran)}, {format_sql_val(durasi, 'smallint')}, {format_sql_val(dibuat, 'timestamptz')}
) ON CONFLICT (id) DO NOTHING;""")

    # 4. SOAL
    print("Memproses sheet 'soal'...")
    ws_soal = wb["soal"]
    lines.append("\n-- ------------------------------------------------------------------------------")
    lines.append("-- 4. SEED SOAL KUIS (70 BUTIR SOAL)")
    lines.append("-- ------------------------------------------------------------------------------")
    for row in ws_soal.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        sid, mid, urutan, pertanyaan, pa, pb, pc, pd, kunci = row[:9]
        lines.append(f"""INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    {escape_sql_str(sid)}, {escape_sql_str(mid)}, {format_sql_val(urutan, 'smallint')},
    {escape_sql_str(pertanyaan)}, {escape_sql_str(pa)}, {escape_sql_str(pb)},
    {escape_sql_str(pc)}, {escape_sql_str(pd)}, {escape_sql_str(kunci)}
) ON CONFLICT (id) DO NOTHING;""")

    # 5. PERBARUI STATUS ASLI KURSUS
    lines.append("\n-- ------------------------------------------------------------------------------")
    lines.append("-- 5. KEMBALIKAN STATUS ASLI KURSUS SETELAH KURIKULUM LENGKAP (BR-02, BR-04)")
    lines.append("-- ------------------------------------------------------------------------------")
    for kid, info in kursus_original_status.items():
        st = info["status"]
        cat = format_sql_val(info["catatan"])
        dia = format_sql_val(info["diajukan"], "timestamptz")
        dit = format_sql_val(info["diterbitkan"], "timestamptz")
        lines.append(f"""UPDATE public.kursus SET
    status = '{st}'::public.status_kursus,
    catatan_tinjauan = {cat},
    diajukan_pada = {dia},
    diterbitkan_pada = {dit}
WHERE id = '{kid}';""")

    # 6. PENDAFTARAN
    print("Memproses sheet 'pendaftaran'...")
    ws_pend = wb["pendaftaran"]
    lines.append("\n-- ------------------------------------------------------------------------------")
    lines.append("-- 6. SEED PENDAFTARAN (61 PENDAFTARAN DENGAN KASUS BATAS)")
    lines.append("-- ------------------------------------------------------------------------------")
    for row in ws_pend.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        pid, kid, peserta_id, status, nominal, metode, batas, invoice, dibayar, konfirm_oleh, alasan, didaftar, selesai, dibatal = row[:14]
        lines.append(f"""INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    {escape_sql_str(pid)}, {escape_sql_str(kid)}, {escape_sql_str(peserta_id)},
    {escape_sql_str(status)}::public.status_pendaftaran, {format_sql_val(nominal, 'integer')},
    {escape_sql_str(metode)}::public.metode_pembayaran, {format_sql_val(batas, 'timestamptz')},
    {format_sql_val(invoice)}, {format_sql_val(dibayar, 'timestamptz')}, {format_sql_val(konfirm_oleh)},
    {format_sql_val(alasan)}, {format_sql_val(didaftar, 'timestamptz')},
    {format_sql_val(selesai, 'timestamptz')}, {format_sql_val(dibatal, 'timestamptz')}
) ON CONFLICT (id) DO NOTHING;""")

    # 7. PROGRES MODUL
    print("Memproses sheet 'progres_modul'...")
    ws_prog = wb["progres_modul"]
    lines.append("\n-- ------------------------------------------------------------------------------")
    lines.append("-- 7. SEED PROGRES MODUL")
    lines.append("-- ------------------------------------------------------------------------------")
    for row in ws_prog.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        prid, pend_id, mid, dibaca, lulus = row[:5]
        lines.append(f"""INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    {escape_sql_str(prid)}, {escape_sql_str(pend_id)}, {escape_sql_str(mid)},
    {format_sql_val(dibaca, 'timestamptz')}, {format_sql_val(lulus, 'timestamptz')}
) ON CONFLICT (id) DO NOTHING;""")

    # 8. PERCOBAAN KUIS
    print("Memproses sheet 'percobaan_kuis'...")
    ws_kuis = wb["percobaan_kuis"]
    lines.append("\n-- ------------------------------------------------------------------------------")
    lines.append("-- 8. SEED PERCOBAAN KUIS (124 PERCOBAAN)")
    lines.append("-- ------------------------------------------------------------------------------")
    for row in ws_kuis.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        qid, pend_id, mid, no_perc, jawaban, j_soal, j_benar, nilai, lulus, waktu = row[:10]
        lines.append(f"""INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    {escape_sql_str(qid)}, {escape_sql_str(pend_id)}, {escape_sql_str(mid)},
    {format_sql_val(no_perc, 'smallint')}, {format_sql_val(jawaban, 'jsonb')},
    {format_sql_val(j_soal, 'smallint')}, {format_sql_val(j_benar, 'smallint')},
    {format_sql_val(nilai, 'smallint')}, {format_sql_val(lulus, 'boolean')},
    {format_sql_val(waktu, 'timestamptz')}
) ON CONFLICT (id) DO NOTHING;""")

    # 9. SERTIFIKAT
    print("Memproses sheet 'sertifikat'...")
    ws_sert = wb["sertifikat"]
    lines.append("\n-- ------------------------------------------------------------------------------")
    lines.append("-- 9. SEED SERTIFIKAT (PA-2026-0001 s/d PA-2026-0025)")
    lines.append("-- ------------------------------------------------------------------------------")
    for row in ws_sert.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        s_id, pend_id, thn, no_urut, no_sert, nm_peserta, jdl_kursus, tgl_terbit = row[:8]
        lines.append(f"""INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    {escape_sql_str(s_id)}, {escape_sql_str(pend_id)}, {format_sql_val(thn, 'smallint')},
    {format_sql_val(no_urut, 'integer')}, {escape_sql_str(no_sert)},
    {escape_sql_str(nm_peserta)}, {escape_sql_str(jdl_kursus)},
    {format_sql_val(tgl_terbit, 'timestamptz')}
) ON CONFLICT (id) DO NOTHING;""")

    # 10. AUDIT LOG
    print("Memproses sheet 'audit_log'...")
    ws_audit = wb["audit_log"]
    lines.append("\n-- ------------------------------------------------------------------------------")
    lines.append("-- 10. SEED AUDIT LOG (APPEND-ONLY)")
    lines.append("-- ------------------------------------------------------------------------------")
    for row in ws_audit.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        aid, pelaku, aksi, tabel, id_data, sblm, sesudah, dibuat = row[:8]
        lines.append(f"""INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    {format_sql_val(aid, 'bigint')}, {format_sql_val(pelaku)}, {escape_sql_str(aksi)},
    {escape_sql_str(tabel)}, {format_sql_val(id_data)}, {format_sql_val(sblm, 'jsonb')},
    {format_sql_val(sesudah, 'jsonb')}, {format_sql_val(dibuat, 'timestamptz')}
) ON CONFLICT (id) DO NOTHING;""")

    lines.append("\nCOMMIT;\n")
    
    output_content = "\n".join(lines)
    with open(seed_sql_path, "w", encoding="utf-8") as f:
        f.write(output_content)
        
    print(f"Berhasil menghasilkan berkas {seed_sql_path} ({len(lines)} baris SQL).")

if __name__ == "__main__":
    main()
