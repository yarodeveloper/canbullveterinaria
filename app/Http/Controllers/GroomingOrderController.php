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
            $q->where('name', 'admin')->orWhere('name', 'veterinarian')->orWhere('name', 'groomer')->orWhere('name', 'staff');
        })->orWhere('role', 'admin')->get(); // fallback based on existing logic. Using all staff for simplicity.

        return Inertia::render('Grooming/Create', [
            'pet' => $pet,
            'services' => $services,
            'groomers' => $groomers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'client_id' => 'required|exists:users,id',
            'user_id' => 'nullable|exists:users,id',
            'arrival_condition' => 'nullable|string',
            'notes' => 'nullable|string',
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
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                GroomingOrderItem::create([
                    'grooming_order_id' => $order->id,
                    'product_id' => $product->id,
                    'concept' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $item['quantity'],
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
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated, $groomingOrder) {
            $groomingOrder->update([
                'arrival_condition' => $validated['arrival_condition'],
                'notes' => $validated['notes'],
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
