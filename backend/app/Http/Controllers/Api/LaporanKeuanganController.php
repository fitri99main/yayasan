<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Akun;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LaporanKeuanganController extends Controller
{
    private function applyFilter($query, Request $request)
    {
        $role = strtolower(trim($request->user()?->role ?? ''));
        if ($role !== 'admin' && $role !== 'super admin') {
            $query->where('jurnal.user_id', $request->user()?->id);
        } else {
            $prefix = $request->query('prefix');
            if ($prefix) {
                $query->where('jurnal.nomor_bukti', 'like', $prefix . '%');
            }
        }
        return $query;
    }

    public function bukuBesar(Request $request)
    {
        $akun_id = $request->query('akun_id');
        $start_date = $request->query('start_date');
        $end_date = $request->query('end_date');

        if (!$akun_id || !$start_date || !$end_date) {
            return response()->json(['message' => 'Parameter akun_id, start_date, dan end_date wajib diisi.'], 400);
        }

        $akun = Akun::findOrFail($akun_id);

        $mutasiQuery = DB::table('jurnal_detail')
            ->join('jurnal', 'jurnal_detail.jurnal_id', '=', 'jurnal.id')
            ->where('jurnal_detail.akun_id', $akun_id)
            ->whereBetween('jurnal.tanggal', [$start_date, $end_date])
            ->select('jurnal.tanggal', 'jurnal.nomor_bukti', 'jurnal.keterangan as jurnal_keterangan', 'jurnal_detail.keterangan', 'jurnal_detail.debit', 'jurnal_detail.kredit')
            ->orderBy('jurnal.tanggal')
            ->orderBy('jurnal.id');
            
        $this->applyFilter($mutasiQuery, $request);
        $mutasi = $mutasiQuery->get();

        // Calculate saldo awal
        $saldoAwalDebitQuery = DB::table('jurnal_detail')
            ->join('jurnal', 'jurnal_detail.jurnal_id', '=', 'jurnal.id')
            ->where('jurnal_detail.akun_id', $akun_id)
            ->where('jurnal.tanggal', '<', $start_date);
            
        $this->applyFilter($saldoAwalDebitQuery, $request);
        $saldoAwalDebit = $saldoAwalDebitQuery->sum('debit');

        $saldoAwalKreditQuery = DB::table('jurnal_detail')
            ->join('jurnal', 'jurnal_detail.jurnal_id', '=', 'jurnal.id')
            ->where('jurnal_detail.akun_id', $akun_id)
            ->where('jurnal.tanggal', '<', $start_date);
            
        $this->applyFilter($saldoAwalKreditQuery, $request);
        $saldoAwalKredit = $saldoAwalKreditQuery->sum('kredit');

        $saldoAwal = $akun->saldo_normal === 'Debit' 
            ? $saldoAwalDebit - $saldoAwalKredit 
            : $saldoAwalKredit - $saldoAwalDebit;

        return response()->json([
            'akun' => $akun,
            'saldo_awal' => $saldoAwal,
            'mutasi' => $mutasi
        ]);
    }

    public function neracaSaldo(Request $request)
    {
        $end_date = $request->query('end_date', date('Y-m-d'));

        $params = [$end_date];
        $role = strtolower(trim($request->user()?->role ?? ''));
        $filterSql = '';
        if ($role !== 'admin' && $role !== 'super admin') {
            $filterSql = ' AND j.user_id = ?';
            $params[] = $request->user()?->id;
        } else {
            $prefix = $request->query('prefix');
            if ($prefix) {
                $filterSql = ' AND j.nomor_bukti LIKE ?';
                $params[] = $prefix . '%';
            }
        }

        $laporan = DB::select("
            SELECT a.id, a.kode_akun, a.nama_akun, a.kategori, a.saldo_normal,
                   COALESCE(t.total_debit, 0) as total_debit, COALESCE(t.total_kredit, 0) as total_kredit
            FROM akun a
            LEFT JOIN (
                SELECT jd.akun_id, SUM(jd.debit) as total_debit, SUM(jd.kredit) as total_kredit
                FROM jurnal_detail jd
                JOIN jurnal j ON jd.jurnal_id = j.id
                WHERE j.tanggal <= ? $filterSql
                GROUP BY jd.akun_id
            ) t ON a.id = t.akun_id
            ORDER BY a.kode_akun
        ", $params);

        $result = [];
        $totalDebit = 0;
        $totalKredit = 0;

        foreach ($laporan as $row) {
            $debit = $row->total_debit ?? 0;
            $kredit = $row->total_kredit ?? 0;
            $saldo = 0;

            if ($row->saldo_normal === 'Debit') {
                $saldo = $debit - $kredit;
                if ($saldo > 0) {
                    $row->saldo_debit = $saldo;
                    $row->saldo_kredit = 0;
                    $totalDebit += $saldo;
                } else {
                    $row->saldo_debit = 0;
                    $row->saldo_kredit = abs($saldo);
                    $totalKredit += abs($saldo);
                }
            } else {
                $saldo = $kredit - $debit;
                if ($saldo > 0) {
                    $row->saldo_debit = 0;
                    $row->saldo_kredit = $saldo;
                    $totalKredit += $saldo;
                } else {
                    $row->saldo_debit = abs($saldo);
                    $row->saldo_kredit = 0;
                    $totalDebit += abs($saldo);
                }
            }
            $result[] = $row;
        }

        return response()->json([
            'data' => $result,
            'total_debit' => $totalDebit,
            'total_kredit' => $totalKredit
        ]);
    }

    public function labaRugi(Request $request)
    {
        $start_date = $request->query('start_date');
        $end_date = $request->query('end_date', date('Y-m-d'));

        $pendapatan = $this->getSaldoByKategori('Pendapatan', $start_date, $end_date, $request);
        $beban = $this->getSaldoByKategori('Beban', $start_date, $end_date, $request);

        $totalPendapatan = collect($pendapatan)->sum('saldo');
        $totalBeban = collect($beban)->sum('saldo');
        $labaBersi = $totalPendapatan - $totalBeban;

        return response()->json([
            'pendapatan' => $pendapatan,
            'total_pendapatan' => $totalPendapatan,
            'beban' => $beban,
            'total_beban' => $totalBeban,
            'laba_rugi' => $labaBersi
        ]);
    }

    public function neraca(Request $request)
    {
        $end_date = $request->query('end_date', date('Y-m-d'));

        $harta = $this->getSaldoByKategori('Harta', null, $end_date, $request);
        $kewajiban = $this->getSaldoByKategori('Kewajiban', null, $end_date, $request);
        $modal = $this->getSaldoByKategori('Modal', null, $end_date, $request);

        // Calculate Laba Rugi Berjalan
        $pendapatan = $this->getSaldoByKategori('Pendapatan', null, $end_date, $request);
        $beban = $this->getSaldoByKategori('Beban', null, $end_date, $request);
        $labaBerjalan = collect($pendapatan)->sum('saldo') - collect($beban)->sum('saldo');

        $totalHarta = collect($harta)->sum('saldo');
        $totalKewajiban = collect($kewajiban)->sum('saldo');
        $totalModal = collect($modal)->sum('saldo');

        return response()->json([
            'harta' => $harta,
            'total_harta' => $totalHarta,
            'kewajiban' => $kewajiban,
            'total_kewajiban' => $totalKewajiban,
            'modal' => $modal,
            'laba_berjalan' => $labaBerjalan,
            'total_kewajiban_modal' => $totalKewajiban + $totalModal + $labaBerjalan
        ]);
    }

    private function getSaldoByKategori($kategori, $start_date = null, $end_date = null, Request $request = null)
    {
        $sub = DB::table('jurnal_detail')
            ->join('jurnal', 'jurnal_detail.jurnal_id', '=', 'jurnal.id')
            ->select('jurnal_detail.akun_id', 
                DB::raw('SUM(jurnal_detail.debit) as debit'), 
                DB::raw('SUM(jurnal_detail.kredit) as kredit'))
            ->groupBy('jurnal_detail.akun_id');

        if ($end_date) {
            $sub->where('jurnal.tanggal', '<=', $end_date);
        }
        if ($start_date) {
            $sub->where('jurnal.tanggal', '>=', $start_date);
        }
        
        if ($request) {
            $role = strtolower(trim($request->user()?->role ?? ''));
            if ($role !== 'admin' && $role !== 'super admin') {
                $sub->where('jurnal.user_id', $request->user()?->id);
            } else {
                $prefix = $request->query('prefix');
                if ($prefix) {
                    $sub->where('jurnal.nomor_bukti', 'like', $prefix . '%');
                }
            }
        }

        $query = DB::table('akun')
            ->where('akun.kategori', $kategori)
            ->leftJoinSub($sub, 'transaksi', function($join) {
                $join->on('akun.id', '=', 'transaksi.akun_id');
            })
            ->select('akun.id', 'akun.kode_akun', 'akun.nama_akun', 'akun.saldo_normal', 
                     DB::raw('COALESCE(transaksi.debit, 0) as total_debit'), 
                     DB::raw('COALESCE(transaksi.kredit, 0) as total_kredit'))
            ->orderBy('akun.kode_akun')
            ->get();

        foreach ($query as $row) {
            if ($row->saldo_normal === 'Debit') {
                $row->saldo = $row->total_debit - $row->total_kredit;
            } else {
                $row->saldo = $row->total_kredit - $row->total_debit;
            }
        }

        return $query;
    }
}
