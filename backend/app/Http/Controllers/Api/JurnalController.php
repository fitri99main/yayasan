<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jurnal;
use App\Models\JurnalDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JurnalController extends Controller
{
    public function index(Request $request)
    {
        $query = Jurnal::with('details.akun')->orderByDesc('tanggal')->orderByDesc('id');
        
        $role = strtolower(trim($request->user()?->role ?? ''));
        if ($role !== 'admin' && $role !== 'super admin') {
            $query->where('user_id', $request->user()?->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nomor_bukti' => 'required|string|unique:jurnal,nomor_bukti',
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'details' => 'required|array|min:2',
            'details.*.akun_id' => 'required|exists:akun,id',
            'details.*.debit' => 'required|numeric|min:0',
            'details.*.kredit' => 'required|numeric|min:0',
            'details.*.keterangan' => 'nullable|string'
        ]);

        $details = $request->details;
        $totalDebit = collect($details)->sum('debit');
        $totalKredit = collect($details)->sum('kredit');

        if (round($totalDebit, 2) !== round($totalKredit, 2)) {
            return response()->json(['message' => 'Total Debit dan Kredit harus seimbang (Balance).', 'debit' => $totalDebit, 'kredit' => $totalKredit], 422);
        }

        if ($totalDebit <= 0) {
            return response()->json(['message' => 'Total jurnal tidak boleh nol.'], 422);
        }

        try {
            DB::beginTransaction();

            $jurnal = Jurnal::create([
                'nomor_bukti' => $request->nomor_bukti,
                'tanggal' => $request->tanggal,
                'keterangan' => $request->keterangan,
                'total' => $totalDebit,
                'user_id' => $request->user()?->id,
            ]);

            foreach ($details as $detail) {
                JurnalDetail::create([
                    'jurnal_id' => $jurnal->id,
                    'akun_id' => $detail['akun_id'],
                    'debit' => $detail['debit'],
                    'kredit' => $detail['kredit'],
                    'keterangan' => $detail['keterangan'] ?? null,
                ]);
            }

            DB::commit();
            return response()->json($jurnal->load('details.akun'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function show(Jurnal $jurnal)
    {
        return response()->json($jurnal->load('details.akun'));
    }

    public function update(Request $request, Jurnal $jurnal)
    {
        $request->validate([
            'nomor_bukti' => 'required|string|unique:jurnal,nomor_bukti,' . $jurnal->id,
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'details' => 'required|array|min:2',
            'details.*.akun_id' => 'required|exists:akun,id',
            'details.*.debit' => 'required|numeric|min:0',
            'details.*.kredit' => 'required|numeric|min:0',
            'details.*.keterangan' => 'nullable|string'
        ]);

        $details = $request->details;
        $totalDebit = collect($details)->sum('debit');
        $totalKredit = collect($details)->sum('kredit');

        if (round($totalDebit, 2) !== round($totalKredit, 2)) {
            return response()->json(['message' => 'Total Debit dan Kredit harus seimbang (Balance).', 'debit' => $totalDebit, 'kredit' => $totalKredit], 422);
        }

        if ($totalDebit <= 0) {
            return response()->json(['message' => 'Total jurnal tidak boleh nol.'], 422);
        }

        try {
            DB::beginTransaction();

            $jurnal->update([
                'nomor_bukti' => $request->nomor_bukti,
                'tanggal' => $request->tanggal,
                'keterangan' => $request->keterangan,
                'total' => $totalDebit,
            ]);

            // Delete old details and recreate
            $jurnal->details()->delete();

            foreach ($details as $detail) {
                JurnalDetail::create([
                    'jurnal_id' => $jurnal->id,
                    'akun_id' => $detail['akun_id'],
                    'debit' => $detail['debit'],
                    'kredit' => $detail['kredit'],
                    'keterangan' => $detail['keterangan'] ?? null,
                ]);
            }

            DB::commit();
            return response()->json($jurnal->load('details.akun'), 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Jurnal $jurnal)
    {
        try {
            $jurnal->delete();
            return response()->json(['message' => 'Jurnal berhasil dihapus.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }
}
