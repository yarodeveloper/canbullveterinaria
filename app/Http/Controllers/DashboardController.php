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

        // --- MÉTRICAS COMUNES (Base para todos) ---
        $commonStats = [
            'appointments_today' => Appointment::whereDate('start_time', today())->where('branch_id', $branchId)->count(),
            'total_pets' => Pet::count(), // Esto podría filtrarse por sucursal si se desea
        ];

        $data = [
            'role' => $role,
            'stats' => $commonStats,
            'revenueData' => [],
            'appointmentDistribution' => [],
            'hospitalizationOccupancy' => [],
            'recentActivities' => [],
            'adminMetrics' => null,
            'vetMetrics' => null,
            'receptionMetrics' => null,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ];

        // --- 1. MÉTRICAS PARA ADMINISTRADORES ---
        if ($role === 'admin') {
            $revenueMonth = (float) Receipt::whereBetween('date', [$startDate, Carbon::parse($endDate)->endOfDay()])->where('branch_id', $branchId)->sum('total');
            $expensesMonth = (float) CashMovement::where('type', 'out')->whereBetween('created_at', [$startDate, Carbon::parse($endDate)->endOfDay()])->where('branch_id', $branchId)->sum('amount');
            
            // Margen operativo del periodo
            $grossMargin = $revenueMonth > 0 ? (($revenueMonth - $expensesMonth) / $revenueMonth) * 100 : 0;

            // Margen por categorías (basado en inventario actual)
            $categoryMargins = DB::table('products')
                ->join('lots', 'products.id', '=', 'lots.product_id')
                ->where('lots.branch_id', $branchId)
                ->where('lots.status', 'active')
                ->where('products.is_service', false)
                ->select(
                    'products.product_category_id',
                    DB::raw('AVG(products.price) as avg_price'),
                    DB::raw('AVG(lots.unit_cost) as avg_cost')
                )
                ->groupBy('products.product_category_id')
                ->get()
                ->map(function($item) {
                    $category = ProductCategory::find($item->product_category_id);
                    $margin = $item->avg_price > 0 ? (($item->avg_price - $item->avg_cost) / $item->avg_price) * 100 : 0;
                    return [
                        'category' => $category ? $category->name : 'General',
                        'margin' => round($margin, 2),
                        'avg_price' => round($item->avg_price, 2),
                        'avg_cost' => round($item->avg_cost, 2),
                    ];
                });

            // 1. Ventas por tipo de rubro
            $salesByType = DB::table('receipt_items')
                ->join('receipts', 'receipt_items.receipt_id', '=', 'receipts.id')
                ->where('receipts.branch_id', $branchId)
                ->whereBetween('receipts.date', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->select(DB::raw("
                    CASE 
                        WHEN receipt_items.type = 'product' THEN 'Productos / Medicamentos'
                        WHEN receipt_items.type = 'service' AND receipt_items.concept LIKE '%Consulta%' THEN 'Consultas'
                        WHEN receipt_items.type = 'service' AND receipt_items.concept LIKE '%Cirug%' THEN 'Cirugías'
                        WHEN receipt_items.type = 'service' AND receipt_items.concept LIKE '%Hosp%' THEN 'Hospitalización'
                        WHEN receipt_items.type = 'service' AND (receipt_items.concept LIKE '%Vacun%' OR receipt_items.concept LIKE '%Vacuna%') THEN 'Vacunas'
                        WHEN receipt_items.type = 'service' AND receipt_items.concept LIKE '%Estética%' THEN 'Estética/Peluquería'
                        ELSE 'Otros Servicios'
                    END as rubro
                "), DB::raw("SUM(receipt_items.total) as total"))
                ->groupBy('rubro')
                ->get();

            // 2. Ventas por método de pago
            $salesByPaymentMethod = Receipt::where('branch_id', $branchId)
                ->whereBetween('date', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->select('payment_method', DB::raw('SUM(total) as total'))
                ->groupBy('payment_method')
                ->get();
                
            // 3. Ventas generadas por vendedor
            $salesBySeller = DB::table('receipt_items')
                ->join('receipts', 'receipt_items.receipt_id', '=', 'receipts.id')
                ->leftJoin('users', 'receipt_items.assigned_user_id', '=', 'users.id')
                ->where('receipts.branch_id', $branchId)
                ->whereBetween('receipts.date', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->select(DB::raw('COALESCE(users.name, "Sin Asignar") as seller_name'), DB::raw('SUM(receipt_items.total) as total'))
                ->groupBy('seller_name')
                ->orderByDesc('total')
                ->get();
                
            // 4. Egresos y tipos de egresos
            $expensesByType = CashMovement::where('branch_id', $branchId)
                ->where('type', 'out')
                ->whereBetween('created_at', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->select('method', DB::raw('SUM(amount) as total'))
                ->groupBy('method')
                ->get();
                
            // Egresos por descripcion (top 10)
            $expensesByDescription = CashMovement::where('branch_id', $branchId)
                ->where('type', 'out')
                ->whereBetween('created_at', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->select('description', DB::raw('SUM(amount) as total'))
                ->groupBy('description')
                ->orderByDesc('total')
                ->limit(10)
                ->get();

            $data['adminMetrics'] = [
                'total_revenue_month' => $revenueMonth,
                'total_expenses_month' => $expensesMonth,
                'gross_margin_percentage' => round($grossMargin, 2),
                'category_margins' => $categoryMargins,
                'sales_by_type' => $salesByType,
                'sales_by_payment_method' => $salesByPaymentMethod,
                'sales_by_seller' => $salesBySeller,
                'expenses_by_type' => $expensesByType,
                'expenses_by_description' => $expensesByDescription,
                'inventory_value_cost' => (float) Lot::where('branch_id', $branchId)->where('status', 'active')->sum(DB::raw('current_quantity * unit_cost')),
                'inventory_value_sale' => (float) Lot::where('lots.branch_id', $branchId)
                    ->where('lots.status', 'active')
                    ->join('products', 'products.id', '=', 'lots.product_id')
                    ->sum(DB::raw('lots.current_quantity * products.price')),
                'low_stock_all' => Product::whereHas('lots', function($q) use ($branchId) {
                    $q->where('branch_id', $branchId)->where('status', 'active');
                })->get()->filter(fn($p) => $p->currentStock($branchId) <= ($p->min_stock ?? 5))->count(),
            ];

            // Gráfica de Ingresos vs Gastos
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $in = Receipt::where('branch_id', $branchId)->whereDate('date', $date)->sum('total');
                $out = CashMovement::where('branch_id', $branchId)->where('type', 'out')->whereDate('created_at', $date)->sum('amount');
                
                $data['revenueData'][] = [
                    'name' => $date->translatedFormat('D d'),
                    'ingresos' => (float) $in,
                    'egresos' => (float) $out,
                ];
            }
        }

        // --- 2. MÉTRICAS PARA MÉDICOS / VETERINARIOS ---
        if ($role === 'admin' || $role === 'veterinarian') {
            $data['vetMetrics'] = [
                'active_hospitalizations' => Hospitalization::where('status', 'admitted')->where('branch_id', $branchId)->count(),
                'pending_surgeries' => Surgery::where('status', 'scheduled')->where('branch_id', $branchId)->count(),
                'surgeries_today' => Surgery::whereDate('scheduled_at', today())->where('branch_id', $branchId)->count(),
                'medical_records_today' => MedicalRecord::whereDate('created_at', today())->where('branch_id', $branchId)->count(),
            ];

            // Distribución de Consultas
            $data['appointmentDistribution'] = Appointment::where('branch_id', $branchId)
                ->whereBetween('start_time', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->get();

            // Ocupación Hospitalaria (7 días)
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $count = Hospitalization::where('branch_id', $branchId)
                    ->whereDate('admission_date', '<=', $date)
                    ->where(function($q) use ($date) {
                        $q->whereNull('discharge_date')->orWhereDate('discharge_date', '>', $date);
                    })->count();
                $data['hospitalizationOccupancy'][] = ['name' => $date->translatedFormat('D d'), 'count' => $count];
            }
        }

        // --- 3. MÉTRICAS PARA MOSTRADOR / RECEPCIÓN ---
        if ($role === 'admin' || $role === 'receptionist') {
            $data['receptionMetrics'] = [
                'sales_today' => (float) Receipt::whereDate('date', today())->where('branch_id', $branchId)->sum('total'),
                'new_clients_today' => User::where('role', 'client')->whereDate('created_at', today())->count(),
                'pending_payments' => PendingCharge::where('status', 'pending')->where('branch_id', $branchId)->count(),
            ];
            
            // Si no es admin y no tiene revenueData por la lógica anterior, llenar ingresos simples
            if (empty($data['revenueData'])) {
                for ($i = 6; $i >= 0; $i--) {
                    $date = Carbon::today()->subDays($i);
                    $total = Receipt::where('branch_id', $branchId)->whereDate('date', $date)->sum('total');
                    $data['revenueData'][] = ['name' => $date->translatedFormat('D d'), 'total' => (float) $total];
                }
            }
        }

        // Actividades Recientes (Todos ven el pulso de la clínica)
        $data['recentActivities'] = AuditLog::with('user')
            ->where('branch_id', $branchId)
            ->latest()->limit(8)->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'user' => $log->user ? $log->user->name : 'Sistema',
                'event' => $log->event,
                'model' => class_basename($log->auditable_type),
                'time' => $log->created_at->diffForHumans(),
            ]);

        return Inertia::render('Dashboard', $data);
    }
}
