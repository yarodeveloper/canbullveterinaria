<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\CashMovement;
use App\Models\Lot;
use App\Models\Pet;
use App\Models\Product;
use App\Models\Receipt;
use App\Models\User;
use App\Models\Hospitalization;
use App\Models\Surgery;
use App\Models\MedicalRecord;
use App\Models\Euthanasia;
use App\Models\ProductCategory;
use App\Models\PendingCharge;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        $branchId = $user->branch_id;
        $role = $user->role;

        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // --- MÉTRICAS COMUNES ---
        $commonStats = [
            'appointments_today' => Appointment::whereDate('start_time', today())
                ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
                ->count(),
            'total_pets' => Pet::count(),
            'total_patients_attended' => MedicalRecord::query()
                ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
                ->whereBetween('created_at', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->distinct('pet_id')
                ->count('pet_id'),
            'total_system_views' => DB::table('internal_analytics')
                ->when($branchId, function($q) use($branchId) {
                    return $q->join('users', 'internal_analytics.user_id', '=', 'users.id')
                             ->where('users.branch_id', $branchId);
                })
                ->count(),
        ];

        // Horas de mayor atención
        $peakHours = DB::table(DB::raw("(
                SELECT HOUR(created_at) as hour FROM medical_records WHERE (branch_id " . ($branchId ? "= $branchId" : "IS NOT NULL") . ") AND created_at BETWEEN '$startDate' AND '$endDate 23:59:59'
                UNION ALL
                SELECT HOUR(created_at) as hour FROM receipts WHERE (branch_id " . ($branchId ? "= $branchId" : "IS NOT NULL") . ") AND created_at BETWEEN '$startDate' AND '$endDate 23:59:59'
            ) as activity"))
            ->select('hour', DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Agendamientos por Tipo
        $appointmentsByType = Appointment::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('start_time', [$startDate, Carbon::parse($endDate)->endOfDay()])
            ->select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->get();

        $data = [
            'role' => $role,
            'stats' => $commonStats,
            'peakHours' => $peakHours,
            'appointmentsByType' => $appointmentsByType,
            'revenueData' => [],
            'hospitalizationOccupancy' => [],
            'dailyPatients' => [],
            'yearlySales' => [],
            'recentActivities' => [],
            'adminMetrics' => null,
            'vetMetrics' => null,
            'receptionMetrics' => null,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ];

        // Tendencia de pacientes (Ultimos 7 dias)
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = MedicalRecord::query()
                ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
                ->whereDate('created_at', $date)
                ->distinct('pet_id')
                ->count('pet_id');
            $data['dailyPatients'][] = ['name' => $date->translatedFormat('D d'), 'count' => $count];
        }

        // --- 1. MÉTRICAS PARA ADMINISTRADORES ---
        if ($role === 'admin') {
            $revenueMonth = (float) CashMovement::where('type', 'in')->whereBetween('created_at', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
                ->sum('amount');
            $expensesMonth = (float) CashMovement::where('type', 'out')->whereBetween('created_at', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
                ->sum('amount');
            
            $grossMargin = $revenueMonth > 0 ? (($revenueMonth - $expensesMonth) / $revenueMonth) * 100 : 0;

            $ticketCount = Receipt::whereBetween('date', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
                ->count();
            $averageTicketValue = $ticketCount > 0 ? $revenueMonth / $ticketCount : 0;

            // Ventas por Rubro (Participación por tipo de servicio)
            $salesByCategory = DB::table('receipt_items')
                ->join('receipts', 'receipt_items.receipt_id', '=', 'receipts.id')
                ->leftJoin('products', 'receipt_items.product_id', '=', 'products.id')
                ->leftJoin('product_categories', 'products.product_category_id', '=', 'product_categories.id')
                ->when($branchId, fn($q) => $q->where('receipts.branch_id', $branchId))
                ->whereBetween('receipts.date', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->select(DB::raw("
                    CASE 
                        WHEN product_categories.name IS NOT NULL THEN product_categories.name
                        WHEN receipt_items.concept LIKE '%Consulta%' OR receipt_items.concept LIKE '%Revisión%' THEN 'Consultas'
                        WHEN receipt_items.concept LIKE '%Cirug%' THEN 'Cirugías'
                        WHEN receipt_items.concept LIKE '%Hosp%' THEN 'Hospitalización'
                        WHEN receipt_items.concept LIKE '%Vacun%' OR receipt_items.concept LIKE '%Vacuna%' THEN 'Vacunas'
                        WHEN receipt_items.concept LIKE '%Estética%' OR receipt_items.concept LIKE '%Baño%' OR receipt_items.concept LIKE '%Peluquería%' THEN 'Estética'
                        WHEN receipt_items.concept LIKE '%Imagen%' OR receipt_items.concept LIKE '%RX%' OR receipt_items.concept LIKE '%Eco%' THEN 'Imagenología'
                        WHEN receipt_items.concept LIKE '%Lab%' OR receipt_items.concept LIKE '%Analisis%' THEN 'Laboratorio'
                        WHEN receipt_items.type = 'product' THEN 'Accesorios/Farmacia'
                        ELSE 'Servicios Varios'
                    END as rubro
                "), DB::raw("SUM(receipt_items.total) as total"), DB::raw("COUNT(*) as sales_count"))
                ->groupBy('rubro')
                ->get();

            // Ventas por Mes (Iniciando de Enero a Diciembre del año actual)
            $currentYear = date('Y');
            $yearlySales = DB::table('cash_movements')
                ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
                ->where('type', 'in')
                ->whereYear('created_at', $currentYear)
                ->select(DB::raw('MONTH(created_at) as month'), DB::raw('SUM(amount) as revenue'))
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->keyBy('month');

            for ($m = 1; $m <= 12; $m++) {
                $monthName = Carbon::create()->month($m)->translatedFormat('M');
                $data['yearlySales'][] = [
                    'name' => $monthName,
                    'revenue' => (float) ($yearlySales[$m]->revenue ?? 0)
                ];
            }

            // Ventas por Sucursal
            $branchMonthlySales = [];
            if (!$branchId) {
                $branchMonthlySales = DB::table('receipts')
                    ->join('branches', 'receipts.branch_id', '=', 'branches.id')
                    ->whereYear('receipts.date', date('Y'))
                    ->select('branches.name as branch_name', DB::raw('MONTH(receipts.date) as month'), DB::raw('SUM(receipts.total) as total'))
                    ->groupBy('branch_name', 'month')->orderBy('month')->get()->groupBy('month')->map(function ($mg, $m) {
                        $d = ['name' => Carbon::create()->month($m)->translatedFormat('M')];
                        foreach ($mg as $i) { $d[$i->branch_name] = (float) $i->total; }
                        return $d;
                    })->values();
            }

            // Ventas por Vendedor
            $salesBySeller = DB::table('receipt_items')
                ->join('receipts', 'receipt_items.receipt_id', '=', 'receipts.id')
                ->leftJoin('users', 'receipt_items.assigned_user_id', '=', 'users.id')
                ->when($branchId, fn($q) => $q->where('receipts.branch_id', $branchId))
                ->whereBetween('receipts.date', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->select(DB::raw('COALESCE(users.name, "Sin Asignar") as seller_name'), DB::raw('SUM(receipt_items.total) as total'), DB::raw('COUNT(DISTINCT receipts.id) as tickets'))
                ->groupBy('seller_name')->orderByDesc('total')->limit(5)->get();

            $data['adminMetrics'] = [
                'total_revenue_month' => $revenueMonth,
                'total_expenses_month' => $expensesMonth,
                'gross_margin_percentage' => round($grossMargin, 2),
                'average_ticket' => round($averageTicketValue, 2),
                'sales_by_type' => $salesByCategory,
                'branch_monthly_sales' => $branchMonthlySales,
                'sales_by_seller' => $salesBySeller,
                'inventory_value_cost' => (float) Lot::query()->when($branchId, fn($q) => $q->where('branch_id', $branchId))->where('status', 'active')->sum(DB::raw('current_quantity * unit_cost')),
            ];

            // Gráfica semanal
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $in = CashMovement::query()->where('type', 'in')->when($branchId, fn($q) => $q->where('branch_id', $branchId))->whereDate('created_at', $date)->sum('amount');
                $out = CashMovement::query()->where('type', 'out')->when($branchId, fn($q) => $q->where('branch_id', $branchId))->whereDate('created_at', $date)->sum('amount');
                $data['revenueData'][] = ['name' => $date->translatedFormat('D d'), 'ingresos' => (float) $in, 'egresos' => (float) $out];
            }
        }

        // --- 2. MÉTRICAS VET ---
        if ($role === 'admin' || $role === 'veterinarian') {
            $data['vetMetrics'] = [
                'active_hospitalizations' => Hospitalization::where('status', 'admitted')->when($branchId, fn($q) => $q->where('branch_id', $branchId))->count(),
                'pending_surgeries' => Surgery::where('status', 'scheduled')->when($branchId, fn($q) => $q->where('branch_id', $branchId))->count(),
            ];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $count = Hospitalization::query()->when($branchId, fn($q) => $q->where('branch_id', $branchId))->whereDate('admission_date', '<=', $date)->where(function($q) use ($date) { $q->whereNull('discharge_date')->orWhereDate('discharge_date', '>', $date); })->count();
                $data['hospitalizationOccupancy'][] = ['name' => $date->translatedFormat('D d'), 'count' => $count];
            }
        }

        // --- 3. MÉTRICAS RECEPCIÓN ---
        if ($role === 'admin' || $role === 'receptionist') {
            $data['receptionMetrics'] = [
                'sales_today' => (float) Receipt::when($branchId, fn($q) => $q->where('branch_id', $branchId))->whereDate('date', today())->sum('total'),
                'total_pets' => Pet::count(),
            ];
        }

        $data['recentActivities'] = AuditLog::with('user')->when($branchId, fn($q) => $q->where('branch_id', $branchId))->latest()->limit(8)->get()->map(fn($log) => [
            'id' => $log->id, 'user' => $log->user ? $log->user->name : 'Sistema', 'event' => $log->event, 'model' => class_basename($log->auditable_type), 'time' => $log->created_at->diffForHumans(),
        ]);

        return Inertia::render('Dashboard', $data);
    }
}
