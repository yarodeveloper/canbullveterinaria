<?php

namespace App\Http\Controllers;

use App\Models\Surgery;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SurgeryController extends Controller
{
    use \App\Traits\ParsesDocumentTemplates;

    public function index(Request $request)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('view surgeries')) {
            abort(403);
        }

        $branchId = Auth::user()->branch_id;
        
        // Ver las cirugías de todas las sucursales (admin) o solo de la actual?
        // El usuario quiere ver/buscar clientes globales.
        $query = Surgery::with(['pet', 'leadSurgeon']);
        
        // Si no hay búsqueda, mostramos por defecto las de la sucursal actual
        if (!$request->filled('search') && $branchId) {
            $query->where('branch_id', $branchId);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->whereHas('pet', function($petQ) use ($search) {
                    $petQ->where('name', 'like', "%{$search}%");
                })
                ->orWhere('surgery_type', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $surgeries = $query->orderBy('scheduled_at', 'desc')->get();

        return Inertia::render('Surgeries/Index', [
            'surgeries' => $surgeries,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create(Request $request)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage surgeries')) {
            abort(403);
        }

        $pet = null;
        if ($request->has('pet_id')) {
            $pet = Pet::with('owner')->find($request->pet_id);
        }

        $branchId = Auth::user()->branch_id;
        $veterinarians = User::where('branch_id', $branchId)
            ->whereIn('role', ['admin', 'veterinarian'])
            ->get();
        
        $clients = User::where('role', 'client')
            ->where('email', '!=', 'publico@general.com')
            ->where('name', 'NOT LIKE', '%Sin Asignar%')
            ->limit(100)
            ->get(['id', 'name']);

        $products = \App\Models\Product::where('is_active', true)
            ->orderByRaw("CASE WHEN is_controlled = 1 THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'is_controlled', 'price', 'is_service']);

        return Inertia::render('Surgeries/Create', [
            'pet' => $pet,
            'veterinarians' => $veterinarians,
            'clients' => $clients,
            'selectedPetId' => $request->pet_id,
            'appointment_id' => $request->appointment_id,
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage surgeries')) {
            abort(403);
        }

        $validated = $request->validate([
            'appointment_id' => 'nullable|exists:appointments,id',
            'pet_id' => 'required|exists:pets,id',
            'veterinarian_id' => 'required|exists:users,id',
            'anesthesiologist_id' => 'nullable|exists:users,id',
            'surgery_type' => 'required|string',
            'scheduled_at' => 'required|date',
            'asa_classification' => 'nullable|string',
            'pre_op_notes' => 'nullable|string',
            'pre_operative_medications' => 'nullable|array',
            'intra_operative_medications' => 'nullable|array',
            'post_operative_medications' => 'nullable|array',
            'pending_charges' => 'nullable|array',
            'pending_charges.*.product_id' => 'required|exists:products,id',
            'pending_charges.*.quantity' => 'required|numeric|min:0.01',
            'pending_charges.*.notes' => 'nullable|string',
        ]);

        $pet = Pet::findOrFail($validated['pet_id']);

        $validated['branch_id'] = Auth::user()->branch_id;
        $validated['status'] = 'scheduled';
        
        // Initial checklist template
        $validated['checklist'] = [
            'pre_op' => [
                ['label' => 'Ayuno (12h)', 'checked' => false],
                ['label' => 'Consentimiento firmado', 'checked' => false],
                ['label' => 'Exámenes pre-quirúrgicos revisados', 'checked' => false],
                ['label' => 'Vía permeable', 'checked' => false],
                ['label' => 'Pre-medicación administrada', 'checked' => false],
            ],
            'intra_op' => [
                ['label' => 'Monitoreo constante vital', 'checked' => false],
                ['label' => 'Control de temperatura', 'checked' => false],
                ['label' => 'Reposición de fluidos', 'checked' => false],
            ],
            'post_op' => [
                ['label' => 'Recuperación de reflejos', 'checked' => false],
                ['label' => 'Control del dolor', 'checked' => false],
                ['label' => 'Herida limpia y vendada', 'checked' => false],
            ]
        ];

        $surgery = Surgery::create($validated);

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
                    'branch_id' => $surgery->branch_id,
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

        return redirect()->route('surgeries.show', $surgery->id)
            ->with('message', 'Cirugía programada correctamente.');
    }

    public function show(Surgery $surgery)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('view surgeries')) {
            abort(403);
        }

        $surgery->load(['pet.consents', 'pet.hospitalizations' => function($q) {
            $q->where('status', 'active');
        }, 'leadSurgeon', 'anesthesiologist', 'branch']);
        
        $templates = \App\Models\DocumentTemplate::where('is_active', true)
            ->where(function($q) use($surgery) {
                $q->where('branch_id', $surgery->branch_id)->orWhereNull('branch_id');
            })->get();

        $branchId = Auth::user()->branch_id;
        $veterinarians = User::where('branch_id', $branchId)
            ->whereIn('role', ['admin', 'veterinarian'])
            ->get();
        $branches = \App\Models\Branch::all();
        $products = \App\Models\Product::where('is_active', true)
            ->orderByRaw("CASE WHEN is_controlled = 1 THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'is_controlled', 'price', 'is_service']);

        return Inertia::render('Surgeries/Show', [
            'surgery' => $surgery,
            'templates' => $templates,
            'veterinarians' => $veterinarians,
            'branches' => $branches,
            'products' => $products
        ]);
    }

    public function update(Request $request, Surgery $surgery)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage surgeries')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'nullable|string',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
            'pre_op_notes' => 'nullable|string',
            'intra_op_notes' => 'nullable|string',
            'post_op_notes' => 'nullable|string',
            'checklist' => 'nullable|array',
            'vital_signs' => 'nullable|array',
            'post_vital_signs' => 'nullable|array',
            'veterinarian_id' => 'nullable|exists:users,id',
            'anesthesiologist_id' => 'nullable|exists:users,id',
            'asa_classification' => 'nullable|string',
            'branch_id' => 'nullable|exists:branches,id',
            'pre_operative_medications' => 'nullable|array',
            'intra_operative_medications' => 'nullable|array',
            'post_operative_medications' => 'nullable|array',
            'pending_charges' => 'nullable|array',
            'pending_charges.*.product_id' => 'required|exists:products,id',
            'pending_charges.*.quantity' => 'required|numeric|min:0.01',
            'pending_charges.*.notes' => 'nullable|string',
        ]);

        $surgery->update($validated);

        // Handle Pending Charges (Send to Cash Register)
        if (!empty($validated['pending_charges'])) {
            // Find the robust owner ID
            $ownerId = $surgery->pet->user_id;
            if (!$ownerId && $surgery->pet->owners()->exists()) {
                $ownerId = $surgery->pet->owners()->first()->id;
            }
            
            // Fallback to "Público en General" if no owner found
            if (!$ownerId) {
                $ownerId = \App\Models\User::where('email', 'publico@general.com')->value('id');
            }

            foreach ($validated['pending_charges'] as $charge) {
                \App\Models\PendingCharge::create([
                    'branch_id' => $surgery->branch_id,
                    'client_id' => $ownerId,
                    'pet_id' => $surgery->pet_id,
                    'product_id' => $charge['product_id'],
                    'quantity' => $charge['quantity'],
                    'assigned_user_id' => Auth::id(),
                    'status' => 'pending',
                    'notes' => $charge['notes'] ?? null,
                ]);
            }
        }

        return redirect()->back()->with('message', 'Registro de cirugía actualizado.');
    }

    public function printConsent(Surgery $surgery, \App\Models\DocumentTemplate $template)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('manage surgeries')) {
            abort(403);
        }

        $surgery->load('pet.owner', 'leadSurgeon');

        $content = $this->parseTemplate($template->content, [
            'pet' => $surgery->pet,
            'veterinarian' => $surgery->leadSurgeon,
            'branch' => $surgery->branch,
            'extra' => [
                'reason' => $surgery->surgery_type,
            ]
        ]);

        return view('print.consent', [
            'content' => $content,
            'title' => $template->title,
            'pet' => $surgery->pet
        ]);
    }

    public function printReport(Surgery $surgery)
    {
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasPermissionTo('view surgeries')) {
            abort(403);
        }

        $surgery->load(['pet.owner', 'leadSurgeon', 'anesthesiologist', 'branch']);

        return view('print.surgery', [
            'surgery' => $surgery,
        ]);
    }
}
