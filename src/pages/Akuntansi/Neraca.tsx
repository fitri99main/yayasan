import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function Neraca() {
  const { user } = useAuthStore();
  const isAdmin = true;
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [sekolahs, setSekolahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchInit = async () => {
      if (isAdmin) {
        try {
          const { data, error } = await supabase.from('sekolah').select('*');
          if (!error && data) setSekolahs(data);
        } catch (error) {
          console.error('Error fetching sekolah:', error);
        }
      }
    };
    fetchInit();
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [selectedPrefix]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: akunData, error: akunError } = await supabase
        .from('daftar_akun')
        .select('id, kode, nama, kategori, saldo_normal');
        
      if (akunError) throw akunError;

      let query = supabase
        .from('jurnal_detail')
        .select(`
          akun_id,
          debit,
          kredit,
          jurnal:jurnal_umum!inner(tanggal, nomor_bukti)
        `);

      if (endDate) {
        query = query.lte('jurnal.tanggal', endDate);
      }
      if (selectedPrefix) {
        query = query.like('jurnal.nomor_bukti', `${selectedPrefix}%`);
      }

      const { data: mutasiData, error: mutasiError } = await query;
      if (mutasiError) throw mutasiError;

      const result = {
        harta: [] as any[],
        kewajiban: [] as any[],
        modal: [] as any[],
        total_harta: 0,
        total_kewajiban: 0,
        total_modal: 0,
        laba_berjalan: 0,
        total_kewajiban_modal: 0
      };

      const akunMap = new Map();
      akunData?.forEach(a => {
        akunMap.set(a.id, {
          id: a.id,
          kode_akun: a.kode,
          nama_akun: a.nama,
          kategori: a.kategori,
          saldo_normal: a.saldo_normal,
          saldo: 0
        });
      });

      mutasiData?.forEach((m: any) => {
        const akun = akunMap.get(m.akun_id);
        if (akun) {
          const debit = Number(m.debit);
          const kredit = Number(m.kredit);
          if (akun.saldo_normal === 'Debit') {
            akun.saldo += debit - kredit;
          } else {
            akun.saldo += kredit - debit;
          }
        }
      });

      let totalPendapatan = 0;
      let totalBeban = 0;

      Array.from(akunMap.values()).forEach(akun => {
        if (akun.kategori === 'Harta') {
          result.harta.push(akun);
          result.total_harta += akun.saldo;
        } else if (akun.kategori === 'Kewajiban') {
          result.kewajiban.push(akun);
          result.total_kewajiban += akun.saldo;
        } else if (akun.kategori === 'Modal') {
          result.modal.push(akun);
          result.total_modal += akun.saldo;
        } else if (akun.kategori === 'Pendapatan') {
          totalPendapatan += akun.saldo;
        } else if (akun.kategori === 'Beban') {
          totalBeban += akun.saldo;
        }
      });

      result.laba_berjalan = totalPendapatan - totalBeban;
      result.total_kewajiban_modal = result.total_kewajiban + result.total_modal + result.laba_berjalan;

      result.harta.sort((a, b) => a.kode_akun.localeCompare(b.kode_akun));
      result.kewajiban.sort((a, b) => a.kode_akun.localeCompare(b.kode_akun));
      result.modal.sort((a, b) => a.kode_akun.localeCompare(b.kode_akun));
      
      setData(result);
    } catch (error) {
      console.error('Error fetching neraca:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Laporan Neraca</h1>
        <p className="text-slate-500 mt-1">Laporan posisi keuangan (Aktiva vs Pasiva)</p>
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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Per Tanggal</label>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-5xl mx-auto">
          <div className="p-6 text-center border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold uppercase text-slate-800">Yayasan Pendidikan</h2>
            <h3 className="text-lg font-semibold text-slate-600">Laporan Posisi Keuangan (Neraca)</h3>
            <p className="text-sm text-slate-500">Per {endDate}</p>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AKTIVA (HARTA) */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 uppercase border-b-2 border-emerald-500 pb-2">Aktiva (Harta)</h4>
              <table className="w-full">
                <tbody>
                  {data.harta.map((item: any) => (
                    item.saldo !== 0 && (
                      <tr 
                        key={item.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                        onClick={() => navigate(`/akuntansi/buku-besar?akun_id=${item.id}&prefix=${selectedPrefix}`)}
                      >
                        <td className="py-2 text-slate-600 group-hover:text-emerald-600 group-hover:font-medium transition-colors">
                          {item.kode_akun} - {item.nama_akun}
                        </td>
                        <td className="py-2 text-right text-slate-700">{formatRp(item.saldo)}</td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
              <div className="mt-8 border-t-2 border-slate-400 flex justify-between items-center py-2">
                <span className="font-bold text-slate-800">TOTAL AKTIVA</span>
                <span className="font-bold text-emerald-700 text-lg">{formatRp(data.total_harta)}</span>
              </div>
            </div>

            {/* PASIVA (KEWAJIBAN & MODAL) */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 uppercase border-b-2 border-blue-500 pb-2">Pasiva</h4>
              
              <div className="mb-4">
                <h5 className="font-semibold text-slate-700 mb-2">Kewajiban (Hutang)</h5>
                <table className="w-full">
                  <tbody>
                    {data.kewajiban.map((item: any) => (
                      item.saldo !== 0 && (
                        <tr 
                          key={item.id}
                          className="hover:bg-slate-50 cursor-pointer transition-colors group"
                          onClick={() => navigate(`/akuntansi/buku-besar?akun_id=${item.id}&prefix=${selectedPrefix}`)}
                        >
                          <td className="py-2 text-slate-600 pl-4 group-hover:text-emerald-600 group-hover:font-medium transition-colors">
                            {item.kode_akun} - {item.nama_akun}
                          </td>
                          <td className="py-2 text-right text-slate-700">{formatRp(item.saldo)}</td>
                        </tr>
                      )
                    ))}
                    <tr>
                      <td className="py-1.5 font-medium text-slate-700 pl-4 pt-2">Total Kewajiban</td>
                      <td className="py-1.5 text-right font-medium text-slate-800 pt-2 border-t border-slate-200">
                        {formatRp(data.total_kewajiban)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h5 className="font-semibold text-slate-700 mb-2">Modal (Ekuitas)</h5>
                <table className="w-full">
                  <tbody>
                    {data.modal.map((item: any) => (
                      item.saldo !== 0 && (
                        <tr 
                          key={item.id}
                          className="hover:bg-slate-50 cursor-pointer transition-colors group"
                          onClick={() => navigate(`/akuntansi/buku-besar?akun_id=${item.id}&prefix=${selectedPrefix}`)}
                        >
                          <td className="py-2 text-slate-600 pl-4 group-hover:text-emerald-600 group-hover:font-medium transition-colors">
                            {item.kode_akun} - {item.nama_akun}
                          </td>
                          <td className="py-2 text-right text-slate-700">{formatRp(item.saldo)}</td>
                        </tr>
                      )
                    ))}
                    <tr>
                      <td className="py-1.5 text-slate-600 pl-4 text-sm font-medium italic">Surplus/(Defisit) Berjalan</td>
                      <td className={`py-1.5 text-right font-medium text-sm italic ${data.laba_berjalan >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatRp(data.laba_berjalan)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 border-t-2 border-slate-400 flex justify-between items-center py-2">
                <span className="font-bold text-slate-800">TOTAL PASIVA</span>
                <span className={`font-bold text-lg ${data.total_kewajiban_modal === data.total_harta ? 'text-emerald-700' : 'text-red-600'}`}>
                  {formatRp(data.total_kewajiban_modal)}
                </span>
              </div>
              
              {data.total_harta !== data.total_kewajiban_modal && (
                <div className="mt-2 text-right text-xs text-red-500 font-bold">
                  *Peringatan: Neraca Tidak Balance! (Selisih: {formatRp(Math.abs(data.total_harta - data.total_kewajiban_modal))})
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
