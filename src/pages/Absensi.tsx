import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Absensi as AbsensiType } from '../types/database';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Absensi() {
  const [data, setData] = useState<AbsensiType[]>([]);
  const [pegawaiList, setPegawaiList] = useState<{ id: string; nama: string; nip: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AbsensiType | null>(null);
  const [filterTanggal, setFilterTanggal] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [form, setForm] = useState({
    pegawai_id: '', tanggal: format(new Date(), 'yyyy-MM-dd'),
    waktu_masuk: '', waktu_keluar: '', status: 'hadir', keterangan: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [absensiRes, pegawaiRes] = await Promise.all([
      supabase.from('absensi').select('*, pegawai(id, nama, nip)').eq('tanggal', filterTanggal).order('waktu_masuk', { ascending: true }),
      supabase.from('pegawai').select('id, nama, nip').order('nama', { ascending: true }),
    ]);
    setData(absensiRes.data as any || []);
    setPegawaiList(pegawaiRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filterTanggal]);

  const openCreate = () => {
    setEditing(null);
    setForm({ pegawai_id: pegawaiList[0]?.id || '', tanggal: format(new Date(), 'yyyy-MM-dd'), waktu_masuk: '', waktu_keluar: '', status: 'hadir', keterangan: '' });
    setModalOpen(true);
  };

  const openEdit = (row: AbsensiType) => {
    setEditing(row);
    setForm({ pegawai_id: row.pegawai_id, tanggal: row.tanggal, waktu_masuk: row.waktu_masuk || '', waktu_keluar: row.waktu_keluar || '', status: row.status, keterangan: row.keterangan || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, waktu_masuk: form.waktu_masuk || null, waktu_keluar: form.waktu_keluar || null, keterangan: form.keterangan || null };
    if (editing) {
      const { error } = await supabase.from('absensi').update(payload).eq('id', editing.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from('absensi').insert([payload]);
      if (error) console.error(error);
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (deleteId: string) => {
    if (confirm('Hapus data absensi ini?')) {
      const { error } = await supabase.from('absensi').delete().eq('id', deleteId);
      if (error) console.error(error);
      fetchData();
    }
  };

  const columns = [
    { header: 'Tanggal', accessor: (row: AbsensiType) => format(new Date(row.tanggal), 'dd MMM yyyy', { locale: id }) },
    { header: 'Pegawai', accessor: (row: AbsensiType) => row.pegawai?.nama || '-' },
    { header: 'NIP', accessor: (row: AbsensiType) => row.pegawai?.nip || '-' },
    { header: 'Masuk', accessor: 'waktu_masuk' as const },
    { header: 'Keluar', accessor: 'waktu_keluar' as const },
    { header: 'Status', accessor: (row: AbsensiType) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        row.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' :
        row.status === 'izin' ? 'bg-amber-100 text-amber-700' :
        row.status === 'sakit' ? 'bg-blue-100 text-blue-700' :
        row.status === 'cuti' ? 'bg-violet-100 text-violet-700' :
        'bg-red-100 text-red-700'
      }`}>{row.status}</span>
    )},
    { header: 'Keterangan', accessor: 'keterangan' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Absensi</h1>
          <p className="text-sm text-slate-500">Catat kehadiran pegawai harian</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} className="pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Tambah Absensi
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Absensi' : 'Tambah Absensi'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pegawai</label>
            <select value={form.pegawai_id} onChange={(e) => setForm({ ...form, pegawai_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
              {pegawaiList.map((p) => (<option key={p.id} value={p.id}>{p.nama} ({p.nip})</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label><input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value="hadir">Hadir</option><option value="izin">Izin</option><option value="sakit">Sakit</option><option value="cuti">Cuti</option><option value="alpa">Alpa</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Waktu Masuk</label><input type="time" value={form.waktu_masuk} onChange={(e) => setForm({ ...form, waktu_masuk: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Waktu Keluar</label><input type="time" value={form.waktu_keluar} onChange={(e) => setForm({ ...form, waktu_keluar: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label><input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Opsional" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
