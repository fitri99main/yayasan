<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sekolah extends Model
{
    protected $table = 'sekolah';

    protected $fillable = [
        'yayasan_id',
        'nama',
        'alamat',
        'telepon',
        'email',
        'jenjang',
        'kode_invoice',
    ];

    public function yayasan(): BelongsTo
    {
        return $this->belongsTo(Yayasan::class);
    }
}
