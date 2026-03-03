<?php

namespace App\Http\Controllers;

use App\Models\PetBreed;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PetBreedController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $breeds = PetBreed::latest()->paginate(15);
        
        return Inertia::render('Breeds/Index', [
            'breeds' => $breeds
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Breeds/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'species' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'size' => 'nullable|string|max:255',
            'adult_weight' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        PetBreed::create($validated);

        return redirect()->route('breeds.index')->with('message', 'Raza agregada al catálogo.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PetBreed $breed)
    {
        return Inertia::render('Breeds/Edit', [
            'breed' => $breed
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PetBreed $breed)
    {
        $validated = $request->validate([
            'species' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'size' => 'nullable|string|max:255',
            'adult_weight' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $breed->update($validated);

        return redirect()->route('breeds.index')->with('message', 'Raza actualizada.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PetBreed $breed)
    {
        $breed->delete();
        return redirect()->route('breeds.index')->with('message', 'Raza eliminada del catálogo.');
    }

    /**
     * API Search for the frontend dropdowns.
     */
    public function search(Request $request)
    {
        $species = $request->get('species');
        $query = $request->get('q');
        $size = $request->get('size');

        $breeds = PetBreed::query();

        if ($species) {
            $breeds->where('species', $species);
        }

        if ($query) {
            $breeds->where('name', 'like', "%{$query}%");
        }

        if ($size) {
            $breeds->where('size', $size);
        }

        return response()->json($breeds->limit(20)->get());
    }
}
