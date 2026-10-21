# Entity Relationship Diagram (ERD) & Kamus Data
## Aplikasi LMS Lembaga Kursus Pijar Aksara

**Skema:** `public` (PostgreSQL Supabase)  
**Tipe Waktu:** `timestamptz` (Zona WIB UTC+7)  
**Mata Uang:** `integer` (Rupiah tanpa desimal)

---

## 1. Diagram Relasi Konseptual

```text
auth.users (Supabase Auth)
    │ (1 : 1)
    ▼
profiles ──────────────┬───────────────┬────────────────────────┐
    │ (1 : N)          │ (1 : N)       │ (1 : N)                │ (1 : N)
    ▼                  ▼               ▼                        ▼
 kursus           pendaftaran      audit_log (pelaku)   pendaftaran (admin konfirmasi)
    │ (1 : N)          │
    ▼                  ├──────────────────────┬──────────────────────┐
  modul                │ (1 : N)              │ (1 : N)              │ (1 : 1)
    │ (1 : N)          ▼                      ▼                      ▼
    ├───────────► progres_modul         percobaan_kuis           sertifikat
    │ (1 : N)
    ▼
  soal
```

---

## 2. Rincian Tabel dan Kolom

### 2.1. Tabel `profiles`
Profil setiap akun. Satu baris per akun di `auth.users`, dibuat otomatis saat akun mendaftar.
* `id` (`uuid`, PK, FK ke `auth.users.id` ON DELETE CASCADE)
* `nama_lengkap` (`text`, wajib, 3 s/d 100 karakter)
* `email` (`text`, wajib, unik)
* `no_hp` (`text`, opsional, format `08xxxxxxxxxx`)
* `peran` (`enum`: `'peserta'`, `'instruktur'`, `'admin'`; bawaan: `'peserta'`)
* `aktif` (`boolean`, bawaan: `true`)
* `dibuat_pada` (`timestamptz`, bawaan: `NOW()`)

### 2.2. Tabel `kursus`
Kursus yang ditawarkan lembaga. Dimiliki oleh satu instruktur.
* `id` (`uuid`, PK, bawaan: `gen_random_uuid()`)
* `instruktur_id` (`uuid`, FK ke `profiles.id`, wajib)
* `judul` (`text`, wajib, 5 s/d 120 karakter)
* `slug` (`text`, wajib, unik, format slug URL)
* `kategori` (`text`, wajib)
* `ringkasan` (`text`, wajib, maksimal 200 karakter)
* `deskripsi` (`text`, wajib)
* `harga` (`integer`, wajib, `0` atau `50000` s/d `5000000`)
* `kuota` (`integer`, wajib, `1` s/d `100`)
* `nilai_lulus` (`smallint`, wajib, `50` s/d `100`, bawaan: `70`)
* `status` (`enum`: `'draf'`, `'ditinjau'`, `'terbit'`, `'ditutup'`; bawaan: `'draf'`)
* `catatan_tinjauan` (`text`, opsional)
* `diajukan_pada` (`timestamptz`, opsional)
* `diterbitkan_pada` (`timestamptz`, opsional)
* `dibuat_pada` (`timestamptz`, bawaan: `NOW()`)
* `diubah_pada` (`timestamptz`, bawaan: `NOW()`)

### 2.3. Tabel `modul`
Bagian kurikulum kursus yang dipelajari bertahap.
* `id` (`uuid`, PK, bawaan: `gen_random_uuid()`)
* `kursus_id` (`uuid`, FK ke `kursus.id` ON DELETE CASCADE, wajib)
* `urutan` (`smallint`, wajib, `1` s/d `10`, unik per kursus)
* `judul` (`text`, wajib)
* `isi_materi` (`text`, wajib)
* `video_url` (`text`, opsional, URL https)
* `lampiran_path` (`text`, opsional, path file PDF di Storage privat)
* `durasi_menit` (`smallint`, wajib, `5` s/d `240`)
* `dibuat_pada` (`timestamptz`, bawaan: `NOW()`)

### 2.4. Tabel `soal`
Soal kuis pilihan ganda per modul.
* `id` (`uuid`, PK, bawaan: `gen_random_uuid()`)
* `modul_id` (`uuid`, FK ke `modul.id` ON DELETE CASCADE, wajib)
* `urutan` (`smallint`, wajib, `1` s/d `20`, unik per modul)
* `pertanyaan` (`text`, wajib)
* `pilihan_a` (`text`, wajib)
* `pilihan_b` (`text`, wajib)
* `pilihan_c` (`text`, wajib)
* `pilihan_d` (`text`, wajib)
* `kunci_jawaban` (`char(1)`, wajib, nilai: `'A'`, `'B'`, `'C'`, `'D'`; RAHASIA SERVER)

