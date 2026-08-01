<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Akun;
use Illuminate\Http\Request;

class AkunController extends Controller
{
    public function index()
    {
        $akun = Akun::orderBy('kode_akun')->get();
        return response()->json($akun);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_akun' => 'required|string|unique:akun,kode_akun',
            'nama_akun' => 'required|string',
            'kategori' => 'required|in:Harta,Kewajiban,Modal,Pendapatan,Beban',
            'saldo_normal' => 'required|in:Debit,Kredit',
        ]);

        $akun = Akun::create($request->all());
        return response()->json($akun, 201);
    }

    public function show(Akun $akun)
    {
        return response()->json($akun);
    }

    public function update(Request $request, Akun $akun)
    {
        $request->validate([
            'kode_akun' => 'required|string|unique:akun,kode_akun,' . $akun->id,
            'nama_akun' => 'required|string',
            'kategori' => 'required|in:Harta,Kewajiban,Modal,Pendapatan,Beban',
            'saldo_normal' => 'required|in:Debit,Kredit',
            'is_aktif' => 'boolean'
        ]);

        $akun->update($request->all());
        return response()->json($akun);
    }

    public function destroy(Akun $akun)
    {
        if ($akun->jurnalDetails()->exists()) {
            return response()->json(['message' => 'Akun tidak bisa dihapus karena sudah memiliki transaksi.'], 400);
        }
        $akun->delete();
        return response()->json(null, 204);
    }
}
