-- Migrasi 05: Perbaikan Kebijakan RLS untuk Akses Data Peserta & Sertifikat oleh Instruktur (BR-12)

CREATE OR REPLACE FUNCTION public.is_instruktur_of_user(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.pendaftaran p
    JOIN public.kursus k ON k.id = p.kursus_id
    WHERE p.peserta_id = target_user_id
      AND k.instruktur_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
TO public
USING (
  (id = auth.uid())
  OR (peran = 'instruktur'::peran_pengguna)
  OR is_admin()
  OR is_instruktur_of_user(id)
);

CREATE OR REPLACE FUNCTION public.is_instruktur_of_pendaftaran(target_pendaftaran_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pendaftaran p
    JOIN public.kursus k ON k.id = p.kursus_id
    WHERE p.id = target_pendaftaran_id
      AND k.instruktur_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "sertifikat_select" ON public.sertifikat;

CREATE POLICY "sertifikat_select" ON public.sertifikat
FOR SELECT
TO public
USING (
  (EXISTS (
    SELECT 1 FROM public.pendaftaran p
    WHERE p.id = sertifikat.pendaftaran_id
      AND p.peserta_id = auth.uid()
  ))
  OR is_instruktur_of_pendaftaran(pendaftaran_id)
  OR is_admin()
);
