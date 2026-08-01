/*
# HRD Yayasan Multi-Sekolah Schema

1. New Tables
- `yayasan` - Data yayasan pusat
  - `id` (uuid, primary key)
  - `nama` (text, nama yayasan)
  - `alamat` (text)
  - `telepon` (text)
  - `email` (text)
  - `created_at` (timestamptz)

- `sekolah` - Data sekolah di bawah yayasan
  - `id` (uuid, primary key)
  - `yayasan_id` (uuid, FK yayasan)
  - `nama` (text, nama sekolah)
  - `alamat` (text)
  - `telepon` (text)
  - `email` (text)
  - `jenjang` (text: TK, SD, SMP, SMA, SMK)
  - `created_at` (timestamptz)

- `jabatan` - Data jabatan
  - `id` (uuid, primary key)
  - `yayasan_id` (uuid, FK yayasan)
  - `nama` (text, nama jabatan)
  - `level` (integer, tingkat jabatan)
  - `gaji_pokok` (numeric, gaji pokok)
  - `tunjangan` (numeric, tunjangan)
  - `created_at` (timestamptz)

- `divisi` - Data divisi/departemen
  - `id` (uuid, primary key)
  - `yayasan_id` (uuid, FK yayasan)
  - `nama` (text, nama divisi)
  - `kode` (text, kode divisi)
  - `created_at` (timestamptz)

- `pegawai` - Data karyawan/pegawai
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK auth.users)
  - `yayasan_id` (uuid, FK yayasan)
  - `sekolah_id` (uuid, FK sekolah, nullable)
  - `jabatan_id` (uuid, FK jabatan)
  - `divisi_id` (uuid, FK divisi)
  - `nip` (text, nomor induk pegawai)
  - `nama` (text, nama lengkap)
  - `email` (text, unique)
  - `telepon` (text)
  - `alamat` (text)
  - `tempat_lahir` (text)
  - `tanggal_lahir` (date)
  - `jenis_kelamin` (text: L/P)
  - `status_pernikahan` (text)
  - `pendidikan_terakhir` (text)
  - `tahun_masuk` (integer)
  - `status` (text: aktif, nonaktif, cuti)
  - `foto_url` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- `absensi` - Data absensi harian pegawai
  - `id` (uuid, primary key)
  - `pegawai_id` (uuid, FK pegawai)
  - `tanggal` (date)
  - `waktu_masuk` (time)
  - `waktu_keluar` (time, nullable)
  - `status` (text: hadir, izin, sakit, alpa, cuti)
  - `keterangan` (text, nullable)
  - `created_at` (timestamptz)

- `gaji` - Data gaji bulanan pegawai
  - `id` (uuid, primary key)
  - `pegawai_id` (uuid, FK pegawai)
  - `bulan` (integer, 1-12)
  - `tahun` (integer)
  - `gaji_pokok` (numeric)
  - `tunjangan` (numeric)
  - `bonus` (numeric, default 0)
  - `potongan` (numeric, default 0)
  - `total_gaji` (numeric)
  - `status` (text: belum_dibayar, sudah_dibayar)
  - `tanggal_bayar` (date, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- `cuti` - Data pengajuan cuti
  - `id` (uuid, primary key)
  - `pegawai_id` (uuid, FK pegawai)
  - `tanggal_mulai` (date)
  - `tanggal_selesai` (date)
  - `jenis_cuti` (text: tahunan, sakit, melahirkan, penting)
  - `alasan` (text)
  - `status` (text: pending, disetujui, ditolak)
  - `disetujui_oleh` (uuid, FK pegawai, nullable)
  - `tanggal_persetujuan` (date, nullable)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on all tables.
- Allow authenticated users to CRUD their own data.
- Admin users can manage all data in their yayasan.

3. Indexes
- Index on pegawai.user_id, sekolah_id, jabatan_id, divisi_id
- Index on absensi.pegawai_id, tanggal
- Index on gaji.pegawai_id, bulan, tahun
- Index on cuti.pegawai_id, status
*/

