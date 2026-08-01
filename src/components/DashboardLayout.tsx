import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';
import {
  Building2,
  School,
  Users,
  Briefcase,
  Layers,
  CalendarCheck,
  Wallet,
  CalendarDays,
  Menu,
  LogOut
} from 'lucide-react';

const FluentIcon = ({ name, className = '' }: { name: string, className?: string }) => {
  const formatName = (n: string) => n.replace(/ /g, '%20');
  const formatFile = (n: string) => n.toLowerCase().replace(/ /g, '_');
  const url = `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${formatName(name)}/3D/${formatFile(name)}_3d.png`;
  
  return (
    <img src={url} alt={name} className={`w-5 h-5 object-contain ${className}`} loading="lazy" />
  );
};

const navGroups = [
  {
    title: 'UTAMA',
    items: [
      { label: 'Dashboard', iconName: 'House', path: '/' },
    ],
  },
  {
    title: 'MASTER DATA',
    items: [
      { label: 'Yayasan', iconName: 'Office building', path: '/yayasan' },
      { label: 'Sekolah', iconName: 'School', path: '/sekolah' },
      { label: 'Divisi', iconName: 'Card index dividers', path: '/divisi' },
      { label: 'Jabatan', iconName: 'Briefcase', path: '/jabatan' },
      { label: 'Pegawai', iconName: 'Busts in silhouette', path: '/pegawai' },
    ],
  },
  {
    title: 'HRD & PAYROLL',
    items: [
      { label: 'Absensi', iconName: 'Calendar', path: '/absensi' },
      { label: 'Gaji', iconName: 'Money bag', path: '/gaji' },
      { label: 'Cuti', iconName: 'Palm tree', path: '/cuti' },
    ],
  },
  {
    title: 'AKUNTANSI',
    items: [
      { label: 'Daftar Akun', iconName: 'Card file box', path: '/akuntansi/akun' },
      { label: 'Jurnal Umum', iconName: 'Memo', path: '/akuntansi/jurnal' },
      { label: 'Buku Besar', iconName: 'Notebook', path: '/akuntansi/buku-besar' },
      { label: 'Laba Rugi', iconName: 'Chart increasing', path: '/akuntansi/laba-rugi' },
      { label: 'Neraca', iconName: 'Balance scale', path: '/akuntansi/neraca' },
    ],
  },
  {
    title: 'PENGATURAN',
    items: [
      { label: 'Pengguna', iconName: 'Bust in silhouette', path: '/pengguna' },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-slate-900 text-white transform transition-transform duration-200 lg:transform-none flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 shrink-0 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center relative overflow-hidden shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <div className="absolute inset-0 bg-emerald-500/30 animate-pulse"></div>
            <FluentIcon name="Green apple" className="w-6 h-6 relative z-10 animate-[bounce_2s_infinite] drop-shadow-sm" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent animate-[pulse_3s_ease-in-out_infinite]">
            HRD Yayasan
          </span>
        </div>
        <nav className="p-3 space-y-4 flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent' }}>
          {navGroups.map((group) => {
            const role = (user?.role || 'admin').toLowerCase().trim();
            
            // Bypass filter if admin, or if this user has no permissions array set at all (fallback)
            if (role === 'admin' || role === 'super admin' || !user?.permissions || user.permissions.length === 0) {
              return group;
            }

            // Filter items based on permissions array
            const allowedItems = group.items.filter(item => 
              user?.permissions?.includes(item.label)
            );

            return { ...group, items: allowedItems };
          })
          .filter(group => group.items.length > 0) // Only show groups that have at least one allowed item
          .map((group, index) => (
            <div key={index}>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = location.pathname === item.path || 
                                 (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`group w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-300 ${
                        active
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className={`transition-all duration-300 ${active ? 'animate-bounce drop-shadow-md' : 'group-hover:scale-110 group-hover:rotate-6 opacity-75 group-hover:opacity-100'}`}>
                        <FluentIcon name={item.iconName} />
                      </div>
                      <span className="flex-1 text-left whitespace-nowrap transition-transform duration-300 group-hover:translate-x-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300"
          >
            <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="transition-transform duration-300 group-hover:translate-x-1">Keluar</span>
          </button>
        </div>
      </aside>
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          
          <div className="flex-1 hidden sm:flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800" suppressHydrationWarning>
                {format(time, 'EEEE, d MMMM yyyy', { locale: id })}
              </span>
              <span className="text-sm text-slate-500" suppressHydrationWarning>
                • {new Intl.DateTimeFormat('id-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(time)} H
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 tracking-tight" suppressHydrationWarning>
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          
          <div className="flex-1 sm:hidden" />
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-white">{user?.email?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-slate-500 truncate capitalize">Role: {user?.role || 'Admin'} | Perms: {user?.permissions?.length || 0}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
