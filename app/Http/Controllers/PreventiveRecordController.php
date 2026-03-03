<?php

namespace App\Http\Controllers;

use App\Models\PreventiveRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PreventiveRecordController extends Controller
{
    public function store(Request $request)
    {
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
