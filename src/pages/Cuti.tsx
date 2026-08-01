import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cuti as CutiType } from '../types/database';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Cuti() {
  const [data, setData] = useState<CutiType[]>([]);
  const [pegawaiList, setPegawaiList] = useState<{ id: string; nama: string; nip: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CutiType | null>(null);
  const [form, setForm] = useState({
    pegawai_id: '', tanggal_mulai: '', tanggal_selesai: '',
    jenis_cuti: 'tahunan', alasan: '', status: 'pending',
  });

  const fetchData = async () => {
    setLoading(true);
    const [cutiRes, pegawaiRes] = await Promise.all([
      supabase.from('cuti').select('*, pegawai(id, nama, nip)').order('created_at', { ascending: false }),
      supabase.from('pegawai').select('id, nama, nip').order('nama', { ascending: true }),
    ]);
    setData(cutiRes.data as any || []);
    setPegawaiList(pegawaiRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ pegawai_id: pegawaiList[0]?.id || '', tanggal_mulai: '', tanggal_selesai: '', jenis_cuti: 'tahunan', alasan: '', status: 'pending' });
    setModalOpen(true);
  };

  const openEdit = (row: CutiType) => {
    setEditing(row);
    setForm({ pegawai_id: row.pegawai_id, tanggal_mulai: row.tanggal_mulai, tanggal_selesai: row.tanggal_selesai, jenis_cuti: row.jenis_cuti, alasan: row.alasan, status: row.status });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (editing) {
      const { error } = await supabase.from('cuti').update(payload).eq('id', editing.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from('cuti').insert([payload]);
      if (error) console.error(error);
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (deleteId: string) => {
    if (confirm('Hapus pengajuan cuti ini?')) {
      const { error } = await supabase.from('cuti').delete().eq('id', deleteId);
      if (error) console.error(error);
      fetchData();
    }
  };

  const columns = [
    { header: 'Pegawai', accessor: (row: CutiType) => row.pegawai?.nama || '-' },
    { header: 'NIP', accessor: (row: CutiType) => row.pegawai?.nip || '-' },
    { header: 'Jenis', accessor: 'jenis_cuti' as const },
    { header: 'Mulai', accessor: (row: CutiType) => format(new Date(row.tanggal_mulai), 'dd MMM yyyy', { locale: id }) },
    { header: 'Selesai', accessor: (row: CutiType) => format(new Date(row.tanggal_selesai), 'dd MMM yyyy', { locale: id }) },
    { header: 'Status', accessor: (row: CutiType) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        row.status === 'disetujui' ? 'bg-emerald-100 text-emerald-700' :
        row.status === 'pending' ? 'bg-amber-100 text-amber-700' :
        'bg-red-100 text-red-700'
      }`}>{row.status}</span>
    )},
    { header: 'Alasan', accessor: 'alasan' as const },
  ];

  const pendingCount = data.filter((d) => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cuti</h1>
          <p className="text-sm text-slate-500">Kelola pengajuan cuti pegawai</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Ajukan Cuti
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2 rounded-lg"><CalendarDays className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-slate-500">Pengajuan Pending</p>
            <p className="text-xl font-bold text-slate-900">{pendingCount} pengajuan</p>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Cuti' : 'Ajukan Cuti'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Pegawai</label>
            <select value={form.pegawai_id} onChange={(e) => setForm({ ...form, pegawai_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
              {pegawaiList.map((p) => (<option key={p.id} value={p.id}>{p.nama} ({p.nip})</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label><input type="date" value={form.tanggal_mulai} onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label><input type="date" value={form.tanggal_selesai} onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Jenis Cuti</label>
              <select value={form.jenis_cuti} onChange={(e) => setForm({ ...form, jenis_cuti: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value="tahunan">Tahunan</option><option value="sakit">Sakit</option><option value="melahirkan">Melahirkan</option><option value="penting">Penting</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value="pending">Pending</option><option value="disetujui">Disetujui</option><option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Alasan</label><textarea value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