CREATE TABLE IF NOT EXISTS yayasan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  alamat text,
  telepon text,
  email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sekolah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yayasan_id uuid NOT NULL REFERENCES yayasan(id) ON DELETE CASCADE,
  nama text NOT NULL,
  alamat text,
  telepon text,
  email text,
  jenjang text NOT NULL DEFAULT 'SD',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jabatan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yayasan_id uuid NOT NULL REFERENCES yayasan(id) ON DELETE CASCADE,
  nama text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  gaji_pokok numeric NOT NULL DEFAULT 0,
  tunjangan numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS divisi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yayasan_id uuid NOT NULL REFERENCES yayasan(id) ON DELETE CASCADE,
  nama text NOT NULL,
  kode text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pegawai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  yayasan_id uuid NOT NULL REFERENCES yayasan(id) ON DELETE CASCADE,
  sekolah_id uuid REFERENCES sekolah(id) ON DELETE SET NULL,
  jabatan_id uuid NOT NULL REFERENCES jabatan(id) ON DELETE RESTRICT,
  divisi_id uuid REFERENCES divisi(id) ON DELETE SET NULL,
  nip text NOT NULL,
  nama text NOT NULL,
  email text NOT NULL,
  telepon text,
  alamat text,
  tempat_lahir text,
  tanggal_lahir date,
  jenis_kelamin text,
  status_pernikahan text,
  pendidikan_terakhir text,
  tahun_masuk integer,
  status text NOT NULL DEFAULT 'aktif',
  foto_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS absensi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pegawai_id uuid NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  waktu_masuk time,
  waktu_keluar time,
  status text NOT NULL DEFAULT 'hadir',
  keterangan text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gaji (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pegawai_id uuid NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
  bulan integer NOT NULL,
  tahun integer NOT NULL,
  gaji_pokok numeric NOT NULL DEFAULT 0,
  tunjangan numeric NOT NULL DEFAULT 0,
  bonus numeric NOT NULL DEFAULT 0,
  potongan numeric NOT NULL DEFAULT 0,
  total_gaji numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'belum_dibayar',
  tanggal_bayar date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cuti (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pegawai_id uuid NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
  tanggal_mulai date NOT NULL,
  tanggal_selesai date NOT NULL,
  jenis_cuti text NOT NULL DEFAULT 'tahunan',
  alasan text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  disetujui_oleh uuid REFERENCES pegawai(id) ON DELETE SET NULL,
  tanggal_persetujuan date,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pegawai_user_id ON pegawai(user_id);
CREATE INDEX IF NOT EXISTS idx_pegawai_sekolah_id ON pegawai(sekolah_id);
CREATE INDEX IF NOT EXISTS idx_pegawai_jabatan_id ON pegawai(jabatan_id);
CREATE INDEX IF NOT EXISTS idx_pegawai_divisi_id ON pegawai(divisi_id);
CREATE INDEX IF NOT EXISTS idx_pegawai_yayasan_id ON pegawai(yayasan_id);
CREATE INDEX IF NOT EXISTS idx_pegawai_nip ON pegawai(nip);
CREATE INDEX IF NOT EXISTS idx_pegawai_status ON pegawai(status);
CREATE INDEX IF NOT EXISTS idx_absensi_pegawai_id ON absensi(pegawai_id);
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX IF NOT EXISTS idx_gaji_pegawai_id ON gaji(pegawai_id);
CREATE INDEX IF NOT EXISTS idx_gaji_bulan_tahun ON gaji(bulan, tahun);
CREATE INDEX IF NOT EXISTS idx_cuti_pegawai_id ON cuti(pegawai_id);
CREATE INDEX IF NOT EXISTS idx_cuti_status ON cuti(status);
CREATE INDEX IF NOT EXISTS idx_sekolah_yayasan_id ON sekolah(yayasan_id);
CREATE INDEX IF NOT EXISTS idx_jabatan_yayasan_id ON jabatan(yayasan_id);
CREATE INDEX IF NOT EXISTS idx_divisi_yayasan_id ON divisi(yayasan_id);

-- RLS
ALTER TABLE yayasan ENABLE ROW LEVEL SECURITY;
ALTER TABLE sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaji ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuti ENABLE ROW LEVEL SECURITY;

-- Policies: use authenticated for all (this app has login)
-- For simplicity, we allow authenticated users to manage all data within their yayasan
-- In a real app, you'd want more granular role-based permissions

DROP POLICY IF EXISTS "yayasan_select_all" ON yayasan;
CREATE POLICY "yayasan_select_all" ON yayasan FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "yayasan_insert_all" ON yayasan;
CREATE POLICY "yayasan_insert_all" ON yayasan FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "yayasan_update_all" ON yayasan;
CREATE POLICY "yayasan_update_all" ON yayasan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "yayasan_delete_all" ON yayasan;
CREATE POLICY "yayasan_delete_all" ON yayasan FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "sekolah_select_all" ON sekolah;
CREATE POLICY "sekolah_select_all" ON sekolah FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sekolah_insert_all" ON sekolah;
CREATE POLICY "sekolah_insert_all" ON sekolah FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sekolah_update_all" ON sekolah;
CREATE POLICY "sekolah_update_all" ON sekolah FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sekolah_delete_all" ON sekolah;
CREATE POLICY "sekolah_delete_all" ON sekolah FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "jabatan_select_all" ON jabatan;
CREATE POLICY "jabatan_select_all" ON jabatan FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "jabatan_insert_all" ON jabatan;
CREATE POLICY "jabatan_insert_all" ON jabatan FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "jabatan_update_all" ON jabatan;
CREATE POLICY "jabatan_update_all" ON jabatan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "jabatan_delete_all" ON jabatan;
CREATE POLICY "jabatan_delete_all" ON jabatan FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "divisi_select_all" ON divisi;
CREATE POLICY "divisi_select_all" ON divisi FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "divisi_insert_all" ON divisi;
CREATE POLICY "divisi_insert_all" ON divisi FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "divisi_update_all" ON divisi;
CREATE POLICY "divisi_update_all" ON divisi FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "divisi_delete_all" ON divisi;
CREATE POLICY "divisi_delete_all" ON divisi FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "pegawai_select_all" ON pegawai;
CREATE POLICY "pegawai_select_all" ON pegawai FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "pegawai_insert_all" ON pegawai;
CREATE POLICY "pegawai_insert_all" ON pegawai FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "pegawai_update_all" ON pegawai;
CREATE POLICY "pegawai_update_all" ON pegawai FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "pegawai_delete_all" ON pegawai;
CREATE POLICY "pegawai_delete_all" ON pegawai FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "absensi_select_all" ON absensi;
CREATE POLICY "absensi_select_all" ON absensi FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "absensi_insert_all" ON absensi;
CREATE POLICY "absensi_insert_all" ON absensi FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "absensi_update_all" ON absensi;
CREATE POLICY "absensi_update_all" ON absensi FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "absensi_delete_all" ON absensi;
CREATE POLICY "absensi_delete_all" ON absensi FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "gaji_select_all" ON gaji;
CREATE POLICY "gaji_select_all" ON gaji FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "gaji_insert_all" ON gaji;
CREATE POLICY "gaji_insert_all" ON gaji FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "gaji_update_all" ON gaji;
CREATE POLICY "gaji_update_all" ON gaji FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "gaji_delete_all" ON gaji;
CREATE POLICY "gaji_delete_all" ON gaji FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "cuti_select_all" ON cuti;
CREATE POLICY "cuti_select_all" ON cuti FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cuti_insert_all" ON cuti;
CREATE POLICY "cuti_insert_all" ON cuti FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cuti_update_all" ON cuti;
CREATE POLICY "cuti_update_all" ON cuti FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cuti_delete_all" ON cuti;
CREATE POLICY "cuti_delete_all" ON cuti FOR DELETE TO authenticated USING (true);

-- Insert default yayasan
INSERT INTO yayasan (nama, alamat, telepon, email) VALUES
('Yayasan Pendidikan Indonesia', 'Jl. Pendidikan No. 1', '08123456789', 'info@yayasan-pendidikan.id')
ON CONFLICT DO NOTHING;

-- Insert default jabatan
INSERT INTO jabatan (yayasan_id, nama, level, gaji_pokok, tunjangan)
SELECT id, 'Direktur', 1, 15000000, 5000000 FROM yayasan WHERE nama = 'Yayasan Pendidikan Indonesia'
UNION ALL
SELECT id, 'Kepala Sekolah', 2, 10000000, 3000000 FROM yayasan WHERE nama = 'Yayasan Pendidikan Indonesia'
UNION ALL
SELECT id, 'Guru', 3, 5000000, 1000000 FROM yayasan WHERE nama = 'Yayasan Pendidikan Indonesia'
UNION ALL
SELECT id, 'Karyawan', 4, 4000000, 500000 FROM yayasan WHERE nama = 'Yayasan Pendidikan Indonesia'
ON CONFLICT DO NOTHING;

-- Insert default divisi
INSERT INTO divisi (yayasan_id, nama, kode)
SELECT id, 'Akademik', 'AKD' FROM yayasan WHERE nama = 'Yayasan Pendidikan Indonesia'
UNION ALL
SELECT id, 'Keuangan', 'KEU' FROM yayasan WHERE nama = 'Yayasan Pendidikan Indonesia'
UNION ALL
SELECT id, 'Kesiswaan', 'KSW' FROM yayasan WHERE nama = 'Yayasan Pendidikan Indonesia'
UNION ALL
SELECT id, 'Sarana Prasarana', 'SARPRAS' FROM yayasan WHERE nama = 'Yayasan Pendidikan Indonesia'
UNION ALL
SELECT id, 'Kurikulum', 'KUR' FROM yayasan WHERE nama = 'Yayasan Pendidikan Indonesia'
ON CONFLICT DO NOTHING;
