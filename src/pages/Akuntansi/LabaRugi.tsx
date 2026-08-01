import { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Akun } from '../../types/database';
import { useAuthStore } from '../../store/authStore';

export default function LabaRugi() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'super admin';
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [sekolahs, setSekolahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchInit = async () => {
      if (isAdmin) {
        try {
          const res = await api.get('/sekolah');
          setSekolahs(res.data);
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
      const res = await api.get('/laporan/laba-rugi', {
        params: { 
          start_date: startDate || undefined, 
          end_date: endDate,
          ...(selectedPrefix ? { prefix: selectedPrefix } : {})
        }
      });
      setData(res.data);
    } catch (error) {
      console.error('Error fetching laba rugi:', error);
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
        <h1 className="text-2xl font-bold text-slate-800">Laporan Laba Rugi</h1>
        <p className="text-slate-500 mt-1">Laporan aktivitas pendapatan dan beban Yayasan</p>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto">
          <div className="p-6 text-center border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold uppercase text-slate-800">Yayasan Pendidikan</h2>
            <h3 className="text-lg font-semibold text-slate-600">Laporan Laba Rugi</h3>
            <p className="text-sm text-slate-500">Periode {startDate ? startDate : 'Awal'} s.d. {endDate}</p>
          </div>
          
          <div className="p-8">
            {/* PENDAPATAN */}
            <div className="mb-6">
              <h4 className="font-bold text-slate-800 mb-3 uppercase border-b border-slate-200 pb-2">Pendapatan</h4>
              <table className="w-full">
                <tbody>
                  {data.pendapatan.map((item: any) => (
                    item.saldo > 0 && (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                        onClick={() => navigate(`/akuntansi/buku-besar?akun_id=${item.id}&prefix=${selectedPrefix}`)}
                      >
                        <td className="py-2 text-slate-600 pl-4 group-hover:text-emerald-600 group-hover:font-medium transition-colors">
                          {item.kode_akun} - {item.nama_akun}
                        </td>
                        <td className="py-2 text-right text-slate-700 pr-4">{formatRp(item.saldo)}</td>
                      </tr>
                    )
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-3 font-semibold text-slate-800 pl-4 pt-4">Total Pendapatan</td>
                    <td className="py-3 text-right font-bold text-emerald-600 pt-4 border-t border-slate-300">
                      {formatRp(data.total_pendapatan)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* BEBAN */}
            <div className="mb-6">
              <h4 className="font-bold text-slate-800 mb-3 uppercase border-b border-slate-200 pb-2 mt-8">Beban (Biaya)</h4>
              <table className="w-full">
                <tbody>
                  {data.beban.map((item: any) => (
                    item.saldo > 0 && (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                        onClick={() => navigate(`/akuntansi/buku-besar?akun_id=${item.id}&prefix=${selectedPrefix}`)}
                      >
                        <td className="py-2 text-slate-600 pl-4 group-hover:text-emerald-600 group-hover:font-medium transition-colors">
                          {item.kode_akun} - {item.nama_akun}
                        </td>
                        <td className="py-2 text-right text-slate-700 pr-4">{formatRp(item.saldo)}</td>
                      </tr>
                    )
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-3 font-semibold text-slate-800 pl-4 pt-4">Total Beban</td>
                    <td className="py-3 text-right font-bold text-red-600 pt-4 border-t border-slate-300">
                      ({formatRp(data.total_beban)})
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* LABA BERSIH */}
            <div className="mt-8 pt-4 border-t-2 border-slate-400">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2 text-lg font-bold text-slate-900 uppercase">Surplus / (Defisit) Bersih</td>
                    <td className={`py-2 text-right text-xl font-bold ${data.laba_rugi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatRp(data.laba_rugi)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
