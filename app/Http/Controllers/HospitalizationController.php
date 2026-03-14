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
    public function index(Request $request)
    {
        $query = Hospitalization::with(['pet', 'veterinarian'])
            ->where('branch_id', Auth::user()->branch_id);

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
        $pet = null;
        if ($request->has('pet_id')) {
            $pet = Pet::with('owner')->findOrFail($request->pet_id);
        }

        $branchId = Auth::user()->branch_id;
        $clients = \App\Models\User::where('branch_id', $branchId)
            ->where('role', 'client')
            ->get(['id', 'name']);

        return Inertia::render('Hospitalizations/Create', [
            'pet' => $pet,
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'reason' => 'required|string',
            'initial_weight' => 'nullable|numeric',
            'admission_date' => 'required|date',
        ]);

        $pet = Pet::findOrFail($validated['pet_id']);

        $hospitalization = new Hospitalization($validated);
        $hospitalization->user_id = Auth::id();
        $hospitalization->branch_id = Auth::user()->branch_id;
        $hospitalization->status = 'active';
        $hospitalization->save();

        return redirect()->route('hospitalizations.show', $hospitalization->id)
            ->with('message', 'Hospitalización iniciada correctamente.');
    }

    public function show(Hospitalization $hospitalization)
    {
        $templates = \App\Models\DocumentTemplate::whereIn('type', ['hospitalization', 'general'])
            ->where(function($q) use($hospitalization) {
                $q->where('branch_id', $hospitalization->branch_id)->orWhereNull('branch_id');
            })->where('is_active', true)->get();

        return Inertia::render('Hospitalizations/Show', [
            'hospitalization' => $hospitalization->load(['pet.owner', 'pet.surgeries', 'veterinarian', 'monitorings.recorder']),
            'templates' => $templates
        ]);
    }

    public function printConsent(Hospitalization $hospitalization, \App\Models\DocumentTemplate $template)
    {
        $hospitalization->load('pet.owner', 'veterinarian');

        $content = $template->content;
        
        $replacements = [
            '{pet_name}' => $hospitalization->pet->name,
            '{client_name}' => $hospitalization->pet->owner->name ?? '_________________',
            '{date}' => \Carbon\Carbon::now()->format('d/m/Y'),
            '{veterinarian_name}' => $hospitalization->veterinarian ? $hospitalization->veterinarian->name : '_________________',
        ];

        foreach($replacements as $key => $val) {
            $content = str_replace($key, $val, $content);
        }

        return view('print.consent', [
            'content' => $content,
            'title' => $template->title,
            'pet' => $hospitalization->pet
        ]);
    }

    public function storeMonitoring(Request $request, Hospitalization $hospitalization)
    {
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
        $validated = $request->validate([
            'status' => 'required|in:active,discharged,expired,euthanized',
            'discharge_notes' => 'nullable|string',
            'discharge_date' => 'nullable|date',
        ]);

        if ($validated['status'] !== 'active' && !$hospitalization->discharge_date) {
            $validated['discharge_date'] = now();
        }

        $hospitalization->update($validated);

        // Sync with Pet status
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

        return back()->with('message', 'Estado de hospitalización actualizado.');
    }
}
