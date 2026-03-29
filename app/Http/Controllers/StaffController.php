<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    public function index()
    {
        // Solo administradores pueden ver esta lista
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        $staff = User::where('role', '!=', 'client')
            ->with(['roles', 'branch'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Settings/Staff/Index', [
            'staff' => $staff
        ]);
    }

    public function create()
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        return Inertia::render('Settings/Staff/Create', [
            'roles' => Role::where('name', '!=', 'client')->get(),
            'branches' => Branch::all()
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|exists:roles,name',
            'branch_id' => 'required|exists:branches,id',
            'phone' => 'nullable|string|max:20',
            'professional_license' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'branch_id' => $request->branch_id,
            'phone' => $request->phone,
            'professional_license' => $request->professional_license,
        ]);

        $user->assignRole($request->role);

        return redirect()->route('staff.index')
            ->with('message', 'Miembro del personal creado correctamente.');
    }

    public function edit(User $staff)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        return Inertia::render('Settings/Staff/Edit', [
            'member' => $staff->load('roles'),
            'roles' => Role::where('name', '!=', 'client')->get(),
            'branches' => Branch::all()
        ]);
    }

    public function update(Request $request, User $staff)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $staff->id,
            'role' => 'required|exists:roles,name',
            'branch_id' => 'required|exists:branches,id',
            'phone' => 'nullable|string|max:20',
            'professional_license' => 'nullable|string|max:255',
        ]);

        $staff->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'branch_id' => $request->branch_id,
            'phone' => $request->phone,
            'professional_license' => $request->professional_license,
        ]);

        if ($request->password) {
            $request->validate([
                'password' => ['confirmed', Rules\Password::defaults()],
            ]);
            $staff->update(['password' => Hash::make($request->password)]);
        }

        $staff->syncRoles([$request->role]);

        return redirect()->route('staff.index')
            ->with('message', 'Información actualizada correctamente.');
    }

    public function destroy(User $staff)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage settings')) {
            abort(403);
        }

        if ($staff->id === auth()->id()) {
            return redirect()->back()->with('error', 'No puedes eliminarte a ti mismo.');
        }

        $staff->delete();

        return redirect()->route('staff.index')
            ->with('message', 'Miembro eliminado correctamente.');
    }
}
