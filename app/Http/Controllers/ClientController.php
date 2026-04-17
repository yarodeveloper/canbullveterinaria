<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $branchId = Auth::user()->branch_id;
        $search = $request->input('search');
        
        $clients = User::query()
            ->where('role', 'client')
            ->where(function($q) {
                $q->where('email', '!=', 'publico@general.com')
                  ->orWhereNull('email');
            })
            ->where('name', 'NOT LIKE', '%Sin Asignar%')
            ->when($search, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->withCount('pets')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => request()->only(['search'])
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
            'email' => 'nullable|string|email|max:255|unique:users',
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

        $branchId = Auth::user()->branch_id;
        
        $documentTemplates = \App\Models\DocumentTemplate::where(function($q) use($branchId) {
                $q->where('branch_id', $branchId)->orWhereNull('branch_id');
            })->where('is_active', true)->get();

        $financialSummary = [
            'pending_credit' => (float) \App\Models\Receipt::where('user_id', $client->id)->where('status', 'pending')->sum('total'),
            'pending_receipts' => \App\Models\Receipt::where('user_id', $client->id)->where('status', 'pending')->get(['id', 'receipt_number', 'total', 'date']),
            'pending_charges' => \App\Models\PendingCharge::with(['pet:id,name', 'product:id,name,price'])->where('client_id', $client->id)->where('status', 'pending')->get(),
            'last_payment_date' => \App\Models\Receipt::where('user_id', $client->id)->where('status', 'paid')->latest()->value('date'),
            'total_historical' => (float) \App\Models\Receipt::where('user_id', $client->id)->where('status', 'paid')->sum('total'),
        ];

        return Inertia::render('Clients/Show', [
            'client' => $client->load(['pets' => function($q) {
                $q->withCount(['medicalRecords', 'appointments']);
            }, 'branch']),
            'documentTemplates' => $documentTemplates,
            'financialSummary' => $financialSummary
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
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $client->id,
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

        $branchId = Auth::user()->branch_id;
        
        // Permitir ver clientes de otras sucursales si el usuario administrativo
        // Pero restringir la EDICIÓN de datos básicos si fuera necesario (opcional)
        // Por ahora, permitimos lectura global para soporte multi-sucursal.
        if ($branchId && $user->branch_id && $user->branch_id !== $branchId) {
            // Unrestricted read.
        }

        if ($user->role !== 'client') {
            abort(403);
        }
    }
}
