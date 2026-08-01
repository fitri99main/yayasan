import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Pegawai as PegawaiType } from '../types/database';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

export default function Pegawai() {
  const [data, setData] = useState<PegawaiType[]>([]);
  const [sekolahList, setSekolahList] = useState<{ id: string; nama: string }[]>([]);
  const [jabatanList, setJabatanList] = useState<{ id: string; nama: string }[]>([]);
  const [divisiList, setDivisiList] = useState<{ id: string; nama: string }[]>([]);
  const [yayasanList, setYayasanList] = useState<{ id: string; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PegawaiType | null>(null);
  const [form, setForm] = useState({
    yayasan_id: '', sekolah_id: '', jabatan_id: '', divisi_id: '',
    nip: '', nama: '', email: '', telepon: '', alamat: '', tempat_lahir: '',
    tanggal_lahir: '', jenis_kelamin: 'L', status_pernikahan: 'Belum Menikah',
    pendidikan_terakhir: '', tahun_masuk: new Date().getFullYear(), status: 'aktif',
  });

  const fetchData = async () => {
    setLoading(true);
    const [pegawaiRes, sekolahRes, jabatanRes, divisiRes, yayasanRes] = await Promise.all([
      supabase.from('pegawai').select('*, sekolah(id, nama), jabatan(id, nama), divisi(id, nama)').order('created_at', { ascending: false }),
      supabase.from('sekolah').select('id, nama').order('nama'),
      supabase.from('jabatan').select('id, nama').order('nama'),
      supabase.from('divisi').select('id, nama').order('nama'),
      supabase.from('yayasan').select('id, nama').order('nama')
    ]);
    // Supabase returns related tables as object arrays if not one-to-one strictly, but usually it's an object for FKs.
    // The types are already compatible if it returns single objects.
    setData(pegawaiRes.data as any || []);
    setSekolahList(sekolahRes.data || []);
    setJabatanList(jabatanRes.data || []);
    setDivisiList(divisiRes.data || []);
    setYayasanList(yayasanRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      yayasan_id: yayasanList[0]?.id || '', sekolah_id: '',
      jabatan_id: jabatanList[0]?.id || '', divisi_id: '',
      nip: '', nama: '', email: '', telepon: '', alamat: '', tempat_lahir: '',
      tanggal_lahir: '', jenis_kelamin: 'L', status_pernikahan: 'Belum Menikah',
      pendidikan_terakhir: '', tahun_masuk: new Date().getFullYear(), status: 'aktif',
    });
    setModalOpen(true);
  };

  const openEdit = (row: PegawaiType) => {
    setEditing(row);
    setForm({
      yayasan_id: row.yayasan_id, sekolah_id: row.sekolah_id || '',
      jabatan_id: row.jabatan_id, divisi_id: row.divisi_id || '',
      nip: row.nip, nama: row.nama, email: row.email, telepon: row.telepon || '',
      alamat: row.alamat || '', tempat_lahir: row.tempat_lahir || '',
      tanggal_lahir: row.tanggal_lahir || '', jenis_kelamin: row.jenis_kelamin || 'L',
      status_pernikahan: row.status_pernikahan || 'Belum Menikah',
      pendidikan_terakhir: row.pendidikan_terakhir || '',
      tahun_masuk: row.tahun_masuk || new Date().getFullYear(), status: row.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      sekolah_id: form.sekolah_id || null,
      divisi_id: form.divisi_id || null,
      tanggal_lahir: form.tanggal_lahir || null,
    };
    if (editing) {
      const { error } = await supabase.from('pegawai').update(payload).eq('id', editing.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from('pegawai').insert([payload]);
      if (error) console.error(error);
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus pegawai ini?')) {
      const { error } = await supabase.from('pegawai').delete().eq('id', id);
      if (error) console.error(error);
      fetchData();
    }
  };

  const columns = [
    { header: 'NIP', accessor: 'nip' as const },
    { header: 'Nama', accessor: 'nama' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Jabatan', accessor: (row: PegawaiType) => row.jabatan?.nama || '-' },
    { header: 'Sekolah', accessor: (row: PegawaiType) => row.sekolah?.nama || '-' },
    { header: 'Divisi', accessor: (row: PegawaiType) => row.divisi?.nama || '-' },
    { header: 'Status', accessor: (row: PegawaiType) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        row.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' :
        row.status === 'cuti' ? 'bg-amber-100 text-amber-700' :
        'bg-red-100 text-red-700'
      }`}>{row.status}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pegawai</h1>
          <p className="text-sm text-slate-500">Kelola data pegawai yayasan</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Tambah Pegawai
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Pegawai' : 'Tambah Pegawai'}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">NIP</label><input value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label><input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label><input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label><textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir</label><input value={form.tempat_lahir} onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label><input type="date" value={form.tanggal_lahir} onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label><select value={form.jenis_kelamin} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Status Pernikahan</label><select value={form.status_pernikahan} onChange={(e) => setForm({ ...form, status_pernikahan: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"><option>Belum Menikah</option><option>Menikah</option><option>Cerai</option></select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Status Kerja</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option><option value="cuti">Cuti</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Pendidikan Terakhir</label><input value={form.pendidikan_terakhir} onChange={(e) => setForm({ ...form, pendidikan_terakhir: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="S1, D2, SMA, dll" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tahun Masuk</label><input type="number" value={form.tahun_masuk} onChange={(e) => setForm({ ...form, tahun_masuk: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Yayasan</label><select value={form.yayasan_id} onChange={(e) => setForm({ ...form, yayasan_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>{yayasanList.map((y) => (<option key={y.id} value={y.id}>{y.nama}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Sekolah</label><select value={form.sekolah_id} onChange={(e) => setForm({ ...form, sekolah_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"><option value="">- Tidak di sekolah -</option>{sekolahList.map((s) => (<option key={s.id} value={s.id}>{s.nama}</option>))}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Jabatan</label><select value={form.jabatan_id} onChange={(e) => setForm({ ...form, jabatan_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>{jabatanList.map((j) => (<option key={j.id} value={j.id}>{j.nama}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Divisi</label><select value={form.divisi_id} onChange={(e) => setForm({ ...form, divisi_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"><option value="">- Pilih Divisi -</option>{divisiList.map((d) => (<option key={d.id} value={d.id}>{d.nama}</option>))}</select></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
