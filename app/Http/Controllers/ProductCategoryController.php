<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Gate;

class ProductCategoryController extends Controller
{
    public function index()
    {
        Gate::authorize('manage inventory');
        
        $categories = ProductCategory::withCount('products')->get();

        return Inertia::render('ProductCategories/Index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manage inventory');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'is_service' => 'boolean'
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        ProductCategory::create($validated);

        return redirect()->back()->with('message', 'Categoría creada correctamente.');
    }

    public function update(Request $request, ProductCategory $productCategory)
    {
        Gate::authorize('manage inventory');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'is_service' => 'boolean'
        ]);

        if ($request->name !== $productCategory->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        $productCategory->update($validated);

        return redirect()->back()->with('message', 'Categoría actualizada correctamente.');
    }

    public function destroy(ProductCategory $productCategory)
    {
        Gate::authorize('manage inventory');

        if ($productCategory->products()->count() > 0) {
            return redirect()->back()->withErrors(['error' => 'No se puede eliminar la categoría porque tiene artículos o servicios asociados.']);
        }

        $productCategory->delete();

        return redirect()->back()->with('message', 'Categoría eliminada.');
    }
}
