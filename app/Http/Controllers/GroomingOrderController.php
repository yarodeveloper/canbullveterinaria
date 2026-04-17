<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GroomingOrder;
use App\Models\GroomingOrderItem;
use App\Models\Pet;
use App\Models\Product;
use App\Models\PendingCharge;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GroomingOrderController extends Controller
{
    public function index(Request $request)
    {
        $branchId = Auth::user()->branch_id;
        $query = GroomingOrder::with(['pet.owner', 'user']);
        
        // Ver las de la sucursal por defecto, pero permitir búsqueda global
        if (!$request->filled('search') && $branchId) {
            $query->where('branch_id', $branchId);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->whereHas('pet', function($petQ) use ($search) {
                    $petQ->where('name', 'like', "%{$search}%")
                         ->orWhereHas('owner', function($ownerQ) use ($search) {
                             $ownerQ->where('name', 'like', "%{$search}%");
                         });
                })
                ->orWhere('folio', 'like', "%{$search}%")
                ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        $groomingOrders = $query->latest()->paginate(15);

        // Pre-load data for create modal
        // Datos globales para facilitar atención cruzada
        $clients = \App\Models\User::where('role', 'client')
            ->where('email', '!=', 'publico@general.com')
            ->where('name', 'NOT LIKE', '%Sin Asignar%')
            ->get(['id', 'name', 'phone']);

        $pets = Pet::query()
            ->with(['owner', 'branch'])
            ->limit(100)
            ->get(['id', 'name', 'user_id', 'breed', 'species', 'branch_id']);

        $groomers = User::where('branch_id', $branchId)
            ->where(function ($q) {
                $q->whereHas('roles', function($r) {
                    $r->whereIn('name', ['admin', 'veterinarian', 'groomer', 'staff']);
                })->orWhereIn('role', ['admin', 'veterinarian', 'groomer', 'staff']);
            })
            ->with('roles')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->roles->first() ? $user->roles->first()->name : $user->role
                ];
            });

        return Inertia::render('Grooming/Index', [
            'groomingOrders' => $groomingOrders,
            'clients' => $clients,
            'pets' => $pets,
            'groomers' => $groomers,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create(Request $request)
    {
        $pet = Pet::with(['owner'])->findOrFail($request->pet_id);
        // Products that are aesthetic services (we assume all services could be used or a subset)
        // Perhaps all is_service products
        $services = Product::where('is_service', true)
            ->where(function($q) {
                $q->where('name', 'like', '%estetic%')
                  ->orWhere('name', 'like', '%grooming%')
                  ->orWhere('name', 'like', '%baño%')
                  ->orWhere('name', 'like', '%corte%')
                  ->orWhere('name', 'like', '%pelo%');
            })
            ->get();
            
        // If empty fallback to all services, or all products
        if ($services->isEmpty()) {
            $services = Product::where('is_service', true)->get();
        }

        $groomers = User::whereHas('roles', function($q) {
            $q->whereIn('name', ['admin', 'veterinarian', 'groomer', 'staff']);
        })->orWhereIn('role', ['admin', 'veterinarian', 'groomer', 'staff'])
        ->with('roles')
        ->get()
        ->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->roles->first() ? $user->roles->first()->name : $user->role
            ];
        });

        $nextVisitDays = (int) (\App\Models\SiteSetting::where('key', 'grooming_next_visit_days')->first()?->value ?? 30);
        $defaultNextVisitDate = \Carbon\Carbon::now()->addDays($nextVisitDays)->toDateString();

        return Inertia::render('Grooming/Create', [
            'pet' => $pet,
            'services' => $services,
            'groomers' => $groomers,
            'appointment_id' => $request->appointment_id,
            'prefill' => $request->only(['groomer_id', 'time']),
            'defaultNextVisitDate' => $defaultNextVisitDate
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'appointment_id' => 'nullable|exists:appointments,id',
            'pet_id' => 'required|exists:pets,id',
            'client_id' => 'required|exists:users,id',
            'user_id' => 'nullable|exists:users,id',
            'arrival_condition' => 'nullable|string',
            'notes' => 'nullable|string',
            'next_visit_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated, &$order) {
            $order = GroomingOrder::create([
                'branch_id' => Auth::user()->branch_id ?? 1,
                'client_id' => $validated['client_id'],
                'pet_id' => $validated['pet_id'],
                'user_id' => $validated['user_id'] ?? Auth::id(),
                'status' => 'pending',
                'arrival_condition' => $validated['arrival_condition'],
                'notes' => $validated['notes'],
                'next_visit_date' => $validated['next_visit_date'],
            ]);

            if (!empty($validated['appointment_id'])) {
                \App\Models\Appointment::where('id', $validated['appointment_id'])->update(['status' => 'completed']);
            }

            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                GroomingOrderItem::create([
                    'grooming_order_id' => $order->id,
                    'product_id' => $product->id,
                    'concept' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $item['quantity'],
                ]);

                // Create POS Pending Charge
                \App\Models\PendingCharge::create([
                    'branch_id' => $order->branch_id,
                    'client_id' => $order->client_id,
                    'pet_id' => $order->pet_id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'assigned_user_id' => $order->user_id,
                    'status' => 'pending',
                    'notes' => 'Estética: ' . ($validated['notes'] ?? '')
                ]);
            }
        });

        return redirect()->route('pets.show', $validated['pet_id'])->with('success', 'Orden de estética creada exitosamente.');
    }

    public function show(GroomingOrder $groomingOrder)
    {
        $groomingOrder->load(['pet.owner', 'user', 'items.product']);

        $services = Product::where('is_service', true)
            ->where(function($q) {
                $q->where('name', 'like', '%estetic%')
                  ->orWhere('name', 'like', '%grooming%')
                  ->orWhere('name', 'like', '%baño%')
                  ->orWhere('name', 'like', '%corte%')
                  ->orWhere('name', 'like', '%pelo%');
            })
            ->get();
            
        if ($services->isEmpty()) {
            $services = Product::where('is_service', true)->get();
        }

        return Inertia::render('Grooming/Show', [
            'order' => $groomingOrder,
            'services' => $services
        ]);
    }

    public function update(Request $request, GroomingOrder $groomingOrder)
    {
        if ($groomingOrder->status === 'completed') {
            return back()->with('error', 'La orden ya está completada y no se puede editar.');
        }

        $validated = $request->validate([
            'arrival_condition' => 'nullable|string',
            'notes' => 'nullable|string',
            'next_visit_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated, $groomingOrder) {
            $groomingOrder->update([
                'arrival_condition' => $validated['arrival_condition'],
                'notes' => $validated['notes'],
                'next_visit_date' => $validated['next_visit_date'],
            ]);

            // Sync items (deleting all and re-creating is simpler for this structure)
            $groomingOrder->items()->delete();

            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                GroomingOrderItem::create([
                    'grooming_order_id' => $groomingOrder->id,
                    'product_id' => $product->id,
                    'concept' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $item['quantity'],
                ]);
            }
        });

        return back()->with('success', 'Orden actualizada con éxito.');
    }

    public function complete(Request $request, GroomingOrder $groomingOrder)
    {
        if ($groomingOrder->status === 'completed') {
            return back()->with('error', 'La orden ya está completada.');
        }

        DB::transaction(function () use ($request, $groomingOrder) {
            // Update status
            $groomingOrder->update([
                'status' => 'completed',
                'notes' => $request->notes ?? $groomingOrder->notes,
            ]);

            // Create Pending Charges for POS
            foreach ($groomingOrder->items as $item) {
                PendingCharge::create([
                    'branch_id' => $groomingOrder->branch_id,
                    'client_id' => $groomingOrder->client_id,
                    'pet_id' => $groomingOrder->pet_id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'assigned_user_id' => $groomingOrder->user_id, // Atendió groomer
                    'status' => 'pending',
                    'notes' => 'Estética Folio: ' . $groomingOrder->folio,
                ]);
            }
        });

        return back()->with('success', 'Orden completada y cargada a caja para cobro.');
    }
}
