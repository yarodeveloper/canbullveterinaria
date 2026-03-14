<?php

namespace App\Http\Controllers;

use App\Models\HealthProtocol;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class HealthProtocolController extends Controller
{
    public function index()
    {
        $protocols = HealthProtocol::whereNull('branch_id')
            ->orWhere('branch_id', Auth::user()->branch_id)
            ->get();

        return Inertia::render('Settings/HealthProtocols/Index', [
            'protocols' => $protocols
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:vaccine,internal_deworming,external_deworming,other',
            'species' => 'required|in:Canino,Felino,both',
            'suggested_product' => 'nullable|string|max:255',
            'days_until_next' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $validated['branch_id'] = Auth::user()->branch_id;

        $protocol = HealthProtocol::create($validated);

        if ($request->expectsJson()) {
            return response()->json($protocol);
        }

        return redirect()->route('health-protocols.index')
            ->with('message', 'Protocolo creado con éxito.');
    }

    public function update(Request $request, HealthProtocol $healthProtocol)
    {
        if ($healthProtocol->branch_id && $healthProtocol->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:vaccine,internal_deworming,external_deworming,other',
            'species' => 'required|in:Canino,Felino,both',
            'suggested_product' => 'nullable|string|max:255',
            'days_until_next' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $healthProtocol->update($validated);

        return redirect()->route('health-protocols.index')
            ->with('message', 'Protocolo actualizado con éxito.');
    }

    public function destroy(HealthProtocol $healthProtocol)
    {
        if ($healthProtocol->branch_id && $healthProtocol->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        if (!$healthProtocol->branch_id) {
            return back()->with('error', 'No se pueden eliminar protocolos bases del sistema.');
        }

        $healthProtocol->delete();

        return redirect()->route('health-protocols.index')
            ->with('message', 'Protocolo eliminado con éxito.');
    }
}
