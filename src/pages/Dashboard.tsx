import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Users,
  School,
  Briefcase,
  Layers,
  CalendarCheck,
  Wallet,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Stats {
  totalPegawai: number;
  aktif: number;
  totalSekolah: number;
  totalJabatan: number;
  totalDivisi: number;
  hadirHariIni: number;
  gajiBulanan: number;
  cutiPending: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPegawai: 0,
    aktif: 0,
    totalSekolah: 0,
    totalJabatan: 0,
    totalDivisi: 0,
    hadirHariIni: 0,
    gajiBulanan: 0,
    cutiPending: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const monthYear = format(new Date(), 'yyyy-MM');

        // Parallel requests
        const [
          { count: totalPegawai },
          { count: aktif },
          { count: totalSekolah },
          { count: totalJabatan },
          { count: totalDivisi },
          { count: hadirHariIni },
          { data: gajiData },
          { count: cutiPending },
          { data: recentPegawai }
        ] = await Promise.all([
          supabase.from('pegawai').select('id', { count: 'exact', head: true }),
          supabase.from('pegawai').select('id', { count: 'exact', head: true }).eq('status_aktif', true),
          supabase.from('sekolah').select('id', { count: 'exact', head: true }),
          supabase.from('jabatan').select('id', { count: 'exact', head: true }),
          supabase.from('divisi').select('id', { count: 'exact', head: true }),
          supabase.from('absensi').select('id', { count: 'exact', head: true }).eq('tanggal', today).eq('status', 'Hadir'),
          supabase.from('gaji').select('total_gaji_bersih').eq('periode', monthYear),
          supabase.from('cuti').select('id', { count: 'exact', head: true }).eq('status', 'Menunggu'),
          supabase.from('pegawai').select('id, nama, nip, created_at, jabatan(nama), sekolah(nama)').order('created_at', { ascending: false }).limit(5)
        ]);

        const gajiBulanan = gajiData?.reduce((sum, item) => sum + (Number(item.total_gaji_bersih) || 0), 0) || 0;

        setStats({
          totalPegawai: totalPegawai || 0,
          aktif: aktif || 0,
          totalSekolah: totalSekolah || 0,
          totalJabatan: totalJabatan || 0,
          totalDivisi: totalDivisi || 0,
          hadirHariIni: hadirHariIni || 0,
          gajiBulanan,
          cutiPending: cutiPending || 0,
        });

        setRecent(recentPegawai || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Pegawai', value: stats.totalPegawai, icon: Users, color: 'bg-blue-500', text: 'text-blue-600' },
    { label: 'Pegawai Aktif', value: stats.aktif, icon: TrendingUp, color: 'bg-emerald-500', text: 'text-emerald-600' },
    { label: 'Sekolah', value: stats.totalSekolah, icon: School, color: 'bg-amber-500', text: 'text-amber-600' },
    { label: 'Jabatan', value: stats.totalJabatan, icon: Briefcase, color: 'bg-violet-500', text: 'text-violet-600' },
    { label: 'Divisi', value: stats.totalDivisi, icon: Layers, color: 'bg-rose-500', text: 'text-rose-600' },
    { label: 'Hadir Hari Ini', value: stats.hadirHariIni, icon: CalendarCheck, color: 'bg-teal-500', text: 'text-teal-600' },
    { label: 'Gaji Bulan Ini', value: `Rp ${stats.gajiBulanan.toLocaleString('id-ID')}`, icon: Wallet, color: 'bg-slate-600', text: 'text-slate-600' },
    { label: 'Cuti Pending', value: stats.cutiPending, icon: AlertCircle, color: 'bg-red-500', text: 'text-red-600' },
  ];

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan data HRD & Keuangan
          </p>
        </div>
        <div className="text-left md:text-right">
          <div className="text-3xl font-bold text-emerald-600 tracking-tight" suppressHydrationWarning>
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <p className="text-sm font-medium text-slate-700 mt-1" suppressHydrationWarning>
            {format(time, 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
          <p className="text-xs text-slate-500 mt-0.5" suppressHydrationWarning>
            {new Intl.DateTimeFormat('id-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(time)} H
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${card.text}`}>{card.value}</p>
              </div>
              <div className={`${card.color} text-white p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-6`}>
                <card.icon className="w-6 h-6 animate-bounce group-hover:animate-spin" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Pegawai Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Nama</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">NIP</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Jabatan</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Sekolah</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{p.nama}</td>
                  <td className="px-6 py-3 text-slate-600">{p.nip}</td>
                  <td className="px-6 py-3 text-slate-600">{p.jabatan?.nama || '-'}</td>
                  <td className="px-6 py-3 text-slate-600">{p.sekolah?.nama || '-'}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {p.created_at ? format(new Date(p.created_at), 'dd MMM yyyy', { locale: id }) : '-'}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Belum ada data pegawai
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
