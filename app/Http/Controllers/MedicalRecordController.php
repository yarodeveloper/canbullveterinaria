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

    public function index(Request $request)
    {
        $branchId = Auth::user()->branch_id;
        $query = MedicalRecord::with(['pet', 'veterinarian']);
        
        // Si queremos ver todos los registros del sistema (Global):
        // Pero típicamente se filtran por sucursal del REGISTRO MÉDICO.
        // Sin embargo, permitiremos ver los que coincidan con la búsqueda sin importar la sucursal.

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->whereHas('pet', function($petQ) use ($search) {
                    $petQ->where('name', 'like', "%{$search}%");
                })
                ->orWhere('assessment', 'like', "%{$search}%");
            });
        }

        $medicalRecords = $query->latest()->paginate(15);

        // Pre-load clients and pets for the "Create" button flow
        // Directorio global de clientes y mascotas para permitir atención cruzada
        $clients = \App\Models\User::where('role', 'client')
            ->where(function($q) use($branchId) {
                if ($branchId) $q->where('branch_id', $branchId)->orWhereNull('branch_id');
            })
            ->where('email', '!=', 'publico@general.com')
            ->limit(100)
            ->get(['id', 'name', 'phone']);

        $pets = Pet::query()
            ->with(['owner', 'branch'])
            ->limit(100)
            ->get(['id', 'name', 'user_id', 'breed', 'species', 'branch_id']);

        $veterinarians = \App\Models\User::where('branch_id', $branchId)
            ->whereIn('role', ['vet', 'admin'])
            ->get(['id', 'name']);

        return Inertia::render('MedicalRecords/Index', [
            'medicalRecords' => $medicalRecords,
            'clients' => $clients,
            'pets' => $pets,
            'veterinarians' => $veterinarians,
            'filters' => $request->only(['search'])
        ]);
    }

    public function edit(MedicalRecord $medicalRecord)
    {
        if (Auth::user()->branch_id && $medicalRecord->branch_id && $medicalRecord->branch_id !== Auth::user()->branch_id) {
            // Acceso permitido
        }

        return Inertia::render('MedicalRecords/Create', [
            'pet' => $medicalRecord->pet->load('owner'),
            'record' => $medicalRecord,
            'isEditing' => true,
            'products' => \App\Models\Product::where('is_active', true)->get()->values(),
        ]);
    }

    public function create(Request $request, Pet $pet)
    {
        // Authorize branch
        if (Auth::user()->branch_id && $pet->branch_id && $pet->branch_id !== Auth::user()->branch_id) {
            // Acceso permitido
        }

        $products = \App\Models\Product::where('is_active', true)->get()->values();

        return Inertia::render('MedicalRecords/Create', [
            'pet' => $pet->load('owner'),
            'products' => $products,
            'prefill' => [
                'date' => $request->get('date'),
                'vet_id' => $request->get('vet_id'),
                'type' => $request->get('type'),
                'appointment_id' => $request->get('appointment_id')
            ]
        ]);
    }

    public function store(Request $request, Pet $pet)
    {
        // Authorize branch
        if (Auth::user()->branch_id && $pet->branch_id && $pet->branch_id !== Auth::user()->branch_id) {
             // Acceso permitido
        }

        $validated = $request->validate([
            'appointment_id' => 'nullable|exists:appointments,id',
            'type' => 'required|in:consultation,follow-up,emergency,specialty',
            'user_id' => 'nullable|exists:users,id',
            'created_at' => 'nullable|date',
            'subjective' => 'nullable|string',
            'objective' => 'nullable|string',
            'assessment' => 'nullable|string',
            'plan' => 'nullable|string',
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
            'pending_charges.*.quantity' => 'required|numeric|min:0.01',
            'pending_charges.*.notes' => 'nullable|string',
            'medications' => 'nullable|array',
            'applied_medications' => 'nullable|array',
        ]);

        $medicalRecord = new MedicalRecord($validated);
        $medicalRecord->pet_id = $pet->id;
        $medicalRecord->user_id = $validated['user_id'] ?? Auth::id();
        $medicalRecord->applied_medications = $validated['applied_medications'] ?? [];
        
        // Si el admin no tiene sucursal, asignamos la de la mascota por defecto, o la primera encontrada como último recurso
        $medicalRecord->branch_id = Auth::user()->branch_id ?? $pet->branch_id ?? \App\Models\Branch::first()->id;
        if (!empty($validated['created_at'])) {
            $medicalRecord->created_at = $validated['created_at'];
        }
        $medicalRecord->save();

        if (!empty($validated['appointment_id'])) {
            \App\Models\Appointment::where('id', $validated['appointment_id'])->update(['status' => 'completed']);
        }

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
            // Find the robust owner ID
            $ownerId = $pet->user_id;
            if (!$ownerId && $pet->owners()->exists()) {
                $ownerId = $pet->owners()->first()->id;
            }
            
            // Fallback to "Público en General" if no owner found
            if (!$ownerId) {
                $ownerId = \App\Models\User::where('email', 'publico@general.com')->value('id');
            }

            foreach ($validated['pending_charges'] as $charge) {
                \App\Models\PendingCharge::create([
                    'branch_id' => $medicalRecord->branch_id,
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

        return redirect()->route('medical-records.edit', $medicalRecord->id)
            ->with('message', 'Registro médico guardado con éxito. Ahora puedes imprimir reportes o seguir modificando.');
    }

    public function update(Request $request, MedicalRecord $medicalRecord)
    {
        if (Auth::user()->branch_id && $medicalRecord->branch_id && $medicalRecord->branch_id !== Auth::user()->branch_id) {
            // Acceso permitido
        }

        $validated = $request->validate([
            'type' => 'required|in:consultation,follow-up,emergency,specialty',
            'user_id' => 'nullable|exists:users,id',
            'created_at' => 'nullable|date',
            'subjective' => 'nullable|string',
            'objective' => 'nullable|string',
            'assessment' => 'nullable|string',
            'plan' => 'nullable|string',
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
            'attachments.*' => 'nullable|file|max:10240',
            'medications' => 'nullable|array',
            'applied_medications' => 'nullable|array',
            'pending_charges' => 'nullable|array',
            'pending_charges.*.product_id' => 'required|exists:products,id',
            'pending_charges.*.quantity' => 'required|numeric|min:0.01',
            'pending_charges.*.notes' => 'nullable|string',
        ]);

        if (!empty($validated['created_at'])) {
            $medicalRecord->created_at = $validated['created_at'];
        }
        $medicalRecord->update($validated);

        // Handle Pending Charges (Send to Cash Register)
        if (!empty($validated['pending_charges'])) {
            // Find the robust owner ID
            $ownerId = $medicalRecord->pet->user_id;
            if (!$ownerId && $medicalRecord->pet->owners()->exists()) {
                $ownerId = $medicalRecord->pet->owners()->first()->id;
            }
            
            // Fallback to "Público en General" if no owner found
            if (!$ownerId) {
                $ownerId = \App\Models\User::where('email', 'publico@general.com')->value('id');
            }

            foreach ($validated['pending_charges'] as $charge) {
                \App\Models\PendingCharge::create([
                    'branch_id' => $medicalRecord->branch_id,
                    'client_id' => $ownerId,
                    'pet_id' => $medicalRecord->pet_id,
                    'product_id' => $charge['product_id'],
                    'quantity' => $charge['quantity'],
                    'assigned_user_id' => Auth::id(),
                    'status' => 'pending',
                    'notes' => $charge['notes'] ?? null,
                ]);
            }
        }

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

        return redirect()->back()->with('message', 'Registro médico actualizado exitosamente y cargos enviados a caja.');
    }

    public function show(MedicalRecord $medicalRecord)
    {
        if (Auth::user()->branch_id && $medicalRecord->branch_id && $medicalRecord->branch_id !== Auth::user()->branch_id) {
            // Acceso permitido
        }

        $templates = \App\Models\DocumentTemplate::whereIn('type', ['consultation', 'general'])
            ->where(function($q) {
                if (Auth::user()->branch_id) {
                    $q->where('branch_id', Auth::user()->branch_id)->orWhereNull('branch_id');
                }
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

    public function printPrescription(MedicalRecord $medicalRecord)
    {
        $medicalRecord->load(['pet.owner', 'veterinarian', 'branch']);
        return view('print.medical_prescription', [
            'record' => $medicalRecord,
        ]);
    }

    public function printReport(MedicalRecord $medicalRecord)
    {
        $medicalRecord->load(['pet.owner', 'veterinarian', 'branch', 'attachments']);
        return view('print.medical_history', [
            'record' => $medicalRecord,
        ]);
    }
}
