<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Yayasan extends Model
{
    protected $table = 'yayasan';

    protected $fillable = [
        'nama',
        'alamat',
        'telepon',
        'email',
    ];

    public function sekolah(): HasMany
    {
        return $this->hasMany(Sekolah::class);
    }

    public function jabatan(): HasMany
    {
        return $this->hasMany(Jabatan::class);
    }

    public function divisi(): HasMany
    {
        return $this->hasMany(Divisi::class);
    }

    public function pegawai(): HasMany
    {
        return $this->hasMany(Pegawai::class);
    }
}
