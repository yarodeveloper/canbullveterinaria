<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PetController extends Controller
{
    public function index(Request $request)
    {
        $branchId = Auth::user()->branch_id;
        $search = $request->input('search');
        
        $pets = Pet::where('branch_id', $branchId)
            ->when($search, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhereHas('owner', function($q2) use ($search) {
                          $q2->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->with('owner')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Pets/Index', [
            'pets' => $pets,
            'filters' => request()->only(['search'])
        ]);
    }

    public function create()
    {
        $branchId = Auth::user()->branch_id;
        
        // Only show clients from the same branch
        $clients = User::where('branch_id', $branchId)
            ->where('role', 'client')
            ->get(['id', 'name']);

        return Inertia::render('Pets/Create', [
            'clients' => $clients
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'photo' => 'nullable|image|max:2048', // 2MB Max
            'name' => 'required|string|max:255',
            'species' => 'required|string|max:255',
            'breed' => 'nullable|string|max:255',
            'gender' => 'required|in:male,female,unknown',
            'dob' => 'nullable|date',
            'color' => 'nullable|string|max:255',
            'microchip' => 'nullable|string|unique:pets,microchip',
            'weight' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'user_id' => 'required|exists:users,id',
            'is_aggressive' => 'nullable|boolean',
            'allergies' => 'nullable|string|max:255',
            'chronic_conditions' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,deceased,inactive',
            'death_date' => 'nullable|date',
            'death_reason' => 'nullable|string',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pets/photos', 'public');
            $validated['photo_path'] = $path;
        }

        $validated['branch_id'] = Auth::user()->branch_id;

        $pet = Pet::create($validated);
        
        // Link owner to pivot table
        $pet->owners()->attach($validated['user_id'], ['relation_type' => 'Owner', 'is_primary' => true]);

        if ($request->expectsJson()) {
            return response()->json([
                'pet' => $pet->load('owner'),
                'message' => 'Mascota registrada con éxito.'
            ]);
        }

        return redirect()->route('pets.index')->with('message', 'Mascota registrada con éxito.');
    }

    public function show(Pet $pet)
    {
        $this->authorizeBranch($pet);

        return Inertia::render('Pets/Show', [
            'pet' => $pet->load([
                'owner', 
                'owners', 
                'medicalRecords.veterinarian', 
                'appointments', 
                'consents', 
                'preventiveRecords.veterinarian',
                'surgeries.leadSurgeon',
                'hospitalizations.veterinarian',
                'documents.uploader'
            ]),
            'protocols' => \App\Models\HealthProtocol::whereNull('branch_id')
                ->orWhere('branch_id', Auth::user()->branch_id)
                ->get(),
            'clients' => User::where('branch_id', Auth::user()->branch_id)
                ->where('role', 'client')
                ->get(['id', 'name']),
            'documentTemplates' => \App\Models\DocumentTemplate::where('is_active', true)
                ->where(function($query) {
                    $query->whereNull('branch_id')
                          ->orWhere('branch_id', Auth::user()->branch_id);
                })
                ->get(['id', 'title', 'type'])
        ]);
    }

    public function edit(Pet $pet)
    {
        $this->authorizeBranch($pet);
        $branchId = Auth::user()->branch_id;

        $clients = User::where('branch_id', $branchId)
            ->where('role', 'client')
            ->get(['id', 'name']);

        return Inertia::render('Pets/Edit', [
            'pet' => $pet,
            'clients' => $clients
        ]);
    }

    public function update(Request $request, Pet $pet)
    {
        $this->authorizeBranch($pet);

        $validated = $request->validate([
            'photo' => 'nullable|image|max:2048',
            'name' => 'required|string|max:255',
            'species' => 'required|string|max:255',
            'breed' => 'nullable|string|max:255',
            'gender' => 'required|in:male,female,unknown',
            'dob' => 'nullable|date',
            'color' => 'nullable|string|max:255',
            'microchip' => 'nullable|string|unique:pets,microchip,' . $pet->id,
            'weight' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'user_id' => 'required|exists:users,id',
            'is_aggressive' => 'nullable|boolean',
            'allergies' => 'nullable|string|max:255',
            'chronic_conditions' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,deceased,inactive',
            'death_date' => 'nullable|date',
            'death_reason' => 'nullable|string',
        ]);

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($pet->photo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($pet->photo_path);
            }
            $path = $request->file('photo')->store('pets/photos', 'public');
            $validated['photo_path'] = $path;
        }

        $pet->update($validated);

        return back()->with('message', 'Mascota actualizada con éxito.');
    }

    public function destroy(Pet $pet)
    {
        $this->authorizeBranch($pet);
        $pet->delete();

        return redirect()->route('pets.index')->with('message', 'Mascota eliminada con éxito.');
    }

    public function search(Request $request)
    {
        $query = $request->get('q');
        $branchId = Auth::user()->branch_id;

        // Search pets by name OR owners by phone/email. Include deceased but with a label.
        $results = Pet::where('branch_id', $branchId)
            ->where('name', 'like', "%{$query}%")
            ->with('owner')
            ->limit(10)
            ->get()
            ->map(function($pet) {
                if ($pet->status === 'deceased') {
                    $pet->name = $pet->name . ' (Fallecido)';
                }
                return $pet;
            });

        return response()->json($results);
    }

    public function linkOwner(Request $request, Pet $pet)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'relation_type' => 'required|string'
        ]);

        $pet->owners()->syncWithoutDetaching([
            $request->user_id => ['relation_type' => $request->relation_type]
        ]);

        return back()->with('message', 'Dueño vinculado correctamente.');
    }

    protected function authorizeBranch(Pet $pet)
    {
        if ($pet->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }
    }
}