### 2.5. Tabel `pendaftaran`
Pendaftaran peserta ke kursus beserta pembayaran.
* `id` (`uuid`, PK, bawaan: `gen_random_uuid()`)
* `kursus_id` (`uuid`, FK ke `kursus.id`, wajib)
* `peserta_id` (`uuid`, FK ke `profiles.id`, wajib)
* `status` (`enum`: `'menunggu_bayar'`, `'aktif'`, `'selesai'`, `'kedaluwarsa'`, `'dibatalkan'`)
* `nominal` (`integer`, wajib, tidak boleh negatif)
* `metode_bayar` (`enum`: `'gratis'`, `'transfer_manual'`, `'mayar'`, wajib)
* `batas_bayar` (`timestamptz`, wajib jika kursus berbayar)
* `mayar_invoice_id` (`text`, unik, opsional)
* `dibayar_pada` (`timestamptz`, opsional)
* `dikonfirmasi_oleh` (`uuid`, FK ke `profiles.id`, opsional)
* `alasan_batal` (`text`, opsional, wajib $\ge 10$ char jika admin membatalkan pendaftaran aktif)
* `didaftarkan_pada` (`timestamptz`, bawaan: `NOW()`)
* `selesai_pada` (`timestamptz`, opsional)
* `dibatalkan_pada` (`timestamptz`, opsional)
* *Aturan tabel:* UNIQUE(`kursus_id`, `peserta_id`) untuk status `menunggu_bayar`, `aktif`, `selesai`.

### 2.6. Tabel `progres_modul`
Catatan belajar peserta per modul.
* `id` (`uuid`, PK, bawaan: `gen_random_uuid()`)
* `pendaftaran_id` (`uuid`, FK ke `pendaftaran.id` ON DELETE CASCADE, wajib)
* `modul_id` (`uuid`, FK ke `modul.id`, wajib)
* `materi_dibaca_pada` (`timestamptz`, wajib)
* `lulus_pada` (`timestamptz`, opsional)
* *Aturan tabel:* UNIQUE(`pendaftaran_id`, `modul_id`)

### 2.7. Tabel `percobaan_kuis`
Riwayat setiap kiriman kuis peserta.
* `id` (`uuid`, PK, bawaan: `gen_random_uuid()`)
* `pendaftaran_id` (`uuid`, FK ke `pendaftaran.id` ON DELETE CASCADE, wajib)
* `modul_id` (`uuid`, FK ke `modul.id`, wajib)
* `nomor_percobaan` (`smallint`, wajib, `1` s/d `3`)
* `jawaban` (`jsonb`, wajib, contoh: `{"id_soal": "B"}`)
* `jumlah_soal` (`smallint`, wajib, > 0)
* `jumlah_benar` (`smallint`, wajib, 0 s/d jumlah_soal)
* `nilai` (`smallint`, wajib, 0 s/d 100)
* `lulus` (`boolean`, wajib)
* `dikerjakan_pada` (`timestamptz`, bawaan: `NOW()`)
* *Aturan tabel:* UNIQUE(`pendaftaran_id`, `modul_id`, `nomor_percobaan`)

### 2.8. Tabel `sertifikat`
Sertifikat resmi untuk pendaftaran berstatus `selesai`.
* `id` (`uuid`, PK, bawaan: `gen_random_uuid()`)
* `pendaftaran_id` (`uuid`, FK ke `pendaftaran.id`, unik, wajib)
* `tahun` (`smallint`, wajib)
* `nomor_urut` (`integer`, wajib, unik per tahun)
* `nomor_sertifikat` (`text`, unik, format `PA-TAHUN-NOMOR`, wajib)
* `nama_peserta` (`text`, wajib)
* `judul_kursus` (`text`, wajib)
* `diterbitkan_pada` (`timestamptz`, bawaan: `NOW()`)

### 2.9. Tabel `audit_log`
Catatan aksi sensitif (append-only, hanya dibaca admin).
* `id` (`bigserial`, PK)
* `pelaku_id` (`uuid`, FK ke `profiles.id`, opsional jika aksi sistem)
* `aksi` (`text`, wajib, misal: `'ubah_status_kursus'`)
* `nama_tabel` (`text`, wajib)
* `id_data` (`uuid`, opsional)
* `data_sebelum` (`jsonb`, opsional)
* `data_sesudah` (`jsonb`, opsional)
* `dibuat_pada` (`timestamptz`, bawaan: `NOW()`)
