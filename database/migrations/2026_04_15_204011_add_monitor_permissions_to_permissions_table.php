<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('permissions')->insertOrIgnore([
            ['name' => 'view preventive reminders', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'view grooming reminders', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $roles = ['admin', 'veterinarian', 'groomer'];
        
        foreach ($roles as $roleName) {
            $role = DB::table('roles')->where('name', $roleName)->first();
            if (!$role) continue;

            $permsToAssign = [];
            if ($roleName === 'admin') {
                $permsToAssign = ['view preventive reminders', 'view grooming reminders'];
            } elseif ($roleName === 'veterinarian') {
                $permsToAssign = ['view preventive reminders'];
            } elseif ($roleName === 'groomer') {
                $permsToAssign = ['view grooming reminders'];
            }

            foreach ($permsToAssign as $pName) {
                $pId = DB::table('permissions')->where('name', $pName)->value('id');
                if ($pId) {
                    DB::table('role_has_permissions')->insertOrIgnore([
                        'permission_id' => $pId,
                        'role_id' => $role->id
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $permissionIds = DB::table('permissions')
            ->whereIn('name', ['view preventive reminders', 'view grooming reminders'])
            ->pluck('id');

        DB::table('role_has_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('id', $permissionIds)->delete();
    }
};
