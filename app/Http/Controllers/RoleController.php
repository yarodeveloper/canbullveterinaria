<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public const PERMISSION_GROUPS = [
        'Mascotas y Clientes' => ['manage pets', 'view pets', 'manage clients'],
        'Clínica Básica' => ['manage appointments', 'manage medical records', 'view medical records'],
        'Procedimientos y Hospital' => ['manage hospitalizations', 'view hospitalizations', 'manage surgeries', 'view surgeries', 'manage euthanasias', 'view euthanasias'],
        'Inventario y Farmacia' => ['manage inventory', 'manage returns'],
        'Caja y Finanzas' => ['manage finances', 'view reports', 'manage cash register', 'manage withdrawals'],
        'Configuración del Sistema' => ['manage settings', 'view dashboard'],
    ];

    public function index()
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        $roles = Role::withCount('permissions')->get();

        return Inertia::render('Settings/Roles/Index', [
            'roles' => $roles,
        ]);
    }

    public function create()
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        return Inertia::render('Settings/Roles/Create', [
            'permissionGroups' => $this->getGroupedPermissions(),
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => $request->name]);
        
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('roles.index')->with('message', 'Rol creado exitosamente.');
    }

    public function edit(Role $role)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        $role->load('permissions');

        return Inertia::render('Settings/Roles/Edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ],
            'permissionGroups' => $this->getGroupedPermissions(),
        ]);
    }

    public function update(Request $request, Role $role)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        // Evitar que editen el nombre de admin o client, pero sí quizás sus permisos (salvo admin que tiene todos)
        if (!in_array($role->name, ['admin', 'client'])) {
            $role->update(['name' => $request->name]);
            
            // Si el nombre del rol cambia, deberíamos actulizar users.role?
            // Podríamos evitar cambiar el nombre, pero como permitimos custom roles, está bien. 
            // Para mantener consistencia con users.role:
            \App\Models\User::where('role', $role->getOriginal('name'))->update(['role' => $request->name]);
        }

        if ($role->name !== 'admin') {
            $role->syncPermissions($request->permissions ?? []);
        }

        return redirect()->route('roles.index')->with('message', 'Rol actualizado exitosamente.');
    }

    public function destroy(Role $role)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        if (in_array($role->name, ['admin', 'client'])) {
            return redirect()->back()->with('error', 'No puedes eliminar los roles principales del sistema.');
        }

        if (\App\Models\User::where('role', $role->name)->exists()) {
            return redirect()->back()->with('error', 'No puedes eliminar un rol que está asignado a uno o más usuarios.');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('message', 'Rol eliminado exitosamente.');
    }

    private function getGroupedPermissions()
    {
        $allPermissions = Permission::all()->pluck('name')->toArray();
        $grouped = [];

        foreach (self::PERMISSION_GROUPS as $groupName => $perms) {
            foreach ($perms as $perm) {
                if (in_array($perm, $allPermissions)) {
                    $grouped[$groupName][] = $perm;
                    // Eliminar de los disponibles para agrupar luego los sobrantes
                    $allPermissions = array_diff($allPermissions, [$perm]);
                }
            }
        }

        if (!empty($allPermissions)) {
            $grouped['Otros'] = array_values($allPermissions);
        }

        return $grouped;
    }
}
