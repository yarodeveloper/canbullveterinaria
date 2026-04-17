<?php

namespace App\Http\Controllers;

use App\Models\PreventiveRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Inertia\Inertia;
use Carbon\Carbon;

class PreventiveRecordController extends Controller
{
    public function index(Request $request)
    {
        $branchId = Auth::user()->branch_id;
        $monitorType = $request->get('monitor_type', 'health');
        
        // --- HEALTH MONITOR ---
        if ($monitorType === 'health') {
            $query = PreventiveRecord::query()
                ->with(['pet.owner', 'veterinarian'])
                ->when($branchId, fn($q) => $q->where('branch_id', $branchId));

            // Filtering
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function($q) use ($search) {
                    $q->whereHas('pet', function($qp) use ($search) {
                        $qp->where('name', 'like', "%{$search}%")
                          ->orWhere('breed', 'like', "%{$search}%")
                          ->orWhere('species', 'like', "%{$search}%")
                          ->orWhereHas('owner', function($qo) use ($search) {
                              $qo->where('name', 'like', "%{$search}%")
                                 ->orWhere('phone', 'like', "%{$search}%");
                          });
                    })->orWhere('name', 'like', "%{$search}%");
                });
            }

            if ($request->filled('type')) {
                $query->where('type', $request->input('type'));
            }

            // Actionable filter (default)
            if (!$request->filled('search') && !$request->filled('type') && !$request->has('show_all')) {
                $query->whereBetween('next_due_date', [
                    Carbon::now()->subDays(90),
                    Carbon::now()->addDays(60)
                ]);
            }

            // Export support
            if ($request->has('export')) {
                return $this->export($query);
            }

            $records = $query->whereNotNull('next_due_date')
                ->orderBy('next_due_date', 'asc')
                ->paginate(15)
                ->withQueryString();

            return Inertia::render('Preventive/Index', [
                'records' => $records,
                'filters' => $request->only(['search', 'type', 'monitor_type'])
            ]);
        } 
        
        // --- GROOMING MONITOR ---
        else {
            $query = \App\Models\GroomingOrder::query()
                ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
                ->whereNotNull('next_visit_date')
                // Only most recent order per pet
                ->whereIn('id', function($q) {
                    $q->selectRaw('MAX(id)')
                      ->from('grooming_orders')
                      ->groupBy('pet_id');
                })
                ->with(['pet.owner']);

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function($q) use ($search) {
                    $q->where('folio', 'like', "%{$search}%")
                      ->orWhereHas('pet', function($qp) use ($search) {
                        $qp->where('name', 'like', "%{$search}%")
                          ->orWhere('breed', 'like', "%{$search}%")
                          ->orWhere('species', 'like', "%{$search}%")
                          ->orWhereHas('owner', function($qo) use ($search) {
                              $qo->where('name', 'like', "%{$search}%")
                                 ->orWhere('phone', 'like', "%{$search}%");
                          });
                    });
                });
            }

            // Default time range for monitor
            if (!$request->filled('search') && !$request->has('show_all')) {
                $query->whereBetween('next_visit_date', [
                    Carbon::now()->subDays(90),
                    Carbon::now()->addDays(60)
                ]);
            }

            $records = $query->orderBy('next_visit_date', 'asc')
                ->paginate(15)
                ->withQueryString();

            return Inertia::render('Preventive/Index', [
                'records' => $records,
                'filters' => $request->only(['search', 'monitor_type'])
            ]);
        }
    }

    private function export($query)
    {
        $records = $query->orderBy('next_due_date', 'asc')->get();
        $filename = "Salud_Preventiva_" . date('Y-m-d') . ".csv";
        
        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Mascota', 'Propietario', 'Telefono', 'Tratamiento', 'Tipo', 'Ultima Aplicacion', 'Proximo Refuerzo'];

        $callback = function() use($records, $columns) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM
            fputcsv($file, $columns);

            foreach ($records as $r) {
                fputcsv($file, [
                    $r->pet->name,
                    $r->pet->owner->name ?? 'N/A',
                    $r->pet->owner->phone ?? 'N/A',
                    $r->name,
                    $r->type,
                    $r->application_date,
                    $r->next_due_date
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function store(Request $request)
    {
        // Support for multiple records in one request
        if ($request->has('records') && is_array($request->input('records'))) {
            $records = $request->input('records');
            $createdCount = 0;
            
            foreach ($records as $recordData) {
                // Basic validation for each item (In production, use a custom Request validator)
                if (!isset($recordData['name']) || !isset($recordData['type'])) continue;

                PreventiveRecord::create([
                    'pet_id' => $recordData['pet_id'],
                    'type' => $recordData['type'],
                    'name' => $recordData['name'],
                    'application_date' => $recordData['application_date'],
                    'next_due_date' => $recordData['next_due_date'] ?? null,
                    'lot_number' => $recordData['lot_number'] ?? null,
                    'brand' => $recordData['brand'] ?? null,
                    'weight_at_time' => $recordData['weight_at_time'] ?? null,
                    'notes' => $recordData['notes'] ?? null,
                    'veterinarian_id' => $recordData['veterinarian_id'] ?? Auth::id(),
                    'branch_id' => Auth::user()->branch_id,
                ]);
                $createdCount++;
            }
            
            return back()->with('message', $createdCount . ' aplicaciones registradas con éxito.');
        }

        // Single record support (backward compatibility)
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'type' => 'required|in:vaccine,internal_deworming,external_deworming,other',
            'name' => 'required|string|max:255',
            'application_date' => 'required|date',
            'next_due_date' => 'nullable|date|after_or_equal:application_date',
            'lot_number' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'weight_at_time' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'veterinarian_id' => 'nullable|exists:users,id',
        ]);

        $validated['branch_id'] = Auth::user()->branch_id;
        $validated['veterinarian_id'] = $validated['veterinarian_id'] ?? Auth::id();

        PreventiveRecord::create($validated);

        return back()->with('message', 'Registro preventivo guardado correctamente.');
    }

    public function update(Request $request, PreventiveRecord $preventiveRecord)
    {
        if ($preventiveRecord->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:vaccine,internal_deworming,external_deworming,other',
            'name' => 'required|string|max:255',
            'application_date' => 'required|date',
            'next_due_date' => 'nullable|date|after_or_equal:application_date',
            'lot_number' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'weight_at_time' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'veterinarian_id' => 'nullable|exists:users,id',
        ]);

        $preventiveRecord->update($validated);

        return back()->with('message', 'Registro preventivo actualizado con éxito.');
    }

    public function destroy(PreventiveRecord $preventiveRecord)
    {
        if ($preventiveRecord->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $preventiveRecord->delete();

        return back()->with('message', 'Registro eliminado.');
    }
}
