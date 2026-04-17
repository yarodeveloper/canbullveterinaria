<?php

namespace App\Http\Controllers;

use App\Models\Hospitalization;
use App\Models\HospitalizationMonitoring;
use App\Models\Pet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class HospitalizationController extends Controller
{
    use \App\Traits\ParsesDocumentTemplates;

    public function index(Request $request)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('view hospitalizations')) {
            abort(403);
        }

        $branchId = Auth::user()->branch_id;
        $query = Hospitalization::with(['pet.owner', 'veterinarian']);
        
        // Por defecto ver sucursal actual, pero permitir búsqueda global
        if (!$request->filled('search') && $branchId) {
            $query->where('branch_id', $branchId);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->whereHas('pet', function($petQ) use ($search) {
                    $petQ->where('name', 'like', "%{$search}%");
                })
                ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $hospitalizations = $query->latest()->get();

        return Inertia::render('Hospitalizations/Index', [
            'hospitalizations' => $hospitalizations,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create(Request $request)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage hospitalizations')) {
            abort(403);
        }

        $pet = null;
        if ($request->has('pet_id')) {
            $pet = Pet::with('owner')->findOrFail($request->pet_id);
        }

        $branchId = Auth::user()->branch_id;
        $clients = \App\Models\User::where('role', 'client')
            ->where('email', '!=', 'publico@general.com')
            ->where('name', 'NOT LIKE', '%Sin Asignar%')
            ->limit(100)
            ->get(['id', 'name']);

        $products = \App\Models\Product::where('is_active', true)
            ->orderByRaw("CASE WHEN is_controlled = 1 THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'is_controlled', 'price', 'is_service']);

        return Inertia::render('Hospitalizations/Create', [
            'pet' => $pet,
            'clients' => $clients,
            'products' => $products,
            'appointment_id' => $request->appointment_id
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage hospitalizations')) {
            abort(403);
        }

        $validated = $request->validate([
            'appointment_id' => 'nullable|exists:appointments,id',
            'pet_id' => 'required|exists:pets,id',
            'reason' => 'required|string',
            'initial_weight' => 'nullable|numeric',
            'admission_date' => 'required|date',
            'medications' => 'nullable|array',
            'pending_charges' => 'nullable|array',
            'pending_charges.*.product_id' => 'required|exists:products,id',
            'pending_charges.*.quantity' => 'required|numeric|min:0.01',
            'pending_charges.*.notes' => 'nullable|string',
        ]);

        $pet = Pet::findOrFail($validated['pet_id']);

        $hospitalization = new Hospitalization($validated);
        $hospitalization->user_id = Auth::id();
        $hospitalization->branch_id = Auth::user()->branch_id ?? $pet->branch_id;
        $hospitalization->status = 'active';
        $hospitalization->save();

        if (!empty($validated['appointment_id'])) {
            \App\Models\Appointment::where('id', $validated['appointment_id'])->update(['status' => 'completed']);
        }

        // Handle Pending Charges (Send to Cash Register)
        if (!empty($validated['pending_charges'])) {
            // Find the robust owner ID
            $ownerId = $pet->user_id;
            if (!$ownerId && $pet->owners()->exists()) {
                $ownerId = $pet->owners()->first()->id;
            }
            
            // Fallback to "Público en General" if no owner found
            if (!$ownerId) {
                $ownerId = \App\Models\User::where('email', 'publico@general.com')->value('id');
            }

            foreach ($validated['pending_charges'] as $charge) {
                \App\Models\PendingCharge::create([
                    'branch_id' => $hospitalization->branch_id,
                    'client_id' => $ownerId,
                    'pet_id' => $pet->id,
                    'product_id' => $charge['product_id'],
                    'quantity' => $charge['quantity'],
                    'assigned_user_id' => Auth::id(),
                    'status' => 'pending',
                    'notes' => $charge['notes'] ?? null,
                ]);
            }
        }

        return redirect()->route('hospitalizations.show', $hospitalization->id)
            ->with('message', 'Hospitalización iniciada correctamente.');
    }

    public function show(Hospitalization $hospitalization)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('view hospitalizations')) {
            abort(403);
        }

        $templates = \App\Models\DocumentTemplate::where('is_active', true)
            ->where(function($q) use($hospitalization) {
                $q->where('branch_id', $hospitalization->branch_id)->orWhereNull('branch_id');
            })->get();

        $products = \App\Models\Product::where('is_active', true)
            ->orderByRaw("CASE WHEN is_controlled = 1 THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'is_controlled', 'price', 'is_service']);

        return Inertia::render('Hospitalizations/Show', [
            'hospitalization' => $hospitalization->load(['pet.owner', 'pet.surgeries', 'veterinarian', 'monitorings.recorder']),
            'templates' => $templates,
            'products' => $products
        ]);
    }

    public function printConsent(Hospitalization $hospitalization, \App\Models\DocumentTemplate $template)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage hospitalizations')) {
            abort(403);
        }

        $hospitalization->load('pet.owner', 'veterinarian');

        $content = $this->parseTemplate($template->content, [
            'pet' => $hospitalization->pet,
            'veterinarian' => $hospitalization->veterinarian,
            'branch' => $hospitalization->pet->branch,
            'extra' => [
                'reason' => $hospitalization->reason,
            ]
        ]);

        return view('print.consent', [
            'content' => $content,
            'title' => $template->title,
            'pet' => $hospitalization->pet
        ]);
    }

    public function storeMonitoring(Request $request, Hospitalization $hospitalization)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage hospitalizations')) {
            abort(403);
        }

        $validated = $request->validate([
            'temperature' => 'nullable|numeric',
            'heart_rate' => 'nullable|integer',
            'respiratory_rate' => 'nullable|integer',
            'mucosa_color' => 'nullable|string',
            'capillary_refill_time' => 'nullable|string',
            'blood_pressure' => 'nullable|string',
            'hydration_status' => 'nullable|string',
            'pain_score' => 'nullable|integer|between:0,10',
            'mental_state' => 'nullable|string',
            'medication_administered' => 'nullable|string',
            'food_intake' => 'nullable|string',
            'urination' => 'nullable|string',
            'defecation' => 'nullable|string',
            'notes' => 'nullable|string',
            'lymph_nodes' => 'nullable|string',
            'abdominal_palpation' => 'nullable|string',
            'bcs' => 'nullable|string',
        ]);

        $monitoring = new HospitalizationMonitoring($validated);
        $monitoring->hospitalization_id = $hospitalization->id;
        $monitoring->user_id = Auth::id();
        $monitoring->save();

        return back()->with('message', 'Registro de monitoreo añadido.');
    }

    public function update(Request $request, Hospitalization $hospitalization)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage hospitalizations')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'nullable|in:active,discharged,expired,euthanized',
            'discharge_notes' => 'nullable|string',
            'discharge_date' => 'nullable|date',
            'medications' => 'nullable|array',
            'pending_charges' => 'nullable|array',
            'pending_charges.*.product_id' => 'required|exists:products,id',
            'pending_charges.*.quantity' => 'required|numeric|min:0.01',
            'pending_charges.*.notes' => 'nullable|string',
        ]);

        if (isset($validated['status']) && $validated['status'] !== 'active' && !$hospitalization->discharge_date) {
            $validated['discharge_date'] = now();
        }

        $hospitalization->update($validated);

        // Handle Pending Charges (Send to Cash Register)
        if (!empty($validated['pending_charges'])) {
            $pet = $hospitalization->pet;
            // Find the robust owner ID
            $ownerId = $pet->user_id;
            if (!$ownerId && $pet->owners()->exists()) {
                $ownerId = $pet->owners()->first()->id;
            }

            foreach ($validated['pending_charges'] as $charge) {
                \App\Models\PendingCharge::create([
                    'branch_id' => $hospitalization->branch_id,
                    'client_id' => $ownerId,
                    'pet_id' => $pet->id,
                    'product_id' => $charge['product_id'],
                    'quantity' => $charge['quantity'],
                    'assigned_user_id' => Auth::id(),
                    'status' => 'pending',
                    'notes' => $charge['notes'] ?? null,
                ]);
            }
        }

        // Sync with Pet status if status changed
        if (isset($validated['status'])) {
            if (in_array($validated['status'], ['expired', 'euthanized'])) {
                $hospitalization->pet->update([
                    'status' => 'deceased',
                    'death_date' => $validated['discharge_date'],
                    'death_reason' => ($validated['status'] === 'euthanized' ? 'Eutanasia: ' : 'Defunción: ') . ($validated['discharge_notes'] ?? '')
                ]);
            } elseif ($validated['status'] === 'active') {
                // Revert if it was accidentally marked as deceased
                if ($hospitalization->pet->status === 'deceased') {
                    $hospitalization->pet->update([
                        'status' => 'active',
                        'death_date' => null,
                        'death_reason' => null
                    ]);
                }
            }
        }

        return back()->with('message', 'Estado de hospitalización actualizado.');
    }

    public function printReport(Hospitalization $hospitalization)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('view hospitalizations')) {
            abort(403);
        }

        $hospitalization->load(['pet.owner', 'veterinarian', 'branch', 'monitorings.recorder']);

        return view('print.hospitalization', [
            'hospitalization' => $hospitalization,
        ]);
    }

    public function updateMonitoring(Request $request, HospitalizationMonitoring $monitoring)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage hospitalizations')) {
            abort(403);
        }

        $validated = $request->validate([
            'temperature' => 'nullable|numeric',
            'heart_rate' => 'nullable|integer',
            'respiratory_rate' => 'nullable|integer',
            'mucosa_color' => 'nullable|string',
            'capillary_refill_time' => 'nullable|string',
            'blood_pressure' => 'nullable|string',
            'hydration_status' => 'nullable|string',
            'pain_score' => 'nullable|integer|between:0,10',
            'mental_state' => 'nullable|string',
            'medication_administered' => 'nullable|string',
            'food_intake' => 'nullable|string',
            'urination' => 'nullable|string',
            'defecation' => 'nullable|string',
            'notes' => 'nullable|string',
            'lymph_nodes' => 'nullable|string',
            'abdominal_palpation' => 'nullable|string',
            'bcs' => 'nullable|string',
        ]);

        $monitoring->update($validated);

        return back()->with('message', 'Registro de monitoreo actualizado.');
    }

    public function destroyMonitoring(HospitalizationMonitoring $monitoring)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage hospitalizations')) {
            abort(403);
        }

        $monitoring->delete();

        return back()->with('message', 'Registro de monitoreo eliminado.');
    }
}
