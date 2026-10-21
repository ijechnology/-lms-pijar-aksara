-- ==============================================================================
-- 02_rls.sql
-- LMS Lembaga Kursus Pijar Aksara
-- Kebijakan Row Level Security (RLS) untuk 9 Tabel
-- ==============================================================================

-- 1. AKTIFKAN RLS PADA SELURUH 9 TABEL
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kursus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pendaftaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progres_modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.percobaan_kuis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sertifikat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 2. HELPER FUNCTIONS UNTUK ROLE
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT peran::text FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND peran = 'admin' AND aktif = true
    );
$$;

-- ==============================================================================
-- KEBIJAKAN TABEL profiles
-- ==============================================================================
-- SELECT:
-- 1. Pengguna dapat melihat profil mereka sendiri
-- 2. Profil instruktur dapat dilihat publik untuk identitas di katalog
-- 3. Admin dapat melihat seluruh profil
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
    id = auth.uid()
    OR peran = 'instruktur'
    OR public.is_admin()
);

-- UPDATE:
-- 1. Pengguna dapat memperbarui nama & no_hp sendiri (tidak boleh ubah peran atau status aktif)
-- 2. Admin dapat memperbarui profil apapun, KECUALI admin dilarang menurunkan peran atau menonaktifkan akun sendiri (BR-12)
CREATE POLICY "profiles_update_self" ON public.profiles
FOR UPDATE USING (
    id = auth.uid()
) WITH CHECK (
    id = auth.uid()
    AND peran = (SELECT p.peran FROM public.profiles p WHERE p.id = auth.uid())
    AND aktif = (SELECT p.aktif FROM public.profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "profiles_update_admin" ON public.profiles
FOR UPDATE USING (
    public.is_admin()
) WITH CHECK (
    public.is_admin()
    -- Cegah admin menurunkan peran atau menonaktifkan akun sendiri (BR-12)
    AND NOT (id = auth.uid() AND (peran != 'admin' OR aktif = false))
);

-- ==============================================================================
-- KEBIJAKAN TABEL kursus
-- ==============================================================================
-- SELECT:
-- 1. Kursus terbit dapat dilihat oleh semua orang (termasuk anonim)
-- 2. Instruktur dapat melihat kursus miliknya sendiri (semua status)
-- 3. Admin dapat melihat semua kursus
CREATE POLICY "kursus_select_public" ON public.kursus
FOR SELECT USING (
    status = 'terbit'
    OR (auth.uid() IS NOT NULL AND instruktur_id = auth.uid())
    OR public.is_admin()
);

-- INSERT:
-- Hanya instruktur untuk kursus miliknya, atau admin
CREATE POLICY "kursus_insert" ON public.kursus
FOR INSERT WITH CHECK (
    (public.get_auth_role() = 'instruktur' AND instruktur_id = auth.uid())
    OR public.is_admin()
);

-- UPDATE:
-- 1. Instruktur hanya dapat mengubah kursus miliknya jika status saat ini 'draf' (INV-03, BR-04)
-- 2. Admin dapat mengubah kursus (moderasi, kuota, harga)
CREATE POLICY "kursus_update_instruktur" ON public.kursus
FOR UPDATE USING (
    instruktur_id = auth.uid() AND status = 'draf'
) WITH CHECK (
    instruktur_id = auth.uid()
);

CREATE POLICY "kursus_update_admin" ON public.kursus
FOR UPDATE USING (
    public.is_admin()
) WITH CHECK (
    public.is_admin()
);

-- DELETE:
CREATE POLICY "kursus_delete" ON public.kursus
FOR DELETE USING (
    (instruktur_id = auth.uid() AND status = 'draf')
    OR public.is_admin()
);

-- ==============================================================================
-- KEBIJAKAN TABEL modul
-- ==============================================================================
-- SELECT:
-- 1. Modul kursus terbit dapat dilihat oleh publik/peserta (untuk silabus)
-- 2. Instruktur dapat melihat modul kursus miliknya
-- 3. Admin dapat melihat seluruh modul
CREATE POLICY "modul_select" ON public.modul
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.kursus k WHERE k.id = modul.kursus_id AND k.status = 'terbit')
    OR EXISTS (SELECT 1 FROM public.kursus k WHERE k.id = modul.kursus_id AND k.instruktur_id = auth.uid())
    OR public.is_admin()
);

-- INSERT / UPDATE / DELETE:
-- Kurikulum terkunci mutlak saat status kursus bukan 'draf' (INV-03, BR-04)
CREATE POLICY "modul_modify" ON public.modul
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.kursus k
        WHERE k.id = modul.kursus_id
        AND k.status = 'draf'
        AND (k.instruktur_id = auth.uid() OR public.is_admin())
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.kursus k
        WHERE k.id = modul.kursus_id
        AND k.status = 'draf'
        AND (k.instruktur_id = auth.uid() OR public.is_admin())
    )
);

-- ==============================================================================
-- KEBIJAKAN TABEL soal (INV-05: Isolasi Kunci Jawaban)
-- ==============================================================================
-- Peserta TIDAK MEMILIKI akses SELECT langsung pada tabel soal demi menjaga kerahasiaan kunci jawaban.
-- Peserta mengambil soal kuis tanpa kolom kunci_jawaban lewat fungsi database RPC get_soal_kuis().
CREATE POLICY "soal_select" ON public.soal
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.modul m
        JOIN public.kursus k ON k.id = m.kursus_id
        WHERE m.id = soal.modul_id
        AND (k.instruktur_id = auth.uid() OR public.is_admin())
    )
);

