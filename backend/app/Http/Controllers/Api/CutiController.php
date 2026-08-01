<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cuti;
use Illuminate\Http\Request;

class CutiController extends Controller
{
    public function index()
    {
        return response()->json(
            Cuti::with(['pegawai:id,nama,nip'])
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'pegawai_id' => 'required|exists:pegawai,id',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'jenis_cuti' => 'required|string|max:30',
            'alasan' => 'required|string',
            'status' => 'required|string|max:20',
        ]);

        $cuti = Cuti::create($request->all());

        return response()->json($cuti->load('pegawai:id,nama,nip'), 201);
    }

    public function show(Cuti $cuti)
    {
        return response()->json($cuti->load('pegawai:id,nama,nip'));
    }

    public function update(Request $request, Cuti $cuti)
    {
        $request->validate([
            'pegawai_id' => 'required|exists:pegawai,id',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'jenis_cuti' => 'required|string|max:30',
            'alasan' => 'required|string',
            'status' => 'required|string|max:20',
        ]);

        $cuti->update($request->all());

        return response()->json($cuti->load('pegawai:id,nama,nip'));
    }

    public function destroy(Cuti $cuti)
    {
        $cuti->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
