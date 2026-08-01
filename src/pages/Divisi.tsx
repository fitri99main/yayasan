import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Divisi as DivisiType } from '../types/database';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

export default function Divisi() {
  const [data, setData] = useState<DivisiType[]>([]);
  const [yayasanList, setYayasanList] = useState<{ id: number; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DivisiType | null>(null);
  const [form, setForm] = useState({ yayasan_id: '', nama: '', kode: '' });

  const fetchData = async () => {
    setLoading(true);
    const [divisiRes, yayasanRes] = await Promise.all([api.get('/divisi'), api.get('/yayasan')]);
    setData(divisiRes.data);
    setYayasanList(yayasanRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ yayasan_id: String(yayasanList[0]?.id || ''), nama: '', kode: '' });
    setModalOpen(true);
  };

  const openEdit = (row: DivisiType) => {
    setEditing(row);
    setForm({ yayasan_id: String(row.yayasan_id), nama: row.nama, kode: row.kode || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, yayasan_id: Number(form.yayasan_id) };
    if (editing) { await api.put(`/divisi/${editing.id}`, payload); } else { await api.post('/divisi', payload); }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus divisi ini?')) { await api.delete(`/divisi/${id}`); fetchData(); }
  };

  const columns = [
    { header: 'Nama', accessor: 'nama' as const },
    { header: 'Kode', accessor: 'kode' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Divisi</h1>
          <p className="text-sm text-slate-500">Kelola data divisi/departemen</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Tambah Divisi
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Divisi' : 'Tambah Divisi'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yayasan</label>
            <select value={form.yayasan_id} onChange={(e) => setForm({ ...form, yayasan_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
              {yayasanList.map((y) => (<option key={y.id} value={y.id}>{y.nama}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Divisi</label>
            <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kode</label>
            <input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Contoh: AKD" />
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
