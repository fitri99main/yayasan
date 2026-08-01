import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Gaji as GajiType } from '../types/database';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Wallet } from 'lucide-react';

export default function Gaji() {
  const [data, setData] = useState<GajiType[]>([]);
  const [pegawaiList, setPegawaiList] = useState<{ id: number; nama: string; nip: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GajiType | null>(null);
  const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1);
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  const [form, setForm] = useState({
    pegawai_id: '', bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear(),
    gaji_pokok: 0, tunjangan: 0, bonus: 0, potongan: 0, total_gaji: 0,
    status: 'belum_dibayar', tanggal_bayar: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [gajiRes, pegawaiRes] = await Promise.all([
      api.get('/gaji', { params: { bulan: filterBulan, tahun: filterTahun } }),
      api.get('/pegawai'),
    ]);
    setData(gajiRes.data);
    setPegawaiList(pegawaiRes.data.map((p: any) => ({ id: p.id, nama: p.nama, nip: p.nip })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filterBulan, filterTahun]);

  const openCreate = () => {
    setEditing(null);
    setForm({ pegawai_id: String(pegawaiList[0]?.id || ''), bulan: filterBulan, tahun: filterTahun, gaji_pokok: 0, tunjangan: 0, bonus: 0, potongan: 0, total_gaji: 0, status: 'belum_dibayar', tanggal_bayar: '' });
    setModalOpen(true);
  };

  const openEdit = (row: GajiType) => {
    setEditing(row);
    setForm({ pegawai_id: String(row.pegawai_id), bulan: row.bulan, tahun: row.tahun, gaji_pokok: row.gaji_pokok, tunjangan: row.tunjangan, bonus: row.bonus, potongan: row.potongan, total_gaji: row.total_gaji, status: row.status, tanggal_bayar: row.tanggal_bayar || '' });
    setModalOpen(true);
  };

  const calculateTotal = () => Number(form.gaji_pokok) + Number(form.tunjangan) + Number(form.bonus) - Number(form.potongan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    const payload = { ...form, pegawai_id: Number(form.pegawai_id), total_gaji: total, tanggal_bayar: form.tanggal_bayar || null };
    if (editing) { await api.put(`/gaji/${editing.id}`, payload); } else { await api.post('/gaji', payload); }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus data gaji ini?')) { await api.delete(`/gaji/${id}`); fetchData(); }
  };

  const columns = [
    { header: 'Pegawai', accessor: (row: GajiType) => row.pegawai?.nama || '-' },
    { header: 'NIP', accessor: (row: GajiType) => row.pegawai?.nip || '-' },
    { header: 'Periode', accessor: (row: GajiType) => `${row.bulan}/${row.tahun}` },
    { header: 'Gaji Pokok', accessor: (row: GajiType) => `Rp ${row.gaji_pokok.toLocaleString('id-ID')}` },
    { header: 'Tunjangan', accessor: (row: GajiType) => `Rp ${row.tunjangan.toLocaleString('id-ID')}` },
    { header: 'Bonus', accessor: (row: GajiType) => `Rp ${row.bonus.toLocaleString('id-ID')}` },
    { header: 'Potongan', accessor: (row: GajiType) => `Rp ${row.potongan.toLocaleString('id-ID')}` },
    { header: 'Total', accessor: (row: GajiType) => `Rp ${row.total_gaji.toLocaleString('id-ID')}` },
    { header: 'Status', accessor: (row: GajiType) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${row.status === 'sudah_dibayar' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
        {row.status === 'sudah_dibayar' ? 'Dibayar' : 'Belum Dibayar'}
      </span>
    )},
  ];

  const totalGaji = data.reduce((sum, g) => sum + g.total_gaji, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gaji</h1>
          <p className="text-sm text-slate-500">Kelola penggajian pegawai</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2">
            <select value={filterBulan} onChange={(e) => setFilterBulan(Number(e.target.value))} className="text-sm outline-none bg-transparent">
              {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
            </select>
            <span className="text-slate-400">/</span>
            <select value={filterTahun} onChange={(e) => setFilterTahun(Number(e.target.value))} className="text-sm outline-none bg-transparent">
              {Array.from({ length: 5 }, (_, i) => (<option key={i} value={new Date().getFullYear() - 2 + i}>{new Date().getFullYear() - 2 + i}</option>))}
            </select>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Tambah Gaji
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-white p-2 rounded-lg"><Wallet className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-slate-500">Total Gaji Bulan Ini</p>
            <p className="text-xl font-bold text-slate-900">Rp {totalGaji.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Gaji' : 'Tambah Gaji'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Pegawai</label>
            <select value={form.pegawai_id} onChange={(e) => setForm({ ...form, pegawai_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
              {pegawaiList.map((p) => (<option key={p.id} value={p.id}>{p.nama} ({p.nip})</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Bulan</label>
              <select value={form.bulan} onChange={(e) => setForm({ ...form, bulan: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label><input type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Gaji Pokok</label><input type="number" value={form.gaji_pokok} onChange={(e) => setForm({ ...form, gaji_pokok: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required min={0} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tunjangan</label><input type="number" value={form.tunjangan} onChange={(e) => setForm({ ...form, tunjangan: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required min={0} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Bonus</label><input type="number" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" min={0} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Potongan</label><input type="number" value={form.potongan} onChange={(e) => setForm({ ...form, potongan: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" min={0} /></div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Total Gaji</span>
              <span className="text-lg font-bold text-emerald-600">Rp {calculateTotal().toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value="belum_dibayar">Belum Dibayar</option><option value="sudah_dibayar">Sudah Dibayar</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Bayar</label><input type="date" value={form.tanggal_bayar} onChange={(e) => setForm({ ...form, tanggal_bayar: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
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
