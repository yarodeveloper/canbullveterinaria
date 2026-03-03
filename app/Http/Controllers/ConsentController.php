<?php

namespace App\Http\Controllers;

use App\Models\Consent;
use App\Models\Pet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ConsentController extends Controller
{
    public function index()
    {
        $consents = Consent::where('branch_id', Auth::user()->branch_id)
            ->with(['pet', 'client'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Consents/Index', [
            'consents' => $consents
        ]);
    }

    public function create(Pet $pet, Request $request)
    {
        $type = $request->query('type', 'general');
        
        $templates = [
            'surgery' => 'Por la presente, autorizo al personal médico a realizar el procedimiento quirúrgico indicado para mi mascota. Entiendo los riesgos anestésicos y quirúrgicos involucrados...',
            'euthanasia' => 'Solicito voluntariamente el procedimiento de eutanasia para mi mascota por razones humanitarias. Entiendo que este acto es irreversible y acepto el manejo del cadáver indicado...',
            'hospitalization' => 'Autorizo el internamiento de mi mascota para tratamiento médico. Acepto cubrir los costos diarios y entiendo que se me notificará de cualquier cambio crítico...',
            'general' => 'Acepto la responsabilidad de los tratamientos médicos generales administrados a mi mascota...',
        ];

        return Inertia::render('Consents/Create', [
            'pet' => $pet->load('owner'),
            'type' => $type,
            'defaultContent' => $templates[$type] ?? $templates['general']
        ]);
    }

    public function store(Request $request, Pet $pet)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'content' => 'required|string',
            'digital_signature' => 'required|string', // Base64 image
            'signed_by_name' => 'required|string',
            'signed_by_id_number' => 'nullable|string',
        ]);

        $consent = new Consent($validated);
        $consent->pet_id = $pet->id;
        $consent->user_id = $pet->user_id; // The client
        $consent->branch_id = Auth::user()->branch_id;
        $consent->status = 'signed';
        $consent->signed_at = now();
        $consent->save();

        return redirect()->route('pets.show', $pet->id)
            ->with('message', 'Consentimiento firmado correctamente.');
    }

    public function show(Consent $consent)
    {
        if ($consent->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        return Inertia::render('Consents/Show', [
            'consent' => $consent->load(['pet.owner'])
        ]);
    }
}
