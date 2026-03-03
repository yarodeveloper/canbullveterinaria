<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Lot;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('manage inventory');

        $branchId = Auth::user()->branch_id;
        $searchTerm = $request->input('search_term', '');
        $selectedCategory = $request->input('selected_category', 'all');

        $query = Product::with(['category', 'lots' => function($query) use ($branchId) {
            $query->where('branch_id', $branchId)->where('status', 'active');
        }])->where('is_active', true);

        if ($selectedCategory !== 'all') {
            $query->where('product_category_id', $selectedCategory);
        }

        if (!empty($searchTerm)) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%");
            });
        }

        $products = $query->orderBy('name', 'asc')->paginate(50)->through(function ($product) {
            $product->current_stock = $product->lots->sum('current_quantity');
            return $product;
        })->withQueryString();

        $categories = ProductCategory::all();

        return Inertia::render('Inventory/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search_term' => $searchTerm,
                'selected_category' => $selectedCategory
            ]
        ]);
    }

    public function audit()
    {
        Gate::authorize('manage inventory');
        $branchId = Auth::user()->branch_id;
        
        $products = Product::where('is_active', true)->with(['category', 'lots' => function($query) use ($branchId) {
            $query->where('branch_id', $branchId)->where('status', 'active');
        }])->get()->map(function($product) {
            $product->current_stock = $product->lots->sum('current_quantity');
            return $product;
        });

        // Filter products with low stock or expiring soon (within 90 days)
        $dateThreshold = now()->addDays(90);
        $alerts = $products->filter(function($product) use ($dateThreshold) {
            $isLowStock = $product->current_stock <= $product->min_stock;
            $hasExpiringLot = $product->lots->contains(function($lot) use ($dateThreshold) {
                return $lot->expiration_date && $lot->expiration_date <= $dateThreshold;
            });
            return $isLowStock || $hasExpiringLot;
        })->values();

        return Inertia::render('Inventory/Audit', [
            'alerts' => $alerts,
            'products' => $products // To show the full list for physical count
        ]);
    }

    public function movements(Request $request)
    {
        Gate::authorize('manage inventory');
        $branchId = Auth::user()->branch_id;

        $startDate = $request->input('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        $searchTerm = $request->input('search_term', '');
        $selectedCategory = $request->input('selected_category', 'all');
        $selectedType = $request->input('selected_type', 'all');

        $query = InventoryTransaction::with(['product.category', 'user', 'lot'])
            ->where('branch_id', $branchId)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);

        if ($selectedType !== 'all') {
            $query->where('type', $selectedType);
        }

        if ($selectedCategory !== 'all') {
            $query->whereHas('product', function($q) use ($selectedCategory) {
                $q->where('product_category_id', $selectedCategory);
            });
        }

        if (!empty($searchTerm)) {
            $query->whereHas('product', function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%");
            });
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(50)->withQueryString();

        $categories = \App\Models\ProductCategory::all();

        return Inertia::render('Inventory/Movements', [
            'transactions' => $transactions,
            'categories' => $categories,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'search_term' => $searchTerm,
                'selected_category' => $selectedCategory,
                'selected_type' => $selectedType
            ]
        ]);
    }

    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Solo el administrador puede dar de alta nuevos artículos en el catálogo.');
        }

        $validated = $request->validate([
            'product_category_id' => 'required|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'barcode' => 'nullable|string|max:100|unique:products,barcode',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'min_stock' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'is_controlled' => 'boolean',
        ]);

        $validated['is_active'] = true;

        Product::create($validated);

        return redirect()->back()->with('message', 'Producto registrado exitosamente.');
    }

    public function update(Request $request, Product $product)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Solo el administrador puede editar artículos del catálogo.');
        }

        $validated = $request->validate([
            'product_category_id' => 'required|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string|max:100|unique:products,barcode,' . $product->id,
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'min_stock' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'is_controlled' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);

        return redirect()->back()->with('message', 'Producto actualizado correctamente.');
    }

    public function destroy(Product $product)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Solo el administrador puede dar de baja artículos del catálogo.');
        }

        $product->delete();

        return redirect()->route('inventory.index')->with('message', 'Producto eliminado (dado de baja).');
    }

    public function show(Product $product)
    {
        Gate::authorize('manage inventory');
        
        $branchId = Auth::user()->branch_id;
        $product->load(['category', 'lots' => function($query) use ($branchId) {
            $query->where('branch_id', $branchId);
        }]);
        
        $transactions = InventoryTransaction::where('product_id', $product->id)
            ->where('branch_id', $branchId)
            ->with(['user', 'lot'])
            ->orderBy('created_at', 'desc')
            ->get();

        $product->current_stock = $product->lots->where('status', 'active')->sum('current_quantity');

        return Inertia::render('Inventory/Show', [
            'product' => $product,
            'transactions' => $transactions
        ]);
    }

    public function storeLot(Request $request, Product $product)
    {
        Gate::authorize('manage inventory');

        $validated = $request->validate([
            'lot_number' => 'required|string',
            'expiration_date' => 'nullable|date',
            'quantity' => 'required|numeric|min:0.01',
            'notes' => 'required|string', // Obligatorio para todos (justificación)
        ]);

        // Regla estricta para medicamento controlado
        if ($product->is_controlled && empty($validated['notes'])) {
            return back()->withErrors(['notes' => 'Es obligatorio justificar e ingresar datos (receta/médico) al registrar lotes de medicamentos controlados.']);
        }

        $branchId = Auth::user()->branch_id;

        $lot = Lot::create([
            'product_id' => $product->id,
            'branch_id' => $branchId,
            'lot_number' => $validated['lot_number'],
            'expiration_date' => $validated['expiration_date'],
            'initial_quantity' => $validated['quantity'],
            'current_quantity' => $validated['quantity'],
            'status' => 'active',
        ]);

        InventoryTransaction::create([
            'product_id' => $product->id,
            'lot_id' => $lot->id,
            'branch_id' => $branchId,
            'user_id' => Auth::id(),
            'type' => 'in',
            'quantity' => $validated['quantity'],
            'notes' => $validated['notes'],
        ]);

        return redirect()->back()->with('message', 'Lote registrado y stock actualizado.');
    }

    public function adjustStock(Request $request, Product $product)
    {
        Gate::authorize('manage inventory');

        $validated = $request->validate([
            'lot_id' => 'required|exists:lots,id',
            'quantity' => 'required|numeric',
            'type' => 'required|in:adjustment,out,clinical_usage,return',
            'notes' => 'required|string',
        ]);

        if ($validated['type'] === 'return') {
            Gate::authorize('manage returns');
        }

        // Si es controlado, obligar nota más extensa o validación si se desea
        // ...

        $lot = Lot::findOrFail($validated['lot_id']);
        $branchId = Auth::user()->branch_id;

        $moveQty = $validated['quantity'];
        
        $lot->current_quantity += $moveQty;
        if ($lot->current_quantity < 0) $lot->current_quantity = 0;
        
        // Si el lote se vacía, podríamos marcarlo inactivo
        if ($lot->current_quantity == 0) {
            $lot->status = 'depleted';
        }

        $lot->save();

        InventoryTransaction::create([
            'product_id' => $product->id,
            'lot_id' => $lot->id,
            'branch_id' => $branchId,
            'user_id' => Auth::id(),
            'type' => $validated['type'],
            'quantity' => $moveQty,
            'notes' => $validated['notes'],
        ]);

        return redirect()->back()->with('message', 'Ajuste de inventario realizado de forma segura.');
    }
}
