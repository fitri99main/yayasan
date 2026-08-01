import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

type Akun = {
  id: string;
  kode: string;
  nama: string;
  saldo_normal: string;
};

type Sekolah = {
  id: string;
  nama: string;
  jenjang: string;
  kode_invoice: string;
};

export default function BukuBesar() {
  const { user } = useAuthStore();
  const isAdmin = true; // Replace with proper check if needed

  const [data, setData] = useState<any>(null);
  const [akuns, setAkuns] = useState<Akun[]>([]);
  const [sekolahs, setSekolahs] = useState<Sekolah[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  
  // Filters
  const [selectedAkunId, setSelectedAkunId] = useState(searchParams.get('akun_id') || '');
  const [selectedPrefix, setSelectedPrefix] = useState(searchParams.get('prefix') || '');
  
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [akunRes, sekolahRes] = await Promise.all([
          supabase.from('daftar_akun').select('id, kode, nama, saldo_normal').order('kode', { ascending: true }),
          isAdmin ? supabase.from('sekolah').select('*') : Promise.resolve({ data: [] })
        ]);
        setAkuns(akunRes.data || []);
        if (isAdmin) setSekolahs(sekolahRes.data || []);
      } catch (error) {
        console.error('Error fetching init data:', error);
      }
    };
    fetchInit();
  }, [isAdmin]);

  useEffect(() => {
    const queryAkunId = searchParams.get('akun_id');
    const queryPrefix = searchParams.get('prefix');
    
    if (queryAkunId) setSelectedAkunId(queryAkunId);
    if (queryPrefix) setSelectedPrefix(queryPrefix);
  }, [searchParams]);

  useEffect(() => {
    if (selectedAkunId) {
      fetchData();
    }
  }, [selectedPrefix, selectedAkunId]);

  const fetchData = async () => {
    if (!selectedAkunId) {
      return;
    }
    
    setLoading(true);
    try {
      const akun = akuns.find(a => a.id === selectedAkunId);
      if (!akun) throw new Error('Akun tidak ditemukan');

      let queryAwal = supabase
        .from('jurnal_detail')
        .select(`
          debit, 
          kredit,
          jurnal:jurnal_umum!inner(tanggal, nomor_bukti)
        `)
        .eq('akun_id', selectedAkunId)
        .lt('jurnal.tanggal', startDate);

      if (selectedPrefix) {
        queryAwal = queryAwal.like('jurnal.nomor_bukti', `${selectedPrefix}%`);
      }

      const { data: dataAwal, error: errorAwal } = await queryAwal;
      if (errorAwal) throw errorAwal;

      let saldoAwal = 0;
      dataAwal?.forEach((d: any) => {
        const debit = Number(d.debit);
        const kredit = Number(d.kredit);
        if (akun.saldo_normal === 'Debit') {
          saldoAwal += debit - kredit;
        } else {
          saldoAwal += kredit - debit;
        }
      });

      let queryMutasi = supabase
        .from('jurnal_detail')
        .select(`
          debit, 
          kredit,
          keterangan,
          jurnal:jurnal_umum!inner(tanggal, nomor_bukti, keterangan)
        `)
        .eq('akun_id', selectedAkunId)
        .gte('jurnal.tanggal', startDate)
        .lte('jurnal.tanggal', endDate)
        .order('jurnal(tanggal)', { ascending: true });

      if (selectedPrefix) {
        queryMutasi = queryMutasi.like('jurnal.nomor_bukti', `${selectedPrefix}%`);
      }

      const { data: dataMutasi, error: errorMutasi } = await queryMutasi;
      if (errorMutasi) throw errorMutasi;

      const mutasiFormat = dataMutasi?.map((d: any) => ({
        tanggal: d.jurnal.tanggal,
        nomor_bukti: d.jurnal.nomor_bukti,
        jurnal_keterangan: d.jurnal.keterangan,
        keterangan: d.keterangan,
        debit: d.debit,
        kredit: d.kredit
      })) || [];

      mutasiFormat.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

      setData({
        akun: akun,
        saldo_awal: saldoAwal,
        mutasi: mutasiFormat
      });

    } catch (error) {
      console.error('Error fetching buku besar:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  let runningSaldo = data ? Number(data.saldo_awal) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Buku Besar</h1>
        <p className="text-slate-500 mt-1">Laporan mutasi per akun (General Ledger)</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
        {isAdmin && (
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Cabang / Sekolah</label>
            <select
              value={selectedPrefix}
              onChange={(e) => setSelectedPrefix(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Semua Cabang (Konsolidasi)</option>
              <option value="INV-YAYASAN">Yayasan Pusat</option>
              {sekolahs.map(s => {
                const prefix = s.kode_invoice || `INV-${s.jenjang.toUpperCase().trim()}`;
                return <option key={s.id} value={prefix}>{s.nama} ({prefix})</option>
              })}
            </select>
          </div>
        )}
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Akun</label>
          <select
            value={selectedAkunId}
            onChange={(e) => setSelectedAkunId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- Pilih Akun --</option>
            {akuns.map(a => (
              <option key={a.id} value={a.id}>{a.kode} - {a.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={fetchData}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Memuat laporan...</div>
      ) : data ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Buku Besar: {data.akun.kode} - {data.akun.nama}</h3>
              <p className="text-sm text-slate-500">Periode: {startDate} s.d. {endDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Saldo Normal</p>
              <p className="font-semibold text-emerald-600">{data.akun.saldo_normal}</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">Tanggal</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">No. Bukti</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">Keterangan</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200 text-right">Debit</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200 text-right">Kredit</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-orange-50">
                  <td colSpan={5} className="px-4 py-3 font-semibold text-right border border-slate-200">SALDO AWAL</td>
                  <td className="px-4 py-3 font-semibold text-right border border-slate-200">{formatRp(runningSaldo)}</td>
                </tr>
                {data.mutasi.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 border border-slate-200">Tidak ada mutasi pada periode ini.</td>
                  </tr>
                ) : (
                  data.mutasi.map((m: any, idx: number) => {
                    const debit = Number(m.debit);
                    const kredit = Number(m.kredit);
                    if (data.akun.saldo_normal === 'Debit') {
                      runningSaldo = runningSaldo + debit - kredit;
                    } else {
                      runningSaldo = runningSaldo + kredit - debit;
                    }
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 border border-slate-200">{m.tanggal}</td>
                        <td className="px-4 py-2 border border-slate-200 text-emerald-600 font-medium">{m.nomor_bukti}</td>
                        <td className="px-4 py-2 border border-slate-200">
                          <div>{m.jurnal_keterangan}</div>
                          {m.keterangan && <div className="text-sm text-slate-500 italic">{m.keterangan}</div>}
                        </td>
                        <td className="px-4 py-2 border border-slate-200 text-right">{debit > 0 ? formatRp(debit) : '-'}</td>
                        <td className="px-4 py-2 border border-slate-200 text-right">{kredit > 0 ? formatRp(kredit) : '-'}</td>
                        <td className="px-4 py-2 border border-slate-200 text-right font-medium">{formatRp(runningSaldo)}</td>
                      </tr>
                    );
                  })
                )}
                <tr className="bg-slate-100">
                  <td colSpan={5} className="px-4 py-3 font-bold text-right border border-slate-200">SALDO AKHIR</td>
                  <td className="px-4 py-3 font-bold text-right text-emerald-700 border border-slate-200">{formatRp(runningSaldo)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
