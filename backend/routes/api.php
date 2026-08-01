<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\YayasanController;
use App\Http\Controllers\Api\SekolahController;
use App\Http\Controllers\Api\JabatanController;
use App\Http\Controllers\Api\DivisiController;
use App\Http\Controllers\Api\PegawaiController;
use App\Http\Controllers\Api\AbsensiController;
use App\Http\Controllers\Api\GajiController;
use App\Http\Controllers\Api\CutiController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvoiceController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/debug-token', function (\Illuminate\Http\Request $request) {
    $token = $request->bearerToken();
    if (!$token) return response()->json(['error' => 'No token provided']);
    
    $model = \Laravel\Sanctum\Sanctum::$personalAccessTokenModel;
    $accessToken = $model::findToken($token);
    
    if (!$accessToken) return response()->json(['error' => 'Token not found in DB']);
    
    return response()->json([
        'token_id' => $accessToken->id,
        'tokenable_type' => $accessToken->tokenable_type,
        'tokenable_id' => $accessToken->tokenable_id,
        'user' => $accessToken->tokenable,
        'supports_tokens' => class_uses_recursive(class_basename($accessToken->tokenable) === 'TransientToken' ? get_class($accessToken->tokenable) : get_class($accessToken->tokenable))
    ]);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Users (Manajemen Pengguna)
    Route::apiResource('users', UserController::class);
    Route::apiResource('invoices', InvoiceController::class);

    // HRD Routes
    Route::apiResource('yayasan', YayasanController::class);
    Route::apiResource('sekolah', SekolahController::class);
    Route::apiResource('jabatan', JabatanController::class);
    Route::apiResource('divisi', DivisiController::class);
    Route::apiResource('pegawai', PegawaiController::class);
    Route::get('/pegawai-recent', [PegawaiController::class, 'recent']);
    Route::apiResource('absensi', AbsensiController::class);
    Route::apiResource('gaji', GajiController::class);
    Route::apiResource('cuti', CutiController::class);

    // Akuntansi
    Route::apiResource('akun', \App\Http\Controllers\Api\AkunController::class);
    Route::apiResource('jurnal', \App\Http\Controllers\Api\JurnalController::class);
    
    // Laporan Keuangan
    Route::get('/laporan/buku-besar', [\App\Http\Controllers\Api\LaporanKeuanganController::class, 'bukuBesar']);
    Route::get('/laporan/neraca-saldo', [\App\Http\Controllers\Api\LaporanKeuanganController::class, 'neracaSaldo']);
    Route::get('/laporan/laba-rugi', [\App\Http\Controllers\Api\LaporanKeuanganController::class, 'labaRugi']);
    Route::get('/laporan/neraca', [\App\Http\Controllers\Api\LaporanKeuanganController::class, 'neraca']);
});

Route::get('/debug-data', function () {
    return [
        'users' => \App\Models\User::all(['id', 'name', 'email', 'role']),
        'sekolah' => \App\Models\Sekolah::all(['id', 'nama', 'jenjang', 'kode_invoice']),
    ];
});
