<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gaji;
use Illuminate\Http\Request;

class GajiController extends Controller
{
    public function index(Request $request)
    {
        $query = Gaji::with(['pegawai:id,nama,nip'])
            ->orderByDesc('total_gaji');

        if ($request->has('bulan')) {
            $query->where('bulan', $request->bulan);
        }
        if ($request->has('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'pegawai_id' => 'required|exists:pegawai,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer',
            'gaji_pokok' => 'required|numeric|min:0',
            'tunjangan' => 'required|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'potongan' => 'nullable|numeric|min:0',
            'total_gaji' => 'required|numeric',
            'status' => 'required|string|max:30',
            'tanggal_bayar' => 'nullable|date',
        ]);

        $gaji = Gaji::create($request->all());

        return response()->json($gaji->load('pegawai:id,nama,nip'), 201);
    }

    public function show(Gaji $gaji)
    {
        return response()->json($gaji->load('pegawai:id,nama,nip'));
    }

    public function update(Request $request, Gaji $gaji)
    {
        $request->validate([
            'pegawai_id' => 'required|exists:pegawai,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer',
            'gaji_pokok' => 'required|numeric|min:0',
            'tunjangan' => 'required|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'potongan' => 'nullable|numeric|min:0',
            'total_gaji' => 'required|numeric',
            'status' => 'required|string|max:30',
            'tanggal_bayar' => 'nullable|date',
        ]);

        $gaji->update($request->all());

        return response()->json($gaji->load('pegawai:id,nama,nip'));
    }

    public function destroy(Gaji $gaji)
    {
        $gaji->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
