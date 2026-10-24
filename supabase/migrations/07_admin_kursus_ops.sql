-- ==============================================================================
-- 07_admin_kursus_ops.sql
-- Operasi Admin: Ubah Kuota & Harga Kursus Terbit (BR-02, BR-06, BR-12)
-- Serta Moderasi Tutup/Buka Kembali Kursus dengan Audit Log
-- ==============================================================================

-- 1. FUNGSI: hitung_kursi_terpakai (BR-06)
CREATE OR REPLACE FUNCTION public.hitung_kursi_terpakai(p_kursus_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.pendaftaran
    WHERE kursus_id = p_kursus_id
      AND (
        status IN ('aktif', 'selesai')
        OR (status = 'menunggu_bayar' AND batas_bayar > NOW())
      );
$$;

-- 2. FUNGSI: ubah_kuota_harga_kursus (BR-02, BR-06, BR-12)
CREATE OR REPLACE FUNCTION public.ubah_kuota_harga_kursus(
    p_kursus_id UUID,
    p_kuota INTEGER,
    p_harga INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_kursus RECORD;
    v_kursi_terpakai INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya admin yang berwenang mengubah kuota dan harga kursus.';
    END IF;

    -- Validasi batasan kuota (BR-03: 1 s/d 100)
    IF p_kuota < 1 OR p_kuota > 100 THEN
        RAISE EXCEPTION 'Kuota kursus harus berada di antara 1 sampai 100 peserta.';
    END IF;

    -- Validasi batasan harga (BR-03: Rp0 atau Rp50.000 s/d Rp5.000.000)
    IF p_harga != 0 AND (p_harga < 50000 OR p_harga > 5000000) THEN
        RAISE EXCEPTION 'Harga kursus harus Rp0 (gratis) atau antara Rp50.000 sampai Rp5.000.000.';
    END IF;

    -- Kunci baris kursus
    SELECT * INTO v_kursus
    FROM public.kursus
    WHERE id = p_kursus_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kursus tidak ditemukan.';
    END IF;

    -- Hanya kursus terbit atau ditutup yang dapat diubah kuota & harganya oleh admin
    IF v_kursus.status NOT IN ('terbit', 'ditutup') THEN
        RAISE EXCEPTION 'Hanya kursus yang telah terbit atau ditutup yang dapat diubah kuota dan harganya.';
    END IF;

    -- Hitung kursi yang sedang terpakai saat ini (BR-06)
    SELECT public.hitung_kursi_terpakai(p_kursus_id) INTO v_kursi_terpakai;

    -- Validasi kuota baru tidak boleh lebih kecil dari kursi terpakai (BR-06)
    IF p_kuota < v_kursi_terpakai THEN
        RAISE EXCEPTION 'Validasi gagal (BR-06): Kuota baru (%) tidak boleh lebih kecil dari jumlah kursi yang sedang terpakai (%).', p_kuota, v_kursi_terpakai;
    END IF;

    -- Update kursus
    UPDATE public.kursus
    SET kuota = p_kuota,
        harga = p_harga
    WHERE id = p_kursus_id;

    -- Catat ke audit log (BR-12)
    INSERT INTO public.audit_log (pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah)
    VALUES (
        v_user_id,
        'ubah_kuota_harga',
        'kursus',
        p_kursus_id,
        jsonb_build_object('kuota', v_kursus.kuota, 'harga', v_kursus.harga),
        jsonb_build_object('kuota', p_kuota, 'harga', p_harga, 'kursi_terpakai', v_kursi_terpakai)
    );

    RETURN jsonb_build_object(
        'success', true,
        'kuota', p_kuota,
        'harga', p_harga,
        'kursi_terpakai', v_kursi_terpakai,
        'pesan', 'Kuota dan harga kursus berhasil diperbarui.'
    );
END;
$$;

-- 3. FUNGSI: ubah_status_kursus_admin (BR-02, BR-12)
CREATE OR REPLACE FUNCTION public.ubah_status_kursus_admin(
    p_kursus_id UUID,
    p_status_baru TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_kursus RECORD;
    v_status_enum public.status_kursus;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya admin yang berwenang menutup atau membuka kembali kursus.';
    END IF;

    IF p_status_baru NOT IN ('terbit', 'ditutup') THEN
        RAISE EXCEPTION 'Status baru tidak valid. Pilihan hanya "terbit" atau "ditutup".';
    END IF;

    v_status_enum := p_status_baru::public.status_kursus;

    SELECT * INTO v_kursus
    FROM public.kursus
    WHERE id = p_kursus_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kursus tidak ditemukan.';
    END IF;

    -- Aturan BR-02:
    -- terbit -> ditutup (Tutup Kursus)
    -- ditutup -> terbit (Buka Kembali Kursus)
    IF v_status_enum = 'ditutup' AND v_kursus.status != 'terbit' THEN
        RAISE EXCEPTION 'Hanya kursus berstatus terbit yang dapat ditutup.';
    END IF;

    IF v_status_enum = 'terbit' AND v_kursus.status != 'ditutup' THEN
        RAISE EXCEPTION 'Hanya kursus berstatus ditutup yang dapat dibuka kembali dengan fungsi ini.';
    END IF;

    UPDATE public.kursus
    SET status = v_status_enum
    WHERE id = p_kursus_id;

    -- Catat ke audit log (BR-12)
    INSERT INTO public.audit_log (pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah)
    VALUES (
        v_user_id,
        CASE WHEN v_status_enum = 'ditutup' THEN 'tutup_kursus' ELSE 'buka_kembali_kursus' END,
        'kursus',
        p_kursus_id,
        jsonb_build_object('status', v_kursus.status),
        jsonb_build_object('status', p_status_baru)
    );

    RETURN jsonb_build_object(
        'success', true,
        'status', p_status_baru,
        'pesan', CASE WHEN v_status_enum = 'ditutup' THEN 'Kursus berhasil ditutup.' ELSE 'Kursus berhasil dibuka kembali ke publik.' END
    );
END;
$$;
