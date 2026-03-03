<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    public function index()
    {
        $branchId = Auth::user()->branch_id;
        
        $clients = User::where('branch_id', $branchId)
            ->where('role', 'client')
            ->where('email', '!=', 'publico@general.com')
            ->withCount('pets')
            ->latest()
            ->paginate(10);

        return Inertia::render('Clients/Index', [
            'clients' => $clients
        ]);
    }

    public function create()
    {
        return Inertia::render('Clients/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'tax_id' => 'nullable|string|max:20',
            'crm_notes' => 'nullable|string',
            'behavior_profile' => 'nullable|string',
        ]);

        $validated['role'] = 'client';
        $validated['branch_id'] = Auth::user()->branch_id;
        $validated['password'] = Hash::make($request->phone ?? 'welcome123'); // Default password

        $client = User::create($validated);
        
        if ($request->wantsJson()) {
            return response()->json($client);
        }

        return redirect()->route('clients.index')->with('message', 'Cliente registrado con éxito.');
    }

    public function show(User $client)
    {
        $this->authorizeBranch($client);

        return Inertia::render('Clients/Show', [
            'client' => $client->load(['pets' => function($q) {
                $q->withCount(['medicalRecords', 'appointments']);
            }])
        ]);
    }

    public function edit(User $client)
    {
        $this->authorizeBranch($client);

        return Inertia::render('Clients/Edit', [
            'client' => $client
        ]);
    }

    public function update(Request $request, User $client)
    {
        $this->authorizeBranch($client);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $client->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'tax_id' => 'nullable|string|max:20',
            'crm_notes' => 'nullable|string',
            'behavior_profile' => 'nullable|string',
        ]);

        $client->update($validated);

        return back()->with('message', 'Datos del cliente actualizados.');
    }

    protected function authorizeBranch(User $user)
    {
        if ($user->email === 'publico@general.com') {
            abort(403, 'Este cliente es del sistema y no puede ser modificado manualmente.');
        }

        if ($user->branch_id !== Auth::user()->branch_id || $user->role !== 'client') {
            abort(403);
        }
    }
}
