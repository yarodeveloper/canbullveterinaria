<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Lot;
use App\Models\MedicalRecord;
use App\Models\Receipt;
use App\Models\ReceiptItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Reporte de Ventas por Empleado
     */
    public function salesByEmployee(Request $request)
    {
        $user = Auth::user();
        $branchId = $user->branch_id;
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $sales = DB::table('receipt_items')
            ->join('receipts', 'receipt_items.receipt_id', '=', 'receipts.id')
            ->leftJoin('users', 'receipt_items.assigned_user_id', '=', 'users.id')
            ->when($branchId, fn($q) => $q->where('receipts.branch_id', $branchId))
            ->whereBetween('receipts.date', [$startDate, Carbon::parse($endDate)->endOfDay()])
            ->select(
                DB::raw('COALESCE(users.name, "Sin Asignar") as employee_name'),
                DB::raw('COUNT(DISTINCT receipts.id) as ticket_count'),
                DB::raw('SUM(receipt_items.total) as total_sales'),
                DB::raw('SUM(receipt_items.quantity) as item_count')
            )
            ->groupBy('employee_name')
            ->orderByDesc('total_sales')
            ->get();

        return Inertia::render('Reports/SalesByEmployee', [
            'sales' => $sales,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    /**
     * Reporte de Pacientes Atendidos
     */
    public function patientsAttended(Request $request)
    {
        $user = Auth::user();
        $branchId = $user->branch_id;
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $patients = MedicalRecord::with(['pet', 'veterinarian'])
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$startDate, Carbon::parse($endDate)->endOfDay()])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($record) => [
                'id' => $record->id,
                'date' => $record->created_at->toDateTimeString(),
                'pet_name' => $record->pet ? $record->pet->name : 'N/A',
                'pet_owner' => $record->pet && $record->pet->owner ? $record->pet->owner->name : 'N/A',
                'vet_name' => $record->veterinarian ? $record->veterinarian->name : 'N/A',
                'reason' => $record->reason,
                'type' => 'Consulta'
            ]);

        return Inertia::render('Reports/PatientsAttended', [
            'patients' => $patients,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    /**
     * Reporte de Inventario por Sucursal
     */
    public function stockByBranch(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && !$user->can('view reports')) {
            abort(403);
        }

        $branchId = $request->input('branch_id', $user->branch_id);
        
        // Forzar sucursal si no es admin
        if ($user->role !== 'admin') {
            $branchId = $user->branch_id;
        }

        $branches = Branch::all();
        if ($branchId && $user->role !== 'admin') {
            $branches = Branch::where('id', $branchId)->get();
        }
        $stockData = DB::table('lots')
            ->join('products', 'lots.product_id', '=', 'products.id')
            ->join('branches', 'lots.branch_id', '=', 'branches.id')
            ->where('lots.status', 'active')
            ->when($branchId, fn($q) => $q->where('lots.branch_id', $branchId))
            ->select(
                'branches.name as branch_name',
                'products.name as product_name',
                'products.sku',
                'lots.current_quantity',
                'lots.unit_cost',
                DB::raw('lots.current_quantity * lots.unit_cost as total_cost_value')
            )
            ->orderBy('branches.name')
            ->orderBy('products.name')
            ->get();

        return Inertia::render('Reports/StockByBranch', [
            'stockData' => $stockData,
            'branches' => $branches,
            'filters' => [
                'branch_id' => $branchId
            ]
        ]);
    }
}
