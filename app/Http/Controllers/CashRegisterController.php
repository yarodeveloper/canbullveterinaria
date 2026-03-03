<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use App\Models\Receipt;
use App\Models\CashMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use DB;

class CashRegisterController extends Controller
{
    public function index()
    {
        Gate::authorize('manage cash register'); // Assuming a general permission, or create 'manage cash_register'
        
        $branchId = Auth::user()->branch_id;
        
        // Find if there is an open register for this branch
        $activeRegister = CashRegister::where('branch_id', $branchId)
            ->where('status', 'open')
            ->with('openedBy')
            ->first();
            
        // Calculate current state if open
        $currentStats = null;
        if ($activeRegister) {
            $receiptsTotal = Receipt::where('cash_register_id', $activeRegister->id)
                ->where('status', 'paid')
                ->sum('total');
                
            $incomes = CashMovement::where('cash_register_id', $activeRegister->id)
                ->where('type', 'in')
                ->sum('amount');
                
            $expenses = CashMovement::where('cash_register_id', $activeRegister->id)
                ->where('type', 'out')
                ->sum('amount');
                
            $expected = $activeRegister->opening_amount + $receiptsTotal + $incomes - $expenses;
            
            $currentStats = [
                'receipts_total' => $receiptsTotal,
                'incomes' => $incomes,
                'expenses' => $expenses,
                'expected_amount' => $expected,
            ];
        }

        // Previous registers
        $history = CashRegister::where('branch_id', $branchId)
            ->where('status', 'closed')
            ->with(['openedBy', 'closedBy'])
            ->orderBy('closed_at', 'desc')
            ->paginate(15);

        return Inertia::render('Finance/CashRegister/Index', [
            'activeRegister' => $activeRegister,
            'currentStats' => $currentStats,
            'history' => $history,
        ]);
    }

    public function open(Request $request)
    {
        Gate::authorize('manage cash register');

        $request->validate([
            'opening_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        $branchId = Auth::user()->branch_id;

        // Check if there's already an open register
        if (CashRegister::where('branch_id', $branchId)->where('status', 'open')->exists()) {
            return redirect()->back()->withErrors(['error' => 'Ya existe un turno de caja abierto en esta sucursal.']);
        }

        CashRegister::create([
            'branch_id' => $branchId,
            'opened_by' => Auth::id(),
            'opening_amount' => $request->opening_amount,
            'status' => 'open',
            'opened_at' => now(),
            'notes' => $request->notes,
        ]);

        return redirect()->route('cash-register.index')->with('message', 'Turno de caja abierto exitosamente.');
    }

    public function close(Request $request, CashRegister $cashRegister)
    {
        Gate::authorize('manage cash register');

        $request->validate([
            'closing_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($cashRegister->status !== 'open') {
            return redirect()->back()->withErrors(['error' => 'Este turno ya fue cerrado.']);
        }

        // Calculate expected
        $receiptsTotal = Receipt::where('cash_register_id', $cashRegister->id)
            ->where('status', 'paid')
            ->sum('total');
            
        $incomes = CashMovement::where('cash_register_id', $cashRegister->id)
            ->where('type', 'in')
            ->sum('amount');
            
        $expenses = CashMovement::where('cash_register_id', $cashRegister->id)
            ->where('type', 'out')
            ->sum('amount');
            
        $expectedAmount = $cashRegister->opening_amount + $receiptsTotal + $incomes - $expenses;

        $cashRegister->update([
            'closed_by' => Auth::id(),
            'closing_amount' => $request->closing_amount,
            'expected_amount' => $expectedAmount,
            'status' => 'closed',
            'closed_at' => now(),
            'notes' => $cashRegister->notes . "\nCierre: " . $request->notes,
        ]);

        return redirect()->route('cash-register.index')->with('message', 'Turno de caja cerrado exitosamente.');
    }

    public function print(CashRegister $cashRegister)
    {
        Gate::authorize('manage cash register');

        $cashRegister->load(['openedBy', 'closedBy', 'branch']);

        // Fetch stats for the print view
        $receipts = Receipt::where('cash_register_id', $cashRegister->id)->with('client')->get();
        $movements = CashMovement::where('cash_register_id', $cashRegister->id)->whereIn('type', ['in', 'out'])->with('user')->get();

        return Inertia::render('Finance/CashRegister/Print', [
            'cashRegister' => $cashRegister,
            'receipts' => $receipts,
            'movements' => $movements,
        ]);
    }
}
