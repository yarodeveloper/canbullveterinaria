<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Pet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class MedicalRecordController extends Controller
{
    use \App\Traits\ParsesDocumentTemplates;

    public function create(Pet $pet)
    {
        // Authorize branch
        if ($pet->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $products = \App\Models\Product::where('is_active', true)->get()->values();

        return Inertia::render('MedicalRecords/Create', [
            'pet' => $pet->load('owner'),
            'products' => $products
        ]);
    }

    public function store(Request $request, Pet $pet)
    {
        // Authorize branch
        if ($pet->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:consultation,follow-up,emergency,specialty',
            'subjective' => 'required|string',
            'objective' => 'required|string',
            'assessment' => 'required|string',
            'plan' => 'required|string',
            'vital_signs.weight' => 'nullable|numeric',
            'vital_signs.temp' => 'nullable|numeric',
            'vital_signs.hr' => 'nullable|integer',
            'vital_signs.rr' => 'nullable|integer',
            'vital_signs.mucous' => 'nullable|string',
            'vital_signs.bcs' => 'nullable|string',
            'vital_signs.tllc' => 'nullable|numeric',
            'vital_signs.lymph_nodes' => 'nullable|string',
            'vital_signs.abdominal_palpation' => 'nullable|string',
            'anamnesis' => 'nullable|array',
            'physical_state' => 'nullable|string',
            'attachments.*' => 'nullable|file|max:10240', // 10MB limit
            'pending_charges' => 'nullable|array',
            'pending_charges.*.product_id' => 'required|exists:products,id',
            'pending_charges.*.quantity' => 'required|numeric|min:1',
            'pending_charges.*.notes' => 'nullable|string',
        ]);

        $medicalRecord = new MedicalRecord($validated);
        $medicalRecord->pet_id = $pet->id;
        $medicalRecord->user_id = Auth::id();
        $medicalRecord->branch_id = Auth::user()->branch_id;
        $medicalRecord->save();

        // Handle Attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('medical-records/' . $medicalRecord->id, 'public');
                $medicalRecord->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        // Update pet weight if provided
        if (isset($validated['vital_signs']['weight'])) {
            $pet->update(['weight' => $validated['vital_signs']['weight']]);
        }

        // Handle Pending Charges (Send to Cash Register)
        if (!empty($validated['pending_charges'])) {
            $ownerId = $pet->owner ? $pet->owner->id : null;
            if (!$ownerId && $pet->user_id) $ownerId = $pet->user_id;

            foreach ($validated['pending_charges'] as $charge) {
                \App\Models\PendingCharge::create([
                    'branch_id' => Auth::user()->branch_id,
                    'client_id' => $ownerId,
                    'pet_id' => $pet->id,
                    'product_id' => $charge['product_id'],
                    'quantity' => $charge['quantity'],
                    'assigned_user_id' => Auth::id(),
                    'status' => 'pending',
                    'notes' => $charge['notes'] ?? null,
                ]);
            }
        }

        return redirect()->route('pets.show', $pet->id)
            ->with('message', 'Registro médico guardado con éxito y ' . ($request->hasFile('attachments') ? count($request->file('attachments')) : 0) . ' archivos adjuntos.');
    }

    public function show(MedicalRecord $medicalRecord)
    {
        if ($medicalRecord->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $templates = \App\Models\DocumentTemplate::whereIn('type', ['consultation', 'general'])
            ->where(function($q) {
                $q->where('branch_id', Auth::user()->branch_id)->orWhereNull('branch_id');
            })->where('is_active', true)->get();

        return Inertia::render('MedicalRecords/Show', [
            'record'    => $medicalRecord->load(['pet.owner', 'veterinarian', 'attachments']),
            'templates' => $templates
        ]);
    }

    public function printConsent(MedicalRecord $medicalRecord, \App\Models\DocumentTemplate $template)
    {
        $medicalRecord->load(['pet.owner', 'veterinarian', 'branch']);

        $content = $this->parseTemplate($template->content, [
            'pet' => $medicalRecord->pet,
            'veterinarian' => $medicalRecord->veterinarian,
            'branch' => $medicalRecord->branch,
            'extra' => [
                'type' => $medicalRecord->type,
            ]
        ]);

        return view('print.consent', [
            'content' => $content,
            'title' => $template->title,
            'pet' => $medicalRecord->pet
        ]);
    }
}
