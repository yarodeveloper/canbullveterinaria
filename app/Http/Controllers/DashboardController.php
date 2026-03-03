<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Pet;
use App\Models\Product;
use App\Models\Receipt;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $branchId = Auth::user()->branch_id;
        
        // 1. Stats Básicas
        $stats = [
            'total_pets' => Pet::count(),
            'appointments_today' => Appointment::whereDate('start_time', today())->count(),
            'total_clients' => User::where('role', 'client')->count(),
            'low_stock_count' => Product::whereHas('lots', function($query) use ($branchId) {
                $query->where('branch_id', $branchId)->where('status', 'active');
            })->get()->filter(function($product) use ($branchId) {
                return $product->currentStock($branchId) <= ($product->min_stock ?? 5);
            })->count(),
        ];

        // 2. Ingresos de los últimos 7 días (para la gráfica)
        $revenueData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $total = Receipt::where('branch_id', $branchId)
                ->whereDate('date', $date)
                ->sum('total');
            
            $revenueData[] = [
                'name' => $date->translatedFormat('D d'),
                'total' => (float) $total,
            ];
        }

        // 3. Tipos de Cita (para Chart)
        $appointmentDistribution = Appointment::where('branch_id', $branchId)
            ->whereDate('start_time', '>=', Carbon::now()->startOfMonth())
            ->select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get();

        // 4. Últimas actividades
        $recentActivities = AuditLog::with('user')
            ->where('branch_id', $branchId)
            ->latest()
            ->limit(10)
            ->get()
            ->map(function($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->name : 'Sistema',
                    'event' => $log->event,
                    'model' => class_basename($log->auditable_type),
                    'time' => $log->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'revenueData' => $revenueData,
            'appointmentDistribution' => $appointmentDistribution,
            'recentActivities' => $recentActivities
        ]);
    }
}
