<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Branch;
use Illuminate\Support\Facades\Auth;

class BranchSwitcherController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'branch_id' => 'nullable|exists:branches,id'
        ]);

        $user = Auth::user();
        
        // Solo administradores pueden cambiar sucursal de contexto globalmente
        if ($user->role !== 'admin') {
            abort(403);
        }

        $user->branch_id = $request->branch_id;
        $user->save();

        return redirect()->back()->with('message', 'Sucursal cambiada correctamente.');
    }
}
