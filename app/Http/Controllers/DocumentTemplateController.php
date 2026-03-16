<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\DocumentTemplate;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Pet; // Pet model is already imported

class DocumentTemplateController extends Controller
{
    use \App\Traits\ParsesDocumentTemplates;

    public function index()
    {
        $branchId = Auth::user()->branch_id;
        $templates = DocumentTemplate::where('branch_id', $branchId)
            ->orWhereNull('branch_id')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Settings/Documents/Index', [
            'templates' => $templates
        ]);
    }

    public function quickGuide()
    {
        return Inertia::render('Settings/Documents/QuickGuide');
    }

    public function preview(\App\Models\DocumentTemplate $template)
    {
        // Dummy data for preview
        $dummyPet = (object)[
            'name' => 'Luna (Demo)',
            'species' => 'Canino',
            'breed' => 'Golden Retriever',
            'gender' => 'Hembra',
            'dob' => \Carbon\Carbon::now()->subYears(3)->subMonths(2),
            'weight' => '25',
            'owner' => (object)[
                'name' => 'Juan Pérez (Demo)',
                'phone' => '555-0123',
                'address' => 'Av. Siempre Viva 123',
                'tax_id' => 'RFC-123456',
            ],
        ];
        $dummyVet = (object)['name' => 'Dr. Sandra Torres (Demo)'];
        $dummyBranch = (object)[
            'name' => 'Clínica Veterinaria CanBull (Demo)',
            'address' => 'Av. Juárez #456',
            'phone' => '555-9876'
        ];

        $content = $this->parseTemplate($template->content, [
            'pet' => $dummyPet,
            'veterinarian' => $dummyVet,
            'branch' => $dummyBranch,
            'extra' => [
                'folio' => 'DEMO-2026-001',
                'witness_name' => 'Roberto Gómez (Demo)',
            ]
        ]);

        return view('print.consent', [
            'content' => $content,
            'title' => $template->title . ' [VISTA PREVIA]',
            'pet' => $dummyPet
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:surgery,hospitalization,euthanasia,consultation,boarding,grooming,witness,finance,discharged,necropsy,general',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $validated['branch_id'] = Auth::user()->branch_id;

        DocumentTemplate::create($validated);

        return redirect()->back()->with('message', 'Plantilla creada con éxito.');
    }

    public function update(Request $request, DocumentTemplate $template)
    {
        if ($template->branch_id && $template->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:surgery,hospitalization,euthanasia,consultation,boarding,grooming,witness,finance,discharged,necropsy,general',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return redirect()->back()->with('message', 'Plantilla actualizada con éxito.');
    }

    public function destroy(DocumentTemplate $template)
    {
        if ($template->branch_id && $template->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }
        
        $template->delete();

    }

    public function print(\App\Models\Pet $pet, \App\Models\DocumentTemplate $template)
    {
        if ($template->branch_id && $template->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $branch = Auth::user()->branch;
        $vet = Auth::user();

        $content = $this->parseTemplate($template->content, [
            'pet' => $pet->load('owner'),
            'veterinarian' => $vet,
            'branch' => $branch,
            'extra' => [
                'folio' => date('Ymd') . '-' . $pet->id . '-' . $template->id,
            ]
        ]);

        return view('print.consent', [
            'content' => $content,
            'title' => $template->title,
            'pet' => $pet
        ]);
    }
}
