<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Quote::with(['pet.owner', 'creator'])
            ->where('branch_id', auth()->user()->branch_id);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('folio', 'like', "%{$request->search}%")
                  ->orWhere('guest_client_name', 'like', "%{$request->search}%")
                  ->orWhereHas('pet.owner', function($sq) use ($request) {
                      $sq->where('name', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $quotes = $query->latest()->paginate(15)->withQueryString();

        return \Inertia\Inertia::render('Quotes/Index', [
            'quotes'  => $quotes,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create(Request $request)
    {
        $pet = null;
        if ($request->has('pet_id')) {
            $pet = \App\Models\Pet::with('owner')->findOrFail($request->pet_id);
        }

        $templates = \App\Models\ServiceTemplate::with('items.product')->where('is_active', true)->get();
        $products = \App\Models\Product::where('is_active', true)->get(['id', 'name', 'price', 'unit', 'is_service']);
        $clients = \App\Models\User::where('role', 'client')->limit(100)->get(['id', 'name']);
        $petsList = \App\Models\Pet::with('owner')->limit(100)->get();
        $settings = \App\Models\SiteSetting::first();

        return \Inertia\Inertia::render('Quotes/Create', [
            'pet'      => $pet,
            'templates' => $templates,
            'products' => $products,
            'clients'  => $clients,
            'petsList' => $petsList,
            'settings' => $settings,
        ]);
    }

    public function store(Request $request)
    {
        $isGuest = $request->boolean('is_guest');

        $rules = [
            'status'              => 'required|string|in:Borrador,Enviada,Aceptada,Rechazada,Vencida',
            'valid_until'         => 'nullable|date',
            'notes'               => 'nullable|string',
            'items'               => 'required|array|min:1',
            'items.*.product_id'  => 'nullable|exists:products,id',
            'items.*.category'    => 'required|string',
            'items.*.description' => 'required|string',
            'items.*.quantity'    => 'required|numeric',
            'items.*.unit_price'  => 'required|numeric',
            'items.*.subtotal'    => 'required|numeric',
        ];

        if ($isGuest) {
            $rules['guest_client_name'] = 'required|string|max:255';
            $rules['guest_pet_name']    = 'required|string|max:255';
            $rules['guest_species']     = 'nullable|string|max:100';
        } else {
            $rules['pet_id']    = 'required|exists:pets,id';
            $rules['client_id'] = 'required|exists:users,id';
        }

        $validated = $request->validate($rules);

        $weight = null;
        if (!$isGuest && isset($validated['pet_id'])) {
            $pet    = \App\Models\Pet::findOrFail($validated['pet_id']);
            $weight = $pet->weight;
        }

        $quote = \App\Models\Quote::create([
            'folio'             => \App\Models\Quote::generateFolio(),
            'pet_id'            => $isGuest ? null : ($validated['pet_id'] ?? null),
            'client_id'         => $isGuest ? null : ($validated['client_id'] ?? null),
            'guest_client_name' => $isGuest ? $validated['guest_client_name'] : null,
            'guest_pet_name'    => $isGuest ? $validated['guest_pet_name'] : null,
            'guest_species'     => $isGuest ? ($validated['guest_species'] ?? null) : null,
            'branch_id'         => auth()->user()->branch_id,
            'user_id'           => auth()->id(),
            'status'            => $validated['status'],
            'weight_at_time'    => $weight,
            'valid_until'       => $validated['valid_until'],
            'notes'             => $validated['notes'],
        ]);

        $subtotal = 0;
        foreach ($validated['items'] as $itemData) {
            $quote->items()->create($itemData);
            $subtotal += $itemData['subtotal'];
        }

        $quote->update([
            'subtotal' => $subtotal,
            'total'    => $subtotal,
        ]);

        return redirect()->route('quotes.show', $quote->id)->with('message', 'Cotización generada: ' . $quote->folio);
    }

    public function show(\App\Models\Quote $quote)
    {
        if ($quote->branch_id !== auth()->user()->branch_id) {
            abort(403);
        }

        $settings = \App\Models\SiteSetting::first();

        return \Inertia\Inertia::render('Quotes/Show', [
            'quote'    => $quote->load(['items.product', 'pet.owner', 'creator', 'pendingCharges']),
            'settings' => $settings,
        ]);
    }

    public function update(Request $request, \App\Models\Quote $quote)
    {
        if ($quote->branch_id !== auth()->user()->branch_id) {
            abort(403);
        }

        if ($quote->status === 'Cobrada') {
            return back()->withErrors(['error' => 'No se puede modificar una cotización que ya ha sido cobrada.']);
        }

        $validated = $request->validate([
            'status'      => 'nullable|string|in:Borrador,Enviada,Aceptada,Rechazada,Vencida,Cobrada',
            'valid_until' => 'nullable|date',
        ]);

        $quote->update(array_filter($validated));

        return back()->with('message', 'Cotización actualizada.');
    }

    public function convertToCharge(Request $request, \App\Models\Quote $quote)
    {
        if ($quote->branch_id !== auth()->user()->branch_id || $quote->status !== 'Aceptada') {
            abort(403, 'La cotización debe estar Aceptada para enviarse al PDV.');
        }

        // EVITAR DUPLICADOS: Si ya existen cargos (pendientes o cobrados) vinculados a esta cotización
        if ($quote->pendingCharges()->exists()) {
            return back()->withErrors(['error' => 'Esta cotización ya tiene cargos asociados en el PDV. Revierte el envío anterior si necesitas enviarla de nuevo.']);
        }

        // Asegurar categoría y producto genérico para ítems manuales (Productos son globales)
        $category = \App\Models\ProductCategory::firstOrCreate(
            ['name' => 'Varios'],
            [
                'slug'      => 'varios',
                'is_active' => true
            ]
        );

        $genericProduct = \App\Models\Product::firstOrCreate(
            ['sku' => 'COT-MANUAL'],
            [
                'name'                => 'Servicio/Producto Cotizado',
                'product_category_id' => $category->id,
                'price'               => 0,
                'unit'                => 'Servicio',
                'is_active'           => true,
                'is_service'          => true,
            ]
        );

        $clientId = $quote->client_id;
        if (!$clientId) {
            $generalPublic = \App\Models\User::firstOrCreate(
                ['email' => 'publico@general.com'],
                [
                    'name' => 'Público en General',
                    'role' => 'client',
                    'password' => bcrypt('password123'),
                    'branch_id' => $quote->branch_id,
                ]
            );
            $clientId = $generalPublic->id;
        }

        foreach ($quote->items as $item) {
            \App\Models\PendingCharge::create([
                'source_quote_id'  => $quote->id,
                'branch_id'        => $quote->branch_id,
                'client_id'        => $clientId,
                'pet_id'           => $quote->pet_id,
                'product_id'       => $item->product_id ?: $genericProduct->id,
                'description'      => $item->description,
                'quantity'         => $item->quantity,
                'price'            => $item->unit_price,
                'assigned_user_id' => auth()->id(),
                'status'           => 'pending',
                'notes'            => 'Ref. Cotización: ' . $quote->folio,
            ]);
        }

        $quote->update(['notes' => $quote->notes . "\n---\nConvertida a Cargos Pendientes el " . now()->format('Y-m-d H:i')]);

        return redirect()->route('receipts.create', ['client_id' => $clientId])->with('message', 'Ítems de la cotización enviados al Punto de Venta.');
    }

    public function revertConversion(Request $request, \App\Models\Quote $quote)
    {
        if ($quote->branch_id !== auth()->user()->branch_id) {
            abort(403);
        }

        // Solo revertir si hay cargos pendientes que NO han sido facturados
        $pending = $quote->pendingCharges()->where('status', 'pending')->get();
        
        if ($pending->isEmpty()) {
            return back()->withErrors(['error' => 'No hay cargos pendientes reversibles para esta cotización (posiblemente ya fueron cobrados).']);
        }

        foreach ($pending as $charge) {
            $charge->delete();
        }

        $quote->update(['notes' => $quote->notes . "\n---\nEnvío a PDV revertido el " . now()->format('Y-m-d H:i')]);

        return back()->with('message', 'Envío a PDV revertido exitosamente.');
    }

    public function destroy(Quote $quote)
    {
        $quote->delete();
        return redirect()->route('quotes.index')->with('success', 'Cotización eliminada correctamente.');
    }
}
