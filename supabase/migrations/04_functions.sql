-- ==============================================================================
-- 04_functions.sql
-- LMS Lembaga Kursus Pijar Aksara
-- Database Functions Atomik (Stored Procedures SECURITY DEFINER)
-- Menjamin Invariant Kuota Kursi, Kuis Anti-Bocor, dan Sertifikat Unik
-- ==============================================================================

-- ==============================================================================
-- 1. FUNGSI: daftar_kursus
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.daftar_kursus(
    p_kursus_id UUID,
    p_metode_bayar TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_user_peran public.peran_pengguna;
    v_user_aktif BOOLEAN;
    v_kursus RECORD;
    v_kursi_terpakai INTEGER;
    v_ada_pendaftaran BOOLEAN;
    v_status public.status_pendaftaran;
    v_nominal INTEGER;
    v_batas_bayar TIMESTAMPTZ;
    v_pendaftaran_id UUID;
    v_metode public.metode_pembayaran;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: Pengguna belum terautentikasi.';
    END IF;

    -- Validasi profil pemanggil: wajib peran peserta dan akun aktif
    SELECT peran, aktif INTO v_user_peran, v_user_aktif
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_user_peran IS NULL OR v_user_peran != 'peserta' THEN
        RAISE EXCEPTION 'Hanya pengguna dengan peran Peserta yang dapat mendaftar kursus.';
    END IF;

    IF NOT v_user_aktif THEN
        RAISE EXCEPTION 'Akun Anda sedang dinonaktifkan. Silakan hubungi admin.';
    END IF;

    -- Validasi enum metode pembayaran
    BEGIN
        v_metode := p_metode_bayar::public.metode_pembayaran;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Metode pembayaran tidak valid.';
    END;

    -- Mengunci baris kursus secara atomik (FOR UPDATE)
    SELECT * INTO v_kursus
    FROM public.kursus
    WHERE id = p_kursus_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kursus tidak ditemukan.';
    END IF;

    IF v_kursus.status != 'terbit' THEN
        RAISE EXCEPTION 'Kursus tidak sedang dibuka untuk pendaftaran publik.';
    END IF;

    -- Validasi kecocokan metode bayar dan harga
    IF v_kursus.harga = 0 AND v_metode != 'gratis' THEN
        RAISE EXCEPTION 'Kursus gratis harus menggunakan metode pembayaran gratis.';
    END IF;

    IF v_kursus.harga > 0 AND v_metode = 'gratis' THEN
        RAISE EXCEPTION 'Kursus berbayar tidak dapat menggunakan metode pembayaran gratis.';
    END IF;

    -- Otomatis tandai kedaluwarsa jika ada pendaftaran menunggu_bayar yang telah melewati batas bayar (BR-05, BR-07)
    UPDATE public.pendaftaran
    SET status = 'kedaluwarsa'
    WHERE kursus_id = p_kursus_id
      AND peserta_id = v_user_id
      AND status = 'menunggu_bayar'
      AND batas_bayar IS NOT NULL
      AND batas_bayar <= NOW();

    -- Validasi INV-02 & BR-05: Satu peserta hanya boleh memiliki 1 pendaftaran yang sedang berlaku
    -- Pendaftaran berlaku = status 'aktif', 'selesai', atau 'menunggu_bayar' dengan batas_bayar > NOW()
    SELECT EXISTS (
        SELECT 1 FROM public.pendaftaran
        WHERE kursus_id = p_kursus_id
          AND peserta_id = v_user_id
          AND (
            status IN ('aktif', 'selesai')
            OR (status = 'menunggu_bayar' AND (batas_bayar IS NULL OR batas_bayar > NOW()))
          )
    ) INTO v_ada_pendaftaran;

    IF v_ada_pendaftaran THEN
        RAISE EXCEPTION 'Anda sudah memiliki pendaftaran yang sedang berlaku pada kursus ini.';
    END IF;

    -- Hitung kursi terpakai secara atomik (BR-06)
    SELECT COUNT(*) INTO v_kursi_terpakai
    FROM public.pendaftaran
    WHERE kursus_id = p_kursus_id
      AND (
        status IN ('aktif', 'selesai')
        OR (status = 'menunggu_bayar' AND batas_bayar > NOW())
      );

    IF v_kursi_terpakai >= v_kursus.kuota THEN
        RAISE EXCEPTION 'Pendaftaran gagal: kuota kursus sudah penuh.';
    END IF;

    -- Tentukan status dan batas bayar sesuai harga kursus
    IF v_kursus.harga = 0 THEN
        v_status := 'aktif';
        v_nominal := 0;
        v_batas_bayar := NULL;
    ELSE
        v_status := 'menunggu_bayar';
        v_nominal := v_kursus.harga;
        v_batas_bayar := NOW() + INTERVAL '24 hours';
    END IF;

    -- Masukkan baris pendaftaran
    INSERT INTO public.pendaftaran (
        kursus_id,
        peserta_id,
        status,
        nominal,
        metode_bayar,
        batas_bayar,
        dibayar_pada
    )
    VALUES (
        p_kursus_id,
        v_user_id,
        v_status,
        v_nominal,
        v_metode,
        v_batas_bayar,
        CASE WHEN v_status = 'aktif' THEN NOW() ELSE NULL END
    )
    RETURNING id INTO v_pendaftaran_id;

    -- Catat ke audit log
    INSERT INTO public.audit_log (pelaku_id, aksi, nama_tabel, id_data, data_sesudah)
    VALUES (
        v_user_id,
        'daftar_kursus',
        'pendaftaran',
        v_pendaftaran_id,
        jsonb_build_object(
            'kursus_id', p_kursus_id,
            'status', v_status,
            'nominal', v_nominal,
            'metode_bayar', v_metode
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'pendaftaran_id', v_pendaftaran_id,
        'status', v_status,
        'nominal', v_nominal,
        'batas_bayar', v_batas_bayar
    );
END;
$$;

-- ==============================================================================
-- 2. FUNGSI: get_soal_kuis (INV-05: Isolasi Kunci Jawaban)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_soal_kuis(
    p_pendaftaran_id UUID,
    p_modul_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_pendaftaran RECORD;
    v_modul RECORD;
    v_soal_list JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: Pengguna belum terautentikasi.';
    END IF;

    -- Validasi pendaftaran milik pengguna
    SELECT * INTO v_pendaftaran
    FROM public.pendaftaran
    WHERE id = p_pendaftaran_id;

    IF NOT FOUND OR (v_pendaftaran.peserta_id != v_user_id AND NOT public.is_admin()) THEN
        RAISE EXCEPTION 'Pendaftaran tidak valid atau bukan milik Anda.';
    END IF;

    IF v_pendaftaran.status NOT IN ('aktif', 'selesai') THEN
        RAISE EXCEPTION 'Pendaftaran belum aktif.';
    END IF;

    -- Ambil soal tanpa kolom kunci_jawaban (MURNI RAHASIA)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', s.id,
            'urutan', s.urutan,
            'pertanyaan', s.pertanyaan,
            'pilihan_a', s.pilihan_a,
            'pilihan_b', s.pilihan_b,
            'pilihan_c', s.pilihan_c,
            'pilihan_d', s.pilihan_d
        ) ORDER BY s.urutan ASC
    ) INTO v_soal_list
    FROM public.soal s
    WHERE s.modul_id = p_modul_id;

    RETURN COALESCE(v_soal_list, '[]'::jsonb);
END;
$$;

-- ==============================================================================
-- 3. FUNGSI: kirim_jawaban_kuis (INV-04, INV-05, INV-06)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.kirim_jawaban_kuis(
    p_pendaftaran_id UUID,
    p_modul_id UUID,
    p_jawaban JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_pendaftaran RECORD;
    v_kursus RECORD;
    v_modul RECORD;
    v_progres RECORD;
    v_jumlah_percobaan INTEGER;
    v_nomor_percobaan SMALLINT;
    v_jumlah_soal INTEGER;
    v_jumlah_benar INTEGER := 0;
    v_soal RECORD;
    v_jawaban_peserta TEXT;
    v_nilai SMALLINT;
    v_lulus BOOLEAN;
    v_total_modul INTEGER;
    v_modul_lulus INTEGER;
    v_tahun SMALLINT;
    v_nomor_urut INTEGER;
    v_nomor_sertifikat TEXT;
    v_nama_peserta TEXT;
    v_judul_kursus TEXT;
    v_sertifikat_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: Pengguna belum terautentikasi.';
    END IF;

    -- 1. Mengunci baris pendaftaran (FOR UPDATE)
    SELECT * INTO v_pendaftaran
    FROM public.pendaftaran
    WHERE id = p_pendaftaran_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pendaftaran tidak ditemukan.';
    END IF;

    IF v_pendaftaran.peserta_id != v_user_id THEN
        RAISE EXCEPTION 'Akses ditolak: Pendaftaran ini bukan milik Anda.';
    END IF;

    IF v_pendaftaran.status NOT IN ('aktif', 'selesai') THEN
        RAISE EXCEPTION 'Pendaftaran belum berstatus aktif.';
    END IF;

    -- 2. Ambil informasi modul dan kursus
    SELECT * INTO v_modul
    FROM public.modul
    WHERE id = p_modul_id AND kursus_id = v_pendaftaran.kursus_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Modul tidak valid untuk kursus ini.';
    END IF;

    SELECT * INTO v_kursus
    FROM public.kursus
    WHERE id = v_pendaftaran.kursus_id;

    -- 3. Cek prasyarat urutan bertingkat (BR-08)
    IF v_modul.urutan > 1 THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.progres_modul pm
            JOIN public.modul prev_m ON prev_m.id = pm.modul_id
            WHERE pm.pendaftaran_id = p_pendaftaran_id
              AND prev_m.kursus_id = v_pendaftaran.kursus_id
              AND prev_m.urutan = v_modul.urutan - 1
              AND pm.lulus_pada IS NOT NULL
        ) THEN
            RAISE EXCEPTION 'Modul sebelumnya belum diselesaikan atau lulus.';
        END IF;
    END IF;

    -- 4. Cek apakah tombol "Tandai materi sudah dibaca" telah ditekan (BR-08)
    SELECT * INTO v_progres
    FROM public.progres_modul
    WHERE pendaftaran_id = p_pendaftaran_id AND modul_id = p_modul_id;

    IF NOT FOUND OR v_progres.materi_dibaca_pada IS NULL THEN
        RAISE EXCEPTION 'Kuis hanya dapat dikerjakan setelah Anda menekan tombol "Tandai materi sudah dibaca".';
    END IF;

    -- 5. Cek apakah modul sudah lulus (INV-04)
    IF v_progres.lulus_pada IS NOT NULL THEN
        RAISE EXCEPTION 'Modul ini sudah berstatus lulus dan tidak dapat diuji ulang.';
    END IF;

    -- 6. Cek kuota percobaan kuis (Maksimal 3x) (INV-04, BR-10)
    SELECT COUNT(*) INTO v_jumlah_percobaan
    FROM public.percobaan_kuis
    WHERE pendaftaran_id = p_pendaftaran_id AND modul_id = p_modul_id;

    IF v_jumlah_percobaan >= 3 THEN
        RAISE EXCEPTION 'Batas maksimal 3 kali percobaan kuis untuk modul ini telah habis.';
    END IF;

    v_nomor_percobaan := (v_jumlah_percobaan + 1)::smallint;

    -- 7. Evaluasi Jawaban secara Server-Side (INV-05, BR-09)
    SELECT COUNT(*) INTO v_jumlah_soal
    FROM public.soal
    WHERE modul_id = p_modul_id;

    IF v_jumlah_soal = 0 THEN
        RAISE EXCEPTION 'Soal kuis untuk modul ini belum tersedia.';
    END IF;

    -- Cocokkan setiap soal
    FOR v_soal IN
        SELECT id, kunci_jawaban FROM public.soal WHERE modul_id = p_modul_id
    LOOP
        v_jawaban_peserta := UPPER(TRIM(COALESCE(p_jawaban->>v_soal.id::text, '')));
        IF v_jawaban_peserta = '' THEN
            RAISE EXCEPTION 'Semua soal kuis wajib dijawab.';
        END IF;

        IF v_jawaban_peserta = v_soal.kunci_jawaban THEN
            v_jumlah_benar := v_jumlah_benar + 1;
        END IF;
    END LOOP;

    -- Nilai = FLOOR((jumlah_benar / jumlah_soal) * 100) (BR-09)
    v_nilai := FLOOR((v_jumlah_benar::numeric / v_jumlah_soal::numeric) * 100)::smallint;
    v_lulus := (v_nilai >= v_kursus.nilai_lulus);

    -- 8. Simpan ke percobaan_kuis
    INSERT INTO public.percobaan_kuis (
        pendaftaran_id,
        modul_id,
        nomor_percobaan,
        jawaban,
        jumlah_soal,
        jumlah_benar,
        nilai,
        lulus
    )
    VALUES (
        p_pendaftaran_id,
        p_modul_id,
        v_nomor_percobaan,
        p_jawaban,
        v_jumlah_soal::smallint,
        v_jumlah_benar::smallint,
        v_nilai,
        v_lulus
    );

    -- 9. Jika Lulus, perbarui progres_modul dan periksa kelulusan total kursus
    IF v_lulus THEN
        UPDATE public.progres_modul
        SET lulus_pada = NOW()
        WHERE pendaftaran_id = p_pendaftaran_id AND modul_id = p_modul_id;

        -- Hitung total modul vs modul lulus
        SELECT COUNT(*) INTO v_total_modul
        FROM public.modul
        WHERE kursus_id = v_pendaftaran.kursus_id;

        SELECT COUNT(*) INTO v_modul_lulus
        FROM public.progres_modul pm
        JOIN public.modul m ON m.id = pm.modul_id
        WHERE pm.pendaftaran_id = p_pendaftaran_id
          AND m.kursus_id = v_pendaftaran.kursus_id
          AND pm.lulus_pada IS NOT NULL;

        -- Jika SEMUA modul telah lulus -> TERBITKAN SERTIFIKAT (INV-06, BR-11)
        IF v_modul_lulus >= v_total_modul THEN
            UPDATE public.pendaftaran
            SET status = 'selesai',
                selesai_pada = NOW()
            WHERE id = p_pendaftaran_id;

            -- Hitung nomor urut sertifikat terurut per tahun tanpa lompatan (INV-06)
            v_tahun := EXTRACT(YEAR FROM NOW())::smallint;

            SELECT COALESCE(MAX(nomor_urut), 0) + 1 INTO v_nomor_urut
            FROM public.sertifikat
            WHERE tahun = v_tahun;

            v_nomor_sertifikat := 'PA-' || v_tahun::text || '-' || LPAD(v_nomor_urut::text, 4, '0');

            SELECT nama_lengkap INTO v_nama_peserta FROM public.profiles WHERE id = v_user_id;
            v_judul_kursus := v_kursus.judul;

            INSERT INTO public.sertifikat (
                pendaftaran_id,
                tahun,
                nomor_urut,
                nomor_sertifikat,
                nama_peserta,
                judul_kursus
            )
            VALUES (
                p_pendaftaran_id,
                v_tahun,
                v_nomor_urut,
                v_nomor_sertifikat,
                v_nama_peserta,
                v_judul_kursus
            )
            RETURNING id INTO v_sertifikat_id;

            -- Audit log kelulusan kursus & penerbitan sertifikat
            INSERT INTO public.audit_log (pelaku_id, aksi, nama_tabel, id_data, data_sesudah)
            VALUES (
                v_user_id,
                'terbitkan_sertifikat',
                'sertifikat',
                v_sertifikat_id,
                jsonb_build_object(
                    'pendaftaran_id', p_pendaftaran_id,
                    'nomor_sertifikat', v_nomor_sertifikat
                )
            );
        END IF;
    END IF;

    -- Return hasil evaluasi tanpa membocorkan kunci jawaban
    RETURN jsonb_build_object(
        'success', true,
        'nomor_percobaan', v_nomor_percobaan,
        'jumlah_soal', v_jumlah_soal,
        'jumlah_benar', v_jumlah_benar,
        'nilai', v_nilai,
        'nilai_lulus', v_kursus.nilai_lulus,
        'lulus', v_lulus,
        'sisa_percobaan', 3 - v_nomor_percobaan,
        'kursus_selesai', (v_modul_lulus >= v_total_modul),
        'nomor_sertifikat', v_nomor_sertifikat
    );
END;
$$;

-- ==============================================================================
-- 4. FUNGSI: ajukan_kursus (BR-03, BR-04)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.ajukan_kursus(
    p_kursus_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_kursus RECORD;
    v_jumlah_modul INTEGER;
    v_modul RECORD;
    v_expected_urutan INTEGER := 1;
    v_jumlah_soal INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: Pengguna belum terautentikasi.';
    END IF;

    -- Mengunci baris kursus
    SELECT * INTO v_kursus
    FROM public.kursus
    WHERE id = p_kursus_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kursus tidak ditemukan.';
    END IF;

    IF v_kursus.instruktur_id != v_user_id AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya instruktur pemilik yang dapat mengajukan kursus ini.';
    END IF;

    IF v_kursus.status != 'draf' THEN
        RAISE EXCEPTION 'Hanya kursus berstatus draf yang dapat diajukan untuk ditinjau.';
    END IF;

    -- Validasi BR-03:
    -- 1. Jumlah modul 2 sampai 10
    SELECT COUNT(*) INTO v_jumlah_modul
    FROM public.modul
    WHERE kursus_id = p_kursus_id;

    IF v_jumlah_modul < 2 OR v_jumlah_modul > 10 THEN
        RAISE EXCEPTION 'Pengajuan gagal: Kursus harus memiliki antara 2 sampai 10 modul (saat ini: %).', v_jumlah_modul;
    END IF;

    -- 2. Nomor urut modul 1, 2, 3 tanpa lompatan dan soal 3 sampai 20 per modul
    FOR v_modul IN
        SELECT id, urutan, judul FROM public.modul WHERE kursus_id = p_kursus_id ORDER BY urutan ASC
    LOOP
        IF v_modul.urutan != v_expected_urutan THEN
            RAISE EXCEPTION 'Pengajuan gagal: Urutan modul harus berurutan tanpa lompatan (ditemukan urutan %, diharapkan %).', v_modul.urutan, v_expected_urutan;
        END IF;

        SELECT COUNT(*) INTO v_jumlah_soal
        FROM public.soal
        WHERE modul_id = v_modul.id;

        IF v_jumlah_soal < 3 OR v_jumlah_soal > 20 THEN
            RAISE EXCEPTION 'Pengajuan gagal: Modul "%" harus memiliki antara 3 sampai 20 soal kuis (saat ini: % butir).', v_modul.judul, v_jumlah_soal;
        END IF;

        v_expected_urutan := v_expected_urutan + 1;
    END LOOP;

    -- Ubah status kursus menjadi ditinjau
    UPDATE public.kursus
    SET status = 'ditinjau',
        diajukan_pada = NOW(),
        catatan_tinjauan = NULL
    WHERE id = p_kursus_id;

    -- Catat ke audit log
    INSERT INTO public.audit_log (pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah)
    VALUES (
        v_user_id,
        'ajukan_kursus',
        'kursus',
        p_kursus_id,
        jsonb_build_object('status', 'draf'),
        jsonb_build_object('status', 'ditinjau')
    );

    RETURN jsonb_build_object(
        'success', true,
        'status', 'ditinjau',
        'pesan', 'Kursus berhasil diajukan untuk ditinjau oleh Admin.'
    );
END;
$$;

-- ==============================================================================
-- 5. FUNGSI: putuskan_tinjauan_kursus (BR-02)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.putuskan_tinjauan_kursus(
    p_kursus_id UUID,
    p_keputusan TEXT,
    p_catatan TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_kursus RECORD;
    v_status_baru public.status_kursus;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya admin yang berwenang memoderasi tinjauan kursus.';
    END IF;

    SELECT * INTO v_kursus
    FROM public.kursus
    WHERE id = p_kursus_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kursus tidak ditemukan.';
    END IF;

    IF v_kursus.status != 'ditinjau' THEN
        RAISE EXCEPTION 'Hanya kursus berstatus "ditinjau" yang dapat dimoderasi.';
    END IF;

    IF p_keputusan = 'terbit' THEN
        v_status_baru := 'terbit';
        UPDATE public.kursus
        SET status = 'terbit',
            diterbitkan_pada = NOW(),
            catatan_tinjauan = NULL
        WHERE id = p_kursus_id;

    ELSIF p_keputusan = 'draf' OR p_keputusan = 'tolak' THEN
        IF p_catatan IS NULL OR char_length(TRIM(p_catatan)) < 10 THEN
            RAISE EXCEPTION 'Pengembalian kursus ke draf wajib menyertakan alasan minimal 10 karakter.';
        END IF;

        v_status_baru := 'draf';
        UPDATE public.kursus
        SET status = 'draf',
            catatan_tinjauan = TRIM(p_catatan)
        WHERE id = p_kursus_id;

    ELSE
        RAISE EXCEPTION 'Keputusan tidak valid. Pilihan: "terbit", "draf", atau "tolak".';
    END IF;

    -- Catat ke audit log
    INSERT INTO public.audit_log (pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah)
    VALUES (
        v_user_id,
        'putuskan_tinjauan_kursus',
        'kursus',
        p_kursus_id,
        jsonb_build_object('status', 'ditinjau'),
        jsonb_build_object('status', v_status_baru, 'catatan', p_catatan)
    );

    RETURN jsonb_build_object(
        'success', true,
        'status', v_status_baru,
        'pesan', CASE WHEN v_status_baru = 'terbit' THEN 'Kursus berhasil diterbitkan ke katalog publik.' ELSE 'Kursus berhasil dikembalikan ke draf instruktur.' END
    );
END;
$$;

-- ==============================================================================
-- 6. FUNGSI: konfirmasi_pembayaran_manual (BR-07)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.konfirmasi_pembayaran_manual(
    p_pendaftaran_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_pendaftaran RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya admin yang berwenang mengonfirmasi pembayaran manual.';
    END IF;

    SELECT * INTO v_pendaftaran
    FROM public.pendaftaran
    WHERE id = p_pendaftaran_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pendaftaran tidak ditemukan.';
    END IF;

    IF v_pendaftaran.status != 'menunggu_bayar' THEN
        RAISE EXCEPTION 'Hanya pendaftaran berstatus "menunggu_bayar" yang dapat dikonfirmasi pembayarannya.';
    END IF;

    UPDATE public.pendaftaran
    SET status = 'aktif',
        dibayar_pada = NOW(),
        dikonfirmasi_oleh = v_user_id
    WHERE id = p_pendaftaran_id;

    -- Catat ke audit log
    INSERT INTO public.audit_log (pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah)
    VALUES (
        v_user_id,
        'konfirmasi_pembayaran_manual',
        'pendaftaran',
        p_pendaftaran_id,
        jsonb_build_object('status', 'menunggu_bayar'),
        jsonb_build_object('status', 'aktif', 'dikonfirmasi_oleh', v_user_id)
    );

    RETURN jsonb_build_object(
        'success', true,
        'status', 'aktif',
        'pesan', 'Pembayaran manual berhasil dikonfirmasi. Pendaftaran kini aktif.'
    );
END;
$$;
