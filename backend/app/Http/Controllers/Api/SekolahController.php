<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use Illuminate\Http\Request;

class SekolahController extends Controller
{
    public function index()
    {
        return response()->json(Sekolah::orderBy('nama')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'yayasan_id' => 'required|exists:yayasan,id',
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'jenjang' => 'required|string|max:10',
            'kode_invoice' => 'nullable|string|max:50',
        ]);

        $sekolah = Sekolah::create($validated);

        return response()->json($sekolah, 201);
    }

    public function show(Sekolah $sekolah)
    {
        return response()->json($sekolah);
    }

    public function update(Request $request, Sekolah $sekolah)
    {
        $validated = $request->validate([
            'yayasan_id' => 'required|exists:yayasan,id',
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'jenjang' => 'required|string|max:10',
            'kode_invoice' => 'nullable|string|max:50',
        ]);

        $sekolah->update($validated);

        return response()->json($sekolah);
    }

    public function destroy(Sekolah $sekolah)
    {
        $sekolah->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
