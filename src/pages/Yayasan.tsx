import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Yayasan as YayasanType } from '../types/database';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

export default function Yayasan() {
  const [data, setData] = useState<YayasanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<YayasanType | null>(null);
  const [form, setForm] = useState({
    nama: '',
    alamat: '',
    telepon: '',
    email: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from('yayasan')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) console.error('Error fetching yayasan:', error);
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nama: '', alamat: '', telepon: '', email: '' });
    setModalOpen(true);
  };

  const openEdit = (row: YayasanType) => {
    setEditing(row);
    setForm({
      nama: row.nama,
      alamat: row.alamat || '',
      telepon: row.telepon || '',
      email: row.email || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase
        .from('yayasan')
        .update(form)
        .eq('id', editing.id);
      if (error) console.error('Error updating yayasan:', error);
    } else {
      const { error } = await supabase
        .from('yayasan')
        .insert([form]);
      if (error) console.error('Error inserting yayasan:', error);
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus yayasan ini? Data sekolah, jabatan, divisi, dan pegawai terkait akan terhapus.')) {
      const { error } = await supabase
        .from('yayasan')
        .delete()
        .eq('id', id);
      if (error) console.error('Error deleting yayasan:', error);
      fetchData();
    }
  };

  const columns = [
    { header: 'Nama', accessor: 'nama' as const },
    { header: 'Alamat', accessor: 'alamat' as const },
    { header: 'Telepon', accessor: 'telepon' as const },
    { header: 'Email', accessor: 'email' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yayasan</h1>
          <p className="text-sm text-slate-500">Kelola data yayasan pendidikan</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Yayasan
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Yayasan' : 'Tambah Yayasan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Yayasan</label>
            <input
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
            <textarea
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              rows={3}
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
