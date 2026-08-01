<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Divisi;
use Illuminate\Http\Request;

class DivisiController extends Controller
{
    public function index()
    {
        return response()->json(Divisi::orderBy('nama')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'yayasan_id' => 'required|exists:yayasan,id',
            'nama' => 'required|string|max:255',
            'kode' => 'nullable|string|max:20',
        ]);

        $divisi = Divisi::create($request->all());

        return response()->json($divisi, 201);
    }

    public function show(Divisi $divisi)
    {
        return response()->json($divisi);
    }

    public function update(Request $request, Divisi $divisi)
    {
        $request->validate([
            'yayasan_id' => 'required|exists:yayasan,id',
            'nama' => 'required|string|max:255',
            'kode' => 'nullable|string|max:20',
        ]);

        $divisi->update($request->all());

        return response()->json($divisi);
    }

    public function destroy(Divisi $divisi)
    {
        $divisi->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
