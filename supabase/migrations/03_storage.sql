-- ==============================================================================
-- 03_storage.sql
-- LMS Lembaga Kursus Pijar Aksara
-- Konfigurasi Supabase Storage Privat untuk Lampiran Modul PDF
-- ==============================================================================

-- 1. PEMBUATAN BUCKET PRIVAT: modul-lampiran
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'modul-lampiran',
    'modul-lampiran',
    false, -- Private bucket: direct public link dilarang
    10485760, -- 10 MB batas ukuran berkas (PRD Bagian 10)
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf'];

-- 2. KEBIJAKAN STORAGE: SELECT / DOWNLOAD (Signed URL 60 Menit)
-- Hanya diizinkan bagi:
-- a. Admin
-- b. Instruktur pemilik kursus terkait
-- c. Peserta dengan pendaftaran aktif atau selesai pada kursus bersangkutan
CREATE POLICY "modul_lampiran_select_policy"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'modul-lampiran'
    AND (
        -- Admin selalu diizinkan
        public.is_admin()
        -- Instruktur pemilik kursus (kursus_id di folder pertama: <kursus_id>/filename.pdf)
        OR EXISTS (
            SELECT 1 FROM public.kursus k
            WHERE k.id::text = (storage.foldername(name))[1]
            AND k.instruktur_id = auth.uid()
        )
        -- Peserta dengan pendaftaran aktif atau selesai
        OR EXISTS (
            SELECT 1 FROM public.pendaftaran p
            WHERE p.kursus_id::text = (storage.foldername(name))[1]
            AND p.peserta_id = auth.uid()
            AND p.status IN ('aktif', 'selesai')
        )
        -- Fallback jika path tersimpan di kolom lampiran_path modul
        OR EXISTS (
            SELECT 1 FROM public.modul m
            JOIN public.pendaftaran p ON p.kursus_id = m.kursus_id
            WHERE m.lampiran_path = name
            AND p.peserta_id = auth.uid()
            AND p.status IN ('aktif', 'selesai')
        )
    )
);

-- 3. KEBIJAKAN STORAGE: INSERT / UPLOAD
-- Hanya instruktur saat kursus berstatus 'draf' atau admin
CREATE POLICY "modul_lampiran_insert_policy"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'modul-lampiran'
    AND (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.kursus k
            WHERE k.id::text = (storage.foldername(name))[1]
            AND k.instruktur_id = auth.uid()
            AND k.status = 'draf'
        )
    )
);

-- 4. KEBIJAKAN STORAGE: UPDATE & DELETE
-- Hanya instruktur saat kursus berstatus 'draf' atau admin
CREATE POLICY "modul_lampiran_update_policy"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'modul-lampiran'
    AND (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.kursus k
            WHERE k.id::text = (storage.foldername(name))[1]
            AND k.instruktur_id = auth.uid()
            AND k.status = 'draf'
        )
    )
);

CREATE POLICY "modul_lampiran_delete_policy"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'modul-lampiran'
    AND (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.kursus k
            WHERE k.id::text = (storage.foldername(name))[1]
            AND k.instruktur_id = auth.uid()
            AND k.status = 'draf'
        )
    )
);
