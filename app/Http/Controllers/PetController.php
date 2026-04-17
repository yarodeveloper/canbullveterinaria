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
        
        $pets = Pet::query()
            ->when($search, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhereHas('owner', function($q2) use ($search) {
                          $q2->where('name', 'like', "%{$search}%")
                             ->orWhere('phone', 'like', "%{$search}%");
                      });
                });
            })
            ->with(['owner', 'branch'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Pets/Index', [
            'pets' => $pets,
            'filters' => request()->only(['search'])
        ]);
    }

    public function create()
    {
        $branchId = Auth::user()->branch_id;
        
        $clients = User::where('role', 'client')
            ->orderBy('name')
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
            'is_sterilized' => 'nullable|boolean',
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
                'medicalRecords.veterinarian:id,name,role', 
                'appointments', 
                'consents', 
                'preventiveRecords.veterinarian:id,name,role',
                'surgeries.leadSurgeon:id,name,role',
                'hospitalizations.veterinarian:id,name,role',
                'documents.uploader:id,name',
                'groomingOrders.user:id,name'
            ]),
            'protocols' => \App\Models\HealthProtocol::whereNull('branch_id')
                ->orWhere('branch_id', Auth::user()->branch_id)
                ->get(),
            'clients' => User::where('role', 'client')
                ->orderBy('name')
                ->limit(20) // Limit to avoid performance issues
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

        $clients = User::where('role', 'client')
            ->orderBy('name')
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
            'is_sterilized' => 'nullable|boolean',
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

    public function updatePhoto(Request $request, Pet $pet)
    {
        $this->authorizeBranch($pet);
        
        $request->validate([
            'photo' => 'required|image|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            if ($pet->photo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($pet->photo_path);
            }
            $path = $request->file('photo')->store('pets/photos', 'public');
            $pet->update(['photo_path' => $path]);
        }

        return back()->with('message', 'Foto actualizada exitosamente.');
    }

    public function search(Request $request)
    {
        $query = $request->get('q');
        $branchId = Auth::user()->branch_id;

        // Búsqueda global de mascotas para permitir pacientes móviles entre sucursales
        $results = Pet::query()
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('microchip', 'like', "%{$query}%")
                  ->orWhereHas('owner', function($q2) use ($query) {
                      $q2->where('name', 'like', "%{$query}%")
                         ->orWhere('phone', 'like', "%{$query}%");
                  });
            })
            ->with(['owner', 'branch'])
            ->limit(15)
            ->get()
            ->map(function($pet) {
                $label = $pet->name;
                if ($pet->status === 'deceased') {
                    $label .= ' (Fallecido)';
                }
                $branchLabel = $pet->branch ? " [{$pet->branch->name}]" : " [Global]";
                return [
                    'id' => $pet->id,
                    'name' => $label,
                    'owner_name' => $pet->owner ? $pet->owner->name : 'Sin dueño',
                    'branch_name' => $pet->branch ? $pet->branch->name : 'N/A',
                    'text' => "{$label} - " . ($pet->owner ? $pet->owner->name : 'S/D') . "{$branchLabel}",
                    'pet' => $pet->makeHidden(['selling_price', 'base_price'])
                ];
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
        $userBranchId = Auth::user()->branch_id;

        // Permitir ver mascotas de otras sucursales si el usuario es Admin Global
        // O permitirlo siempre para lectura si el negocio decide que los pacientes son compartidos.
        // Por ahora, permitimos lectura global pero restringiremos acciones críticas si es necesario en cada método.
        if ($userBranchId && $pet->branch_id && $pet->branch_id !== $userBranchId) {
            // Si queremos ser estrictos: abort(403);
            // Pero para movilidad de clientes, dejamos pasar el 'show'.
        }
    }
}
