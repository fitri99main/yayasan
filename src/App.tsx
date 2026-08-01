import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import DashboardLayout from './components/DashboardLayout';

// Gunakan React.lazy untuk Code Splitting (memecah bundle JavaScript)
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Yayasan = lazy(() => import('./pages/Yayasan'));
const Sekolah = lazy(() => import('./pages/Sekolah'));
const Jabatan = lazy(() => import('./pages/Jabatan'));
const Divisi = lazy(() => import('./pages/Divisi'));
const Pegawai = lazy(() => import('./pages/Pegawai'));
const Absensi = lazy(() => import('./pages/Absensi'));
const Gaji = lazy(() => import('./pages/Gaji'));
const Cuti = lazy(() => import('./pages/Cuti'));
const DaftarAkun = lazy(() => import('./pages/Akuntansi/DaftarAkun'));
const JurnalUmum = lazy(() => import('./pages/Akuntansi/JurnalUmum'));
const BukuBesar = lazy(() => import('./pages/Akuntansi/BukuBesar'));
const LabaRugi = lazy(() => import('./pages/Akuntansi/LabaRugi'));
const Neraca = lazy(() => import('./pages/Akuntansi/Neraca'));
const Pengguna = lazy(() => import('./pages/Pengaturan/Pengguna'));

// Komponen loading sementara saat halaman sedang diunduh
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  const init = useAuthStore((state) => state.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/yayasan" element={<DashboardLayout><Yayasan /></DashboardLayout>} />
          <Route path="/sekolah" element={<DashboardLayout><Sekolah /></DashboardLayout>} />
          <Route path="/jabatan" element={<DashboardLayout><Jabatan /></DashboardLayout>} />
          <Route path="/divisi" element={<DashboardLayout><Divisi /></DashboardLayout>} />
          <Route path="/pegawai" element={<DashboardLayout><Pegawai /></DashboardLayout>} />
          <Route path="/absensi" element={<DashboardLayout><Absensi /></DashboardLayout>} />
          <Route path="/gaji" element={<DashboardLayout><Gaji /></DashboardLayout>} />
          <Route path="/cuti" element={<DashboardLayout><Cuti /></DashboardLayout>} />
          <Route path="/akuntansi/akun" element={<DashboardLayout><DaftarAkun /></DashboardLayout>} />
          <Route path="/akuntansi/jurnal" element={<DashboardLayout><JurnalUmum /></DashboardLayout>} />
          <Route path="/akuntansi/buku-besar" element={<DashboardLayout><BukuBesar /></DashboardLayout>} />
          <Route path="/akuntansi/laba-rugi" element={<DashboardLayout><LabaRugi /></DashboardLayout>} />
          <Route path="/akuntansi/neraca" element={<DashboardLayout><Neraca /></DashboardLayout>} />
          
          {/* Pengaturan Routes */}
          <Route path="/pengguna" element={<DashboardLayout><Pengguna /></DashboardLayout>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
