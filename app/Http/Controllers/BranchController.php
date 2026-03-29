<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index()
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403);
        }

        $branches = Branch::latest()->paginate(10);

        return Inertia::render('Settings/Branches/Index', [
            'branches' => $branches
        ]);
    }

    public function create()
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403);
        }

        return Inertia::render('Settings/Branches/Create');
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'tax_id' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        Branch::create($validated);

        return redirect()->route('branches.index')
            ->with('message', 'Sucursal creada correctamente.');
    }

    public function edit(Branch $branch)
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403);
        }

        return Inertia::render('Settings/Branches/Edit', [
            'branch' => $branch
        ]);
    }

    public function update(Request $request, Branch $branch)
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'tax_id' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $branch->update($validated);

        return redirect()->route('branches.index')
            ->with('message', 'Sucursal actualizada correctamente.');
    }

    public function destroy(Branch $branch)
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403);
        }

        // Evitar eliminar la última sucursal o la sucursal actual si se desea
        if (Branch::count() <= 1) {
            return redirect()->back()->with('error', 'No puedes eliminar la única sucursal disponible.');
        }

        $branch->delete();

        return redirect()->route('branches.index')
            ->with('message', 'Sucursal eliminada correctamente.');
    }
}
