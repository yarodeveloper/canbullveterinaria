<?php

namespace App\Http\Controllers;

use App\Models\Euthanasia;
use App\Models\Pet;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EuthanasiaController extends Controller
{
    use \App\Traits\ParsesDocumentTemplates;

    public function index(Request $request)
    {
        $branchId = Auth::user()->branch_id;

        $query = Euthanasia::where('branch_id', $branchId)
            ->with(['pet.owner', 'veterinarian']);

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->whereHas('pet', fn($p) => $p->where('name', 'like', "%$s%"))
                  ->orWhere('folio', 'like', "%$s%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $euthanasias = $query->orderBy('performed_at', 'desc')->get();

        return Inertia::render('Euthanasias/Index', [
            'euthanasias' => $euthanasias,
            'filters'     => $request->only(['search', 'status']),
        ]);
    }

    public function create(Request $request)
    {
        $branchId = Auth::user()->branch_id;

        $pet = null;
        if ($request->filled('pet_id')) {
            $pet = Pet::with('owner')->find($request->pet_id);
        }

        $veterinarians = User::where('branch_id', $branchId)
            ->whereIn('role', ['admin', 'veterinarian'])
            ->get(['id', 'name']);

        // Productos del inventario para medicamentos (marcados como controlados o farmacia)
        $products = Product::where('is_active', true)
            ->whereHas('lots', fn($q) => $q->where('branch_id', $branchId)->where('current_quantity', '>', 0))
            ->with(['lots' => fn($q) => $q->where('branch_id', $branchId)->where('status', 'active')])
            ->orderByRaw("CASE WHEN is_controlled = 1 THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'is_controlled']);

        return Inertia::render('Euthanasias/Create', [
            'pet'          => $pet,
            'veterinarians' => $veterinarians,
            'products'     => $products,
            'selectedPetId' => $request->pet_id,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pet_id'             => 'required|exists:pets,id',
            'veterinarian_id'    => 'required|exists:users,id',
            'performed_at'       => 'required|date',
            'status'             => 'required|in:scheduled,completed,cancelled',
            'weight'             => 'nullable|numeric|min:0',
            'reason'             => 'required|string',
            'reason_detail'      => 'nullable|string',
            'medications'        => 'nullable|array',
            'owner_present'      => 'boolean',
            'owner_authorization' => 'nullable|string',
            'consent_signed'     => 'boolean',
            'disposition'        => 'nullable|string',
            'cremation_provider' => 'nullable|string',
            'notes'              => 'nullable|string',
            'folio'              => 'nullable|string|unique:euthanasias,folio',
        ]);

        $validated['branch_id'] = Auth::user()->branch_id;

        // Generar folio automático si no se proporcionó
        if (empty($validated['folio'])) {
            $validated['folio'] = Euthanasia::generateFolio();
        }

        $euthanasia = Euthanasia::create($validated);

        // Si el procedimiento se marca como completado, marcar al paciente como fallecido
        if ($validated['status'] === 'completed') {
            $pet = Pet::find($validated['pet_id']);
            if ($pet && $pet->status !== 'deceased') {
                $pet->update([
                    'status'           => 'deceased',
                    'death_date'       => now(),
                    'death_cause'      => 'Eutanasia — ' . $validated['reason'],
                ]);
            }
        }

        return redirect()->route('euthanasias.show', $euthanasia->id)
            ->with('message', 'Registro de eutanasia creado correctamente.');
    }

    public function show(Euthanasia $euthanasia)
    {
        $branchId = Auth::user()->branch_id;
        $euthanasia->load(['pet.owner', 'veterinarian', 'branch']);

        $products = Product::where('is_active', true)
            ->whereHas('lots', fn($q) => $q->where('branch_id', $branchId)->where('current_quantity', '>', 0))
            ->orderByRaw("CASE WHEN is_controlled = 1 THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'is_controlled']);

        $documentTemplates = \App\Models\DocumentTemplate::where(function($q) use($branchId) {
                $q->where('branch_id', $branchId)->orWhereNull('branch_id');
            })->where('is_active', true)->get();

        return Inertia::render('Euthanasias/Show', [
            'euthanasia' => $euthanasia,
            'products'   => $products,
            'documentTemplates'  => $documentTemplates
        ]);
    }

    public function printConsent(Euthanasia $euthanasia, \App\Models\DocumentTemplate $template)
    {
        $euthanasia->load(['pet.owner', 'veterinarian', 'branch']);

        $content = $this->parseTemplate($template->content, [
            'pet' => $euthanasia->pet,
            'veterinarian' => $euthanasia->veterinarian,
            'branch' => $euthanasia->branch,
            'extra' => [
                'folio' => $euthanasia->folio,
                'reason' => $euthanasia->reason,
            ]
        ]);

        return view('print.consent', [
            'content' => $content,
            'title' => $template->title,
            'pet' => $euthanasia->pet
        ]);
    }

    public function update(Request $request, Euthanasia $euthanasia)
    {
        $validated = $request->validate([
            'status'             => 'nullable|in:scheduled,completed,cancelled',
            'performed_at'       => 'nullable|date',
            'weight'             => 'nullable|numeric|min:0',
            'reason'             => 'nullable|string',
            'reason_detail'      => 'nullable|string',
            'medications'        => 'nullable|array',
            'owner_present'      => 'nullable|boolean',
            'owner_authorization' => 'nullable|string',
            'consent_signed'     => 'nullable|boolean',
            'disposition'        => 'nullable|string',
            'cremation_provider' => 'nullable|string',
            'notes'              => 'nullable|string',
            'folio'              => 'nullable|string|unique:euthanasias,folio,' . $euthanasia->id,
        ]);

        $euthanasia->update($validated);

        // Si se completa, marcar paciente como fallecido
        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $pet = $euthanasia->pet;
            if ($pet && $pet->status !== 'deceased') {
                $pet->update([
                    'status'      => 'deceased',
                    'death_date'  => $euthanasia->performed_at ?? now(),
                    'death_cause' => 'Eutanasia — ' . ($euthanasia->reason ?? ''),
                ]);
            }
        }

        return redirect()->back()->with('message', 'Registro actualizado correctamente.');
    }

    public function destroy(Euthanasia $euthanasia)
    {
        $euthanasia->delete();
        return redirect()->route('euthanasias.index')->with('message', 'Registro eliminado.');
    }

    public function printReport(Euthanasia $euthanasia)
    {
        $euthanasia->load(['pet.owner', 'veterinarian', 'branch']);

        return view('print.euthanasia', [
            'euthanasia' => $euthanasia,
        ]);
    }
}
