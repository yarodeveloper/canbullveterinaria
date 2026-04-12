<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

use App\Models\Task;
use App\Models\PreventiveRecord;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $branchId = Auth::user()->branch_id;
        
        // Date range for the list view
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());
        
        // Single date for the calendar selection
        $selectedDate = $request->get('date', Carbon::today()->toDateString());
        $vetId = $request->get('vet_id');
        
        // --- Fetch Appointments ---
        $aptQuery = Appointment::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('start_time', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        
        if ($vetId) {
            $aptQuery->where('veterinarian_id', $vetId);
        }
        
        $appointments = $aptQuery->with(['pet', 'client', 'veterinarian'])
            ->orderBy('start_time')
            ->get();

        // --- Fetch Tasks ---
        $taskQuery = Task::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('start_time', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
            
        // If a specific vet is selected, we filter tasks assigned to them (user_id)
        if ($vetId) {
            $taskQuery->where('user_id', $vetId);
        }

        $tasks = $taskQuery->with(['user'])
            ->orderBy('start_time')
            ->get();

        // --- Monthly counts for Calendar view ---
        $month = Carbon::parse($selectedDate)->format('Y-m');
        
        $aptMonthCounts = Appointment::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->where('start_time', 'like', $month . '%')
            ->when($vetId, fn($q) => $q->where('veterinarian_id', $vetId))
            ->selectRaw('DATE(start_time) as date, count(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        $taskMonthCounts = Task::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->where('start_time', 'like', $month . '%')
            ->when($vetId, fn($q) => $q->where('user_id', $vetId))
            ->selectRaw('DATE(start_time) as date, count(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        // --- Fetch Preventive Reminders (Salud Preventiva) ---
        $preventiveReminders = PreventiveRecord::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereNotNull('next_due_date')
            // Fetch overdue (last 60 days) and upcoming (next 30 days)
            ->whereBetween('next_due_date', [
                Carbon::now()->subDays(60),
                Carbon::now()->addDays(30)
            ])
            ->with(['pet.owner', 'veterinarian'])
            ->orderBy('next_due_date', 'asc')
            ->get();

        // Merge counts
        $monthlyCounts = $aptMonthCounts->mapWithKeys(function($count, $date) use ($taskMonthCounts) {
            return [$date => $count + ($taskMonthCounts[$date] ?? 0)];
        });

        // Add dates that are only in tasks
        foreach ($taskMonthCounts as $date => $count) {
            if (!$monthlyCounts->has($date)) {
                $monthlyCounts[$date] = $count;
            }
        }

        $veterinarians = User::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->where(function($q) {
                $q->whereHas('roles', function($r) {
                    $r->whereIn('name', ['admin', 'veterinarian', 'surgeon', 'specialist', 'groomer']);
                })->orWhereIn('role', ['admin', 'veterinarian']);
            })
            ->with(['roles', 'branch'])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->roles->first() ? $user->roles->first()->name : $user->role
                ];
            });

        $pets = Pet::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->where('status', '!=', 'deceased')
            ->with('owner')
            ->get();

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'tasks' => $tasks,
            'selectedDate' => $selectedDate,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'selectedVet' => $vetId,
            'monthlyCounts' => $monthlyCounts,
            'veterinarians' => $veterinarians,
            'pets' => $pets,
            'preventiveReminders' => $preventiveReminders
        ]);
    }

    public function create()
    {
        $branchId = Auth::user()->branch_id;
        
        $pets = Pet::query()->with(['owner', 'branch'])->limit(100)->get();
        $veterinarians = User::where('branch_id', $branchId)
            ->where(function($q) {
                $q->whereHas('roles', function($r) {
                    $r->whereIn('name', ['admin', 'veterinarian', 'surgeon', 'specialist', 'groomer']);
                })->orWhereIn('role', ['admin', 'veterinarian']);
            })
            ->with('roles')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->roles->first() ? $user->roles->first()->name : $user->role
                ];
            });

        return Inertia::render('Appointments/Create', [
            'pets' => $pets,
            'veterinarians' => $veterinarians
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'veterinarian_id' => 'nullable|exists:users,id',
            'start_time' => 'required|date',
            'duration' => 'required|integer|min:15|max:480', // duration in minutes (max 8 hours)
            'type' => 'required|in:consultation,surgery,grooming,hospitalization,follow-up,emergency,euthanasia',
            'reason' => 'nullable|string',
        ]);

        $pet = Pet::findOrFail($validated['pet_id']);
        
        $appointment = new Appointment($validated);
        $appointment->user_id = $pet->user_id; // Primary owner
        $appointment->branch_id = Auth::user()->branch_id;
        $appointment->end_time = Carbon::parse($validated['start_time'])->addMinutes((int)$validated['duration']);
        $appointment->status = 'scheduled';
        $appointment->save();

        return redirect()->route('appointments.index')
            ->with('message', 'Cita agendada correctamente.');
    }

    public function update(Request $request, Appointment $appointment)
    {
        if ($appointment->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:scheduled,confirmed,in-progress,completed,cancelled,no-show',
            'veterinarian_id' => 'nullable|exists:users,id',
            'start_time' => 'nullable|date',
            'reason' => 'nullable|string',
        ]);

        if (isset($validated['start_time']) && $validated['start_time'] != (string) $appointment->start_time) {
            $duration = Carbon::parse($appointment->start_time)->diffInMinutes($appointment->end_time);
            $appointment->start_time = $validated['start_time'];
            $appointment->end_time = Carbon::parse($validated['start_time'])->addMinutes($duration);
        }

        if (array_key_exists('veterinarian_id', $validated)) {
            $appointment->veterinarian_id = $validated['veterinarian_id'];
        }
        if (isset($validated['status'])) {
            $appointment->status = $validated['status'];
        }
        if (isset($validated['reason'])) {
            $appointment->reason = $validated['reason'];
        }

        $appointment->save();

        return redirect()->back()->with('message', 'Cita actualizada correctamente.');
    }

    public function destroy(Appointment $appointment)
    {
        if ($appointment->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $appointment->delete();

        return redirect()->route('appointments.index')
            ->with('message', 'Cita eliminada correctamente.');
    }
}
