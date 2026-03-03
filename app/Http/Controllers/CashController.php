<?php

namespace App\Http\Controllers;

use App\Models\CashMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class CashController extends Controller
{
    public function index()
    {
        $branchId = Auth::user()->branch_id;
        
        $activeRegister = \App\Models\CashRegister::where('branch_id', $branchId)->where('status', 'open')->first();
        
        $query = CashMovement::with(['user', 'receipt']);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        
        if ($activeRegister) {
            $query->where('cash_register_id', $activeRegister->id);
            $ins = CashMovement::where('cash_register_id', $activeRegister->id)->where('type', 'in')->sum('amount');
            $outs = CashMovement::where('cash_register_id', $activeRegister->id)->where('type', 'out')->sum('amount');
            $todayTotal = $ins - $outs;
        } else {
            $query->whereRaw('1 = 0'); // No box open = no movements show
            $todayTotal = 0;
        }

        $movements = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Finance/Cash/Index', [
            'movements' => $movements,
            'todayTotal' => $todayTotal,
            'activeRegister' => $activeRegister
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manage withdrawals');
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:in,out',
            'method' => 'required|string',
            'description' => 'required|string',
        ]);

        $branchId = Auth::user()->branch_id;
        $activeRegister = \App\Models\CashRegister::where('branch_id', $branchId)->where('status', 'open')->first();
        
        if (!$activeRegister) {
            return redirect()->route('cash-register.index')->withErrors(['error' => 'Debes abrir turno de caja antes de registrar egresos o ingresos extraordinarios.']);
        }

        $validated['branch_id'] = $branchId;
        $validated['user_id'] = Auth::id();
        $validated['cash_register_id'] = $activeRegister->id;

        $movement = CashMovement::create($validated);

        return redirect()->back()->with([
            'message' => 'Movimiento registrado en la caja activa.',
            'print_movement_id' => $movement->id, // Pasa el ID para imprimir automáticamente
        ]);
    }

    public function print(CashMovement $cashMovement)
    {
        Gate::authorize('manage finances');

        $cashMovement->load('user', 'branch');

        return Inertia::render('Finance/Cash/Print', [
            'movement' => $cashMovement
        ]);
    }
}
