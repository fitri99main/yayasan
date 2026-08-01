import { useState, useEffect } from 'react';
import { Plus, Search, FileText, CheckCircle2, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

type Akun = {
  id: string;
  kode: string;
  nama: string;
};

type Sekolah = {
  id: string;
  nama: string;
  jenjang: string;
  kode_invoice: string;
};

type JurnalDetail = {
  id: string;
  jurnal_id: string;
  akun_id: string;
  debit: number;
  kredit: number;
  keterangan: string | null;
  akun?: Akun;
};

type Jurnal = {
  id: string;
  yayasan_id: string;
  tanggal: string;
  nomor_bukti: string;
  keterangan: string;
  total_debit: number;
  total_kredit: number;
  status: string;
  created_at: string;
  jurnal_detail?: JurnalDetail[];
};

export default function JurnalUmum() {
  const [jurnals, setJurnals] = useState<Jurnal[]>([]);
  const [akuns, setAkuns] = useState<Akun[]>([]);
  const [sekolahs, setSekolahs] = useState<Sekolah[]>([]);
  const [yayasanId, setYayasanId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [tanggal, setTanggal] = useState('');
  const [nomorBukti, setNomorBukti] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [details, setDetails] = useState([{ id: Math.random().toString(), akun_id: '', debit: 0, kredit: 0, keterangan: '', _searchText: '' }]);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [selectedCabang, setSelectedCabang] = useState('');
  const { user } = useAuthStore();
  
  // Need a robust permission check here. Assuming admin for now.
  const isAdmin = true;

  const [selectedJurnal, setSelectedJurnal] = useState<Jurnal | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: yData } = await supabase.from('yayasan').select('id').limit(1).single();
      if (yData) setYayasanId(yData.id);

      const [jurnalRes, akunRes, sekolahRes] = await Promise.all([
        supabase.from('jurnal_umum').select('*, jurnal_detail(*, akun:daftar_akun(kode, nama))').order('created_at', { ascending: false }),
        supabase.from('daftar_akun').select('id, kode, nama').order('kode', { ascending: true }),
        supabase.from('sekolah').select('*')
      ]);
      setJurnals(jurnalRes.data as any || []);
      setAkuns(akunRes.data || []);
      setSekolahs(sekolahRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateNomorBukti = (tgl: string, currentUser: any, existingJurnals: Jurnal[], sekolahList: Sekolah[], chosenPrefix?: string) => {
    let prefix = 'INV-YAYASAN'; // Default prefix
    
    if (chosenPrefix) {
      prefix = chosenPrefix;
    } else {
      // Logic for automatic prefix generation can be enhanced based on current user context
      const searchString = `${currentUser?.name || ''} ${currentUser?.email || ''}`.toUpperCase();
      const safeSearchString = searchString.replace(/[^a-zA-Z0-9]/g, ' ');
      
      const sortedSekolah = [...sekolahList].sort((a, b) => (b.jenjang?.length || 0) - (a.jenjang?.length || 0));
      
      const matchedSekolah = sortedSekolah.find(s => {
        if (!s.jenjang) return false;
        const jenjang = s.jenjang.toUpperCase().trim();
        if (!jenjang) return false;
        const regex = new RegExp(`\\b${jenjang}\\b`);
        return regex.test(safeSearchString);
      });
      
      if (matchedSekolah) {
        prefix = matchedSekolah.kode_invoice || `INV-${matchedSekolah.jenjang.toUpperCase().trim()}`;
      }
    }

    const date = new Date(tgl || new Date());
    const year = date.getFullYear();
    
    const count = existingJurnals.filter(j => j.nomor_bukti.includes(`${prefix}-${year}`)).length + 1;
    return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
  };

  useEffect(() => {
    if (autoGenerate && isModalOpen && !selectedJurnal) {
      setNomorBukti(generateNomorBukti(tanggal, user, jurnals, sekolahs, selectedCabang));
    }
  }, [tanggal, autoGenerate, user, jurnals, sekolahs, isModalOpen, selectedJurnal, selectedCabang]);

  const totalDebit = details.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
  const totalKredit = details.reduce((sum, item) => sum + (Number(item.kredit) || 0), 0);
  const isBalance = totalDebit > 0 && totalDebit === totalKredit;

  const handleAddLine = () => {
    setDetails([...details, { id: Math.random().toString(), akun_id: '', debit: 0, kredit: 0, keterangan: '', _searchText: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    if (details.length > 1) {
      const newDetails = [...details];
      newDetails.splice(index, 1);
      setDetails(newDetails);
    }
  };

  const handleDetailChange = (index: number, field: string, value: any) => {
    const newDetails = [...details];
    (newDetails[index] as any)[field] = value;
    setDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalance) {
      alert('Total Debit dan Kredit belum seimbang!');
      return;
    }

    if (details.some(d => !d.akun_id)) {
      alert('Harap pilih akun untuk semua baris!');
      return;
    }

    try {
      const payloadJurnal = {
        yayasan_id: yayasanId,
        tanggal: tanggal,
        nomor_bukti: nomorBukti,
        keterangan: keterangan,
        total_debit: totalDebit,
        total_kredit: totalKredit,
        status: 'draft',
      };
      
      if (editingId) {
        // Update jurnal_umum
        const { error: jurnalError } = await supabase.from('jurnal_umum').update(payloadJurnal).eq('id', editingId);
        if (jurnalError) throw jurnalError;
        
        // Replace detail: delete old, insert new
        await supabase.from('jurnal_detail').delete().eq('jurnal_id', editingId);
        
        const payloadDetails = details.map(d => ({
          jurnal_id: editingId,
          akun_id: d.akun_id,
          debit: d.debit,
          kredit: d.kredit,
          keterangan: d.keterangan || null
        }));
        
        const { error: detailError } = await supabase.from('jurnal_detail').insert(payloadDetails);
        if (detailError) throw detailError;
      } else {
        // Insert new jurnal_umum
        const { data: newJurnal, error: jurnalError } = await supabase.from('jurnal_umum').insert([payloadJurnal]).select().single();
        if (jurnalError) throw jurnalError;
        
        const payloadDetails = details.map(d => ({
          jurnal_id: newJurnal.id,
          akun_id: d.akun_id,
          debit: d.debit,
          kredit: d.kredit,
          keterangan: d.keterangan || null
        }));
        
        const { error: detailError } = await supabase.from('jurnal_detail').insert(payloadDetails);
        if (detailError) throw detailError;
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Gagal menyimpan jurnal.');
    }
  };

  const openModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingId(null);
    setTanggal(today);
    setAutoGenerate(true);
    setSelectedCabang('');
    setNomorBukti(generateNomorBukti(today, user, jurnals, sekolahs, ''));
    setKeterangan('');
    setDetails([
      { id: Math.random().toString(), akun_id: '', debit: 0, kredit: 0, keterangan: '', _searchText: '' },
      { id: Math.random().toString(), akun_id: '', debit: 0, kredit: 0, keterangan: '', _searchText: '' }
    ]);
    setSelectedJurnal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (jurnal: Jurnal) => {
    setEditingId(jurnal.id);
    setTanggal(jurnal.tanggal);
    setAutoGenerate(false);
    setNomorBukti(jurnal.nomor_bukti);
    setKeterangan(jurnal.keterangan);
    setDetails(jurnal.jurnal_detail?.map(d => ({
      id: d.id.toString(),
      akun_id: d.akun_id,
      debit: Number(d.debit),
      kredit: Number(d.kredit),
      keterangan: d.keterangan || '',
      _searchText: `${d.akun?.kode} - ${d.akun?.nama}`
    })) || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (jurnal: Jurnal) => {
    if (window.confirm(`Yakin ingin menghapus jurnal ${jurnal.nomor_bukti}?`)) {
      try {
        const { error } = await supabase.from('jurnal_umum').delete().eq('id', jurnal.id);
        if (error) throw error;
        fetchData();
      } catch (error: any) {
        alert(error.message || 'Gagal menghapus jurnal.');
      }
    }
  };

  const filteredJurnals = jurnals.filter(
    (j) =>
      j.nomor_bukti.toLowerCase().includes(search.toLowerCase()) ||
      j.keterangan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jurnal Umum</h1>
          <p className="text-slate-500 mt-1">Pencatatan transaksi akuntansi berpasangan</p>
        </div>
        <button
          onClick={openModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Jurnal</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor bukti atau keterangan..."
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
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Tanggal</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">No. Bukti</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Keterangan</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Total (Rp)</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : filteredJurnals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Tidak ada jurnal ditemukan.</td>
                </tr>
              ) : (
                filteredJurnals.map((jurnal) => (
                  <tr key={jurnal.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">{jurnal.tanggal}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600">{jurnal.nomor_bukti}</td>
                    <td className="px-6 py-4">{jurnal.keterangan}</td>
                    <td className="px-6 py-4">{new Intl.NumberFormat('id-ID').format(jurnal.total_debit)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(jurnal)}
                        className="text-emerald-600 hover:text-emerald-700 p-1.5 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(jurnal)}
                        className="text-red-500 hover:text-red-700 p-1.5 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedJurnal(jurnal)}
                        className="text-blue-600 hover:text-blue-800 p-1.5 transition-colors"
                        title="Lihat Detail"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Jurnal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? 'Edit Jurnal' : 'Buat Jurnal Baru'}</h3>
              {isBalance ? (
                <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> Balance
                </span>
              ) : (
                <span className="text-red-600 text-sm font-medium bg-red-50 px-3 py-1 rounded-full">
                  Unbalanced
                </span>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                {isAdmin && !editingId && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cabang / Sekolah</label>
                    <select
                      value={selectedCabang}
                      onChange={(e) => setSelectedCabang(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Yayasan Pusat</option>
                      {sekolahs.map(s => {
                        const prefix = s.kode_invoice || `INV-${s.jenjang?.toUpperCase().trim()}`;
                        return <option key={s.id} value={prefix}>{s.nama} ({prefix})</option>
                      })}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                    <span>Nomor Bukti / Invoice</span>
                    <label className="flex items-center gap-1 text-xs text-emerald-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoGenerate} 
                        onChange={(e) => setAutoGenerate(e.target.checked)} 
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Otomatis
                    </label>
                  </label>
                  <input
                    type="text"
                    value={nomorBukti}
                    onChange={(e) => setNomorBukti(e.target.value)}
                    disabled={autoGenerate}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan Umum</label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-sm font-semibold text-slate-600 w-1/3">Akun</th>
                      <th className="px-4 py-2 text-sm font-semibold text-slate-600">Keterangan Detail (Opsional)</th>
                      <th className="px-4 py-2 text-sm font-semibold text-slate-600 w-40">Debit (Rp)</th>
                      <th className="px-4 py-2 text-sm font-semibold text-slate-600 w-40">Kredit (Rp)</th>
                      <th className="px-4 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail, idx) => {
                      const rowId = detail.id || idx;
                      return (
                      <tr key={rowId} className="border-t border-slate-200">
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            list={`akun-list-${rowId}`}
                            value={detail._searchText !== undefined ? detail._searchText : (detail.akun_id ? `${akuns.find(a => a.id === detail.akun_id)?.kode} - ${akuns.find(a => a.id === detail.akun_id)?.nama}` : '')}
                            onChange={(e) => {
                              const text = e.target.value;
                              const matchedAkun = akuns.find(a => `${a.kode} - ${a.nama}` === text);
                              const newDetails = [...details];
                              newDetails[idx] = {
                                ...newDetails[idx],
                                _searchText: text,
                                akun_id: matchedAkun ? matchedAkun.id : ''
                              };
                              setDetails(newDetails);
                            }}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            placeholder="Ketik untuk mencari akun..."
                            required
                          />
                          <datalist id={`akun-list-${rowId}`}>
                            {akuns.map(a => (
                              <option key={a.id} value={`${a.kode} - ${a.nama}`} />
                            ))}
                          </datalist>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={detail.keterangan || ''}
                            onChange={(e) => handleDetailChange(idx, 'keterangan', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            placeholder="Keterangan..."
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={detail.debit || ''}
                            onChange={(e) => {
                              handleDetailChange(idx, 'debit', Number(e.target.value));
                              if (Number(e.target.value) > 0) handleDetailChange(idx, 'kredit', 0);
                            }}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-right"
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={detail.kredit || ''}
                            onChange={(e) => {
                              handleDetailChange(idx, 'kredit', Number(e.target.value));
                              if (Number(e.target.value) > 0) handleDetailChange(idx, 'debit', 0);
                            }}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-right"
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          {details.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 font-semibold text-right">TOTAL</td>
                      <td className={`px-4 py-3 text-right font-semibold ${isBalance ? 'text-emerald-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('id-ID').format(totalDebit)}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${isBalance ? 'text-emerald-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('id-ID').format(totalKredit)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="mt-3 text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Tambah Baris
                </button>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isBalance}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lihat Jurnal */}
      {selectedJurnal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Detail Jurnal Umum</h3>
              <button onClick={() => setSelectedJurnal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500">Nomor Bukti</p>
                  <p className="font-semibold text-slate-800">{selectedJurnal.nomor_bukti}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tanggal</p>
                  <p className="font-semibold text-slate-800">{selectedJurnal.tanggal}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Keterangan</p>
                  <p className="font-semibold text-slate-800">{selectedJurnal.keterangan}</p>
                </div>
              </div>

              <table className="w-full text-left border-collapse border border-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-sm font-semibold text-slate-600">Kode Akun</th>
                    <th className="px-4 py-2 text-sm font-semibold text-slate-600">Nama Akun</th>
                    <th className="px-4 py-2 text-sm font-semibold text-slate-600">Keterangan</th>
                    <th className="px-4 py-2 text-sm font-semibold text-slate-600 text-right">Debit</th>
                    <th className="px-4 py-2 text-sm font-semibold text-slate-600 text-right">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedJurnal.jurnal_detail?.map((detail) => (
                    <tr key={detail.id} className="border-t border-slate-200">
                      <td className="px-4 py-2">{detail.akun?.kode}</td>
                      <td className="px-4 py-2">{detail.akun?.nama}</td>
                      <td className="px-4 py-2 text-sm">{detail.keterangan || '-'}</td>
                      <td className="px-4 py-2 text-right">{detail.debit > 0 ? new Intl.NumberFormat('id-ID').format(detail.debit) : '-'}</td>
                      <td className="px-4 py-2 text-right">{detail.kredit > 0 ? new Intl.NumberFormat('id-ID').format(detail.kredit) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-bold text-right">TOTAL</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{new Intl.NumberFormat('id-ID').format(selectedJurnal.total_debit)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{new Intl.NumberFormat('id-ID').format(selectedJurnal.total_kredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedJurnal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
