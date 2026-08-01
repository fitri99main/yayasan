<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index()
    {
        return response()->json(Invoice::orderBy('tanggal', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_invoice' => 'required|string|unique:invoices',
            'jenjang' => 'required|in:KB,TK,SD,SMP,SMA',
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'total' => 'required|numeric',
            'status' => 'required|in:Lunas,Belum Lunas',
        ]);

        $invoice = Invoice::create($validated);
        return response()->json($invoice, 201);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'nomor_invoice' => 'required|string|unique:invoices,nomor_invoice,' . $invoice->id,
            'jenjang' => 'required|in:KB,TK,SD,SMP,SMA',
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'total' => 'required|numeric',
            'status' => 'required|in:Lunas,Belum Lunas',
        ]);

        $invoice->update($validated);
        return response()->json($invoice);
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return response()->json(null, 204);
    }
}
