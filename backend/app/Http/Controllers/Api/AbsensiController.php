<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use Illuminate\Http\Request;

class AbsensiController extends Controller
{
    public function index(Request $request)
    {
        $query = Absensi::with(['pegawai:id,nama,nip'])
            ->orderByDesc('tanggal');

        if ($request->has('tanggal')) {
            $query->where('tanggal', $request->tanggal);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'pegawai_id' => 'required|exists:pegawai,id',
            'tanggal' => 'required|date',
            'waktu_masuk' => 'nullable|date_format:H:i',
            'waktu_keluar' => 'nullable|date_format:H:i',
            'status' => 'required|string|max:20',
            'keterangan' => 'nullable|string',
        ]);

        $absensi = Absensi::create($request->all());

        return response()->json($absensi->load('pegawai:id,nama,nip'), 201);
    }

    public function show(Absensi $absensi)
    {
        return response()->json($absensi->load('pegawai:id,nama,nip'));
    }

    public function update(Request $request, Absensi $absensi)
    {
        $request->validate([
            'pegawai_id' => 'required|exists:pegawai,id',
            'tanggal' => 'required|date',
            'waktu_masuk' => 'nullable|date_format:H:i',
            'waktu_keluar' => 'nullable|date_format:H:i',
            'status' => 'required|string|max:20',
            'keterangan' => 'nullable|string',
        ]);

        $absensi->update($request->all());

        return response()->json($absensi->load('pegawai:id,nama,nip'));
    }

    public function destroy(Absensi $absensi)
    {
        $absensi->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
