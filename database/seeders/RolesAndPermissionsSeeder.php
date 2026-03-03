<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            'manage pets',
            'view pets',
            'manage appointments',
            'manage medical records',
            'view medical records',
            'manage clients',
            'manage inventory',
            'manage settings',
            'view dashboard',
            'manage finances', // Existing: Receipts and Cash general
            'view reports',    // Existing: Financial reports and charts
            'manage cash register', // New: Open/Close shift
            'manage withdrawals', // New: Withdrawals/Egresos
            'manage returns', // New: Inventory Returns
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        // Create Roles and Assign Permissions
        
        // Admin: All permissions
        $adminRole = Role::findOrCreate('admin');
        $adminRole->givePermissionTo(Permission::all());

        // Veterinarian
        $vetRole = Role::findOrCreate('veterinarian');
        $vetRole->givePermissionTo([
            'view pets',
            'manage appointments',
            'manage medical records',
            'view medical records',
            'view dashboard',
        ]);

        // Receptionist / Assistant
        $receptionistRole = Role::findOrCreate('receptionist');
        $receptionistRole->givePermissionTo([
            'view pets',
            'manage appointments',
            'manage clients',
            'view dashboard',
            'manage cash register', // Receptions can open/close cash
        ]);

        // Cashier 
        $cashierRole = Role::findOrCreate('cashier');
        $cashierRole->givePermissionTo([
            'view dashboard',
            'manage clients',
            'manage cash register',
            'manage withdrawals',
            'manage returns',
            'manage finances',
        ]);

        // Medical Assistant
        $assistantRole = Role::findOrCreate('assistant');
        $assistantRole->givePermissionTo([
            'view pets',
            'manage appointments',
            'view medical records',
            'view dashboard',
        ]);

        // Specialist
        $specialistRole = Role::findOrCreate('specialist');
        $specialistRole->givePermissionTo([
            'view pets',
            'manage appointments',
            'manage medical records',
            'view medical records',
            'view dashboard',
        ]);

        // Surgeon
        $surgeonRole = Role::findOrCreate('surgeon');
        $surgeonRole->givePermissionTo([
            'view pets',
            'manage appointments',
            'manage medical records',
            'view medical records',
            'view dashboard',
        ]);

        // Groomer
        $groomerRole = Role::findOrCreate('groomer');
        $groomerRole->givePermissionTo([
            'view pets',
            'manage appointments',
        ]);

        // Pharmacist
        $pharmacistRole = Role::findOrCreate('pharmacist');
        $pharmacistRole->givePermissionTo([
            'manage inventory',
        ]);

        // Client
        $clientRole = Role::findOrCreate('client');
        $clientRole->givePermissionTo([
            'view pets', // Only their own, but permission can be checked globally
        ]);

        // Assign roles to existing users based on their 'role' column
        User::all()->each(function ($user) {
            if ($user->role) {
                $user->assignRole($user->role);
            }
        });
    }
}
