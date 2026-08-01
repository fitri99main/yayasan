<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use Illuminate\Http\Request;

class PegawaiController extends Controller
{
    public function index()
    {
        $pegawai = Pegawai::with(['sekolah:id,nama', 'jabatan:id,nama', 'divisi:id,nama'])
            ->orderBy('nama')
            ->get();

        return response()->json($pegawai);
    }

    public function store(Request $request)
    {
        $request->validate([
            'yayasan_id' => 'required|exists:yayasan,id',
            'sekolah_id' => 'nullable|exists:sekolah,id',
            'jabatan_id' => 'required|exists:jabatan,id',
            'divisi_id' => 'nullable|exists:divisi,id',
            'nip' => 'required|string|max:50',
            'nama' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telepon' => 'nullable|string|max:50',
            'alamat' => 'nullable|string',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|string|max:5',
            'status_pernikahan' => 'nullable|string|max:30',
            'pendidikan_terakhir' => 'nullable|string|max:50',
            'tahun_masuk' => 'nullable|integer',
            'status' => 'required|string|max:20',
        ]);

        $pegawai = Pegawai::create($request->all());

        return response()->json($pegawai->load(['sekolah:id,nama', 'jabatan:id,nama', 'divisi:id,nama']), 201);
    }

    public function show(Pegawai $pegawai)
    {
        return response()->json($pegawai->load(['sekolah:id,nama', 'jabatan:id,nama', 'divisi:id,nama']));
    }

    public function update(Request $request, Pegawai $pegawai)
    {
        $request->validate([
            'yayasan_id' => 'required|exists:yayasan,id',
            'sekolah_id' => 'nullable|exists:sekolah,id',
            'jabatan_id' => 'required|exists:jabatan,id',
            'divisi_id' => 'nullable|exists:divisi,id',
            'nip' => 'required|string|max:50',
            'nama' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telepon' => 'nullable|string|max:50',
            'alamat' => 'nullable|string',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|string|max:5',
            'status_pernikahan' => 'nullable|string|max:30',
            'pendidikan_terakhir' => 'nullable|string|max:50',
            'tahun_masuk' => 'nullable|integer',
            'status' => 'required|string|max:20',
        ]);

        $pegawai->update($request->all());

        return response()->json($pegawai->load(['sekolah:id,nama', 'jabatan:id,nama', 'divisi:id,nama']));
    }

    public function destroy(Pegawai $pegawai)
    {
        $pegawai->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function recent()
    {
        $pegawai = Pegawai::with(['jabatan:id,nama', 'sekolah:id,nama'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return response()->json($pegawai);
    }
}
