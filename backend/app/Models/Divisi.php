<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Divisi extends Model
{
    protected $table = 'divisi';

    protected $fillable = [
        'yayasan_id',
        'nama',
        'kode',
    ];

    public function yayasan(): BelongsTo
    {
        return $this->belongsTo(Yayasan::class);
    }
}
