import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Yayasan from './pages/Yayasan';
import Sekolah from './pages/Sekolah';
import Jabatan from './pages/Jabatan';
import Divisi from './pages/Divisi';
import Pegawai from './pages/Pegawai';
import Absensi from './pages/Absensi';
import Gaji from './pages/Gaji';
import Cuti from './pages/Cuti';
import DaftarAkun from './pages/Akuntansi/DaftarAkun';
import JurnalUmum from './pages/Akuntansi/JurnalUmum';
import BukuBesar from './pages/Akuntansi/BukuBesar';
import LabaRugi from './pages/Akuntansi/LabaRugi';
import Neraca from './pages/Akuntansi/Neraca';
import Pengguna from './pages/Pengaturan/Pengguna';

function App() {
  const init = useAuthStore((state) => state.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
