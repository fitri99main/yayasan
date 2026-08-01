import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Jabatan as JabatanType } from '../types/database';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

export default function Jabatan() {
  const [data, setData] = useState<JabatanType[]>([]);
  const [yayasanList, setYayasanList] = useState<{ id: string; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JabatanType | null>(null);
  const [form, setForm] = useState({ yayasan_id: '', nama: '', level: 1, gaji_pokok: 0, tunjangan: 0 });

  const fetchData = async () => {
    setLoading(true);
    const [jabatanRes, yayasanRes] = await Promise.all([
      supabase.from('jabatan').select('*').order('created_at', { ascending: false }),
      supabase.from('yayasan').select('id, nama').order('nama', { ascending: true })
    ]);
    setData(jabatanRes.data || []);
    setYayasanList(yayasanRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ yayasan_id: yayasanList[0]?.id || '', nama: '', level: 1, gaji_pokok: 0, tunjangan: 0 });
    setModalOpen(true);
  };

  const openEdit = (row: JabatanType) => {
    setEditing(row);
    setForm({ yayasan_id: row.yayasan_id, nama: row.nama, level: row.level, gaji_pokok: row.gaji_pokok, tunjangan: row.tunjangan });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from('jabatan').update(form).eq('id', editing.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from('jabatan').insert([form]);
      if (error) console.error(error);
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus jabatan ini?')) {
      const { error } = await supabase.from('jabatan').delete().eq('id', id);
      if (error) console.error(error);
      fetchData();
    }
  };

  const columns = [
    { header: 'Nama', accessor: 'nama' as const },
    { header: 'Level', accessor: 'level' as const },
    { header: 'Gaji Pokok', accessor: (row: JabatanType) => `Rp ${row.gaji_pokok.toLocaleString('id-ID')}` },
    { header: 'Tunjangan', accessor: (row: JabatanType) => `Rp ${row.tunjangan.toLocaleString('id-ID')}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jabatan</h1>
          <p className="text-sm text-slate-500">Kelola data jabatan pegawai</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Tambah Jabatan
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Jabatan' : 'Tambah Jabatan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yayasan</label>
            <select value={form.yayasan_id} onChange={(e) => setForm({ ...form, yayasan_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
              {yayasanList.map((y) => (<option key={y.id} value={y.id}>{y.nama}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Jabatan</label>
            <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
            <input type="number" value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required min={1} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gaji Pokok</label>
              <input type="number" value={form.gaji_pokok} onChange={(e) => setForm({ ...form, gaji_pokok: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tunjangan</label>
              <input type="number" value={form.tunjangan} onChange={(e) => setForm({ ...form, tunjangan: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required min={0} />
            </div>
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
