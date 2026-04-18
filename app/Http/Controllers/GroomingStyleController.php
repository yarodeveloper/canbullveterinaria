<?php

namespace App\Http\Controllers;

use App\Models\GroomingStyle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroomingStyleController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/GroomingStyles/Index', [
            'styles' => GroomingStyle::orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'is_active' => 'boolean'
        ]);

        GroomingStyle::create($validated);

        return back()->with('success', 'Estilo de corte creado correctamente.');
    }

    public function update(Request $request, GroomingStyle $groomingStyle)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'is_active' => 'boolean'
        ]);

        $groomingStyle->update($validated);

        return back()->with('success', 'Estilo de corte actualizado correctamente.');
    }

    public function destroy(GroomingStyle $groomingStyle)
    {
        $groomingStyle->delete();

        return back()->with('success', 'Estilo de corte eliminado correctamente.');
    }
}
