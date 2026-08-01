<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Jabatan extends Model
{
    protected $table = 'jabatan';

    protected $fillable = [
        'yayasan_id',
        'nama',
        'level',
        'gaji_pokok',
        'tunjangan',
    ];

    protected $casts = [
        'gaji_pokok' => 'float',
        'tunjangan' => 'float',
    ];

    public function yayasan(): BelongsTo
    {
        return $this->belongsTo(Yayasan::class);
    }
}
