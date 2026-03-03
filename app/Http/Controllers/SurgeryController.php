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
    public function index(Request $request)
    {
        $branchId = Auth::user()->branch_id;
        
        $query = Surgery::where('branch_id', $branchId)->with(['pet', 'leadSurgeon']);

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
        $branchId = Auth::user()->branch_id;
        $pets = Pet::where('branch_id', $branchId)->get();
        $veterinarians = User::where('branch_id', $branchId)
            ->whereIn('role', ['admin', 'veterinarian'])
            ->get();

        return Inertia::render('Surgeries/Create', [
            'pets' => $pets,
            'veterinarians' => $veterinarians,
            'selectedPetId' => $request->pet_id
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'veterinarian_id' => 'required|exists:users,id',
            'anesthesiologist_id' => 'nullable|exists:users,id',
            'surgery_type' => 'required|string',
            'scheduled_at' => 'required|date',
            'asa_classification' => 'nullable|string',
            'pre_op_notes' => 'nullable|string',
        ]);

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

        return redirect()->route('surgeries.show', $surgery->id)
            ->with('message', 'Cirugía programada correctamente.');
    }

    public function show(Surgery $surgery)
    {
        $surgery->load(['pet.consents', 'pet.hospitalizations' => function($q) {
            $q->where('status', 'active');
        }, 'leadSurgeon', 'anesthesiologist', 'branch']);
        
        $templates = \App\Models\DocumentTemplate::whereIn('type', ['surgery', 'general'])
            ->where(function($q) use($surgery) {
                $q->where('branch_id', $surgery->branch_id)->orWhereNull('branch_id');
            })->where('is_active', true)->get();

        return Inertia::render('Surgeries/Show', [
            'surgery' => $surgery,
            'templates' => $templates
        ]);
    }

    public function update(Request $request, Surgery $surgery)
    {
        $validated = $request->validate([
            'status' => 'nullable|string',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
            'intra_op_notes' => 'nullable|string',
            'post_op_notes' => 'nullable|string',
            'checklist' => 'nullable|array',
            'vital_signs' => 'nullable|array',
        ]);

        $surgery->update($validated);

        return redirect()->back()->with('message', 'Registro de cirugía actualizado.');
    }

    public function printConsent(Surgery $surgery, \App\Models\DocumentTemplate $template)
    {
        $surgery->load('pet.owner', 'leadSurgeon');

        $content = $template->content;
        
        $replacements = [
            '{pet_name}' => $surgery->pet->name,
            '{client_name}' => $surgery->pet->owner->name ?? '_________________',
            '{date}' => \Carbon\Carbon::now()->format('d/m/Y'),
            '{veterinarian_name}' => $surgery->leadSurgeon ? $surgery->leadSurgeon->name : '_________________',
        ];

        foreach($replacements as $key => $val) {
            $content = str_replace($key, $val, $content);
        }

        return view('print.consent', [
            'content' => $content,
            'title' => $template->title,
            'pet' => $surgery->pet
        ]);
    }
}
