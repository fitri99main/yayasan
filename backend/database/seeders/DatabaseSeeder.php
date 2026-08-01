<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Yayasan;
use App\Models\Jabatan;
use App\Models\Divisi;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create default admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@yayasan.id'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
            ]
        );

        // Create default yayasan
        $yayasan = Yayasan::firstOrCreate(
            ['nama' => 'Yayasan Pendidikan Indonesia'],
            [
                'alamat' => 'Jl. Pendidikan No. 1',
                'telepon' => '08123456789',
                'email' => 'info@yayasan-pendidikan.id',
            ]
        );

        // Create default jabatan
        $jabatanData = [
            ['nama' => 'Direktur', 'level' => 1, 'gaji_pokok' => 15000000, 'tunjangan' => 5000000],
            ['nama' => 'Kepala Sekolah', 'level' => 2, 'gaji_pokok' => 10000000, 'tunjangan' => 3000000],
            ['nama' => 'Guru', 'level' => 3, 'gaji_pokok' => 5000000, 'tunjangan' => 1000000],
            ['nama' => 'Karyawan', 'level' => 4, 'gaji_pokok' => 4000000, 'tunjangan' => 500000],
        ];

        foreach ($jabatanData as $j) {
            Jabatan::firstOrCreate(
                ['yayasan_id' => $yayasan->id, 'nama' => $j['nama']],
                $j
            );
        }

        // Create default divisi
        $divisiData = [
            ['nama' => 'Akademik', 'kode' => 'AKD'],
            ['nama' => 'Keuangan', 'kode' => 'KEU'],
            ['nama' => 'Kesiswaan', 'kode' => 'KSW'],
            ['nama' => 'Sarana Prasarana', 'kode' => 'SARPRAS'],
            ['nama' => 'Kurikulum', 'kode' => 'KUR'],
        ];

        foreach ($divisiData as $d) {
            Divisi::firstOrCreate(
                ['yayasan_id' => $yayasan->id, 'nama' => $d['nama']],
                $d
            );
        }
    }
}
