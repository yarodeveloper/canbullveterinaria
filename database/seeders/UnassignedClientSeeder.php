<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnassignedClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $branches = \App\Models\Branch::all();

        foreach ($branches as $branch) {
            \App\Models\User::firstOrCreate(
                ['email' => 'sin-asignar-' . $branch->id . '@canbull.com'],
                [
                    'name' => '<< Sin Asignar >>',
                    'password' => \Illuminate\Support\Facades\Hash::make('password'),
                    'role' => 'client',
                    'branch_id' => $branch->id,
                    'phone' => '000-0000',
                    'address' => '—',
                ]
            );
        }
    }
}
