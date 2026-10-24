-- Migrasi: Penambahan kolom status pengiriman notifikasi pengingat batas bayar
ALTER TABLE public.pendaftaran 
ADD COLUMN IF NOT EXISTS notifikasi_pengingat_terkirim BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.pendaftaran.notifikasi_pengingat_terkirim IS 'Menandai apakah email pengingat sisa batas bayar 3 jam sudah pernah dikirimkan ke peserta.';
