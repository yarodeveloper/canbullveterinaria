<?php

namespace App\Http\Controllers;

use App\Models\PreventiveRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PreventiveRecordController extends Controller
{
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

    public function destroy(PreventiveRecord $preventiveRecord)
    {
        if ($preventiveRecord->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $preventiveRecord->delete();

        return back()->with('message', 'Registro eliminado.');
    }
}
