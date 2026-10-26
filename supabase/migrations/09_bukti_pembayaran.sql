-- ==============================================================================
-- 09_bukti_pembayaran.sql
-- LMS Lembaga Kursus Pijar Aksara
-- Kolom Unggah Bukti Pembayaran Peserta & Storage Bucket
-- ==============================================================================

-- 1. Tambah kolom bukti bayar ke tabel pendaftaran
ALTER TABLE public.pendaftaran 
ADD COLUMN IF NOT EXISTS bukti_bayar_url TEXT,
ADD COLUMN IF NOT EXISTS bukti_bayar_pada TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS catatan_pembayaran TEXT;

-- 2. Buat bucket storage bukti-pembayaran jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'bukti-pembayaran',
    'bukti-pembayaran',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];

-- 3. Kebijakan Storage untuk bukti-pembayaran:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'bukti_pembayaran_upload_policy' AND tablename = 'objects'
    ) THEN
        CREATE POLICY "bukti_pembayaran_upload_policy"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'bukti-pembayaran');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'bukti_pembayaran_select_policy' AND tablename = 'objects'
    ) THEN
        CREATE POLICY "bukti_pembayaran_select_policy"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'bukti-pembayaran');
    END IF;
END $$;

-- 4. Perbarui RLS policy tabel pendaftaran agar peserta dapat mengunggah bukti bayar
DROP POLICY IF EXISTS "pendaftaran_update_peserta" ON public.pendaftaran;

CREATE POLICY "pendaftaran_update_peserta" ON public.pendaftaran
FOR UPDATE USING (
    peserta_id = auth.uid() AND status = 'menunggu_bayar'::public.status_pendaftaran
) WITH CHECK (
    peserta_id = auth.uid() AND status IN ('menunggu_bayar'::public.status_pendaftaran, 'dibatalkan'::public.status_pendaftaran)
);

-- 5. Fungsi RPC unggah_bukti_pembayaran (Atomic & Aman)
CREATE OR REPLACE FUNCTION public.unggah_bukti_pembayaran(
    p_pendaftaran_id UUID,
    p_bukti_bayar_url TEXT,
    p_catatan TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_pendaftaran RECORD;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Pengguna belum terautentikasi.';
    END IF;

    SELECT * INTO v_pendaftaran
    FROM public.pendaftaran
    WHERE id = p_pendaftaran_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pendaftaran tidak ditemukan.';
    END IF;

    IF v_pendaftaran.peserta_id != v_user_id AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Anda tidak memiliki hak akses pada pendaftaran ini.';
    END IF;

    IF v_pendaftaran.status != 'menunggu_bayar' THEN
        RAISE EXCEPTION 'Bukti pembayaran hanya dapat diunggah untuk pendaftaran yang berstatus menunggu pembayaran.';
    END IF;

    UPDATE public.pendaftaran
    SET
        bukti_bayar_url = p_bukti_bayar_url,
        bukti_bayar_pada = NOW(),
        catatan_pembayaran = NULLIF(TRIM(p_catatan), '')
    WHERE id = p_pendaftaran_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Bukti pembayaran berhasil disimpan.'
    );
END;
$$;
