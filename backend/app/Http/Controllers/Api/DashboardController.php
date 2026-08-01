<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\Sekolah;
use App\Models\Jabatan;
use App\Models\Divisi;
use App\Models\Absensi;
use App\Models\Gaji;
use App\Models\Cuti;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = now()->toDateString();
        $bulan = now()->month;
        $tahun = now()->year;

        $totalPegawai = Pegawai::count();
        $aktif = Pegawai::where('status', 'aktif')->count();
        $totalSekolah = Sekolah::count();
        $totalJabatan = Jabatan::count();
        $totalDivisi = Divisi::count();
        $hadirHariIni = Absensi::where('tanggal', $today)->where('status', 'hadir')->count();
        $gajiBulanan = Gaji::where('bulan', $bulan)->where('tahun', $tahun)->sum('total_gaji');
        $cutiPending = Cuti::where('status', 'pending')->count();

        return response()->json([
            'totalPegawai' => $totalPegawai,
            'aktif' => $aktif,
            'totalSekolah' => $totalSekolah,
            'totalJabatan' => $totalJabatan,
            'totalDivisi' => $totalDivisi,
            'hadirHariIni' => $hadirHariIni,
            'gajiBulanan' => (float) $gajiBulanan,
            'cutiPending' => $cutiPending,
        ]);
    }
}
