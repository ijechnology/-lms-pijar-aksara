-- 08_analisis_modul_lulus_pertama.sql
-- RPC untuk Dasbor Analitik Admin: Analisis Modul dengan Tingkat Lulus Percobaan Pertama Terendah

CREATE OR REPLACE FUNCTION public.get_analisis_modul_lulus_pertama()
RETURNS TABLE (
    modul_id UUID,
    modul_judul TEXT,
    modul_urutan SMALLINT,
    kursus_id UUID,
    kursus_judul TEXT,
    instruktur_nama TEXT,
    total_percobaan_pertama BIGINT,
    total_lulus_pertama BIGINT,
    persen_lulus INTEGER,
    rata_rata_nilai NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        m.id AS modul_id,
        m.judul::TEXT AS modul_judul,
        m.urutan AS modul_urutan,
        k.id AS kursus_id,
        k.judul::TEXT AS kursus_judul,
        COALESCE(p.nama_lengkap, 'Instruktur')::TEXT AS instruktur_nama,
        COUNT(pk.id) AS total_percobaan_pertama,
        COUNT(pk.id) FILTER (WHERE pk.lulus = true) AS total_lulus_pertama,
        ROUND((COUNT(pk.id) FILTER (WHERE pk.lulus = true)::numeric / NULLIF(COUNT(pk.id), 0)::numeric) * 100)::INTEGER AS persen_lulus,
        ROUND(AVG(pk.nilai), 1) AS rata_rata_nilai
    FROM public.percobaan_kuis pk
    JOIN public.modul m ON m.id = pk.modul_id
    JOIN public.kursus k ON k.id = m.kursus_id
    LEFT JOIN public.profiles p ON p.id = k.instruktur_id
    WHERE pk.nomor_percobaan = 1
    GROUP BY m.id, m.judul, m.urutan, k.id, k.judul, p.nama_lengkap
    HAVING COUNT(pk.id) > 0
    ORDER BY persen_lulus ASC, total_percobaan_pertama DESC;
$$;
