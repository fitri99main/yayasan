<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Gaji extends Model
{
    protected $table = 'gaji';

    protected $fillable = [
        'pegawai_id',
        'bulan',
        'tahun',
        'gaji_pokok',
        'tunjangan',
        'bonus',
        'potongan',
        'total_gaji',
        'status',
        'tanggal_bayar',
    ];

    protected $casts = [
        'gaji_pokok' => 'float',
        'tunjangan' => 'float',
        'bonus' => 'float',
        'potongan' => 'float',
        'total_gaji' => 'float',
    ];

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class);
    }
}
