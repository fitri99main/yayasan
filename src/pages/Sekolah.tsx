import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sekolah as SekolahType } from '../types/database';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

export default function Sekolah() {
  const [data, setData] = useState<SekolahType[]>([]);
  const [yayasanList, setYayasanList] = useState<{ id: string; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SekolahType | null>(null);
  const [form, setForm] = useState({
    yayasan_id: '',
    nama: '',
    alamat: '',
    telepon: '',
    email: '',
    jenjang: 'SD',
    kode_invoice: ''
  });

  const fetchData = async () => {
    setLoading(true);
    
    const [sekolahRes, yayasanRes] = await Promise.all([
      supabase.from('sekolah').select('*').order('created_at', { ascending: false }),
      supabase.from('yayasan').select('id, nama').order('nama', { ascending: true })
    ]);
    
    setData(sekolahRes.data || []);
    setYayasanList(yayasanRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ yayasan_id: yayasanList[0]?.id || '', nama: '', alamat: '', telepon: '', email: '', jenjang: 'SD', kode_invoice: '' });
    setModalOpen(true);
  };

  const openEdit = (row: SekolahType) => {
    setEditing(row);
    setForm({
      yayasan_id: row.yayasan_id,
      nama: row.nama,
      alamat: row.alamat || '',
      telepon: row.telepon || '',
      email: row.email || '',
      jenjang: row.jenjang,
      kode_invoice: row.kode_invoice || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase
        .from('sekolah')
        .update(form)
        .eq('id', editing.id);
      if (error) console.error('Error updating sekolah:', error);
    } else {
      const { error } = await supabase
        .from('sekolah')
        .insert([form]);
      if (error) console.error('Error inserting sekolah:', error);
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus sekolah ini?')) {
      const { error } = await supabase
        .from('sekolah')
        .delete()
        .eq('id', id);
      if (error) console.error('Error deleting sekolah:', error);
      fetchData();
    }
  };

  const columns = [
    { header: 'Nama', accessor: 'nama' as const },
    { header: 'Jenjang', accessor: 'jenjang' as const },
    { header: 'Kode Invoice', accessor: 'kode_invoice' as const },
    { header: 'Alamat', accessor: 'alamat' as const },
    { header: 'Telepon', accessor: 'telepon' as const },
    { header: 'Email', accessor: 'email' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sekolah</h1>
          <p className="text-sm text-slate-500">Kelola data sekolah di bawah yayasan</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Sekolah
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Sekolah' : 'Tambah Sekolah'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yayasan</label>
            <select
              value={form.yayasan_id}
              onChange={(e) => setForm({ ...form, yayasan_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            >
              {yayasanList.map((y) => (
                <option key={y.id} value={y.id}>{y.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Sekolah</label>
            <input
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jenjang</label>
            <input
              list="jenjang-options"
              value={form.jenjang}
              onChange={(e) => setForm({ ...form, jenjang: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Pilih atau ketik jenjang baru..."
              required
            />
            <datalist id="jenjang-options">
              <option value="KB" />
              <option value="TK" />
              <option value="SD" />
              <option value="SMP" />
              <option value="SMA" />
              <option value="SMK" />
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kode Invoice (Prefix)</label>
            <input
              value={form.kode_invoice}
              onChange={(e) => setForm({ ...form, kode_invoice: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Contoh: INV-SD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
            <input
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
              <input
                value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
