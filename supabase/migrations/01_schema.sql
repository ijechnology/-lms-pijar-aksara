-- ==============================================================================
-- 01_schema.sql
-- LMS Lembaga Kursus Pijar Aksara
-- Skema Database Relasional, Enum, Aturan Integritas, dan Indeks
-- ==============================================================================

-- 1. ENUMS
CREATE TYPE public.peran_pengguna AS ENUM ('peserta', 'instruktur', 'admin');
CREATE TYPE public.status_kursus AS ENUM ('draf', 'ditinjau', 'terbit', 'ditutup');
CREATE TYPE public.status_pendaftaran AS ENUM ('menunggu_bayar', 'aktif', 'selesai', 'kedaluwarsa', 'dibatalkan');
CREATE TYPE public.metode_pembayaran AS ENUM ('gratis', 'transfer_manual', 'mayar');

-- 2. TABEL: profiles
-- Terhubung 1-ke-1 dengan auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama_lengkap TEXT NOT NULL CHECK (char_length(nama_lengkap) BETWEEN 3 AND 100),
    email TEXT NOT NULL UNIQUE,
    no_hp TEXT CHECK (no_hp IS NULL OR no_hp ~ '^08[0-9]{8,11}$'),
    peran public.peran_pengguna NOT NULL DEFAULT 'peserta',
    aktif BOOLEAN NOT NULL DEFAULT true,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABEL: kursus
CREATE TABLE public.kursus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instruktur_id UUID NOT NULL REFERENCES public.profiles(id),
    judul TEXT NOT NULL CHECK (char_length(judul) BETWEEN 5 AND 120),
    slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    kategori TEXT NOT NULL,
    ringkasan TEXT NOT NULL CHECK (char_length(ringkasan) <= 200),
    deskripsi TEXT NOT NULL,
    harga INTEGER NOT NULL CHECK (harga = 0 OR (harga >= 50000 AND harga <= 5000000)),
    kuota INTEGER NOT NULL CHECK (kuota >= 1 AND kuota <= 100),
    nilai_lulus SMALLINT NOT NULL DEFAULT 70 CHECK (nilai_lulus >= 50 AND nilai_lulus <= 100),
    status public.status_kursus NOT NULL DEFAULT 'draf',
    catatan_tinjauan TEXT,
    diajukan_pada TIMESTAMPTZ,
    diterbitkan_pada TIMESTAMPTZ,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    diubah_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABEL: modul
CREATE TABLE public.modul (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kursus_id UUID NOT NULL REFERENCES public.kursus(id) ON DELETE CASCADE,
    urutan SMALLINT NOT NULL CHECK (urutan >= 1 AND urutan <= 10),
    judul TEXT NOT NULL,
    isi_materi TEXT NOT NULL,
    video_url TEXT CHECK (video_url IS NULL OR video_url ~ '^https?://'),
    lampiran_path TEXT,
    durasi_menit SMALLINT NOT NULL CHECK (durasi_menit >= 5 AND durasi_menit <= 240),
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_modul_kursus_urutan UNIQUE (kursus_id, urutan)
);

-- 5. TABEL: soal
CREATE TABLE public.soal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modul_id UUID NOT NULL REFERENCES public.modul(id) ON DELETE CASCADE,
    urutan SMALLINT NOT NULL CHECK (urutan >= 1 AND urutan <= 20),
    pertanyaan TEXT NOT NULL,
    pilihan_a TEXT NOT NULL,
    pilihan_b TEXT NOT NULL,
    pilihan_c TEXT NOT NULL,
    pilihan_d TEXT NOT NULL,
    kunci_jawaban CHAR(1) NOT NULL CHECK (kunci_jawaban IN ('A', 'B', 'C', 'D')),
    CONSTRAINT uq_soal_modul_urutan UNIQUE (modul_id, urutan)
);

-- 6. TABEL: pendaftaran
CREATE TABLE public.pendaftaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kursus_id UUID NOT NULL REFERENCES public.kursus(id),
    peserta_id UUID NOT NULL REFERENCES public.profiles(id),
    status public.status_pendaftaran NOT NULL DEFAULT 'menunggu_bayar',
    nominal INTEGER NOT NULL CHECK (nominal >= 0),
    metode_bayar public.metode_pembayaran NOT NULL,
    batas_bayar TIMESTAMPTZ,
    mayar_invoice_id TEXT UNIQUE,
    dibayar_pada TIMESTAMPTZ,
    dikonfirmasi_oleh UUID REFERENCES public.profiles(id),
    alasan_batal TEXT,
    didaftarkan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    selesai_pada TIMESTAMPTZ,
    dibatalkan_pada TIMESTAMPTZ
);

