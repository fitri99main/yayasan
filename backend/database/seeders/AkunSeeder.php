<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AkunSeeder extends Seeder
{
    public function run(): void
    {
        $akuns = [
            // Harta (Aset) - Debit
            ['kode_akun' => '1-1000', 'nama_akun' => 'Kas Yayasan', 'kategori' => 'Harta', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '1-1010', 'nama_akun' => 'Kas Kecil', 'kategori' => 'Harta', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '1-1100', 'nama_akun' => 'Bank BCA', 'kategori' => 'Harta', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '1-1200', 'nama_akun' => 'Piutang SPP', 'kategori' => 'Harta', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '1-1210', 'nama_akun' => 'Piutang Lain-lain', 'kategori' => 'Harta', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '1-2000', 'nama_akun' => 'Inventaris Kantor', 'kategori' => 'Harta', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '1-2010', 'nama_akun' => 'Akumulasi Penyusutan Inventaris', 'kategori' => 'Harta', 'saldo_normal' => 'Kredit'],
            ['kode_akun' => '1-2100', 'nama_akun' => 'Gedung Yayasan', 'kategori' => 'Harta', 'saldo_normal' => 'Debit'],

            // Kewajiban (Hutang) - Kredit
            ['kode_akun' => '2-1000', 'nama_akun' => 'Hutang Usaha', 'kategori' => 'Kewajiban', 'saldo_normal' => 'Kredit'],
            ['kode_akun' => '2-1100', 'nama_akun' => 'Hutang Gaji', 'kategori' => 'Kewajiban', 'saldo_normal' => 'Kredit'],
            ['kode_akun' => '2-2000', 'nama_akun' => 'Hutang Bank (Jangka Panjang)', 'kategori' => 'Kewajiban', 'saldo_normal' => 'Kredit'],

            // Modal (Ekuitas) - Kredit
            ['kode_akun' => '3-1000', 'nama_akun' => 'Modal Yayasan', 'kategori' => 'Modal', 'saldo_normal' => 'Kredit'],
            ['kode_akun' => '3-1100', 'nama_akun' => 'Surplus (Defisit) Tahun Lalu', 'kategori' => 'Modal', 'saldo_normal' => 'Kredit'],

            // Pendapatan - Kredit
            ['kode_akun' => '4-1000', 'nama_akun' => 'Pendapatan SPP', 'kategori' => 'Pendapatan', 'saldo_normal' => 'Kredit'],
            ['kode_akun' => '4-1100', 'nama_akun' => 'Pendapatan Uang Gedung', 'kategori' => 'Pendapatan', 'saldo_normal' => 'Kredit'],
            ['kode_akun' => '4-1200', 'nama_akun' => 'Pendapatan Donasi / Hibah', 'kategori' => 'Pendapatan', 'saldo_normal' => 'Kredit'],
            ['kode_akun' => '4-1300', 'nama_akun' => 'Pendapatan Lain-lain', 'kategori' => 'Pendapatan', 'saldo_normal' => 'Kredit'],

            // Beban (Biaya) - Debit
            ['kode_akun' => '5-1000', 'nama_akun' => 'Beban Gaji Karyawan', 'kategori' => 'Beban', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '5-1010', 'nama_akun' => 'Beban Tunjangan Karyawan', 'kategori' => 'Beban', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '5-1100', 'nama_akun' => 'Beban Listrik, Air, & Telepon', 'kategori' => 'Beban', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '5-1200', 'nama_akun' => 'Beban ATK & Cetak', 'kategori' => 'Beban', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '5-1300', 'nama_akun' => 'Beban Pemeliharaan Gedung', 'kategori' => 'Beban', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '5-1400', 'nama_akun' => 'Beban Penyusutan', 'kategori' => 'Beban', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '5-1500', 'nama_akun' => 'Beban Konsumsi', 'kategori' => 'Beban', 'saldo_normal' => 'Debit'],
            ['kode_akun' => '5-1999', 'nama_akun' => 'Beban Lain-lain', 'kategori' => 'Beban', 'saldo_normal' => 'Debit'],
        ];

        foreach ($akuns as $akun) {
            DB::table('akun')->insert([
                'kode_akun' => $akun['kode_akun'],
                'nama_akun' => $akun['nama_akun'],
                'kategori' => $akun['kategori'],
                'saldo_normal' => $akun['saldo_normal'],
                'is_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
