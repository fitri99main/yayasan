<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Yayasan;
use Illuminate\Http\Request;

class YayasanController extends Controller
{
    public function index()
    {
        return response()->json(Yayasan::orderBy('nama')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        $yayasan = Yayasan::create($request->all());

        return response()->json($yayasan, 201);
    }

    public function show(Yayasan $yayasan)
    {
        return response()->json($yayasan);
    }

    public function update(Request $request, Yayasan $yayasan)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        $yayasan->update($request->all());

        return response()->json($yayasan);
    }

    public function destroy(Yayasan $yayasan)
    {
        $yayasan->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
