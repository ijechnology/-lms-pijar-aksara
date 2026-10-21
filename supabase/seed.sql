-- ==============================================================================
-- seed.sql
-- LMS Lembaga Kursus Pijar Aksara
-- Data Contoh Lengkap dan Akun Uji (35 Akun, 7 Kursus, 18 Modul, 70 Soal)
-- Dihasilkan otomatis oleh scripts/seed.py dari Data_Contoh_LMS.xlsx
-- ==============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. SEED AUTH.USERS & PROFILES (35 AKUN RESMI)
-- Kata sandi default untuk seluruh akun uji: Latihan#2026
-- ------------------------------------------------------------------------------
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'ratna@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-01 08:00+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Ratna Kusumawati", "peran": "admin", "no_hp": "081211110001"}'::jsonb,
    '2026-08-01 08:00+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'dimas@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-01 08:10+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Dimas Prasetyo", "peran": "admin", "no_hp": "081211110002"}'::jsonb,
    '2026-08-01 08:10+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000011',
    '00000000-0000-0000-0000-000000000000',
    'yudha@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-02 09:00+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Yudha Pratama", "peran": "instruktur", "no_hp": "081311110011"}'::jsonb,
    '2026-08-02 09:00+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000012',
    '00000000-0000-0000-0000-000000000000',
    'laras@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-02 09:20+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Laras Wulandari", "peran": "instruktur", "no_hp": "081311110012"}'::jsonb,
    '2026-08-02 09:20+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000013',
    '00000000-0000-0000-0000-000000000000',
    'michael@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-02 10:00+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Michael Sitorus", "peran": "instruktur", "no_hp": "081311110013"}'::jsonb,
    '2026-08-02 10:00+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000101',
    '00000000-0000-0000-0000-000000000000',
    'nadia.putri@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-17 01:56+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Nadia Putri", "peran": "peserta", "no_hp": "082269091062"}'::jsonb,
    '2026-09-17 01:56+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000102',
    '00000000-0000-0000-0000-000000000000',
    'rizky.ramadhan@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-06 15:48+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Rizky Ramadhan", "peran": "peserta", "no_hp": "081215409396"}'::jsonb,
    '2026-09-06 15:48+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000103',
    '00000000-0000-0000-0000-000000000000',
    'siti.aminah@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-17 22:24+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Siti Aminah", "peran": "peserta", "no_hp": "082280487276"}'::jsonb,
    '2026-08-17 22:24+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000104',
    '00000000-0000-0000-0000-000000000000',
    'bagus.santoso@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-19 11:36+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Bagus Santoso", "peran": "peserta", "no_hp": "087786832986"}'::jsonb,
    '2026-08-19 11:36+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000105',
    '00000000-0000-0000-0000-000000000000',
    'dewi.lestari@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-04 16:34+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Dewi Lestari", "peran": "peserta", "no_hp": "087741246825"}'::jsonb,
    '2026-09-04 16:34+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000106',
    '00000000-0000-0000-0000-000000000000',
    'fajar.nugroho@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-19 03:41+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Fajar Nugroho", "peran": "peserta", "no_hp": "081241428945"}'::jsonb,
    '2026-08-19 03:41+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000107',
    '00000000-0000-0000-0000-000000000000',
    'intan.permatasari@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-17 21:12+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Intan Permatasari", "peran": "peserta", "no_hp": "082118240387"}'::jsonb,
    '2026-08-17 21:12+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000108',
    '00000000-0000-0000-0000-000000000000',
    'andika.saputra@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-19 17:56+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Andika Saputra", "peran": "peserta", "no_hp": "085218968285"}'::jsonb,
    '2026-08-19 17:56+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000109',
    '00000000-0000-0000-0000-000000000000',
    'melati.anggraini@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-31 22:56+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Melati Anggraini", "peran": "peserta", "no_hp": "082246243653"}'::jsonb,
    '2026-08-31 22:56+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000110',
    '00000000-0000-0000-0000-000000000000',
    'hendra.gunawan@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-20 08:48+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Hendra Gunawan", "peran": "peserta", "no_hp": "087733643046"}'::jsonb,
    '2026-08-20 08:48+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000111',
    '00000000-0000-0000-0000-000000000000',
    'putri.ayuningtyas@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-02 22:41+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Putri Ayuningtyas", "peran": "peserta", "no_hp": "081210209063"}'::jsonb,
    '2026-09-02 22:41+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000112',
    '00000000-0000-0000-0000-000000000000',
    'rangga.wijaya@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-27 06:05+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Rangga Wijaya", "peran": "peserta", "no_hp": "087867070072"}'::jsonb,
    '2026-08-27 06:05+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000113',
    '00000000-0000-0000-0000-000000000000',
    'ayu.kartika@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-09 07:41+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Ayu Kartika", "peran": "peserta", "no_hp": "081296700132"}'::jsonb,
    '2026-09-09 07:41+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000114',
    '00000000-0000-0000-0000-000000000000',
    'teguh.hidayat@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-26 09:34+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Teguh Hidayat", "peran": "peserta", "no_hp": "087876619093"}'::jsonb,
    '2026-09-26 09:34+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000115',
    '00000000-0000-0000-0000-000000000000',
    'sari.rahmawati@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-08 07:34+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Sari Rahmawati", "peran": "peserta", "no_hp": "081319303592"}'::jsonb,
    '2026-09-08 07:34+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000116',
    '00000000-0000-0000-0000-000000000000',
    'yoga.firmansyah@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-13 22:12+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Yoga Firmansyah", "peran": "peserta", "no_hp": "081269183247"}'::jsonb,
    '2026-09-13 22:12+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000117',
    '00000000-0000-0000-0000-000000000000',
    'lina.marlina@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-21 13:12+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Lina Marlina", "peran": "peserta", "no_hp": "082273534994"}'::jsonb,
    '2026-09-21 13:12+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000118',
    '00000000-0000-0000-0000-000000000000',
    'arif.budiman@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-18 05:18+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Arif Budiman", "peran": "peserta", "no_hp": "087885351027"}'::jsonb,
    '2026-09-18 05:18+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000119',
    '00000000-0000-0000-0000-000000000000',
    'wulan.sari@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-07 11:12+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Wulan Sari", "peran": "peserta", "no_hp": "085243248532"}'::jsonb,
    '2026-09-07 11:12+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000120',
    '00000000-0000-0000-0000-000000000000',
    'kevin.tanoto@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-29 06:48+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Kevin Tanoto", "peran": "peserta", "no_hp": "082127883096"}'::jsonb,
    '2026-08-29 06:48+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000121',
    '00000000-0000-0000-0000-000000000000',
    'nur.fadilah@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-10 09:00+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Nur Fadilah", "peran": "peserta", "no_hp": "085214329687"}'::jsonb,
    '2026-09-10 09:00+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000122',
    '00000000-0000-0000-0000-000000000000',
    'galih.pamungkas@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-10-13 21:18+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Galih Pamungkas", "peran": "peserta", "no_hp": "087779005559"}'::jsonb,
    '2026-10-13 21:18+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000123',
    '00000000-0000-0000-0000-000000000000',
    'citra.maharani@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-29 00:18+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Citra Maharani", "peran": "peserta", "no_hp": "082265449612"}'::jsonb,
    '2026-08-29 00:18+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000124',
    '00000000-0000-0000-0000-000000000000',
    'dodi.kurniawan@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-27 15:41+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Dodi Kurniawan", "peran": "peserta", "no_hp": "087872531155"}'::jsonb,
    '2026-09-27 15:41+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000125',
    '00000000-0000-0000-0000-000000000000',
    'eka.safitri@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-28 21:56+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Eka Safitri", "peran": "peserta", "no_hp": "085237675785"}'::jsonb,
    '2026-08-28 21:56+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000126',
    '00000000-0000-0000-0000-000000000000',
    'bima.aditya@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-08 09:12+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Bima Aditya", "peran": "peserta", "no_hp": "085228082646"}'::jsonb,
    '2026-09-08 09:12+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000127',
    '00000000-0000-0000-0000-000000000000',
    'rina.oktaviani@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-08-27 10:12+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Rina Oktaviani", "peran": "peserta", "no_hp": "087894185657"}'::jsonb,
    '2026-08-27 10:12+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000128',
    '00000000-0000-0000-0000-000000000000',
    'zaki.maulana@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-11 08:56+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Zaki Maulana", "peran": "peserta", "no_hp": "087745813260"}'::jsonb,
    '2026-09-11 08:56+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000129',
    '00000000-0000-0000-0000-000000000000',
    'maya.sinaga@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-10 15:18+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Maya Sinaga", "peran": "peserta", "no_hp": "082166209279"}'::jsonb,
    '2026-09-10 15:18+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-4000-a000-000000000130',
    '00000000-0000-0000-0000-000000000000',
    'fikri.hakim@pijaraksara.test',
    crypt('Latihan#2026', gen_salt('bf')),
    '2026-09-23 04:05+07:00'::timestamptz,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama_lengkap": "Fikri Hakim", "peran": "peserta", "no_hp": null}'::jsonb,
    '2026-09-23 04:05+07:00'::timestamptz,
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- PROFILES
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000001', 'Ratna Kusumawati', 'ratna@pijaraksara.test', '081211110001', 'admin'::public.peran_pengguna, true, '2026-08-01 08:00+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000002', 'Dimas Prasetyo', 'dimas@pijaraksara.test', '081211110002', 'admin'::public.peran_pengguna, true, '2026-08-01 08:10+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000011', 'Yudha Pratama', 'yudha@pijaraksara.test', '081311110011', 'instruktur'::public.peran_pengguna, true, '2026-08-02 09:00+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000012', 'Laras Wulandari', 'laras@pijaraksara.test', '081311110012', 'instruktur'::public.peran_pengguna, true, '2026-08-02 09:20+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000013', 'Michael Sitorus', 'michael@pijaraksara.test', '081311110013', 'instruktur'::public.peran_pengguna, true, '2026-08-02 10:00+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000101', 'Nadia Putri', 'nadia.putri@pijaraksara.test', '082269091062', 'peserta'::public.peran_pengguna, true, '2026-09-17 01:56+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000102', 'Rizky Ramadhan', 'rizky.ramadhan@pijaraksara.test', '081215409396', 'peserta'::public.peran_pengguna, true, '2026-09-06 15:48+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000103', 'Siti Aminah', 'siti.aminah@pijaraksara.test', '082280487276', 'peserta'::public.peran_pengguna, true, '2026-08-17 22:24+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000104', 'Bagus Santoso', 'bagus.santoso@pijaraksara.test', '087786832986', 'peserta'::public.peran_pengguna, true, '2026-08-19 11:36+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000105', 'Dewi Lestari', 'dewi.lestari@pijaraksara.test', '087741246825', 'peserta'::public.peran_pengguna, true, '2026-09-04 16:34+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000106', 'Fajar Nugroho', 'fajar.nugroho@pijaraksara.test', '081241428945', 'peserta'::public.peran_pengguna, true, '2026-08-19 03:41+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000107', 'Intan Permatasari', 'intan.permatasari@pijaraksara.test', '082118240387', 'peserta'::public.peran_pengguna, true, '2026-08-17 21:12+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000108', 'Andika Saputra', 'andika.saputra@pijaraksara.test', '085218968285', 'peserta'::public.peran_pengguna, true, '2026-08-19 17:56+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000109', 'Melati Anggraini', 'melati.anggraini@pijaraksara.test', '082246243653', 'peserta'::public.peran_pengguna, true, '2026-08-31 22:56+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000110', 'Hendra Gunawan', 'hendra.gunawan@pijaraksara.test', '087733643046', 'peserta'::public.peran_pengguna, true, '2026-08-20 08:48+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000111', 'Putri Ayuningtyas', 'putri.ayuningtyas@pijaraksara.test', '081210209063', 'peserta'::public.peran_pengguna, true, '2026-09-02 22:41+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000112', 'Rangga Wijaya', 'rangga.wijaya@pijaraksara.test', '087867070072', 'peserta'::public.peran_pengguna, true, '2026-08-27 06:05+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000113', 'Ayu Kartika', 'ayu.kartika@pijaraksara.test', '081296700132', 'peserta'::public.peran_pengguna, true, '2026-09-09 07:41+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000114', 'Teguh Hidayat', 'teguh.hidayat@pijaraksara.test', '087876619093', 'peserta'::public.peran_pengguna, true, '2026-09-26 09:34+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000115', 'Sari Rahmawati', 'sari.rahmawati@pijaraksara.test', '081319303592', 'peserta'::public.peran_pengguna, true, '2026-09-08 07:34+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000116', 'Yoga Firmansyah', 'yoga.firmansyah@pijaraksara.test', '081269183247', 'peserta'::public.peran_pengguna, true, '2026-09-13 22:12+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000117', 'Lina Marlina', 'lina.marlina@pijaraksara.test', '082273534994', 'peserta'::public.peran_pengguna, true, '2026-09-21 13:12+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000118', 'Arif Budiman', 'arif.budiman@pijaraksara.test', '087885351027', 'peserta'::public.peran_pengguna, true, '2026-09-18 05:18+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000119', 'Wulan Sari', 'wulan.sari@pijaraksara.test', '085243248532', 'peserta'::public.peran_pengguna, true, '2026-09-07 11:12+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000120', 'Kevin Tanoto', 'kevin.tanoto@pijaraksara.test', '082127883096', 'peserta'::public.peran_pengguna, true, '2026-08-29 06:48+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000121', 'Nur Fadilah', 'nur.fadilah@pijaraksara.test', '085214329687', 'peserta'::public.peran_pengguna, true, '2026-09-10 09:00+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000122', 'Galih Pamungkas', 'galih.pamungkas@pijaraksara.test', '087779005559', 'peserta'::public.peran_pengguna, true, '2026-10-13 21:18+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000123', 'Citra Maharani', 'citra.maharani@pijaraksara.test', '082265449612', 'peserta'::public.peran_pengguna, true, '2026-08-29 00:18+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000124', 'Dodi Kurniawan', 'dodi.kurniawan@pijaraksara.test', '087872531155', 'peserta'::public.peran_pengguna, true, '2026-09-27 15:41+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000125', 'Eka Safitri', 'eka.safitri@pijaraksara.test', '085237675785', 'peserta'::public.peran_pengguna, true, '2026-08-28 21:56+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000126', 'Bima Aditya', 'bima.aditya@pijaraksara.test', '085228082646', 'peserta'::public.peran_pengguna, true, '2026-09-08 09:12+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000127', 'Rina Oktaviani', 'rina.oktaviani@pijaraksara.test', '087894185657', 'peserta'::public.peran_pengguna, true, '2026-08-27 10:12+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000128', 'Zaki Maulana', 'zaki.maulana@pijaraksara.test', '087745813260', 'peserta'::public.peran_pengguna, true, '2026-09-11 08:56+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000129', 'Maya Sinaga', 'maya.sinaga@pijaraksara.test', '082166209279', 'peserta'::public.peran_pengguna, true, '2026-09-10 15:18+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;
INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('00000000-0000-4000-a000-000000000130', 'Fikri Hakim', 'fikri.hakim@pijaraksara.test', NULL, 'peserta'::public.peran_pengguna, true, '2026-09-23 04:05+07:00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    no_hp = EXCLUDED.no_hp,
    peran = EXCLUDED.peran,
    aktif = EXCLUDED.aktif;

-- ------------------------------------------------------------------------------
-- 2. SEED KURSUS (STATUS AWAL DRAF SESUAI ATURAN BR-04)
-- ------------------------------------------------------------------------------
INSERT INTO public.kursus (
    id, instruktur_id, judul, slug, kategori, ringkasan, deskripsi,
    harga, kuota, nilai_lulus, status, dibuat_pada, diubah_pada
) VALUES (
    '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000011', 'Excel untuk Administrasi Perkantoran', 'excel-administrasi-perkantoran',
    'Perkantoran', 'Kuasai Excel untuk rekap data, rumus dasar, dan laporan bulanan kantor.', 'Kursus praktik Excel untuk staf administrasi. Peserta belajar mengatur lembar kerja, memakai rumus dasar, dan menyusun laporan dengan tabel serta grafik. Cocok untuk pemula.',
    350000, 25, 70,
    'draf'::public.status_kursus, '2026-08-03 09:00+07:00'::timestamptz, '2026-08-17 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kursus (
    id, instruktur_id, judul, slug, kategori, ringkasan, deskripsi,
    harga, kuota, nilai_lulus, status, dibuat_pada, diubah_pada
) VALUES (
    '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000012', 'Desain Konten Media Sosial dengan Canva', 'desain-konten-canva',
    'Desain', 'Kelas gratis membuat konten Instagram yang rapi dengan Canva.', 'Kursus gratis untuk pelaku usaha dan staf pemasaran. Peserta belajar prinsip desain dasar, memakai template Canva, dan menyiapkan konten untuk satu minggu.',
    0, 40, 70,
    'draf'::public.status_kursus, '2026-08-04 10:00+07:00'::timestamptz, '2026-08-17 09:30+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kursus (
    id, instruktur_id, judul, slug, kategori, ringkasan, deskripsi,
    harga, kuota, nilai_lulus, status, dibuat_pada, diubah_pada
) VALUES (
    '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000013', 'Bahasa Inggris untuk Percakapan Kerja', 'bahasa-inggris-percakapan-kerja',
    'Bahasa', 'Latihan percakapan bahasa Inggris untuk rapat, telepon, dan email kantor.', 'Kursus untuk karyawan yang perlu berbicara dan menulis bahasa Inggris di tempat kerja. Materi berisi ungkapan rapat, menerima telepon, dan menulis email singkat.',
    450000, 20, 70,
    'draf'::public.status_kursus, '2026-08-05 13:00+07:00'::timestamptz, '2026-08-24 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kursus (
    id, instruktur_id, judul, slug, kategori, ringkasan, deskripsi,
    harga, kuota, nilai_lulus, status, dibuat_pada, diubah_pada
) VALUES (
    '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000011', 'Dasar Pembukuan untuk UMKM', 'dasar-pembukuan-umkm',
    'Keuangan', 'Catat kas masuk, kas keluar, dan laba rugi sederhana untuk usaha kecil.', 'Kursus kelas kecil untuk pemilik dan admin UMKM. Peserta belajar memisahkan uang usaha dan pribadi, mencatat transaksi harian, dan membaca laporan laba rugi sederhana.',
    300000, 12, 70,
    'draf'::public.status_kursus, '2026-08-18 09:00+07:00'::timestamptz, '2026-08-31 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kursus (
    id, instruktur_id, judul, slug, kategori, ringkasan, deskripsi,
    harga, kuota, nilai_lulus, status, dibuat_pada, diubah_pada
) VALUES (
    '00000000-0000-4000-b000-000000000005', '00000000-0000-4000-a000-000000000012', 'Fotografi Produk dengan Ponsel', 'fotografi-produk-ponsel',
    'Desain', 'Foto produk jualan yang terang dan menarik hanya dengan ponsel.', 'Kursus singkat untuk penjual online. Peserta belajar mengatur cahaya alami, komposisi, dan menyunting foto produk langsung di ponsel.',
    250000, 15, 70,
    'draf'::public.status_kursus, '2026-08-03 11:00+07:00'::timestamptz, '2026-10-01 17:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kursus (
    id, instruktur_id, judul, slug, kategori, ringkasan, deskripsi,
    harga, kuota, nilai_lulus, status, dibuat_pada, diubah_pada
) VALUES (
    '00000000-0000-4000-b000-000000000006', '00000000-0000-4000-a000-000000000013', 'Public Speaking untuk Presentasi Kantor', 'public-speaking-presentasi-kantor',
    'Pengembangan Diri', 'Presentasi lebih percaya diri dengan struktur pesan yang jelas.', 'Kursus untuk karyawan yang sering presentasi. Peserta belajar menyusun alur presentasi dan mengelola rasa gugup.',
    400000, 20, 70,
    'draf'::public.status_kursus, '2026-10-01 10:00+07:00'::timestamptz, '2026-10-12 16:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kursus (
    id, instruktur_id, judul, slug, kategori, ringkasan, deskripsi,
    harga, kuota, nilai_lulus, status, dibuat_pada, diubah_pada
) VALUES (
    '00000000-0000-4000-b000-000000000007', '00000000-0000-4000-a000-000000000011', 'Microsoft Word untuk Surat Dinas', 'word-surat-dinas',
    'Perkantoran', 'Buat surat dinas rapi sesuai format dengan Microsoft Word.', 'Kursus untuk staf administrasi yang menyusun surat resmi. Masih dalam penyusunan.',
    200000, 20, 70,
    'draf'::public.status_kursus, '2026-10-08 13:00+07:00'::timestamptz, '2026-10-08 13:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. SEED MODUL (18 MODUL)
-- ------------------------------------------------------------------------------
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000001000001', '00000000-0000-4000-b000-000000000001', 1,
    'Mengenal Lembar Kerja dan Format Sel', 'Materi modul 1: Mengenal Lembar Kerja dan Format Sel. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Excel untuk Administrasi Perkantoran.', 'https://www.youtube.com/watch?v=CONTOH11',
    'materi/excel-administrasi-perkantoran/modul-1.pdf', 45, '2026-08-03 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000001000002', '00000000-0000-4000-b000-000000000001', 2,
    'Rumus Dasar SUM, AVERAGE, dan IF', 'Materi modul 2: Rumus Dasar SUM, AVERAGE, dan IF. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Excel untuk Administrasi Perkantoran.', 'https://www.youtube.com/watch?v=CONTOH12',
    NULL, 60, '2026-08-03 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000001000003', '00000000-0000-4000-b000-000000000001', 3,
    'Tabel dan Grafik untuk Laporan', 'Materi modul 3: Tabel dan Grafik untuk Laporan. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Excel untuk Administrasi Perkantoran.', 'https://www.youtube.com/watch?v=CONTOH13',
    'materi/excel-administrasi-perkantoran/modul-3.pdf', 50, '2026-08-03 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000002000001', '00000000-0000-4000-b000-000000000002', 1,
    'Prinsip Dasar Desain Visual', 'Materi modul 1: Prinsip Dasar Desain Visual. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Desain Konten Media Sosial dengan Canva.', 'https://www.youtube.com/watch?v=CONTOH21',
    'materi/desain-konten-canva/modul-1.pdf', 40, '2026-08-04 10:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000002000002', '00000000-0000-4000-b000-000000000002', 2,
    'Memakai Template dan Brand Kit', 'Materi modul 2: Memakai Template dan Brand Kit. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Desain Konten Media Sosial dengan Canva.', 'https://www.youtube.com/watch?v=CONTOH22',
    NULL, 45, '2026-08-04 10:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000002000003', '00000000-0000-4000-b000-000000000002', 3,
    'Merencanakan Konten Satu Minggu', 'Materi modul 3: Merencanakan Konten Satu Minggu. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Desain Konten Media Sosial dengan Canva.', 'https://www.youtube.com/watch?v=CONTOH23',
    'materi/desain-konten-canva/modul-3.pdf', 35, '2026-08-04 10:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000003000001', '00000000-0000-4000-b000-000000000003', 1,
    'Memperkenalkan Diri dan Rekan Kerja', 'Materi modul 1: Memperkenalkan Diri dan Rekan Kerja. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Bahasa Inggris untuk Percakapan Kerja.', 'https://www.youtube.com/watch?v=CONTOH31',
    'materi/bahasa-inggris-percakapan-kerja/modul-1.pdf', 40, '2026-08-05 13:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000003000002', '00000000-0000-4000-b000-000000000003', 2,
    'Bahasa Inggris dalam Rapat', 'Materi modul 2: Bahasa Inggris dalam Rapat. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Bahasa Inggris untuk Percakapan Kerja.', 'https://www.youtube.com/watch?v=CONTOH32',
    NULL, 50, '2026-08-05 13:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000003000003', '00000000-0000-4000-b000-000000000003', 3,
    'Telepon dan Email Singkat', 'Materi modul 3: Telepon dan Email Singkat. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Bahasa Inggris untuk Percakapan Kerja.', 'https://www.youtube.com/watch?v=CONTOH33',
    'materi/bahasa-inggris-percakapan-kerja/modul-3.pdf', 45, '2026-08-05 13:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000004000001', '00000000-0000-4000-b000-000000000004', 1,
    'Memisahkan Uang Usaha dan Pribadi', 'Materi modul 1: Memisahkan Uang Usaha dan Pribadi. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Dasar Pembukuan untuk UMKM.', 'https://www.youtube.com/watch?v=CONTOH41',
    'materi/dasar-pembukuan-umkm/modul-1.pdf', 30, '2026-08-18 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000004000002', '00000000-0000-4000-b000-000000000004', 2,
    'Mencatat Kas Masuk dan Kas Keluar', 'Materi modul 2: Mencatat Kas Masuk dan Kas Keluar. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Dasar Pembukuan untuk UMKM.', 'https://www.youtube.com/watch?v=CONTOH42',
    NULL, 40, '2026-08-18 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000004000003', '00000000-0000-4000-b000-000000000004', 3,
    'Laporan Laba Rugi Sederhana', 'Materi modul 3: Laporan Laba Rugi Sederhana. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Dasar Pembukuan untuk UMKM.', 'https://www.youtube.com/watch?v=CONTOH43',
    'materi/dasar-pembukuan-umkm/modul-3.pdf', 40, '2026-08-18 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000005000001', '00000000-0000-4000-b000-000000000005', 1,
    'Cahaya dan Latar Belakang', 'Materi modul 1: Cahaya dan Latar Belakang. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Fotografi Produk dengan Ponsel.', 'https://www.youtube.com/watch?v=CONTOH51',
    'materi/fotografi-produk-ponsel/modul-1.pdf', 35, '2026-08-03 11:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000005000002', '00000000-0000-4000-b000-000000000005', 2,
    'Komposisi dan Penyuntingan', 'Materi modul 2: Komposisi dan Penyuntingan. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Fotografi Produk dengan Ponsel.', 'https://www.youtube.com/watch?v=CONTOH52',
    NULL, 40, '2026-08-03 11:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000006000001', '00000000-0000-4000-b000-000000000006', 1,
    'Menyusun Alur Presentasi', 'Materi modul 1: Menyusun Alur Presentasi. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Public Speaking untuk Presentasi Kantor.', 'https://www.youtube.com/watch?v=CONTOH61',
    'materi/public-speaking-presentasi-kantor/modul-1.pdf', 40, '2026-10-01 10:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000006000002', '00000000-0000-4000-b000-000000000006', 2,
    'Mengelola Rasa Gugup', 'Materi modul 2: Mengelola Rasa Gugup. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Public Speaking untuk Presentasi Kantor.', 'https://www.youtube.com/watch?v=CONTOH62',
    NULL, 35, '2026-10-01 10:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000007000001', '00000000-0000-4000-b000-000000000007', 1,
    'Format Surat Dinas', 'Materi modul 1: Format Surat Dinas. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Microsoft Word untuk Surat Dinas.', 'https://www.youtube.com/watch?v=CONTOH71',
    'materi/word-surat-dinas/modul-1.pdf', 30, '2026-10-08 13:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.modul (
    id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada
) VALUES (
    '00000000-0000-4000-c000-000007000002', '00000000-0000-4000-b000-000000000007', 2,
    'Mail Merge untuk Surat Massal', 'Materi modul 2: Mail Merge untuk Surat Massal. Bacaan ringkas, contoh langkah kerja, dan latihan mandiri untuk kursus Microsoft Word untuk Surat Dinas.', 'https://www.youtube.com/watch?v=CONTOH72',
    NULL, 35, '2026-10-08 13:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. SEED SOAL KUIS (70 BUTIR SOAL)
-- ------------------------------------------------------------------------------
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100010001', '00000000-0000-4000-c000-000001000001', 1,
    'Pertemuan baris 3 dan kolom C disebut sel...', 'K3', 'R3C',
    'C3', '3C', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100010002', '00000000-0000-4000-c000-000001000001', 2,
    'Format sel yang tepat untuk menulis tanggal 17/08/2026 adalah...', 'Number', 'Date',
    'Percentage', 'Text', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100010003', '00000000-0000-4000-c000-000001000001', 3,
    'Tombol pintas untuk menyimpan file di Excel adalah...', 'Ctrl + S', 'Ctrl + Z',
    'Ctrl + P', 'Ctrl + N', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100010004', '00000000-0000-4000-c000-000001000001', 4,
    'Fitur untuk membuat baris judul tetap terlihat saat menggulir adalah...', 'Freeze Panes', 'Wrap Text',
    'Sort', 'Merge Cells', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100020001', '00000000-0000-4000-c000-000001000002', 1,
    'Rumus untuk menjumlahkan sel A1 sampai A10 adalah...', NULL, NULL,
    NULL, NULL, 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100020002', '00000000-0000-4000-c000-000001000002', 2,
    'Rumus =AVERAGE(B2:B5) menghasilkan...', 'Nilai terkecil', 'Nilai terbesar',
    'Nilai rata-rata', 'Jumlah data', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100020003', '00000000-0000-4000-c000-000001000002', 3,
    'Hasil =IF(80>=75;"Lulus";"Ulang") adalah...', 'Ulang', 'Lulus',
    '80', '75', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100020004', '00000000-0000-4000-c000-000001000002', 4,
    'Tanda $ pada $A$1 berfungsi untuk...', 'Mengunci alamat sel', 'Menghapus isi sel',
    'Menghitung pajak', 'Mengubah format mata uang', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100030001', '00000000-0000-4000-c000-000001000003', 1,
    'Fitur untuk meringkas data penjualan per bulan secara cepat adalah...', 'Find', 'PivotTable',
    'Hyperlink', 'Comment', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100030002', '00000000-0000-4000-c000-000001000003', 2,
    'Grafik yang paling tepat untuk menunjukkan tren pengeluaran per bulan adalah...', 'Pie chart', 'Line chart',
    'Tabel biasa', 'Scatter tanpa garis', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100030003', '00000000-0000-4000-c000-000001000003', 3,
    'Filter pada tabel dipakai untuk...', 'Menampilkan baris yang memenuhi syarat saja', 'Menghapus baris kosong',
    'Mengunci file', 'Mencetak tabel', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000100030004', '00000000-0000-4000-c000-000001000003', 4,
    'Sebelum mencetak laporan, area yang dicetak diatur lewat...', 'Data Validation', 'Conditional Formatting',
    'Print Area', 'Goal Seek', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200010001', '00000000-0000-4000-c000-000002000001', 1,
    'Ruang kosong di sekitar elemen desain disebut...', 'Whitespace', 'Watermark',
    'Gradient', 'Layer', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200010002', '00000000-0000-4000-c000-000002000001', 2,
    'Jumlah jenis huruf yang disarankan dalam satu desain konten adalah...', 'Hanya 1 dengan semua gaya', 'Paling banyak 2 sampai 3',
    'Sebanyak mungkin', 'Minimal 5', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200010003', '00000000-0000-4000-c000-000002000001', 3,
    'Kontras warna yang baik membuat teks...', 'Bergerak', 'Lebih kecil',
    'Lebih samar', 'Mudah dibaca', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200010004', '00000000-0000-4000-c000-000002000001', 4,
    'Elemen yang paling besar dan mencolok sebaiknya berisi...', 'Nomor telepon kecil', 'Hiasan',
    'Pesan utama', 'Tanggal file', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200020001', '00000000-0000-4000-c000-000002000002', 1,
    'Brand kit di Canva menyimpan...', 'Kata sandi akun', 'Logo, warna, dan font merek',
    'Data pelanggan', 'Riwayat percakapan', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200020002', '00000000-0000-4000-c000-000002000002', 2,
    'Ukuran feed Instagram persegi yang umum adalah...', '1080 x 1080 piksel', '800 x 600 piksel',
    '500 x 2000 piksel', '1920 x 1080 piksel', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200020003', '00000000-0000-4000-c000-000002000002', 3,
    'Cara tercepat membuat 5 konten dengan gaya sama adalah...', 'Mencetak lalu memotret', 'Menggandakan desain lalu mengganti isi',
    'Membuat dari kosong setiap kali', 'Mengganti semua font', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200020004', '00000000-0000-4000-c000-000002000002', 4,
    'Format unduhan terbaik untuk desain dengan teks tajam adalah...', 'GIF', 'TXT',
    'BMP', 'PNG', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200030001', '00000000-0000-4000-c000-000002000003', 1,
    'Kalender konten berguna untuk...', 'Menjadwalkan topik dan waktu unggah', 'Mengganti nama akun',
    'Menambah pengikut otomatis', 'Menghapus komentar', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200030002', '00000000-0000-4000-c000-000002000003', 2,
    'Ajakan bertindak dalam konten disebut...', 'Hashtag', 'Caption kosong',
    'Call to action', 'Thumbnail', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200030003', '00000000-0000-4000-c000-000002000003', 3,
    'Bila ingin konten edukasi berisi beberapa langkah, format yang cocok adalah...', 'Story 1 detik', 'Satu foto tanpa teks',
    'Carousel', 'Profil bio', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000200030004', '00000000-0000-4000-c000-000002000003', 4,
    'Waktu unggah sebaiknya ditentukan berdasarkan...', 'Tebakan', 'Urutan abjad',
    'Data jam aktif pengikut', 'Jam tidur admin', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300010001', '00000000-0000-4000-c000-000003000001', 1,
    'Ungkapan yang tepat saat pertama kali bertemu klien adalah...', 'See you later', 'Hurry up',
    'Never mind', 'Nice to meet you', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300010002', '00000000-0000-4000-c000-000003000001', 2,
    '"I am in charge of the finance team" berarti...', 'Saya baru bergabung', 'Saya bertanggung jawab atas tim keuangan',
    'Saya keluar dari tim keuangan', 'Saya tidak tahu', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300010003', '00000000-0000-4000-c000-000003000001', 3,
    'Cara sopan memperkenalkan rekan adalah...', 'You know Rina', 'This is my colleague, Rina',
    'Rina here, go', 'She is Rina, okay', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300010004', '00000000-0000-4000-c000-000003000001', 4,
    'Jawaban yang tepat untuk "How do you do?" adalah...', 'How do you do?', 'Yes, I do',
    'I am fine, thanks', 'No problem', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300010005', '00000000-0000-4000-c000-000003000001', 5,
    'Kata "department" dalam kalimat "I work in the HR department" berarti...', 'Bagian', 'Jabatan',
    'Gaji', 'Gedung', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300020001', '00000000-0000-4000-c000-000003000002', 1,
    'Ungkapan untuk meminta pendapat peserta rapat adalah...', 'What do you think?', 'Stop talking',
    'That is all', 'I am leaving', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300020002', '00000000-0000-4000-c000-000003000002', 2,
    '"Could you repeat that, please?" dipakai untuk...', 'Memberi nilai', 'Menutup rapat',
    'Meminta mengulang', 'Menolak usulan', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300020003', '00000000-0000-4000-c000-000003000002', 3,
    'Ungkapan sopan untuk tidak setuju adalah...', 'Forget it', 'You are wrong',
    'I see your point, but...', 'No way', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300020004', '00000000-0000-4000-c000-000003000002', 4,
    '"Let''s move on to the next item" berarti...', 'Mari istirahat', 'Mari pulang',
    'Mari ulang dari awal', 'Mari pindah ke agenda berikutnya', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300020005', '00000000-0000-4000-c000-000003000002', 5,
    'Notulen rapat dalam bahasa Inggris disebut...', 'Agenda', 'Seconds',
    'Minutes', 'Hours', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300030001', '00000000-0000-4000-c000-000003000003', 1,
    'Ungkapan pembuka saat menerima telepon kantor adalah...', 'Who is this?', 'Hello, bye',
    'What do you want?', 'Good morning, Pijar Aksara, how may I help you?', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300030002', '00000000-0000-4000-c000-000003000003', 2,
    '"Could you hold on a moment?" berarti...', 'Silakan datang', 'Mohon tunggu sebentar',
    'Tolong tutup teleponnya', 'Saya sibuk', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300030003', '00000000-0000-4000-c000-000003000003', 3,
    'Penutup email formal yang umum adalah...', 'Bye bye', 'Cheers mate',
    'See ya', 'Best regards', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300030004', '00000000-0000-4000-c000-000003000003', 4,
    'Baris subjek email sebaiknya...', 'Kosong', 'Singkat dan menjelaskan isi',
    'Berisi salam saja', 'Panjang satu paragraf', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000300030005', '00000000-0000-4000-c000-000003000003', 5,
    '"Please find attached the report" berarti...', 'Laporan dicetak', 'Laporan hilang',
    'Laporan terlampir', 'Laporan ditolak', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400010001', '00000000-0000-4000-c000-000004000001', 1,
    'Alasan utama memisahkan rekening usaha dan pribadi adalah...', 'Agar pajak hilang', 'Agar transaksi lebih sedikit',
    'Agar keuntungan usaha terlihat jelas', 'Agar bank senang', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400010002', '00000000-0000-4000-c000-000004000001', 2,
    'Gaji pemilik usaha sebaiknya...', 'Tidak pernah diambil', 'Ditetapkan rutin dan dicatat',
    'Diambil kapan saja tanpa catatan', 'Diambil dari modal pinjaman', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400010003', '00000000-0000-4000-c000-000004000001', 3,
    'Modal adalah...', 'Dana yang ditanamkan pemilik ke usaha', 'Pendapatan harian',
    'Uang belanja pribadi', 'Utang ke pemasok', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400010004', '00000000-0000-4000-c000-000004000001', 4,
    'Bukti transaksi yang perlu disimpan adalah...', 'Kartu nama', 'Brosur promosi',
    'Nota dan kuitansi', 'Struk parkir pribadi', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400020001', '00000000-0000-4000-c000-000004000002', 1,
    'Penjualan tunai dicatat sebagai...', 'Kas masuk', 'Kas keluar',
    'Utang', 'Modal', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400020002', '00000000-0000-4000-c000-000004000002', 2,
    'Pembayaran sewa toko dicatat sebagai...', 'Kas masuk', 'Kas keluar',
    'Piutang', 'Pendapatan', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400020003', '00000000-0000-4000-c000-000004000002', 3,
    'Saldo kas akhir dihitung dengan...', 'Kas masuk x kas keluar', 'Saldo awal + kas masuk - kas keluar',
    'Kas keluar - saldo awal', 'Saldo awal - kas masuk', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400020004', '00000000-0000-4000-c000-000004000002', 4,
    'Pencatatan kas sebaiknya dilakukan...', 'Saat diminta bank saja', 'Setiap hari',
    'Saat usaha tutup', 'Setahun sekali', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400030001', '00000000-0000-4000-c000-000004000003', 1,
    'Laba kotor adalah...', 'Modal dikurangi utang', 'Kas dikurangi piutang',
    'Penjualan dikurangi harga pokok penjualan', 'Penjualan ditambah biaya', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400030002', '00000000-0000-4000-c000-000004000003', 2,
    'Bila total biaya lebih besar dari pendapatan, usaha mengalami...', 'Untung kotor', 'Rugi',
    'Impas', 'Laba', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400030003', '00000000-0000-4000-c000-000004000003', 3,
    'Contoh biaya operasional adalah...', 'Pembelian mobil pribadi', 'Pinjaman bank',
    'Listrik toko', 'Setoran modal', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000400030004', '00000000-0000-4000-c000-000004000003', 4,
    'Laporan laba rugi menunjukkan hasil usaha selama...', 'Selamanya', 'Satu detik',
    'Satu periode tertentu', 'Satu transaksi saja', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000500010001', '00000000-0000-4000-c000-000005000001', 1,
    'Sumber cahaya paling murah untuk foto produk adalah...', 'Cahaya jendela', 'Senter merah',
    'Layar televisi', 'Lampu disko', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000500010002', '00000000-0000-4000-c000-000005000001', 2,
    'Latar belakang polos dipakai agar...', 'Foto terlihat gelap', 'Warna produk berubah',
    'File lebih besar', 'Produk menjadi fokus', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000500010003', '00000000-0000-4000-c000-000005000001', 3,
    'Bayangan yang terlalu keras bisa dilunakkan dengan...', 'Mematikan ponsel', 'Memperbesar zoom',
    'Memakai flash langsung', 'Kain tipis atau kertas putih', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000500010004', '00000000-0000-4000-c000-000005000001', 4,
    'Waktu terbaik memakai cahaya matahari tidak langsung adalah...', 'Saat hujan deras di luar ruangan', 'Tengah malam',
    'Kapan saja tanpa beda', 'Pagi atau sore', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000500020001', '00000000-0000-4000-c000-000005000002', 1,
    'Garis bantu tiga kali tiga di kamera disebut...', 'HDR', 'Rule of thirds',
    'Histogram', 'Burst', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000500020002', '00000000-0000-4000-c000-000005000002', 2,
    'Sudut foto yang cocok untuk makanan di piring datar adalah...', 'Dari bawah meja', 'Dari samping jauh',
    'Dari atas (flat lay)', 'Dari belakang', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000500020003', '00000000-0000-4000-c000-000005000002', 3,
    'Penyuntingan yang wajar untuk foto produk adalah...', 'Mengatur terang dan kontras', 'Mengganti warna asli produk',
    'Mengubah bentuk produk', 'Menambah stiker penuh', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000500020004', '00000000-0000-4000-c000-000005000002', 4,
    'Zoom digital sebaiknya dihindari karena...', 'Menghemat baterai', 'Membuat foto lebih tajam',
    'Menambah warna', 'Menurunkan ketajaman foto', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000600010001', '00000000-0000-4000-c000-000006000001', 1,
    'Bagian pembuka presentasi sebaiknya berisi...', 'Ucapan penutup', 'Tujuan dan gambaran isi',
    'Lampiran data mentah', 'Daftar pustaka', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000600010002', '00000000-0000-4000-c000-000006000001', 2,
    'Jumlah poin utama yang mudah diingat audiens adalah...', 'Sekitar 3 poin', 'Tidak ada poin',
    'Satu kata saja', 'Lebih dari 15 poin', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000600010003', '00000000-0000-4000-c000-000006000001', 3,
    'Penutup presentasi yang kuat berisi...', 'Permintaan maaf panjang', 'Slide kosong',
    'Materi baru', 'Ringkasan dan ajakan bertindak', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000600020001', '00000000-0000-4000-c000-000006000002', 1,
    'Cara sederhana mengurangi gugup sebelum tampil adalah...', 'Latihan dan napas perlahan', 'Minum kopi lima gelas',
    'Tidak menyiapkan materi', 'Begadang', 'A'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000600020002', '00000000-0000-4000-c000-000006000002', 2,
    'Kontak mata dengan audiens berguna untuk...', 'Menghindari pertanyaan', 'Membangun kepercayaan',
    'Mempercepat waktu', 'Membuat audiens takut', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000600020003', '00000000-0000-4000-c000-000006000002', 3,
    'Bila lupa materi saat presentasi, sebaiknya...', 'Diam sampai waktu habis', 'Jeda sejenak lalu lihat catatan',
    'Mengulang dari awal', 'Langsung meninggalkan ruangan', 'B'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000700010001', '00000000-0000-4000-c000-000007000001', 1,
    'Bagian surat yang memuat nama dan alamat instansi adalah...', 'Tembusan', 'Lampiran',
    'Paraf', 'Kop surat', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000700010002', '00000000-0000-4000-c000-000007000001', 2,
    'Nomor surat ditulis di bagian...', 'Di amplop saja', 'Tidak perlu ditulis',
    'Atas, setelah kop surat', 'Paling bawah', 'C'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000700010003', '00000000-0000-4000-c000-000007000001', 3,
    'Ukuran kertas surat dinas yang umum adalah...', 'A6', 'Kertas folio bergaris',
    'Kertas HVS warna', 'A4', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000700020001', '00000000-0000-4000-c000-000007000002', 1,
    'Mail merge dipakai untuk...', 'Mengirim email spam', 'Menghapus format',
    'Menggabungkan dua printer', 'Membuat banyak surat dengan data penerima berbeda', 'D'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.soal (
    id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
) VALUES (
    '00000000-0000-4000-d000-000700020002', '00000000-0000-4000-c000-000007000002', 2,
    'Sumber data mail merge bisa berupa...', 'File video', 'File gambar',
    'File Excel daftar penerima', 'File musik', 'C'
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. KEMBALIKAN STATUS ASLI KURSUS SETELAH KURIKULUM LENGKAP (BR-02, BR-04)
-- ------------------------------------------------------------------------------
UPDATE public.kursus SET
    status = 'terbit'::public.status_kursus,
    catatan_tinjauan = NULL,
    diajukan_pada = '2026-08-12 14:00+07:00'::timestamptz,
    diterbitkan_pada = '2026-08-17 09:00+07:00'::timestamptz
WHERE id = '00000000-0000-4000-b000-000000000001';
UPDATE public.kursus SET
    status = 'terbit'::public.status_kursus,
    catatan_tinjauan = NULL,
    diajukan_pada = '2026-08-11 16:00+07:00'::timestamptz,
    diterbitkan_pada = '2026-08-17 09:30+07:00'::timestamptz
WHERE id = '00000000-0000-4000-b000-000000000002';
UPDATE public.kursus SET
    status = 'terbit'::public.status_kursus,
    catatan_tinjauan = NULL,
    diajukan_pada = '2026-08-14 10:00+07:00'::timestamptz,
    diterbitkan_pada = '2026-08-24 09:00+07:00'::timestamptz
WHERE id = '00000000-0000-4000-b000-000000000003';
UPDATE public.kursus SET
    status = 'terbit'::public.status_kursus,
    catatan_tinjauan = NULL,
    diajukan_pada = '2026-08-26 15:00+07:00'::timestamptz,
    diterbitkan_pada = '2026-08-31 09:00+07:00'::timestamptz
WHERE id = '00000000-0000-4000-b000-000000000004';
UPDATE public.kursus SET
    status = 'ditutup'::public.status_kursus,
    catatan_tinjauan = NULL,
    diajukan_pada = '2026-08-10 09:00+07:00'::timestamptz,
    diterbitkan_pada = '2026-08-17 10:00+07:00'::timestamptz
WHERE id = '00000000-0000-4000-b000-000000000005';
UPDATE public.kursus SET
    status = 'ditinjau'::public.status_kursus,
    catatan_tinjauan = NULL,
    diajukan_pada = '2026-10-12 16:00+07:00'::timestamptz,
    diterbitkan_pada = NULL
WHERE id = '00000000-0000-4000-b000-000000000006';
UPDATE public.kursus SET
    status = 'draf'::public.status_kursus,
    catatan_tinjauan = NULL,
    diajukan_pada = NULL,
    diterbitkan_pada = NULL
WHERE id = '00000000-0000-4000-b000-000000000007';

-- ------------------------------------------------------------------------------
-- 6. SEED PENDAFTARAN (61 PENDAFTARAN DENGAN KASUS BATAS)
-- ------------------------------------------------------------------------------
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000001', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000117',
    'aktif'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-22 19:12+07:00'::timestamptz,
    NULL, '2026-09-22 15:06+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-21 19:12+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000002', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000106',
    'selesai'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-08-20 08:41+07:00'::timestamptz,
    NULL, '2026-08-20 04:23+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-08-19 08:41+07:00'::timestamptz,
    '2026-09-03 07:10+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000003', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000128',
    'aktif'::public.status_pendaftaran, 350000,
    'mayar'::public.metode_pembayaran, '2026-10-13 20:05+07:00'::timestamptz,
    'INV-CONTOH-0003', '2026-10-12 20:47+07:00'::timestamptz, NULL,
    NULL, '2026-10-12 20:05+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000004', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000112',
    'selesai'::public.status_pendaftaran, 350000,
    'mayar'::public.metode_pembayaran, '2026-09-18 14:05+07:00'::timestamptz,
    'INV-CONTOH-0004', '2026-09-17 14:38+07:00'::timestamptz, NULL,
    NULL, '2026-09-17 14:05+07:00'::timestamptz,
    '2026-10-04 06:31+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000005', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000124',
    'selesai'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-30 11:41+07:00'::timestamptz,
    NULL, '2026-09-29 14:07+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-29 11:41+07:00'::timestamptz,
    '2026-10-06 19:30+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000006', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000105',
    'aktif'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-22 20:05+07:00'::timestamptz,
    NULL, '2026-09-22 12:26+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-21 20:05+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000007', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000116',
    'aktif'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-17 18:12+07:00'::timestamptz,
    NULL, '2026-09-17 13:49+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-16 18:12+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000008', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000126',
    'selesai'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-10 12:12+07:00'::timestamptz,
    NULL, '2026-09-09 21:27+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-09 12:12+07:00'::timestamptz,
    '2026-09-18 00:38+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000009', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000110',
    'selesai'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-08-22 09:48+07:00'::timestamptz,
    NULL, '2026-08-22 01:59+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-08-21 09:48+07:00'::timestamptz,
    '2026-08-30 06:23+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000010', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000114',
    'aktif'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-27 14:34+07:00'::timestamptz,
    NULL, '2026-09-27 09:41+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-26 14:34+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000011', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000107',
    'aktif'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-08-19 11:12+07:00'::timestamptz,
    NULL, '2026-08-19 00:24+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-08-18 11:12+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000012', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000120',
    'selesai'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-14 07:12+07:00'::timestamptz,
    NULL, '2026-09-13 11:43+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-13 07:12+07:00'::timestamptz,
    '2026-09-26 17:15+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000013', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000122',
    'menunggu_bayar'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-10-15 21:18+07:00'::timestamptz,
    NULL, NULL, NULL,
    NULL, '2026-10-14 21:18+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000014', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000127',
    'kedaluwarsa'::public.status_pendaftaran, 350000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-30 13:27+07:00'::timestamptz,
    NULL, NULL, NULL,
    NULL, '2026-09-29 13:27+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000015', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000111',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-10-14 19:34+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000016', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000110',
    'selesai'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-08-23 15:12+07:00'::timestamptz,
    '2026-09-02 21:17+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000017', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000117',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-09-27 13:48+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000018', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000125',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-08-30 07:56+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000019', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000124',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-10-06 12:27+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000020', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000112',
    'selesai'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-08-27 16:05+07:00'::timestamptz,
    '2026-09-06 02:50+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000021', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000128',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-09-11 16:56+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000022', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000127',
    'selesai'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-08-27 14:12+07:00'::timestamptz,
    '2026-09-05 23:54+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000023', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000118',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-09-19 12:18+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000024', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000102',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-10-03 16:48+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000025', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000109',
    'selesai'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-09-22 20:12+07:00'::timestamptz,
    '2026-10-11 02:58+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000026', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000119',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-10-07 15:05+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000027', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000101',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-09-17 07:56+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000028', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000123',
    'selesai'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-08-29 19:18+07:00'::timestamptz,
    '2026-09-11 07:16+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000029', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000107',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-09-11 11:12+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000030', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000115',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-10-10 15:27+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000031', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000120',
    'aktif'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-10-09 16:56+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000032', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000105',
    'selesai'::public.status_pendaftaran, 0,
    'gratis'::public.metode_pembayaran, NULL,
    NULL, NULL, NULL,
    NULL, '2026-09-25 09:12+07:00'::timestamptz,
    '2026-10-08 02:11+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000033', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000102',
    'aktif'::public.status_pendaftaran, 450000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-08 18:48+07:00'::timestamptz,
    NULL, '2026-09-08 04:08+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-07 18:48+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000034', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000105',
    'selesai'::public.status_pendaftaran, 450000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-21 16:05+07:00'::timestamptz,
    NULL, '2026-09-21 05:28+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-20 16:05+07:00'::timestamptz,
    '2026-10-04 02:04+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000035', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000118',
    'selesai'::public.status_pendaftaran, 450000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-27 11:12+07:00'::timestamptz,
    NULL, '2026-09-26 20:22+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-26 11:12+07:00'::timestamptz,
    '2026-10-06 19:22+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000036', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000130',
    'aktif'::public.status_pendaftaran, 450000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-27 07:41+07:00'::timestamptz,
    NULL, '2026-09-26 17:04+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-26 07:41+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000037', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000129',
    'aktif'::public.status_pendaftaran, 450000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-12 15:18+07:00'::timestamptz,
    NULL, '2026-09-11 19:55+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-11 15:18+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000038', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000120',
    'selesai'::public.status_pendaftaran, 450000,
    'transfer_manual'::public.metode_pembayaran, '2026-08-31 14:48+07:00'::timestamptz,
    NULL, '2026-08-31 07:23+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-08-30 14:48+07:00'::timestamptz,
    '2026-09-17 01:09+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000039', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000115',
    'selesai'::public.status_pendaftaran, 450000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-11 07:34+07:00'::timestamptz,
    NULL, '2026-09-10 13:23+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-10 07:34+07:00'::timestamptz,
    '2026-09-17 19:20+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000040', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000109',
    'dibatalkan'::public.status_pendaftaran, 450000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-03 09:56+07:00'::timestamptz,
    NULL, '2026-09-03 02:21+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    'Peserta pindah tugas ke luar kota dan meminta pembatalan', '2026-09-02 09:56+07:00'::timestamptz,
    NULL, '2026-09-06 09:56+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000041', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000116',
    'dibatalkan'::public.status_pendaftaran, 450000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-16 14:12+07:00'::timestamptz,
    NULL, NULL, NULL,
    NULL, '2026-09-15 14:12+07:00'::timestamptz,
    NULL, '2026-09-15 23:12+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000042', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000111',
    'kedaluwarsa'::public.status_pendaftaran, 300000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-04 20:41+07:00'::timestamptz,
    NULL, NULL, NULL,
    NULL, '2026-09-03 20:41+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000043', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000111',
    'aktif'::public.status_pendaftaran, 300000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-06 08:12+07:00'::timestamptz,
    NULL, '2026-09-05 20:02+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-05 08:12+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000044', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000120',
    'aktif'::public.status_pendaftaran, 300000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-08 11:41+07:00'::timestamptz,
    NULL, '2026-09-07 17:37+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-07 11:41+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000045', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000129',
    'aktif'::public.status_pendaftaran, 300000,
    'mayar'::public.metode_pembayaran, '2026-09-16 15:18+07:00'::timestamptz,
    'INV-CONTOH-0045', '2026-09-15 16:01+07:00'::timestamptz, NULL,
    NULL, '2026-09-15 15:18+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000046', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000105',
    'aktif'::public.status_pendaftaran, 300000,
    'mayar'::public.metode_pembayaran, '2026-09-07 16:34+07:00'::timestamptz,
    'INV-CONTOH-0046', '2026-09-06 17:07+07:00'::timestamptz, NULL,
    NULL, '2026-09-06 16:34+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000047', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000107',
    'aktif'::public.status_pendaftaran, 300000,
    'transfer_manual'::public.metode_pembayaran, '2026-10-05 17:48+07:00'::timestamptz,
    NULL, '2026-10-05 01:52+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-10-04 17:48+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000048', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000125',
    'selesai'::public.status_pendaftaran, 300000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-29 12:56+07:00'::timestamptz,
    NULL, '2026-09-28 16:55+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-28 12:56+07:00'::timestamptz,
    '2026-10-11 10:14+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000049', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000130',
    'aktif'::public.status_pendaftaran, 300000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-25 21:05+07:00'::timestamptz,
    NULL, '2026-09-25 01:23+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-24 21:05+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000050', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000119',
    'aktif'::public.status_pendaftaran, 300000,
    'mayar'::public.metode_pembayaran, '2026-09-09 10:12+07:00'::timestamptz,
    'INV-CONTOH-0050', '2026-09-08 10:56+07:00'::timestamptz, NULL,
    NULL, '2026-09-08 10:12+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000051', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000128',
    'selesai'::public.status_pendaftaran, 300000,
    'mayar'::public.metode_pembayaran, '2026-09-29 18:12+07:00'::timestamptz,
    'INV-CONTOH-0051', '2026-09-28 18:53+07:00'::timestamptz, NULL,
    NULL, '2026-09-28 18:12+07:00'::timestamptz,
    '2026-10-12 17:33+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000052', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000127',
    'aktif'::public.status_pendaftaran, 300000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-16 10:34+07:00'::timestamptz,
    NULL, '2026-09-15 16:37+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-15 10:34+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000053', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000123',
    'menunggu_bayar'::public.status_pendaftaran, 300000,
    'mayar'::public.metode_pembayaran, '2026-10-16 07:56+07:00'::timestamptz,
    'INV-CONTOH-0053', NULL, NULL,
    NULL, '2026-10-15 07:56+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000054', '00000000-0000-4000-b000-000000000005', '00000000-0000-4000-a000-000000000120',
    'selesai'::public.status_pendaftaran, 250000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-02 21:27+07:00'::timestamptz,
    NULL, '2026-09-02 12:55+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-01 21:27+07:00'::timestamptz,
    '2026-09-08 05:04+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000055', '00000000-0000-4000-b000-000000000005', '00000000-0000-4000-a000-000000000109',
    'selesai'::public.status_pendaftaran, 250000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-27 09:27+07:00'::timestamptz,
    NULL, '2026-09-27 02:43+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-26 09:27+07:00'::timestamptz,
    '2026-10-04 13:17+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000056', '00000000-0000-4000-b000-000000000005', '00000000-0000-4000-a000-000000000101',
    'selesai'::public.status_pendaftaran, 250000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-24 16:56+07:00'::timestamptz,
    NULL, '2026-09-24 04:32+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-23 16:56+07:00'::timestamptz,
    '2026-10-05 02:34+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000057', '00000000-0000-4000-b000-000000000005', '00000000-0000-4000-a000-000000000112',
    'selesai'::public.status_pendaftaran, 250000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-25 10:18+07:00'::timestamptz,
    NULL, '2026-09-24 23:58+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-09-24 10:18+07:00'::timestamptz,
    '2026-10-03 20:47+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000058', '00000000-0000-4000-b000-000000000005', '00000000-0000-4000-a000-000000000127',
    'selesai'::public.status_pendaftaran, 250000,
    'transfer_manual'::public.metode_pembayaran, '2026-08-31 19:27+07:00'::timestamptz,
    NULL, '2026-08-31 11:33+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-08-30 19:27+07:00'::timestamptz,
    '2026-09-11 09:47+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000059', '00000000-0000-4000-b000-000000000005', '00000000-0000-4000-a000-000000000108',
    'selesai'::public.status_pendaftaran, 250000,
    'transfer_manual'::public.metode_pembayaran, '2026-08-22 16:56+07:00'::timestamptz,
    NULL, '2026-08-22 11:10+07:00'::timestamptz, '00000000-0000-4000-a000-000000000002',
    NULL, '2026-08-21 16:56+07:00'::timestamptz,
    '2026-08-26 14:44+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000060', '00000000-0000-4000-b000-000000000005', '00000000-0000-4000-a000-000000000125',
    'aktif'::public.status_pendaftaran, 250000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-05 15:48+07:00'::timestamptz,
    NULL, '2026-09-05 03:33+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-04 15:48+07:00'::timestamptz,
    NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pendaftaran (
    id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar,
    mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal,
    didaftarkan_pada, selesai_pada, dibatalkan_pada
) VALUES (
    '00000000-0000-4000-e000-000000000061', '00000000-0000-4000-b000-000000000005', '00000000-0000-4000-a000-000000000113',
    'selesai'::public.status_pendaftaran, 250000,
    'transfer_manual'::public.metode_pembayaran, '2026-09-10 14:41+07:00'::timestamptz,
    NULL, '2026-09-10 07:55+07:00'::timestamptz, '00000000-0000-4000-a000-000000000001',
    NULL, '2026-09-09 14:41+07:00'::timestamptz,
    '2026-09-23 17:35+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. SEED PROGRES MODUL
-- ------------------------------------------------------------------------------
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000001', '00000000-0000-4000-e000-000000000001', '00000000-0000-4000-c000-000001000001',
    '2026-09-26 12:06+07:00'::timestamptz, '2026-09-26 12:59+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000002', '00000000-0000-4000-e000-000000000001', '00000000-0000-4000-c000-000001000002',
    '2026-10-01 06:59+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000003', '00000000-0000-4000-e000-000000000002', '00000000-0000-4000-c000-000001000001',
    '2026-08-22 03:23+07:00'::timestamptz, '2026-08-22 03:55+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000004', '00000000-0000-4000-e000-000000000002', '00000000-0000-4000-c000-000001000002',
    '2026-08-28 16:55+07:00'::timestamptz, '2026-08-30 06:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000005', '00000000-0000-4000-e000-000000000002', '00000000-0000-4000-c000-000001000003',
    '2026-09-03 06:22+07:00'::timestamptz, '2026-09-03 07:10+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000006', '00000000-0000-4000-e000-000000000003', '00000000-0000-4000-c000-000001000001',
    '2026-10-13 16:47+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000007', '00000000-0000-4000-e000-000000000004', '00000000-0000-4000-c000-000001000001',
    '2026-09-24 03:38+07:00'::timestamptz, '2026-09-24 04:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000008', '00000000-0000-4000-e000-000000000004', '00000000-0000-4000-c000-000001000002',
    '2026-10-01 02:23+07:00'::timestamptz, '2026-10-01 02:52+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000009', '00000000-0000-4000-e000-000000000004', '00000000-0000-4000-c000-000001000003',
    '2026-10-03 12:52+07:00'::timestamptz, '2026-10-04 06:31+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000010', '00000000-0000-4000-e000-000000000005', '00000000-0000-4000-c000-000001000001',
    '2026-10-01 10:07+07:00'::timestamptz, '2026-10-01 11:01+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000011', '00000000-0000-4000-e000-000000000005', '00000000-0000-4000-c000-000001000002',
    '2026-10-03 09:01+07:00'::timestamptz, '2026-10-03 09:43+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000012', '00000000-0000-4000-e000-000000000005', '00000000-0000-4000-c000-000001000003',
    '2026-10-06 09:43+07:00'::timestamptz, '2026-10-06 19:30+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000013', '00000000-0000-4000-e000-000000000006', '00000000-0000-4000-c000-000001000001',
    '2026-09-28 20:26+07:00'::timestamptz, '2026-09-28 21:16+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000014', '00000000-0000-4000-e000-000000000006', '00000000-0000-4000-c000-000001000002',
    '2026-10-03 18:16+07:00'::timestamptz, '2026-10-03 18:46+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000015', '00000000-0000-4000-e000-000000000008', '00000000-0000-4000-c000-000001000001',
    '2026-09-12 14:27+07:00'::timestamptz, '2026-09-12 15:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000016', '00000000-0000-4000-e000-000000000008', '00000000-0000-4000-c000-000001000002',
    '2026-09-13 19:23+07:00'::timestamptz, '2026-09-14 09:42+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000017', '00000000-0000-4000-e000-000000000008', '00000000-0000-4000-c000-000001000003',
    '2026-09-17 23:42+07:00'::timestamptz, '2026-09-18 00:38+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000018', '00000000-0000-4000-e000-000000000009', '00000000-0000-4000-c000-000001000001',
    '2026-08-24 17:59+07:00'::timestamptz, '2026-08-24 18:24+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000019', '00000000-0000-4000-e000-000000000009', '00000000-0000-4000-c000-000001000002',
    '2026-08-26 00:24+07:00'::timestamptz, '2026-08-26 01:10+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000020', '00000000-0000-4000-e000-000000000009', '00000000-0000-4000-c000-000001000003',
    '2026-08-29 06:10+07:00'::timestamptz, '2026-08-30 06:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000021', '00000000-0000-4000-e000-000000000010', '00000000-0000-4000-c000-000001000001',
    '2026-10-02 19:41+07:00'::timestamptz, '2026-10-04 02:11+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000022', '00000000-0000-4000-e000-000000000010', '00000000-0000-4000-c000-000001000002',
    '2026-10-10 17:11+07:00'::timestamptz, '2026-10-10 17:42+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000023', '00000000-0000-4000-e000-000000000012', '00000000-0000-4000-c000-000001000001',
    '2026-09-17 13:43+07:00'::timestamptz, '2026-09-17 14:18+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000024', '00000000-0000-4000-e000-000000000012', '00000000-0000-4000-c000-000001000002',
    '2026-09-23 09:18+07:00'::timestamptz, '2026-09-24 16:26+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000025', '00000000-0000-4000-e000-000000000012', '00000000-0000-4000-c000-000001000003',
    '2026-09-26 16:26+07:00'::timestamptz, '2026-09-26 17:15+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000026', '00000000-0000-4000-e000-000000000016', '00000000-0000-4000-c000-000002000001',
    '2026-08-25 14:12+07:00'::timestamptz, '2026-08-25 14:51+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000027', '00000000-0000-4000-e000-000000000016', '00000000-0000-4000-c000-000002000002',
    '2026-08-31 03:51+07:00'::timestamptz, '2026-08-31 04:36+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000028', '00000000-0000-4000-e000-000000000016', '00000000-0000-4000-c000-000002000003',
    '2026-09-02 20:36+07:00'::timestamptz, '2026-09-02 21:17+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000029', '00000000-0000-4000-e000-000000000018', '00000000-0000-4000-c000-000002000001',
    '2026-09-06 02:56+07:00'::timestamptz, '2026-09-06 03:35+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000030', '00000000-0000-4000-e000-000000000020', '00000000-0000-4000-c000-000002000001',
    '2026-08-30 07:05+07:00'::timestamptz, '2026-08-30 07:55+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000031', '00000000-0000-4000-e000-000000000020', '00000000-0000-4000-c000-000002000002',
    '2026-09-02 09:55+07:00'::timestamptz, '2026-09-02 10:20+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000032', '00000000-0000-4000-e000-000000000020', '00000000-0000-4000-c000-000002000003',
    '2026-09-06 02:20+07:00'::timestamptz, '2026-09-06 02:50+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000033', '00000000-0000-4000-e000-000000000021', '00000000-0000-4000-c000-000002000001',
    '2026-09-14 00:56+07:00'::timestamptz, '2026-09-14 01:31+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000034', '00000000-0000-4000-e000-000000000021', '00000000-0000-4000-c000-000002000002',
    '2026-09-19 08:31+07:00'::timestamptz, '2026-09-19 09:31+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000035', '00000000-0000-4000-e000-000000000022', '00000000-0000-4000-c000-000002000001',
    '2026-08-31 08:12+07:00'::timestamptz, '2026-08-31 09:06+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000036', '00000000-0000-4000-e000-000000000022', '00000000-0000-4000-c000-000002000002',
    '2026-09-02 18:06+07:00'::timestamptz, '2026-09-02 22:28+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000037', '00000000-0000-4000-e000-000000000022', '00000000-0000-4000-c000-000002000003',
    '2026-09-05 23:28+07:00'::timestamptz, '2026-09-05 23:54+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000038', '00000000-0000-4000-e000-000000000023', '00000000-0000-4000-c000-000002000001',
    '2026-09-23 04:18+07:00'::timestamptz, '2026-09-23 05:15+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000039', '00000000-0000-4000-e000-000000000023', '00000000-0000-4000-c000-000002000002',
    '2026-09-29 07:15+07:00'::timestamptz, '2026-09-30 12:37+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000040', '00000000-0000-4000-e000-000000000024', '00000000-0000-4000-c000-000002000001',
    '2026-10-04 15:48+07:00'::timestamptz, '2026-10-04 16:25+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000041', '00000000-0000-4000-e000-000000000024', '00000000-0000-4000-c000-000002000002',
    '2026-10-08 05:25+07:00'::timestamptz, '2026-10-08 05:53+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000042', '00000000-0000-4000-e000-000000000025', '00000000-0000-4000-c000-000002000001',
    '2026-09-28 02:12+07:00'::timestamptz, '2026-09-28 02:56+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000043', '00000000-0000-4000-e000-000000000025', '00000000-0000-4000-c000-000002000002',
    '2026-10-03 13:56+07:00'::timestamptz, '2026-10-03 14:27+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000044', '00000000-0000-4000-e000-000000000025', '00000000-0000-4000-c000-000002000003',
    '2026-10-10 02:27+07:00'::timestamptz, '2026-10-11 02:58+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000045', '00000000-0000-4000-e000-000000000026', '00000000-0000-4000-c000-000002000001',
    '2026-10-11 15:05+07:00'::timestamptz, '2026-10-11 15:51+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000046', '00000000-0000-4000-e000-000000000028', '00000000-0000-4000-c000-000002000001',
    '2026-09-01 05:18+07:00'::timestamptz, '2026-09-01 05:56+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000047', '00000000-0000-4000-e000-000000000028', '00000000-0000-4000-c000-000002000002',
    '2026-09-08 03:56+07:00'::timestamptz, '2026-09-08 22:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000048', '00000000-0000-4000-e000-000000000028', '00000000-0000-4000-c000-000002000003',
    '2026-09-10 11:22+07:00'::timestamptz, '2026-09-11 07:16+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000049', '00000000-0000-4000-e000-000000000029', '00000000-0000-4000-c000-000002000001',
    '2026-09-15 13:12+07:00'::timestamptz, '2026-09-15 13:46+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000050', '00000000-0000-4000-e000-000000000029', '00000000-0000-4000-c000-000002000002',
    '2026-09-17 23:46+07:00'::timestamptz, '2026-09-18 00:43+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000051', '00000000-0000-4000-e000-000000000031', '00000000-0000-4000-c000-000002000001',
    '2026-10-11 21:56+07:00'::timestamptz, '2026-10-11 22:54+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000052', '00000000-0000-4000-e000-000000000031', '00000000-0000-4000-c000-000002000002',
    '2026-10-13 08:54+07:00'::timestamptz, '2026-10-13 09:27+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000053', '00000000-0000-4000-e000-000000000032', '00000000-0000-4000-c000-000002000001',
    '2026-09-26 20:12+07:00'::timestamptz, '2026-09-26 20:51+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000054', '00000000-0000-4000-e000-000000000032', '00000000-0000-4000-c000-000002000002',
    '2026-10-02 23:51+07:00'::timestamptz, '2026-10-03 00:45+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000055', '00000000-0000-4000-e000-000000000032', '00000000-0000-4000-c000-000002000003',
    '2026-10-08 01:45+07:00'::timestamptz, '2026-10-08 02:11+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000056', '00000000-0000-4000-e000-000000000033', '00000000-0000-4000-c000-000003000001',
    '2026-09-13 18:08+07:00'::timestamptz, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000057', '00000000-0000-4000-e000-000000000034', '00000000-0000-4000-c000-000003000001',
    '2026-09-27 14:28+07:00'::timestamptz, '2026-09-27 15:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000058', '00000000-0000-4000-e000-000000000034', '00000000-0000-4000-c000-000003000002',
    '2026-09-30 18:23+07:00'::timestamptz, '2026-09-30 19:07+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000059', '00000000-0000-4000-e000-000000000034', '00000000-0000-4000-c000-000003000003',
    '2026-10-04 01:07+07:00'::timestamptz, '2026-10-04 02:04+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000060', '00000000-0000-4000-e000-000000000035', '00000000-0000-4000-c000-000003000001',
    '2026-10-02 14:22+07:00'::timestamptz, '2026-10-02 17:59+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000061', '00000000-0000-4000-e000-000000000035', '00000000-0000-4000-c000-000003000002',
    '2026-10-05 18:59+07:00'::timestamptz, '2026-10-05 19:25+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000062', '00000000-0000-4000-e000-000000000035', '00000000-0000-4000-c000-000003000003',
    '2026-10-06 18:25+07:00'::timestamptz, '2026-10-06 19:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000063', '00000000-0000-4000-e000-000000000038', '00000000-0000-4000-c000-000003000001',
    '2026-09-05 02:23+07:00'::timestamptz, '2026-09-05 03:11+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000064', '00000000-0000-4000-e000-000000000038', '00000000-0000-4000-c000-000003000002',
    '2026-09-10 02:11+07:00'::timestamptz, '2026-09-10 14:24+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000065', '00000000-0000-4000-e000-000000000038', '00000000-0000-4000-c000-000003000003',
    '2026-09-17 00:24+07:00'::timestamptz, '2026-09-17 01:09+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000066', '00000000-0000-4000-e000-000000000039', '00000000-0000-4000-c000-000003000001',
    '2026-09-11 08:23+07:00'::timestamptz, '2026-09-11 08:52+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000067', '00000000-0000-4000-e000-000000000039', '00000000-0000-4000-c000-000003000002',
    '2026-09-16 01:52+07:00'::timestamptz, '2026-09-16 02:20+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000068', '00000000-0000-4000-e000-000000000039', '00000000-0000-4000-c000-000003000003',
    '2026-09-17 05:20+07:00'::timestamptz, '2026-09-17 19:20+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000069', '00000000-0000-4000-e000-000000000044', '00000000-0000-4000-c000-000004000001',
    '2026-09-13 22:37+07:00'::timestamptz, '2026-09-13 23:15+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000070', '00000000-0000-4000-e000-000000000044', '00000000-0000-4000-c000-000004000002',
    '2026-09-18 11:15+07:00'::timestamptz, '2026-09-18 11:49+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000071', '00000000-0000-4000-e000-000000000046', '00000000-0000-4000-c000-000004000001',
    '2026-09-09 10:07+07:00'::timestamptz, '2026-09-10 05:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000072', '00000000-0000-4000-e000-000000000047', '00000000-0000-4000-c000-000004000001',
    '2026-10-08 14:52+07:00'::timestamptz, '2026-10-08 17:57+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000073', '00000000-0000-4000-e000-000000000047', '00000000-0000-4000-c000-000004000002',
    '2026-10-13 02:57+07:00'::timestamptz, '2026-10-13 03:29+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000074', '00000000-0000-4000-e000-000000000048', '00000000-0000-4000-c000-000004000001',
    '2026-10-04 01:55+07:00'::timestamptz, '2026-10-04 02:32+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000075', '00000000-0000-4000-e000-000000000048', '00000000-0000-4000-c000-000004000002',
    '2026-10-08 00:32+07:00'::timestamptz, '2026-10-08 01:24+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000076', '00000000-0000-4000-e000-000000000048', '00000000-0000-4000-c000-000004000003',
    '2026-10-11 09:24+07:00'::timestamptz, '2026-10-11 10:14+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000077', '00000000-0000-4000-e000-000000000051', '00000000-0000-4000-c000-000004000001',
    '2026-10-04 02:53+07:00'::timestamptz, '2026-10-04 03:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000078', '00000000-0000-4000-e000-000000000051', '00000000-0000-4000-c000-000004000002',
    '2026-10-06 14:22+07:00'::timestamptz, '2026-10-06 15:05+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000079', '00000000-0000-4000-e000-000000000051', '00000000-0000-4000-c000-000004000003',
    '2026-10-12 17:05+07:00'::timestamptz, '2026-10-12 17:33+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000080', '00000000-0000-4000-e000-000000000054', '00000000-0000-4000-c000-000005000001',
    '2026-09-04 14:55+07:00'::timestamptz, '2026-09-04 15:46+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000081', '00000000-0000-4000-e000-000000000054', '00000000-0000-4000-c000-000005000002',
    '2026-09-07 21:46+07:00'::timestamptz, '2026-09-08 05:04+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000082', '00000000-0000-4000-e000-000000000055', '00000000-0000-4000-c000-000005000001',
    '2026-10-01 09:43+07:00'::timestamptz, '2026-10-01 10:33+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000083', '00000000-0000-4000-e000-000000000055', '00000000-0000-4000-c000-000005000002',
    '2026-10-04 12:33+07:00'::timestamptz, '2026-10-04 13:17+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000084', '00000000-0000-4000-e000-000000000056', '00000000-0000-4000-c000-000005000001',
    '2026-09-27 18:32+07:00'::timestamptz, '2026-09-28 17:17+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000085', '00000000-0000-4000-e000-000000000056', '00000000-0000-4000-c000-000005000002',
    '2026-10-04 21:17+07:00'::timestamptz, '2026-10-05 02:34+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000086', '00000000-0000-4000-e000-000000000057', '00000000-0000-4000-c000-000005000001',
    '2026-09-26 12:58+07:00'::timestamptz, '2026-09-27 02:14+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000087', '00000000-0000-4000-e000-000000000057', '00000000-0000-4000-c000-000005000002',
    '2026-10-03 20:14+07:00'::timestamptz, '2026-10-03 20:47+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000088', '00000000-0000-4000-e000-000000000058', '00000000-0000-4000-c000-000005000001',
    '2026-09-07 00:33+07:00'::timestamptz, '2026-09-07 01:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000089', '00000000-0000-4000-e000-000000000058', '00000000-0000-4000-c000-000005000002',
    '2026-09-10 11:22+07:00'::timestamptz, '2026-09-11 09:47+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000090', '00000000-0000-4000-e000-000000000059', '00000000-0000-4000-c000-000005000001',
    '2026-08-25 15:10+07:00'::timestamptz, '2026-08-25 15:58+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000091', '00000000-0000-4000-e000-000000000059', '00000000-0000-4000-c000-000005000002',
    '2026-08-26 13:58+07:00'::timestamptz, '2026-08-26 14:44+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000092', '00000000-0000-4000-e000-000000000061', '00000000-0000-4000-c000-000005000001',
    '2026-09-16 20:55+07:00'::timestamptz, '2026-09-17 08:05+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.progres_modul (
    id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada
) VALUES (
    '00000000-0000-4000-f000-000000000093', '00000000-0000-4000-e000-000000000061', '00000000-0000-4000-c000-000005000002',
    '2026-09-23 17:05+07:00'::timestamptz, '2026-09-23 17:35+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. SEED PERCOBAAN KUIS (124 PERCOBAAN)
-- ------------------------------------------------------------------------------
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000001', '00000000-0000-4000-e000-000000000001', '00000000-0000-4000-c000-000001000001',
    1, '{"00000000-0000-4000-d000-000100010001": "C", "00000000-0000-4000-d000-000100010002": "B", "00000000-0000-4000-d000-000100010003": "A", "00000000-0000-4000-d000-000100010004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-26 12:59+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000002', '00000000-0000-4000-e000-000000000001', '00000000-0000-4000-c000-000001000002',
    1, '{"00000000-0000-4000-d000-000100020001": "A", "00000000-0000-4000-d000-000100020002": "C", "00000000-0000-4000-d000-000100020003": "A", "00000000-0000-4000-d000-000100020004": "D"}'::jsonb,
    4, 2,
    50, false,
    '2026-10-01 07:52+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000003', '00000000-0000-4000-e000-000000000001', '00000000-0000-4000-c000-000001000002',
    2, '{"00000000-0000-4000-d000-000100020001": "A", "00000000-0000-4000-d000-000100020002": "C", "00000000-0000-4000-d000-000100020003": "C", "00000000-0000-4000-d000-000100020004": "C"}'::jsonb,
    4, 2,
    50, false,
    '2026-10-01 20:12+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000004', '00000000-0000-4000-e000-000000000002', '00000000-0000-4000-c000-000001000001',
    1, '{"00000000-0000-4000-d000-000100010001": "C", "00000000-0000-4000-d000-000100010002": "B", "00000000-0000-4000-d000-000100010003": "A", "00000000-0000-4000-d000-000100010004": "A"}'::jsonb,
    4, 4,
    100, true,
    '2026-08-22 03:55+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000005', '00000000-0000-4000-e000-000000000002', '00000000-0000-4000-c000-000001000002',
    1, '{"00000000-0000-4000-d000-000100020001": "C", "00000000-0000-4000-d000-000100020002": "B", "00000000-0000-4000-d000-000100020003": "A", "00000000-0000-4000-d000-000100020004": "C"}'::jsonb,
    4, 0,
    0, false,
    '2026-08-28 17:47+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000006', '00000000-0000-4000-e000-000000000002', '00000000-0000-4000-c000-000001000002',
    2, '{"00000000-0000-4000-d000-000100020001": "A", "00000000-0000-4000-d000-000100020002": "B", "00000000-0000-4000-d000-000100020003": "C", "00000000-0000-4000-d000-000100020004": "A"}'::jsonb,
    4, 2,
    50, false,
    '2026-08-29 12:29+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000007', '00000000-0000-4000-e000-000000000002', '00000000-0000-4000-c000-000001000002',
    3, '{"00000000-0000-4000-d000-000100020001": "A", "00000000-0000-4000-d000-000100020002": "D", "00000000-0000-4000-d000-000100020003": "B", "00000000-0000-4000-d000-000100020004": "A"}'::jsonb,
    4, 3,
    75, true,
    '2026-08-30 06:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000008', '00000000-0000-4000-e000-000000000002', '00000000-0000-4000-c000-000001000003',
    1, '{"00000000-0000-4000-d000-000100030001": "B", "00000000-0000-4000-d000-000100030002": "B", "00000000-0000-4000-d000-000100030003": "A", "00000000-0000-4000-d000-000100030004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-03 07:10+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000009', '00000000-0000-4000-e000-000000000004', '00000000-0000-4000-c000-000001000001',
    1, '{"00000000-0000-4000-d000-000100010001": "C", "00000000-0000-4000-d000-000100010002": "B", "00000000-0000-4000-d000-000100010003": "A", "00000000-0000-4000-d000-000100010004": "B"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-24 04:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000010', '00000000-0000-4000-e000-000000000004', '00000000-0000-4000-c000-000001000002',
    1, '{"00000000-0000-4000-d000-000100020001": "A", "00000000-0000-4000-d000-000100020002": "B", "00000000-0000-4000-d000-000100020003": "B", "00000000-0000-4000-d000-000100020004": "A"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-01 02:52+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000011', '00000000-0000-4000-e000-000000000004', '00000000-0000-4000-c000-000001000003',
    1, '{"00000000-0000-4000-d000-000100030001": "B", "00000000-0000-4000-d000-000100030002": "C", "00000000-0000-4000-d000-000100030003": "D", "00000000-0000-4000-d000-000100030004": "D"}'::jsonb,
    4, 1,
    25, false,
    '2026-10-03 13:51+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000012', '00000000-0000-4000-e000-000000000004', '00000000-0000-4000-c000-000001000003',
    2, '{"00000000-0000-4000-d000-000100030001": "B", "00000000-0000-4000-d000-000100030002": "B", "00000000-0000-4000-d000-000100030003": "A", "00000000-0000-4000-d000-000100030004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-04 06:31+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000013', '00000000-0000-4000-e000-000000000005', '00000000-0000-4000-c000-000001000001',
    1, '{"00000000-0000-4000-d000-000100010001": "C", "00000000-0000-4000-d000-000100010002": "B", "00000000-0000-4000-d000-000100010003": "A", "00000000-0000-4000-d000-000100010004": "A"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-01 11:01+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000014', '00000000-0000-4000-e000-000000000005', '00000000-0000-4000-c000-000001000002',
    1, '{"00000000-0000-4000-d000-000100020001": "A", "00000000-0000-4000-d000-000100020002": "C", "00000000-0000-4000-d000-000100020003": "B", "00000000-0000-4000-d000-000100020004": "A"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-03 09:43+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000015', '00000000-0000-4000-e000-000000000005', '00000000-0000-4000-c000-000001000003',
    1, '{"00000000-0000-4000-d000-000100030001": "D", "00000000-0000-4000-d000-000100030002": "B", "00000000-0000-4000-d000-000100030003": "A", "00000000-0000-4000-d000-000100030004": "B"}'::jsonb,
    4, 2,
    50, false,
    '2026-10-06 10:21+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000016', '00000000-0000-4000-e000-000000000005', '00000000-0000-4000-c000-000001000003',
    2, '{"00000000-0000-4000-d000-000100030001": "B", "00000000-0000-4000-d000-000100030002": "B", "00000000-0000-4000-d000-000100030003": "D", "00000000-0000-4000-d000-000100030004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-06 19:30+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000017', '00000000-0000-4000-e000-000000000006', '00000000-0000-4000-c000-000001000001',
    1, '{"00000000-0000-4000-d000-000100010001": "C", "00000000-0000-4000-d000-000100010002": "B", "00000000-0000-4000-d000-000100010003": "A", "00000000-0000-4000-d000-000100010004": "A"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-28 21:16+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000018', '00000000-0000-4000-e000-000000000006', '00000000-0000-4000-c000-000001000002',
    1, '{"00000000-0000-4000-d000-000100020001": "A", "00000000-0000-4000-d000-000100020002": "C", "00000000-0000-4000-d000-000100020003": "B", "00000000-0000-4000-d000-000100020004": "A"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-03 18:46+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000019', '00000000-0000-4000-e000-000000000008', '00000000-0000-4000-c000-000001000001',
    1, '{"00000000-0000-4000-d000-000100010001": "C", "00000000-0000-4000-d000-000100010002": "B", "00000000-0000-4000-d000-000100010003": "A", "00000000-0000-4000-d000-000100010004": "A"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-12 15:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000020', '00000000-0000-4000-e000-000000000008', '00000000-0000-4000-c000-000001000002',
    1, '{"00000000-0000-4000-d000-000100020001": "B", "00000000-0000-4000-d000-000100020002": "B", "00000000-0000-4000-d000-000100020003": "A", "00000000-0000-4000-d000-000100020004": "D"}'::jsonb,
    4, 0,
    0, false,
    '2026-09-13 20:17+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000021', '00000000-0000-4000-e000-000000000008', '00000000-0000-4000-c000-000001000002',
    2, '{"00000000-0000-4000-d000-000100020001": "A", "00000000-0000-4000-d000-000100020002": "B", "00000000-0000-4000-d000-000100020003": "B", "00000000-0000-4000-d000-000100020004": "A"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-14 09:42+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000022', '00000000-0000-4000-e000-000000000008', '00000000-0000-4000-c000-000001000003',
    1, '{"00000000-0000-4000-d000-000100030001": "B", "00000000-0000-4000-d000-000100030002": "B", "00000000-0000-4000-d000-000100030003": "D", "00000000-0000-4000-d000-000100030004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-18 00:38+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000023', '00000000-0000-4000-e000-000000000009', '00000000-0000-4000-c000-000001000001',
    1, '{"00000000-0000-4000-d000-000100010001": "C", "00000000-0000-4000-d000-000100010002": "B", "00000000-0000-4000-d000-000100010003": "B", "00000000-0000-4000-d000-000100010004": "A"}'::jsonb,
    4, 3,
    75, true,
    '2026-08-24 18:24+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000024', '00000000-0000-4000-e000-000000000009', '00000000-0000-4000-c000-000001000002',
    1, '{"00000000-0000-4000-d000-000100020001": "C", "00000000-0000-4000-d000-000100020002": "C", "00000000-0000-4000-d000-000100020003": "B", "00000000-0000-4000-d000-000100020004": "A"}'::jsonb,
    4, 3,
    75, true,
    '2026-08-26 01:10+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000025', '00000000-0000-4000-e000-000000000009', '00000000-0000-4000-c000-000001000003',
    1, '{"00000000-0000-4000-d000-000100030001": "A", "00000000-0000-4000-d000-000100030002": "B", "00000000-0000-4000-d000-000100030003": "D", "00000000-0000-4000-d000-000100030004": "B"}'::jsonb,
    4, 1,
    25, false,
    '2026-08-29 07:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000026', '00000000-0000-4000-e000-000000000009', '00000000-0000-4000-c000-000001000003',
    2, '{"00000000-0000-4000-d000-000100030001": "B", "00000000-0000-4000-d000-000100030002": "B", "00000000-0000-4000-d000-000100030003": "A", "00000000-0000-4000-d000-000100030004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-08-30 06:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000027', '00000000-0000-4000-e000-000000000010', '00000000-0000-4000-c000-000001000001',
    1, '{"00000000-0000-4000-d000-000100010001": "A", "00000000-0000-4000-d000-000100010002": "B", "00000000-0000-4000-d000-000100010003": "C", "00000000-0000-4000-d000-000100010004": "A"}'::jsonb,
    4, 2,
    50, false,
    '2026-10-02 20:28+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000028', '00000000-0000-4000-e000-000000000010', '00000000-0000-4000-c000-000001000001',
    2, '{"00000000-0000-4000-d000-000100010001": "A", "00000000-0000-4000-d000-000100010002": "A", "00000000-0000-4000-d000-000100010003": "A", "00000000-0000-4000-d000-000100010004": "B"}'::jsonb,
    4, 1,
    25, false,
    '2026-10-03 15:18+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000029', '00000000-0000-4000-e000-000000000010', '00000000-0000-4000-c000-000001000001',
    3, '{"00000000-0000-4000-d000-000100010001": "C", "00000000-0000-4000-d000-000100010002": "A", "00000000-0000-4000-d000-000100010003": "A", "00000000-0000-4000-d000-000100010004": "A"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-04 02:11+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000030', '00000000-0000-4000-e000-000000000010', '00000000-0000-4000-c000-000001000002',
    1, '{"00000000-0000-4000-d000-000100020001": "A", "00000000-0000-4000-d000-000100020002": "C", "00000000-0000-4000-d000-000100020003": "B", "00000000-0000-4000-d000-000100020004": "A"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-10 17:42+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000031', '00000000-0000-4000-e000-000000000012', '00000000-0000-4000-c000-000001000001',
    1, '{"00000000-0000-4000-d000-000100010001": "C", "00000000-0000-4000-d000-000100010002": "B", "00000000-0000-4000-d000-000100010003": "A", "00000000-0000-4000-d000-000100010004": "B"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-17 14:18+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000032', '00000000-0000-4000-e000-000000000012', '00000000-0000-4000-c000-000001000002',
    1, '{"00000000-0000-4000-d000-000100020001": "C", "00000000-0000-4000-d000-000100020002": "C", "00000000-0000-4000-d000-000100020003": "D", "00000000-0000-4000-d000-000100020004": "D"}'::jsonb,
    4, 1,
    25, false,
    '2026-09-23 10:03+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000033', '00000000-0000-4000-e000-000000000012', '00000000-0000-4000-c000-000001000002',
    2, '{"00000000-0000-4000-d000-000100020001": "C", "00000000-0000-4000-d000-000100020002": "A", "00000000-0000-4000-d000-000100020003": "B", "00000000-0000-4000-d000-000100020004": "D"}'::jsonb,
    4, 1,
    25, false,
    '2026-09-24 08:15+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000034', '00000000-0000-4000-e000-000000000012', '00000000-0000-4000-c000-000001000002',
    3, '{"00000000-0000-4000-d000-000100020001": "A", "00000000-0000-4000-d000-000100020002": "C", "00000000-0000-4000-d000-000100020003": "B", "00000000-0000-4000-d000-000100020004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-24 16:26+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000035', '00000000-0000-4000-e000-000000000012', '00000000-0000-4000-c000-000001000003',
    1, '{"00000000-0000-4000-d000-000100030001": "B", "00000000-0000-4000-d000-000100030002": "B", "00000000-0000-4000-d000-000100030003": "C", "00000000-0000-4000-d000-000100030004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-26 17:15+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000036', '00000000-0000-4000-e000-000000000016', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "A", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-08-25 14:51+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000037', '00000000-0000-4000-e000-000000000016', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-08-31 04:36+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000038', '00000000-0000-4000-e000-000000000016', '00000000-0000-4000-c000-000002000003',
    1, '{"00000000-0000-4000-d000-000200030001": "A", "00000000-0000-4000-d000-000200030002": "C", "00000000-0000-4000-d000-000200030003": "C", "00000000-0000-4000-d000-000200030004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-02 21:17+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000039', '00000000-0000-4000-e000-000000000018', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "A", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-06 03:35+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000040', '00000000-0000-4000-e000-000000000020', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "B", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-08-30 07:55+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000041', '00000000-0000-4000-e000-000000000020', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "C", "00000000-0000-4000-d000-000200020004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-02 10:20+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000042', '00000000-0000-4000-e000-000000000020', '00000000-0000-4000-c000-000002000003',
    1, '{"00000000-0000-4000-d000-000200030001": "A", "00000000-0000-4000-d000-000200030002": "C", "00000000-0000-4000-d000-000200030003": "C", "00000000-0000-4000-d000-000200030004": "B"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-06 02:50+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000043', '00000000-0000-4000-e000-000000000021', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "D", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-14 01:31+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000044', '00000000-0000-4000-e000-000000000021', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-19 09:31+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000045', '00000000-0000-4000-e000-000000000022', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "A", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "C", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-08-31 09:06+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000046', '00000000-0000-4000-e000-000000000022', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "C", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "C"}'::jsonb,
    4, 2,
    50, false,
    '2026-09-02 18:46+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000047', '00000000-0000-4000-e000-000000000022', '00000000-0000-4000-c000-000002000002',
    2, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-02 22:28+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000048', '00000000-0000-4000-e000-000000000022', '00000000-0000-4000-c000-000002000003',
    1, '{"00000000-0000-4000-d000-000200030001": "D", "00000000-0000-4000-d000-000200030002": "C", "00000000-0000-4000-d000-000200030003": "C", "00000000-0000-4000-d000-000200030004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-05 23:54+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000049', '00000000-0000-4000-e000-000000000023', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "A", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "B"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-23 05:15+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000050', '00000000-0000-4000-e000-000000000023', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "A", "00000000-0000-4000-d000-000200020002": "D", "00000000-0000-4000-d000-000200020003": "D", "00000000-0000-4000-d000-000200020004": "A"}'::jsonb,
    4, 0,
    0, false,
    '2026-09-29 07:49+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000051', '00000000-0000-4000-e000-000000000023', '00000000-0000-4000-c000-000002000002',
    2, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "D", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "A"}'::jsonb,
    4, 2,
    50, false,
    '2026-09-30 04:48+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000052', '00000000-0000-4000-e000-000000000023', '00000000-0000-4000-c000-000002000002',
    3, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "A"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-30 12:37+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000053', '00000000-0000-4000-e000-000000000024', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "A", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "A"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-04 16:25+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000054', '00000000-0000-4000-e000-000000000024', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "C", "00000000-0000-4000-d000-000200020004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-08 05:53+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000055', '00000000-0000-4000-e000-000000000025', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "A", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-28 02:56+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000056', '00000000-0000-4000-e000-000000000025', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-03 14:27+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000057', '00000000-0000-4000-e000-000000000025', '00000000-0000-4000-c000-000002000003',
    1, '{"00000000-0000-4000-d000-000200030001": "D", "00000000-0000-4000-d000-000200030002": "C", "00000000-0000-4000-d000-000200030003": "D", "00000000-0000-4000-d000-000200030004": "C"}'::jsonb,
    4, 2,
    50, false,
    '2026-10-10 03:08+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000058', '00000000-0000-4000-e000-000000000025', '00000000-0000-4000-c000-000002000003',
    2, '{"00000000-0000-4000-d000-000200030001": "C", "00000000-0000-4000-d000-000200030002": "B", "00000000-0000-4000-d000-000200030003": "B", "00000000-0000-4000-d000-000200030004": "D"}'::jsonb,
    4, 0,
    0, false,
    '2026-10-10 08:57+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000059', '00000000-0000-4000-e000-000000000025', '00000000-0000-4000-c000-000002000003',
    3, '{"00000000-0000-4000-d000-000200030001": "A", "00000000-0000-4000-d000-000200030002": "C", "00000000-0000-4000-d000-000200030003": "C", "00000000-0000-4000-d000-000200030004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-11 02:58+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000060', '00000000-0000-4000-e000-000000000026', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "A", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-11 15:51+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000061', '00000000-0000-4000-e000-000000000028', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "A", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-01 05:56+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000062', '00000000-0000-4000-e000-000000000028', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "A", "00000000-0000-4000-d000-000200020002": "B", "00000000-0000-4000-d000-000200020003": "C", "00000000-0000-4000-d000-000200020004": "D"}'::jsonb,
    4, 1,
    25, false,
    '2026-09-08 04:25+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000063', '00000000-0000-4000-e000-000000000028', '00000000-0000-4000-c000-000002000002',
    2, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-08 22:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000064', '00000000-0000-4000-e000-000000000028', '00000000-0000-4000-c000-000002000003',
    1, '{"00000000-0000-4000-d000-000200030001": "C", "00000000-0000-4000-d000-000200030002": "A", "00000000-0000-4000-d000-000200030003": "A", "00000000-0000-4000-d000-000200030004": "B"}'::jsonb,
    4, 0,
    0, false,
    '2026-09-10 12:16+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000065', '00000000-0000-4000-e000-000000000028', '00000000-0000-4000-c000-000002000003',
    2, '{"00000000-0000-4000-d000-000200030001": "A", "00000000-0000-4000-d000-000200030002": "C", "00000000-0000-4000-d000-000200030003": "C", "00000000-0000-4000-d000-000200030004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-11 07:16+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000066', '00000000-0000-4000-e000-000000000029', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "A", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-15 13:46+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000067', '00000000-0000-4000-e000-000000000029', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "B"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-18 00:43+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000068', '00000000-0000-4000-e000-000000000031', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "D", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-11 22:54+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000069', '00000000-0000-4000-e000-000000000031', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "A", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-13 09:27+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000070', '00000000-0000-4000-e000-000000000032', '00000000-0000-4000-c000-000002000001',
    1, '{"00000000-0000-4000-d000-000200010001": "A", "00000000-0000-4000-d000-000200010002": "B", "00000000-0000-4000-d000-000200010003": "D", "00000000-0000-4000-d000-000200010004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-26 20:51+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000071', '00000000-0000-4000-e000-000000000032', '00000000-0000-4000-c000-000002000002',
    1, '{"00000000-0000-4000-d000-000200020001": "B", "00000000-0000-4000-d000-000200020002": "A", "00000000-0000-4000-d000-000200020003": "B", "00000000-0000-4000-d000-000200020004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-03 00:45+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000072', '00000000-0000-4000-e000-000000000032', '00000000-0000-4000-c000-000002000003',
    1, '{"00000000-0000-4000-d000-000200030001": "A", "00000000-0000-4000-d000-000200030002": "A", "00000000-0000-4000-d000-000200030003": "C", "00000000-0000-4000-d000-000200030004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-08 02:11+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000073', '00000000-0000-4000-e000-000000000033', '00000000-0000-4000-c000-000003000001',
    1, '{"00000000-0000-4000-d000-000300010001": "B", "00000000-0000-4000-d000-000300010002": "A", "00000000-0000-4000-d000-000300010003": "B", "00000000-0000-4000-d000-000300010004": "C", "00000000-0000-4000-d000-000300010005": "A"}'::jsonb,
    5, 2,
    40, false,
    '2026-09-13 18:56+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000074', '00000000-0000-4000-e000-000000000033', '00000000-0000-4000-c000-000003000001',
    2, '{"00000000-0000-4000-d000-000300010001": "A", "00000000-0000-4000-d000-000300010002": "B", "00000000-0000-4000-d000-000300010003": "A", "00000000-0000-4000-d000-000300010004": "C", "00000000-0000-4000-d000-000300010005": "C"}'::jsonb,
    5, 1,
    20, false,
    '2026-09-14 07:15+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000075', '00000000-0000-4000-e000-000000000033', '00000000-0000-4000-c000-000003000001',
    3, '{"00000000-0000-4000-d000-000300010001": "C", "00000000-0000-4000-d000-000300010002": "B", "00000000-0000-4000-d000-000300010003": "A", "00000000-0000-4000-d000-000300010004": "B", "00000000-0000-4000-d000-000300010005": "D"}'::jsonb,
    5, 1,
    20, false,
    '2026-09-15 07:51+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000076', '00000000-0000-4000-e000-000000000034', '00000000-0000-4000-c000-000003000001',
    1, '{"00000000-0000-4000-d000-000300010001": "D", "00000000-0000-4000-d000-000300010002": "B", "00000000-0000-4000-d000-000300010003": "B", "00000000-0000-4000-d000-000300010004": "A", "00000000-0000-4000-d000-000300010005": "D"}'::jsonb,
    5, 4,
    80, true,
    '2026-09-27 15:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000077', '00000000-0000-4000-e000-000000000034', '00000000-0000-4000-c000-000003000002',
    1, '{"00000000-0000-4000-d000-000300020001": "A", "00000000-0000-4000-d000-000300020002": "C", "00000000-0000-4000-d000-000300020003": "C", "00000000-0000-4000-d000-000300020004": "C", "00000000-0000-4000-d000-000300020005": "C"}'::jsonb,
    5, 4,
    80, true,
    '2026-09-30 19:07+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000078', '00000000-0000-4000-e000-000000000034', '00000000-0000-4000-c000-000003000003',
    1, '{"00000000-0000-4000-d000-000300030001": "D", "00000000-0000-4000-d000-000300030002": "B", "00000000-0000-4000-d000-000300030003": "D", "00000000-0000-4000-d000-000300030004": "B", "00000000-0000-4000-d000-000300030005": "C"}'::jsonb,
    5, 5,
    100, true,
    '2026-10-04 02:04+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000079', '00000000-0000-4000-e000-000000000035', '00000000-0000-4000-c000-000003000001',
    1, '{"00000000-0000-4000-d000-000300010001": "D", "00000000-0000-4000-d000-000300010002": "A", "00000000-0000-4000-d000-000300010003": "A", "00000000-0000-4000-d000-000300010004": "A", "00000000-0000-4000-d000-000300010005": "D"}'::jsonb,
    5, 2,
    40, false,
    '2026-10-02 15:09+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000080', '00000000-0000-4000-e000-000000000035', '00000000-0000-4000-c000-000003000001',
    2, '{"00000000-0000-4000-d000-000300010001": "D", "00000000-0000-4000-d000-000300010002": "B", "00000000-0000-4000-d000-000300010003": "B", "00000000-0000-4000-d000-000300010004": "A", "00000000-0000-4000-d000-000300010005": "C"}'::jsonb,
    5, 4,
    80, true,
    '2026-10-02 17:59+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000081', '00000000-0000-4000-e000-000000000035', '00000000-0000-4000-c000-000003000002',
    1, '{"00000000-0000-4000-d000-000300020001": "A", "00000000-0000-4000-d000-000300020002": "C", "00000000-0000-4000-d000-000300020003": "C", "00000000-0000-4000-d000-000300020004": "D", "00000000-0000-4000-d000-000300020005": "C"}'::jsonb,
    5, 5,
    100, true,
    '2026-10-05 19:25+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000082', '00000000-0000-4000-e000-000000000035', '00000000-0000-4000-c000-000003000003',
    1, '{"00000000-0000-4000-d000-000300030001": "D", "00000000-0000-4000-d000-000300030002": "B", "00000000-0000-4000-d000-000300030003": "A", "00000000-0000-4000-d000-000300030004": "B", "00000000-0000-4000-d000-000300030005": "C"}'::jsonb,
    5, 4,
    80, true,
    '2026-10-06 19:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000083', '00000000-0000-4000-e000-000000000038', '00000000-0000-4000-c000-000003000001',
    1, '{"00000000-0000-4000-d000-000300010001": "D", "00000000-0000-4000-d000-000300010002": "C", "00000000-0000-4000-d000-000300010003": "B", "00000000-0000-4000-d000-000300010004": "A", "00000000-0000-4000-d000-000300010005": "A"}'::jsonb,
    5, 4,
    80, true,
    '2026-09-05 03:11+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000084', '00000000-0000-4000-e000-000000000038', '00000000-0000-4000-c000-000003000002',
    1, '{"00000000-0000-4000-d000-000300020001": "D", "00000000-0000-4000-d000-000300020002": "C", "00000000-0000-4000-d000-000300020003": "D", "00000000-0000-4000-d000-000300020004": "C", "00000000-0000-4000-d000-000300020005": "C"}'::jsonb,
    5, 2,
    40, false,
    '2026-09-10 02:59+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000085', '00000000-0000-4000-e000-000000000038', '00000000-0000-4000-c000-000003000002',
    2, '{"00000000-0000-4000-d000-000300020001": "A", "00000000-0000-4000-d000-000300020002": "C", "00000000-0000-4000-d000-000300020003": "C", "00000000-0000-4000-d000-000300020004": "D", "00000000-0000-4000-d000-000300020005": "D"}'::jsonb,
    5, 4,
    80, true,
    '2026-09-10 14:24+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000086', '00000000-0000-4000-e000-000000000038', '00000000-0000-4000-c000-000003000003',
    1, '{"00000000-0000-4000-d000-000300030001": "D", "00000000-0000-4000-d000-000300030002": "B", "00000000-0000-4000-d000-000300030003": "D", "00000000-0000-4000-d000-000300030004": "D", "00000000-0000-4000-d000-000300030005": "C"}'::jsonb,
    5, 4,
    80, true,
    '2026-09-17 01:09+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000087', '00000000-0000-4000-e000-000000000039', '00000000-0000-4000-c000-000003000001',
    1, '{"00000000-0000-4000-d000-000300010001": "D", "00000000-0000-4000-d000-000300010002": "B", "00000000-0000-4000-d000-000300010003": "B", "00000000-0000-4000-d000-000300010004": "A", "00000000-0000-4000-d000-000300010005": "A"}'::jsonb,
    5, 5,
    100, true,
    '2026-09-11 08:52+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000088', '00000000-0000-4000-e000-000000000039', '00000000-0000-4000-c000-000003000002',
    1, '{"00000000-0000-4000-d000-000300020001": "A", "00000000-0000-4000-d000-000300020002": "C", "00000000-0000-4000-d000-000300020003": "C", "00000000-0000-4000-d000-000300020004": "D", "00000000-0000-4000-d000-000300020005": "C"}'::jsonb,
    5, 5,
    100, true,
    '2026-09-16 02:20+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000089', '00000000-0000-4000-e000-000000000039', '00000000-0000-4000-c000-000003000003',
    1, '{"00000000-0000-4000-d000-000300030001": "A", "00000000-0000-4000-d000-000300030002": "B", "00000000-0000-4000-d000-000300030003": "D", "00000000-0000-4000-d000-000300030004": "B", "00000000-0000-4000-d000-000300030005": "B"}'::jsonb,
    5, 3,
    60, false,
    '2026-09-17 05:48+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000090', '00000000-0000-4000-e000-000000000039', '00000000-0000-4000-c000-000003000003',
    2, '{"00000000-0000-4000-d000-000300030001": "D", "00000000-0000-4000-d000-000300030002": "C", "00000000-0000-4000-d000-000300030003": "D", "00000000-0000-4000-d000-000300030004": "B", "00000000-0000-4000-d000-000300030005": "C"}'::jsonb,
    5, 4,
    80, true,
    '2026-09-17 19:20+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000091', '00000000-0000-4000-e000-000000000044', '00000000-0000-4000-c000-000004000001',
    1, '{"00000000-0000-4000-d000-000400010001": "C", "00000000-0000-4000-d000-000400010002": "B", "00000000-0000-4000-d000-000400010003": "A", "00000000-0000-4000-d000-000400010004": "C"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-13 23:15+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000092', '00000000-0000-4000-e000-000000000044', '00000000-0000-4000-c000-000004000002',
    1, '{"00000000-0000-4000-d000-000400020001": "A", "00000000-0000-4000-d000-000400020002": "B", "00000000-0000-4000-d000-000400020003": "B", "00000000-0000-4000-d000-000400020004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-18 11:49+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000093', '00000000-0000-4000-e000-000000000046', '00000000-0000-4000-c000-000004000001',
    1, '{"00000000-0000-4000-d000-000400010001": "A", "00000000-0000-4000-d000-000400010002": "B", "00000000-0000-4000-d000-000400010003": "A", "00000000-0000-4000-d000-000400010004": "B"}'::jsonb,
    4, 2,
    50, false,
    '2026-09-09 11:06+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000094', '00000000-0000-4000-e000-000000000046', '00000000-0000-4000-c000-000004000001',
    2, '{"00000000-0000-4000-d000-000400010001": "B", "00000000-0000-4000-d000-000400010002": "B", "00000000-0000-4000-d000-000400010003": "A", "00000000-0000-4000-d000-000400010004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-10 05:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000095', '00000000-0000-4000-e000-000000000047', '00000000-0000-4000-c000-000004000001',
    1, '{"00000000-0000-4000-d000-000400010001": "A", "00000000-0000-4000-d000-000400010002": "D", "00000000-0000-4000-d000-000400010003": "C", "00000000-0000-4000-d000-000400010004": "D"}'::jsonb,
    4, 0,
    0, false,
    '2026-10-08 15:48+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000096', '00000000-0000-4000-e000-000000000047', '00000000-0000-4000-c000-000004000001',
    2, '{"00000000-0000-4000-d000-000400010001": "A", "00000000-0000-4000-d000-000400010002": "B", "00000000-0000-4000-d000-000400010003": "A", "00000000-0000-4000-d000-000400010004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-08 17:57+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000097', '00000000-0000-4000-e000-000000000047', '00000000-0000-4000-c000-000004000002',
    1, '{"00000000-0000-4000-d000-000400020001": "A", "00000000-0000-4000-d000-000400020002": "B", "00000000-0000-4000-d000-000400020003": "B", "00000000-0000-4000-d000-000400020004": "B"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-13 03:29+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000098', '00000000-0000-4000-e000-000000000048', '00000000-0000-4000-c000-000004000001',
    1, '{"00000000-0000-4000-d000-000400010001": "C", "00000000-0000-4000-d000-000400010002": "B", "00000000-0000-4000-d000-000400010003": "A", "00000000-0000-4000-d000-000400010004": "B"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-04 02:32+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000099', '00000000-0000-4000-e000-000000000048', '00000000-0000-4000-c000-000004000002',
    1, '{"00000000-0000-4000-d000-000400020001": "A", "00000000-0000-4000-d000-000400020002": "A", "00000000-0000-4000-d000-000400020003": "B", "00000000-0000-4000-d000-000400020004": "B"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-08 01:24+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000100', '00000000-0000-4000-e000-000000000048', '00000000-0000-4000-c000-000004000003',
    1, '{"00000000-0000-4000-d000-000400030001": "C", "00000000-0000-4000-d000-000400030002": "B", "00000000-0000-4000-d000-000400030003": "C", "00000000-0000-4000-d000-000400030004": "A"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-11 10:14+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000101', '00000000-0000-4000-e000-000000000051', '00000000-0000-4000-c000-000004000001',
    1, '{"00000000-0000-4000-d000-000400010001": "C", "00000000-0000-4000-d000-000400010002": "A", "00000000-0000-4000-d000-000400010003": "A", "00000000-0000-4000-d000-000400010004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-04 03:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000102', '00000000-0000-4000-e000-000000000051', '00000000-0000-4000-c000-000004000002',
    1, '{"00000000-0000-4000-d000-000400020001": "A", "00000000-0000-4000-d000-000400020002": "B", "00000000-0000-4000-d000-000400020003": "B", "00000000-0000-4000-d000-000400020004": "B"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-06 15:05+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000103', '00000000-0000-4000-e000-000000000051', '00000000-0000-4000-c000-000004000003',
    1, '{"00000000-0000-4000-d000-000400030001": "C", "00000000-0000-4000-d000-000400030002": "D", "00000000-0000-4000-d000-000400030003": "C", "00000000-0000-4000-d000-000400030004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-12 17:33+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000104', '00000000-0000-4000-e000-000000000054', '00000000-0000-4000-c000-000005000001',
    1, '{"00000000-0000-4000-d000-000500010001": "A", "00000000-0000-4000-d000-000500010002": "D", "00000000-0000-4000-d000-000500010003": "D", "00000000-0000-4000-d000-000500010004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-04 15:46+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000105', '00000000-0000-4000-e000-000000000054', '00000000-0000-4000-c000-000005000002',
    1, '{"00000000-0000-4000-d000-000500020001": "C", "00000000-0000-4000-d000-000500020002": "D", "00000000-0000-4000-d000-000500020003": "A", "00000000-0000-4000-d000-000500020004": "D"}'::jsonb,
    4, 2,
    50, false,
    '2026-09-07 22:11+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000106', '00000000-0000-4000-e000-000000000054', '00000000-0000-4000-c000-000005000002',
    2, '{"00000000-0000-4000-d000-000500020001": "B", "00000000-0000-4000-d000-000500020002": "C", "00000000-0000-4000-d000-000500020003": "A", "00000000-0000-4000-d000-000500020004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-08 05:04+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000107', '00000000-0000-4000-e000-000000000055', '00000000-0000-4000-c000-000005000001',
    1, '{"00000000-0000-4000-d000-000500010001": "A", "00000000-0000-4000-d000-000500010002": "D", "00000000-0000-4000-d000-000500010003": "A", "00000000-0000-4000-d000-000500010004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-01 10:33+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000108', '00000000-0000-4000-e000-000000000055', '00000000-0000-4000-c000-000005000002',
    1, '{"00000000-0000-4000-d000-000500020001": "B", "00000000-0000-4000-d000-000500020002": "C", "00000000-0000-4000-d000-000500020003": "A", "00000000-0000-4000-d000-000500020004": "B"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-04 13:17+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000109', '00000000-0000-4000-e000-000000000056', '00000000-0000-4000-c000-000005000001',
    1, '{"00000000-0000-4000-d000-000500010001": "B", "00000000-0000-4000-d000-000500010002": "C", "00000000-0000-4000-d000-000500010003": "A", "00000000-0000-4000-d000-000500010004": "A"}'::jsonb,
    4, 0,
    0, false,
    '2026-09-27 19:09+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000110', '00000000-0000-4000-e000-000000000056', '00000000-0000-4000-c000-000005000001',
    2, '{"00000000-0000-4000-d000-000500010001": "A", "00000000-0000-4000-d000-000500010002": "D", "00000000-0000-4000-d000-000500010003": "B", "00000000-0000-4000-d000-000500010004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-28 17:17+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000111', '00000000-0000-4000-e000-000000000056', '00000000-0000-4000-c000-000005000002',
    1, '{"00000000-0000-4000-d000-000500020001": "B", "00000000-0000-4000-d000-000500020002": "B", "00000000-0000-4000-d000-000500020003": "D", "00000000-0000-4000-d000-000500020004": "D"}'::jsonb,
    4, 2,
    50, false,
    '2026-10-04 22:02+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000112', '00000000-0000-4000-e000-000000000056', '00000000-0000-4000-c000-000005000002',
    2, '{"00000000-0000-4000-d000-000500020001": "B", "00000000-0000-4000-d000-000500020002": "C", "00000000-0000-4000-d000-000500020003": "D", "00000000-0000-4000-d000-000500020004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-10-05 02:34+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000113', '00000000-0000-4000-e000-000000000057', '00000000-0000-4000-c000-000005000001',
    1, '{"00000000-0000-4000-d000-000500010001": "A", "00000000-0000-4000-d000-000500010002": "D", "00000000-0000-4000-d000-000500010003": "C", "00000000-0000-4000-d000-000500010004": "B"}'::jsonb,
    4, 2,
    50, false,
    '2026-09-26 13:38+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000114', '00000000-0000-4000-e000-000000000057', '00000000-0000-4000-c000-000005000001',
    2, '{"00000000-0000-4000-d000-000500010001": "A", "00000000-0000-4000-d000-000500010002": "D", "00000000-0000-4000-d000-000500010003": "C", "00000000-0000-4000-d000-000500010004": "B"}'::jsonb,
    4, 2,
    50, false,
    '2026-09-26 21:47+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000115', '00000000-0000-4000-e000-000000000057', '00000000-0000-4000-c000-000005000001',
    3, '{"00000000-0000-4000-d000-000500010001": "A", "00000000-0000-4000-d000-000500010002": "D", "00000000-0000-4000-d000-000500010003": "D", "00000000-0000-4000-d000-000500010004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-09-27 02:14+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000116', '00000000-0000-4000-e000-000000000057', '00000000-0000-4000-c000-000005000002',
    1, '{"00000000-0000-4000-d000-000500020001": "B", "00000000-0000-4000-d000-000500020002": "C", "00000000-0000-4000-d000-000500020003": "A", "00000000-0000-4000-d000-000500020004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-10-03 20:47+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000117', '00000000-0000-4000-e000-000000000058', '00000000-0000-4000-c000-000005000001',
    1, '{"00000000-0000-4000-d000-000500010001": "A", "00000000-0000-4000-d000-000500010002": "B", "00000000-0000-4000-d000-000500010003": "D", "00000000-0000-4000-d000-000500010004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-07 01:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000118', '00000000-0000-4000-e000-000000000058', '00000000-0000-4000-c000-000005000002',
    1, '{"00000000-0000-4000-d000-000500020001": "D", "00000000-0000-4000-d000-000500020002": "A", "00000000-0000-4000-d000-000500020003": "C", "00000000-0000-4000-d000-000500020004": "C"}'::jsonb,
    4, 0,
    0, false,
    '2026-09-10 12:04+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000119', '00000000-0000-4000-e000-000000000058', '00000000-0000-4000-c000-000005000002',
    2, '{"00000000-0000-4000-d000-000500020001": "B", "00000000-0000-4000-d000-000500020002": "C", "00000000-0000-4000-d000-000500020003": "A", "00000000-0000-4000-d000-000500020004": "B"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-11 09:47+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000120', '00000000-0000-4000-e000-000000000059', '00000000-0000-4000-c000-000005000001',
    1, '{"00000000-0000-4000-d000-000500010001": "A", "00000000-0000-4000-d000-000500010002": "B", "00000000-0000-4000-d000-000500010003": "D", "00000000-0000-4000-d000-000500010004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-08-25 15:58+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000121', '00000000-0000-4000-e000-000000000059', '00000000-0000-4000-c000-000005000002',
    1, '{"00000000-0000-4000-d000-000500020001": "B", "00000000-0000-4000-d000-000500020002": "C", "00000000-0000-4000-d000-000500020003": "A", "00000000-0000-4000-d000-000500020004": "D"}'::jsonb,
    4, 4,
    100, true,
    '2026-08-26 14:44+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000122', '00000000-0000-4000-e000-000000000061', '00000000-0000-4000-c000-000005000001',
    1, '{"00000000-0000-4000-d000-000500010001": "A", "00000000-0000-4000-d000-000500010002": "B", "00000000-0000-4000-d000-000500010003": "C", "00000000-0000-4000-d000-000500010004": "D"}'::jsonb,
    4, 2,
    50, false,
    '2026-09-16 21:32+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000123', '00000000-0000-4000-e000-000000000061', '00000000-0000-4000-c000-000005000001',
    2, '{"00000000-0000-4000-d000-000500010001": "A", "00000000-0000-4000-d000-000500010002": "D", "00000000-0000-4000-d000-000500010003": "D", "00000000-0000-4000-d000-000500010004": "C"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-17 08:05+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.percobaan_kuis (
    id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada
) VALUES (
    '00000000-0000-4000-9000-000000000124', '00000000-0000-4000-e000-000000000061', '00000000-0000-4000-c000-000005000002',
    1, '{"00000000-0000-4000-d000-000500020001": "B", "00000000-0000-4000-d000-000500020002": "C", "00000000-0000-4000-d000-000500020003": "C", "00000000-0000-4000-d000-000500020004": "D"}'::jsonb,
    4, 3,
    75, true,
    '2026-09-23 17:35+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. SEED SERTIFIKAT (PA-2026-0001 s/d PA-2026-0025)
-- ------------------------------------------------------------------------------
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-e000-000000000059', 2026,
    1, 'PA-2026-0001',
    'Andika Saputra', 'Fotografi Produk dengan Ponsel',
    '2026-08-26 14:44+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-e000-000000000009', 2026,
    2, 'PA-2026-0002',
    'Hendra Gunawan', 'Excel untuk Administrasi Perkantoran',
    '2026-08-30 06:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-e000-000000000016', 2026,
    3, 'PA-2026-0003',
    'Hendra Gunawan', 'Desain Konten Media Sosial dengan Canva',
    '2026-09-02 21:17+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000004', '00000000-0000-4000-e000-000000000002', 2026,
    4, 'PA-2026-0004',
    'Fajar Nugroho', 'Excel untuk Administrasi Perkantoran',
    '2026-09-03 07:10+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-e000-000000000022', 2026,
    5, 'PA-2026-0005',
    'Rina Oktaviani', 'Desain Konten Media Sosial dengan Canva',
    '2026-09-05 23:54+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-e000-000000000020', 2026,
    6, 'PA-2026-0006',
    'Rangga Wijaya', 'Desain Konten Media Sosial dengan Canva',
    '2026-09-06 02:50+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000007', '00000000-0000-4000-e000-000000000054', 2026,
    7, 'PA-2026-0007',
    'Kevin Tanoto', 'Fotografi Produk dengan Ponsel',
    '2026-09-08 05:04+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000008', '00000000-0000-4000-e000-000000000028', 2026,
    8, 'PA-2026-0008',
    'Citra Maharani', 'Desain Konten Media Sosial dengan Canva',
    '2026-09-11 07:16+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000009', '00000000-0000-4000-e000-000000000058', 2026,
    9, 'PA-2026-0009',
    'Rina Oktaviani', 'Fotografi Produk dengan Ponsel',
    '2026-09-11 09:47+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-e000-000000000038', 2026,
    10, 'PA-2026-0010',
    'Kevin Tanoto', 'Bahasa Inggris untuk Percakapan Kerja',
    '2026-09-17 01:09+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-e000-000000000039', 2026,
    11, 'PA-2026-0011',
    'Sari Rahmawati', 'Bahasa Inggris untuk Percakapan Kerja',
    '2026-09-17 19:20+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000012', '00000000-0000-4000-e000-000000000008', 2026,
    12, 'PA-2026-0012',
    'Bima Aditya', 'Excel untuk Administrasi Perkantoran',
    '2026-09-18 00:38+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000013', '00000000-0000-4000-e000-000000000061', 2026,
    13, 'PA-2026-0013',
    'Ayu Kartika', 'Fotografi Produk dengan Ponsel',
    '2026-09-23 17:35+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000014', '00000000-0000-4000-e000-000000000012', 2026,
    14, 'PA-2026-0014',
    'Kevin Tanoto', 'Excel untuk Administrasi Perkantoran',
    '2026-09-26 17:15+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000015', '00000000-0000-4000-e000-000000000057', 2026,
    15, 'PA-2026-0015',
    'Rangga Wijaya', 'Fotografi Produk dengan Ponsel',
    '2026-10-03 20:47+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000016', '00000000-0000-4000-e000-000000000034', 2026,
    16, 'PA-2026-0016',
    'Dewi Lestari', 'Bahasa Inggris untuk Percakapan Kerja',
    '2026-10-04 02:04+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000017', '00000000-0000-4000-e000-000000000004', 2026,
    17, 'PA-2026-0017',
    'Rangga Wijaya', 'Excel untuk Administrasi Perkantoran',
    '2026-10-04 06:31+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000018', '00000000-0000-4000-e000-000000000055', 2026,
    18, 'PA-2026-0018',
    'Melati Anggraini', 'Fotografi Produk dengan Ponsel',
    '2026-10-04 13:17+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000019', '00000000-0000-4000-e000-000000000056', 2026,
    19, 'PA-2026-0019',
    'Nadia Putri', 'Fotografi Produk dengan Ponsel',
    '2026-10-05 02:34+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000020', '00000000-0000-4000-e000-000000000035', 2026,
    20, 'PA-2026-0020',
    'Arif Budiman', 'Bahasa Inggris untuk Percakapan Kerja',
    '2026-10-06 19:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000021', '00000000-0000-4000-e000-000000000005', 2026,
    21, 'PA-2026-0021',
    'Dodi Kurniawan', 'Excel untuk Administrasi Perkantoran',
    '2026-10-06 19:30+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000022', '00000000-0000-4000-e000-000000000032', 2026,
    22, 'PA-2026-0022',
    'Dewi Lestari', 'Desain Konten Media Sosial dengan Canva',
    '2026-10-08 02:11+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000023', '00000000-0000-4000-e000-000000000025', 2026,
    23, 'PA-2026-0023',
    'Melati Anggraini', 'Desain Konten Media Sosial dengan Canva',
    '2026-10-11 02:58+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000024', '00000000-0000-4000-e000-000000000048', 2026,
    24, 'PA-2026-0024',
    'Eka Safitri', 'Dasar Pembukuan untuk UMKM',
    '2026-10-11 10:14+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sertifikat (
    id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada
) VALUES (
    '00000000-0000-4000-8000-000000000025', '00000000-0000-4000-e000-000000000051', 2026,
    25, 'PA-2026-0025',
    'Zaki Maulana', 'Dasar Pembukuan untuk UMKM',
    '2026-10-12 17:33+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 10. SEED AUDIT LOG (APPEND-ONLY)
-- ------------------------------------------------------------------------------
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    1, '00000000-0000-4000-a000-000000000001', 'ubah_peran_akun',
    'profiles', '00000000-0000-4000-a000-000000000011', '{"peran": "peserta"}'::jsonb,
    '{"peran": "instruktur"}'::jsonb, '2026-08-02 09:05+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    2, '00000000-0000-4000-a000-000000000001', 'ubah_peran_akun',
    'profiles', '00000000-0000-4000-a000-000000000012', '{"peran": "peserta"}'::jsonb,
    '{"peran": "instruktur"}'::jsonb, '2026-08-02 09:25+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    3, '00000000-0000-4000-a000-000000000001', 'ubah_peran_akun',
    'profiles', '00000000-0000-4000-a000-000000000013', '{"peran": "peserta"}'::jsonb,
    '{"peran": "instruktur"}'::jsonb, '2026-08-02 10:05+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    4, '00000000-0000-4000-a000-000000000012', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000005', '{"status": "draf"}'::jsonb,
    '{"status": "ditinjau"}'::jsonb, '2026-08-10 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    5, '00000000-0000-4000-a000-000000000013', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000003', '{"status": "draf"}'::jsonb,
    '{"status": "ditinjau"}'::jsonb, '2026-08-11 10:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    6, '00000000-0000-4000-a000-000000000012', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000002', '{"status": "draf"}'::jsonb,
    '{"status": "ditinjau"}'::jsonb, '2026-08-11 16:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    7, '00000000-0000-4000-a000-000000000011', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000001', '{"status": "draf"}'::jsonb,
    '{"status": "ditinjau"}'::jsonb, '2026-08-12 14:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    8, '00000000-0000-4000-a000-000000000001', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000003', '{"status": "ditinjau"}'::jsonb,
    '{"status": "draf", "catatan_tinjauan": "Tambahkan contoh percakapan di modul 3"}'::jsonb, '2026-08-12 15:20+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    9, '00000000-0000-4000-a000-000000000013', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000003', '{"status": "draf"}'::jsonb,
    '{"status": "ditinjau"}'::jsonb, '2026-08-14 10:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    10, '00000000-0000-4000-a000-000000000001', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000001', '{"status": "ditinjau"}'::jsonb,
    '{"status": "terbit"}'::jsonb, '2026-08-17 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    11, '00000000-0000-4000-a000-000000000002', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000002', '{"status": "ditinjau"}'::jsonb,
    '{"status": "terbit"}'::jsonb, '2026-08-17 09:30+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    12, '00000000-0000-4000-a000-000000000001', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000005', '{"status": "ditinjau"}'::jsonb,
    '{"status": "terbit"}'::jsonb, '2026-08-17 10:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    13, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000011', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-08-19 00:24+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    14, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000002', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-08-20 04:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    15, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000009', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-08-22 01:59+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    16, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000059', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-08-22 11:10+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    17, '00000000-0000-4000-a000-000000000002', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000003', '{"status": "ditinjau"}'::jsonb,
    '{"status": "terbit"}'::jsonb, '2026-08-24 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    18, '00000000-0000-4000-a000-000000000011', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000004', '{"status": "draf"}'::jsonb,
    '{"status": "ditinjau"}'::jsonb, '2026-08-26 15:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    19, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000038', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-08-31 07:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    20, '00000000-0000-4000-a000-000000000002', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000004', '{"status": "ditinjau"}'::jsonb,
    '{"status": "terbit"}'::jsonb, '2026-08-31 09:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    21, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000058', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-08-31 11:33+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    22, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000054', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-02 12:55+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    23, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000040', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-03 02:21+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    24, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000060', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-05 03:33+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    25, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000043', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-05 20:02+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    26, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000040', '{"status": "aktif"}'::jsonb,
    '{"status": "dibatalkan", "alasan_batal": "Peserta pindah tugas ke luar kota dan meminta pembatalan"}'::jsonb, '2026-09-06 09:56+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    27, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000044', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-07 17:37+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    28, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000033', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-08 04:08+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    29, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000008', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-09 21:27+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    30, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000061', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-10 07:55+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    31, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000039', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-10 13:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    32, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000037', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-11 19:55+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    33, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000012', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-13 11:43+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    34, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000052', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-15 16:37+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    35, '00000000-0000-4000-a000-000000000116', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000041', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "dibatalkan", "alasan_batal": null}'::jsonb, '2026-09-15 23:12+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    36, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000007', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-17 13:49+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    37, '00000000-0000-4000-a000-000000000001', 'ubah_harga_kuota',
    'kursus', '00000000-0000-4000-b000-000000000004', '{"kuota": 10}'::jsonb,
    '{"kuota": 12}'::jsonb, '2026-09-20 10:15+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    38, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000034', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-21 05:28+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    39, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000006', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-22 12:26+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    40, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000001', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-22 15:06+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    41, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000056', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-24 04:32+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    42, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000057', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-24 23:58+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    43, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000049', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-25 01:23+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    44, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000036', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-26 17:04+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    45, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000035', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-26 20:22+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    46, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000055', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-27 02:43+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    47, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000010', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-27 09:41+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    48, '00000000-0000-4000-a000-000000000001', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000048', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-28 16:55+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    49, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000005', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-09-29 14:07+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    50, '00000000-0000-4000-a000-000000000001', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000005', '{"status": "terbit"}'::jsonb,
    '{"status": "ditutup"}'::jsonb, '2026-10-01 17:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    51, '00000000-0000-4000-a000-000000000002', 'ubah_status_pendaftaran',
    'pendaftaran', '00000000-0000-4000-e000-000000000047', '{"status": "menunggu_bayar"}'::jsonb,
    '{"status": "aktif"}'::jsonb, '2026-10-05 01:52+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (
    id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada
) VALUES (
    52, '00000000-0000-4000-a000-000000000013', 'ubah_status_kursus',
    'kursus', '00000000-0000-4000-b000-000000000006', '{"status": "draf"}'::jsonb,
    '{"status": "ditinjau"}'::jsonb, '2026-10-12 16:00+07:00'::timestamptz
) ON CONFLICT (id) DO NOTHING;

COMMIT;
