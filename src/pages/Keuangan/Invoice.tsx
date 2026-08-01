import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Invoice } from '../../types/database';

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    nomor_invoice: '',
    jenjang: 'SD',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
    total: 0,
    status: 'Belum Lunas'
  });

  const [autoGenerate, setAutoGenerate] = useState(true);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const generateInvoiceCode = (jenjang: string) => {
    const date = new Date(formData.tanggal);
    const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const count = invoices.filter(i => i.jenjang === jenjang && i.nomor_invoice.includes(yearMonth)).length + 1;
    return `INV-${jenjang}-${yearMonth}-${count.toString().padStart(4, '0')}`;
  };

  useEffect(() => {
    if (autoGenerate && !editingInvoice) {
      setFormData(prev => ({ ...prev, nomor_invoice: generateInvoiceCode(prev.jenjang) }));
    }
  }, [formData.jenjang, formData.tanggal, autoGenerate, invoices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        const { error } = await supabase.from('invoices').update({
          nomor_invoice: formData.nomor_invoice,
          jenjang: formData.jenjang,
          tanggal: formData.tanggal,
          keterangan: formData.keterangan,
          total: formData.total,
          status: formData.status
        }).eq('id', editingInvoice.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('invoices').insert([formData]);
        if (error) throw error;
      }
      setShowForm(false);
      setEditingInvoice(null);
      setFormData({
        nomor_invoice: '',
        jenjang: 'SD',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        total: 0,
        status: 'Belum Lunas'
      });
      fetchInvoices();
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan saat menyimpan data.');
      console.error('Error saving invoice:', error);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      nomor_invoice: invoice.nomor_invoice,
      jenjang: invoice.jenjang,
      tanggal: invoice.tanggal,
      keterangan: invoice.keterangan,
      total: invoice.total,
      status: invoice.status
    });
    setAutoGenerate(false);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus invoice ini?')) {
      try {
        const { error } = await supabase.from('invoices').delete().eq('id', id);
        if (error) throw error;
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const filteredInvoices = invoices.filter(
    (i) =>
      i.nomor_invoice.toLowerCase().includes(search.toLowerCase()) ||
      i.keterangan.toLowerCase().includes(search.toLowerCase()) ||
      i.jenjang.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoice & Tagihan</h1>
          <p className="text-slate-500 mt-1">Kelola tagihan sekolah per jenjang (KB, TK, SD, SMP, SMA)</p>
        </div>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setAutoGenerate(true);
            setFormData({
              nomor_invoice: generateInvoiceCode('SD'),
              jenjang: 'SD',
              tanggal: new Date().toISOString().split('T')[0],
              keterangan: '',
              total: 0,
              status: 'Belum Lunas'
            });
            setShowForm(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Invoice</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor invoice, keterangan, jenjang..."
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
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">No. Invoice</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Jenjang</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Tanggal</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Keterangan</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Total (Rp)</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Tidak ada data invoice ditemukan.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{inv.nomor_invoice}</td>
                    <td className="px-6 py-4"><span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium">{inv.jenjang}</span></td>
                    <td className="px-6 py-4 text-slate-600">{inv.tanggal}</td>
                    <td className="px-6 py-4">{inv.keterangan}</td>
                    <td className="px-6 py-4 text-right font-medium">{new Intl.NumberFormat('id-ID').format(inv.total)}</td>
                    <td className="px-6 py-4">
                      {inv.status === 'Lunas' ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium"><CheckCircle2 className="w-4 h-4"/> Lunas</span>
                      ) : (
                        <span className="text-amber-600 text-sm font-medium">Belum Lunas</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(inv)}
                          className="text-slate-400 hover:text-emerald-600 p-2 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="text-slate-400 hover:text-red-600 p-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingInvoice ? 'Edit Invoice' : 'Buat Invoice Baru'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenjang</label>
                  <select
                    value={formData.jenjang}
                    onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="KB">KB</option>
                    <option value="TK">TK</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                  <span>Nomor Invoice</span>
                  {!editingInvoice && (
                    <label className="flex items-center gap-1 text-xs text-emerald-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoGenerate} 
                        onChange={(e) => setAutoGenerate(e.target.checked)} 
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Otomatis
                    </label>
                  )}
                </label>
                <input
                  type="text"
                  required
                  disabled={autoGenerate && !editingInvoice}
                  value={formData.nomor_invoice}
                  onChange={(e) => setFormData({ ...formData, nomor_invoice: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="INV-SD-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan / Nama Siswa</label>
                <input
                  type="text"
                  required
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="SPP Bulan Juni - Ahmad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.total || ''}
                  onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status Pembayaran</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
