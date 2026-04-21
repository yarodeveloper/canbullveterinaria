<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ServiceTemplateController extends Controller
{
    public function index()
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403);
        }

        $templates = \App\Models\ServiceTemplate::with('items.product')->latest()->get();
        $products = \App\Models\Product::where('is_active', true)->get(['id', 'name', 'price', 'unit']);

        return \Inertia\Inertia::render('ServiceTemplates/Index', [
            'templates' => $templates,
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'animal_type' => 'required|string|in:Canino,Felino,Todos',
            'is_active' => 'boolean',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.category' => 'required|string|in:Insumos,Materiales,Medicamentos,Equipos,Renta de Equipos,Apoyo Médico,Servicios',
            'items.*.description' => 'required|string',
            'items.*.is_dosable' => 'boolean',
            'items.*.base_dose' => 'nullable|numeric',
            'items.*.unit_weight' => 'nullable|numeric',
            'items.*.suggested_quantity' => 'required|numeric',
            'items.*.suggested_price' => 'required|numeric',
        ]);

        $template = \App\Models\ServiceTemplate::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'animal_type' => $validated['animal_type'],
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => auth()->id(),
        ]);

        $total = 0;
        foreach ($validated['items'] as $itemData) {
            $template->items()->create($itemData);
            // Si es dosificable, el total estimado base es con cantidad 1, pero aquí es un estimado base.
            $total += ($itemData['suggested_price'] * $itemData['suggested_quantity']);
        }

        $template->update(['total_estimated' => $total]);

        return back()->with('message', 'Plantilla de servicio creada correctamente.');
    }

    public function update(Request $request, \App\Models\ServiceTemplate $serviceTemplate)
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'animal_type' => 'required|string|in:Canino,Felino,Todos',
            'is_active' => 'boolean',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.category' => 'required|string|in:Insumos,Materiales,Medicamentos,Equipos,Renta de Equipos,Apoyo Médico,Servicios',
            'items.*.description' => 'required|string',
            'items.*.is_dosable' => 'boolean',
            'items.*.base_dose' => 'nullable|numeric',
            'items.*.unit_weight' => 'nullable|numeric',
            'items.*.suggested_quantity' => 'required|numeric',
            'items.*.suggested_price' => 'required|numeric',
        ]);

        $serviceTemplate->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'animal_type' => $validated['animal_type'],
            'is_active' => $validated['is_active'] ?? true,
            'updated_by' => auth()->id(),
        ]);

        $serviceTemplate->items()->delete();

        $total = 0;
        foreach ($validated['items'] as $itemData) {
            $serviceTemplate->items()->create($itemData);
            $total += ($itemData['suggested_price'] * $itemData['suggested_quantity']);
        }

        $serviceTemplate->update(['total_estimated' => $total]);

        return back()->with('message', 'Plantilla de servicio actualizada correctamente.');
    }

    public function destroy(\App\Models\ServiceTemplate $serviceTemplate)
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403);
        }

        $serviceTemplate->update(['deleted_by' => auth()->id()]);
        $serviceTemplate->delete();

        return back()->with('message', 'Plantilla de servicio eliminada.');
    }
}