-- Aturan INV-02: Satu peserta hanya boleh memiliki 1 pendaftaran aktif/berlaku per kursus
CREATE UNIQUE INDEX uq_pendaftaran_berlaku ON public.pendaftaran (kursus_id, peserta_id)
WHERE (status IN ('menunggu_bayar', 'aktif', 'selesai'));

-- 7. TABEL: progres_modul
CREATE TABLE public.progres_modul (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pendaftaran_id UUID NOT NULL REFERENCES public.pendaftaran(id) ON DELETE CASCADE,
    modul_id UUID NOT NULL REFERENCES public.modul(id),
    materi_dibaca_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lulus_pada TIMESTAMPTZ,
    CONSTRAINT uq_progres_pendaftaran_modul UNIQUE (pendaftaran_id, modul_id),
    CONSTRAINT chk_lulus_setelah_baca CHECK (lulus_pada IS NULL OR lulus_pada >= materi_dibaca_pada)
);

-- 8. TABEL: percobaan_kuis
CREATE TABLE public.percobaan_kuis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pendaftaran_id UUID NOT NULL REFERENCES public.pendaftaran(id) ON DELETE CASCADE,
    modul_id UUID NOT NULL REFERENCES public.modul(id),
    nomor_percobaan SMALLINT NOT NULL CHECK (nomor_percobaan >= 1 AND nomor_percobaan <= 3),
    jawaban JSONB NOT NULL,
    jumlah_soal SMALLINT NOT NULL CHECK (jumlah_soal > 0),
    jumlah_benar SMALLINT NOT NULL CHECK (jumlah_benar >= 0 AND jumlah_benar <= jumlah_soal),
    nilai SMALLINT NOT NULL CHECK (nilai >= 0 AND nilai <= 100),
    lulus BOOLEAN NOT NULL,
    dikerjakan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_percobaan_nomor UNIQUE (pendaftaran_id, modul_id, nomor_percobaan)
);

-- 9. TABEL: sertifikat
CREATE TABLE public.sertifikat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pendaftaran_id UUID NOT NULL UNIQUE REFERENCES public.pendaftaran(id),
    tahun SMALLINT NOT NULL,
    nomor_urut INTEGER NOT NULL CHECK (nomor_urut > 0),
    nomor_sertifikat TEXT NOT NULL UNIQUE,
    nama_peserta TEXT NOT NULL,
    judul_kursus TEXT NOT NULL,
    diterbitkan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sertifikat_tahun_nomor UNIQUE (tahun, nomor_urut)
);

-- 10. TABEL: audit_log (Append-Only)
CREATE TABLE public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    pelaku_id UUID REFERENCES public.profiles(id),
    aksi TEXT NOT NULL,
    nama_tabel TEXT NOT NULL,
    id_data UUID,
    data_sebelum JSONB,
    data_sesudah JSONB,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEKS PERFORMA & PENCARIAN
CREATE INDEX idx_kursus_status_kategori ON public.kursus (status, kategori);
CREATE INDEX idx_kursus_slug ON public.kursus (slug);
CREATE INDEX idx_kursus_instruktur ON public.kursus (instruktur_id);
CREATE INDEX idx_modul_kursus ON public.modul (kursus_id, urutan);
CREATE INDEX idx_soal_modul ON public.soal (modul_id, urutan);
CREATE INDEX idx_pendaftaran_peserta ON public.pendaftaran (peserta_id, status);
CREATE INDEX idx_pendaftaran_kursus ON public.pendaftaran (kursus_id, status);
CREATE INDEX idx_progres_pendaftaran ON public.progres_modul (pendaftaran_id);
CREATE INDEX idx_percobaan_pendaftaran_modul ON public.percobaan_kuis (pendaftaran_id, modul_id);
CREATE INDEX idx_audit_log_nama_tabel ON public.audit_log (nama_tabel, dibuat_pada DESC);

-- TRIGGER UNTUK UPDATE OTOMATIS diubah_pada
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.diubah_pada = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kursus_updated_at
BEFORE UPDATE ON public.kursus
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TRIGGER UNTUK SINKRONISASI OTOMATIS USER BARU auth.users -> profiles
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
        NEW.email,
        NEW.raw_user_meta_data->>'no_hp',
        COALESCE((NEW.raw_user_meta_data->>'peran')::public.peran_pengguna, 'peserta'),
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
