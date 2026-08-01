export interface Yayasan {
  id: string;
  nama: string;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Sekolah {
  id: string;
  yayasan_id: string;
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
  id: string;
  yayasan_id: string;
  nama: string;
  level: number;
  gaji_pokok: number;
  tunjangan: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Divisi {
  id: string;
  yayasan_id: string;
  nama: string;
  kode: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Pegawai {
  id: string;
  user_id: string | null;
  yayasan_id: string;
  sekolah_id: string | null;
  jabatan_id: string;
  divisi_id: string | null;
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
  sekolah?: { id: string; nama: string } | null;
  jabatan?: { id: string; nama: string } | null;
  divisi?: { id: string; nama: string } | null;
}

export interface Absensi {
  id: string;
  pegawai_id: string;
  tanggal: string;
  waktu_masuk: string | null;
  waktu_keluar: string | null;
  status: string;
  keterangan: string | null;
  created_at: string | null;
  updated_at: string | null;
  pegawai?: { id: string; nama: string; nip: string } | null;
}

export interface Gaji {
  id: string;
  pegawai_id: string;
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
  pegawai?: { id: string; nama: string; nip: string } | null;
}

export interface Cuti {
  id: string;
  pegawai_id: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jenis_cuti: string;
  alasan: string;
  status: string;
  disetujui_oleh: string | null;
  tanggal_persetujuan: string | null;
  created_at: string | null;
  updated_at: string | null;
  pegawai?: { id: string; nama: string; nip: string } | null;
}

export interface Akun {
  id: string;
  yayasan_id: string;
  kode: string;
  nama: string;
  kategori: string;
  saldo_normal: string;
  keterangan: string | null;
  created_at: string;
}

export interface JurnalUmum {
  id: string;
  yayasan_id: string;
  tanggal: string;
  nomor_bukti: string;
  keterangan: string;
  total_debit: number;
  total_kredit: number;
  status: string;
  created_by: string | null;
  created_at: string;
  details?: JurnalDetail[];
}

export interface JurnalDetail {
  id: string;
  jurnal_id: string;
  akun_id: string;
  debit: number;
  kredit: number;
  keterangan: string | null;
  akun?: Akun;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  nomor_invoice: string;
  jenjang: 'KB' | 'TK' | 'SD' | 'SMP' | 'SMA';
  tanggal: string;
  keterangan: string;
  total: number;
  status: 'Lunas' | 'Belum Lunas';
  created_at?: string;
  updated_at?: string;
}
