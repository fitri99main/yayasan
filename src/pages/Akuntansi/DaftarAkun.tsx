import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Local type for UI
type Akun = {
  id: string;
  yayasan_id: string;
  kode: string;
  nama: string;
  kategori: string;
  saldo_normal: string;
  keterangan: string | null;
  created_at: string;
};

export default function DaftarAkun() {
  const [akuns, setAkuns] = useState<Akun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAkun, setEditingAkun] = useState<Akun | null>(null);
  
  // Default yayasan_id for now, can be changed later
  const [yayasanId, setYayasanId] = useState('');

  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kategori: 'Harta',
    saldo_normal: 'Debit',
    keterangan: '',
  });

  const fetchAkun = async () => {
    setLoading(true);
    try {
      const { data: yData } = await supabase.from('yayasan').select('id').limit(1).single();
      if (yData) setYayasanId(yData.id);
      
      const { data, error } = await supabase.from('daftar_akun').select('*').order('kode', { ascending: true });
      if (error) throw error;
      setAkuns(data || []);
    } catch (error) {
      console.error('Error fetching akun:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAkun();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, yayasan_id: yayasanId };
      if (editingAkun) {
        const { error } = await supabase.from('daftar_akun').update(payload).eq('id', editingAkun.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('daftar_akun').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchAkun();
    } catch (error) {
      console.error('Error saving akun:', error);
      alert('Gagal menyimpan data akun.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      try {
        const { error } = await supabase.from('daftar_akun').delete().eq('id', id);
        if (error) throw error;
        fetchAkun();
      } catch (error: any) {
        alert(error.message || 'Gagal menghapus akun.');
      }
    }
  };

  const openModal = (akun?: Akun) => {
    if (akun) {
      setEditingAkun(akun);
      setFormData({
        kode: akun.kode,
        nama: akun.nama,
        kategori: akun.kategori,
        saldo_normal: akun.saldo_normal,
        keterangan: akun.keterangan || '',
      });
    } else {
      setEditingAkun(null);
      setFormData({
        kode: '',
        nama: '',
        kategori: 'Harta',
        saldo_normal: 'Debit',
        keterangan: '',
      });
    }
    setIsModalOpen(true);
  };

  const filteredAkuns = akuns.filter(
    (akun) =>
      akun.kode.toLowerCase().includes(search.toLowerCase()) ||
      akun.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Akun (COA)</h1>
          <p className="text-slate-500 mt-1">Kelola master data bagan akun akuntansi</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Akun</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode atau nama akun..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Kode Akun</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Nama Akun</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Kategori</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Saldo Normal</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Keterangan</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredAkuns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada data akun ditemukan.
                  </td>
                </tr>
              ) : (
                filteredAkuns.map((akun) => (
                  <tr key={akun.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{akun.kode}</span>
                    </td>
                    <td className="px-6 py-4">{akun.nama}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${akun.kategori === 'Harta' ? 'bg-blue-100 text-blue-800' :
                          akun.kategori === 'Kewajiban' ? 'bg-red-100 text-red-800' :
                          akun.kategori === 'Modal' ? 'bg-purple-100 text-purple-800' :
                          akun.kategori === 'Pendapatan' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-orange-100 text-orange-800'}`}>
                        {akun.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {akun.saldo_normal}
                    </td>
                    <td className="px-6 py-4">
                      {akun.keterangan || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(akun)}
                        className="text-slate-400 hover:text-emerald-600 p-2 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(akun.id)}
                        className="text-slate-400 hover:text-red-600 p-2 transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingAkun ? 'Edit Akun' : 'Tambah Akun Baru'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Akun</label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Akun</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Harta">Harta</option>
                  <option value="Kewajiban">Kewajiban</option>
                  <option value="Modal">Modal</option>
                  <option value="Pendapatan">Pendapatan</option>
                  <option value="Beban">Beban</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Normal</label>
                <select
                  value={formData.saldo_normal}
                  onChange={(e) => setFormData({ ...formData, saldo_normal: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Debit">Debit</option>
                  <option value="Kredit">Kredit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
