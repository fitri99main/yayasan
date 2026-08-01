export interface Yayasan {
  id: number;
  nama: string;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Sekolah {
  id: number;
  yayasan_id: number;
  nama: string;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  jenjang: string;
  kode_invoice: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Jabatan {
  id: number;
  yayasan_id: number;
  nama: string;
  level: number;
  gaji_pokok: number;
  tunjangan: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Divisi {
  id: number;
  yayasan_id: number;
  nama: string;
  kode: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Pegawai {
  id: number;
  user_id: number | null;
  yayasan_id: number;
  sekolah_id: number | null;
  jabatan_id: number;
  divisi_id: number | null;
  nip: string;
  nama: string;
  email: string;
  telepon: string | null;
  alamat: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: string | null;
  status_pernikahan: string | null;
  pendidikan_terakhir: string | null;
  tahun_masuk: number | null;
  status: string;
  foto_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  sekolah?: { id: number; nama: string } | null;
  jabatan?: { id: number; nama: string } | null;
  divisi?: { id: number; nama: string } | null;
}

export interface Absensi {
  id: number;
  pegawai_id: number;
  tanggal: string;
  waktu_masuk: string | null;
  waktu_keluar: string | null;
  status: string;
  keterangan: string | null;
  created_at: string | null;
  updated_at: string | null;
  pegawai?: { id: number; nama: string; nip: string } | null;
}

export interface Gaji {
  id: number;
  pegawai_id: number;
  bulan: number;
  tahun: number;
  gaji_pokok: number;
  tunjangan: number;
  bonus: number;
  potongan: number;
  total_gaji: number;
  status: string;
  tanggal_bayar: string | null;
  created_at: string | null;
  updated_at: string | null;
  pegawai?: { id: number; nama: string; nip: string } | null;
}

export interface Cuti {
  id: number;
  pegawai_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jenis_cuti: string;
  alasan: string;
  status: string;
  disetujui_oleh: number | null;
  tanggal_persetujuan: string | null;
  created_at: string | null;
  updated_at: string | null;
  pegawai?: { id: number; nama: string; nip: string } | null;
}

export interface Akun {
  id: number;
  kode_akun: string;
  nama_akun: string;
  kategori: 'Harta' | 'Kewajiban' | 'Modal' | 'Pendapatan' | 'Beban';
  saldo_normal: 'Debit' | 'Kredit';
  is_aktif: boolean;
  created_at: string;
}

export interface Jurnal {
  id: number;
  nomor_bukti: string;
  tanggal: string;
  keterangan: string;
  total: number;
  user_id: number | null;
  details?: JurnalDetail[];
  created_at: string;
}

export interface JurnalDetail {
  id: number;
  jurnal_id: number;
  akun_id: number;
  debit: number;
  kredit: number;
  keterangan: string | null;
  akun?: Akun;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: number;
  nomor_invoice: string;
  jenjang: 'KB' | 'TK' | 'SD' | 'SMP' | 'SMA';
  tanggal: string;
  keterangan: string;
  total: number;
  status: 'Lunas' | 'Belum Lunas';
  created_at?: string;
  updated_at?: string;
}
