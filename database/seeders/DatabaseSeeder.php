<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            SiteSettingSeeder::class,
            SiteSettingsSeeder::class,
            InitialDataSeeder::class,
            PetBreedSeeder::class,
            InventorySeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Admin Canbull',
            'email' => 'admin@canbull.com',
            'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
        ])->assignRole('admin');
    }
}