-- INSERT / UPDATE / DELETE:
-- Terkunci mutlak saat status kursus bukan 'draf' (INV-03, BR-04)
CREATE POLICY "soal_modify" ON public.soal
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.modul m
        JOIN public.kursus k ON k.id = m.kursus_id
        WHERE m.id = soal.modul_id
        AND k.status = 'draf'
        AND (k.instruktur_id = auth.uid() OR public.is_admin())
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.modul m
        JOIN public.kursus k ON k.id = m.kursus_id
        WHERE m.id = soal.modul_id
        AND k.status = 'draf'
        AND (k.instruktur_id = auth.uid() OR public.is_admin())
    )
);

-- ==============================================================================
-- KEBIJAKAN TABEL pendaftaran
-- ==============================================================================
-- SELECT:
-- 1. Peserta melihat pendaftarannya sendiri
-- 2. Instruktur melihat pendaftaran pada kursus miliknya (BR-12)
-- 3. Admin melihat semua pendaftaran
CREATE POLICY "pendaftaran_select" ON public.pendaftaran
FOR SELECT USING (
    peserta_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.kursus k
        WHERE k.id = pendaftaran.kursus_id AND k.instruktur_id = auth.uid()
    )
    OR public.is_admin()
);

-- INSERT:
-- Dilakukan oleh peserta yang login
CREATE POLICY "pendaftaran_insert" ON public.pendaftaran
FOR INSERT WITH CHECK (
    peserta_id = auth.uid() AND public.get_auth_role() = 'peserta'
);

-- UPDATE:
-- 1. Peserta hanya boleh membatalkan pendaftaran yang belum dibayar (status 'menunggu_bayar' -> 'dibatalkan')
-- 2. Admin dapat mengupdate status pendaftaran (konfirmasi bayar, batalkan pendaftaran aktif dengan alasan)
CREATE POLICY "pendaftaran_update_peserta" ON public.pendaftaran
FOR UPDATE USING (
    peserta_id = auth.uid() AND status = 'menunggu_bayar'
) WITH CHECK (
    peserta_id = auth.uid() AND status = 'dibatalkan'
);

CREATE POLICY "pendaftaran_update_admin" ON public.pendaftaran
FOR UPDATE USING (
    public.is_admin()
) WITH CHECK (
    public.is_admin()
);

-- ==============================================================================
-- KEBIJAKAN TABEL progres_modul
-- ==============================================================================
CREATE POLICY "progres_select" ON public.progres_modul
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pendaftaran p
        WHERE p.id = progres_modul.pendaftaran_id AND p.peserta_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.pendaftaran p
        JOIN public.kursus k ON k.id = p.kursus_id
        WHERE p.id = progres_modul.pendaftaran_id AND k.instruktur_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY "progres_insert_update" ON public.progres_modul
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.pendaftaran p
        WHERE p.id = progres_modul.pendaftaran_id
        AND p.peserta_id = auth.uid()
        AND p.status IN ('aktif', 'selesai')
    )
    OR public.is_admin()
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.pendaftaran p
        WHERE p.id = progres_modul.pendaftaran_id
        AND p.peserta_id = auth.uid()
        AND p.status IN ('aktif', 'selesai')
    )
    OR public.is_admin()
);

-- ==============================================================================
-- KEBIJAKAN TABEL percobaan_kuis
-- ==============================================================================
CREATE POLICY "percobaan_select" ON public.percobaan_kuis
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pendaftaran p
        WHERE p.id = percobaan_kuis.pendaftaran_id AND p.peserta_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.pendaftaran p
        JOIN public.kursus k ON k.id = p.kursus_id
        WHERE p.id = percobaan_kuis.pendaftaran_id AND k.instruktur_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY "percobaan_insert" ON public.percobaan_kuis
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.pendaftaran p
        WHERE p.id = percobaan_kuis.pendaftaran_id
        AND p.peserta_id = auth.uid()
        AND p.status IN ('aktif', 'selesai')
    )
    OR public.is_admin()
);

-- ==============================================================================
-- KEBIJAKAN TABEL sertifikat
-- ==============================================================================
CREATE POLICY "sertifikat_select" ON public.sertifikat
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pendaftaran p
        WHERE p.id = sertifikat.pendaftaran_id AND p.peserta_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY "sertifikat_modify_admin" ON public.sertifikat
FOR ALL USING (
    public.is_admin()
) WITH CHECK (
    public.is_admin()
);

-- ==============================================================================
-- KEBIJAKAN TABEL audit_log (INV-07: Append-Only)
-- ==============================================================================
-- Hanya admin yang dapat membaca catatan audit log
CREATE POLICY "audit_log_select_admin" ON public.audit_log
FOR SELECT USING (
    public.is_admin()
);

-- Siapapun yang terautentikasi dapat menambahkan baris log aktivitas
CREATE POLICY "audit_log_insert" ON public.audit_log
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
);

-- TIDAK ADA KEBIJAKAN UPDATE ATAU DELETE (Append-Only Mutlak)
