<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use Illuminate\Http\Request;

class JabatanController extends Controller
{
    public function index()
    {
        return response()->json(Jabatan::orderBy('level')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'yayasan_id' => 'required|exists:yayasan,id',
            'nama' => 'required|string|max:255',
            'level' => 'required|integer|min:1',
            'gaji_pokok' => 'required|numeric|min:0',
            'tunjangan' => 'required|numeric|min:0',
        ]);

        $jabatan = Jabatan::create($request->all());

        return response()->json($jabatan, 201);
    }

    public function show(Jabatan $jabatan)
    {
        return response()->json($jabatan);
    }

    public function update(Request $request, Jabatan $jabatan)
    {
        $request->validate([
            'yayasan_id' => 'required|exists:yayasan,id',
            'nama' => 'required|string|max:255',
            'level' => 'required|integer|min:1',
            'gaji_pokok' => 'required|numeric|min:0',
            'tunjangan' => 'required|numeric|min:0',
        ]);

        $jabatan->update($request->all());

        return response()->json($jabatan);
    }

    public function destroy(Jabatan $jabatan)
    {
        $jabatan->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
