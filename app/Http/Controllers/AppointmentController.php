<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $branchId = Auth::user()->branch_id;
        $date = $request->get('date', Carbon::today()->toDateString());
        $vetId = $request->get('vet_id');
        
        $query = Appointment::where('branch_id', $branchId)->whereDate('start_time', $date);
        
        if ($vetId) {
            $query->where('veterinarian_id', $vetId);
        }
        
        $appointments = $query->with(['pet', 'client', 'veterinarian'])
            ->orderBy('start_time')
            ->get();

        // Weekly/Monthly Volume for Calendar view
        $month = Carbon::parse($date)->format('Y-m');
        $monthQuery = Appointment::where('branch_id', $branchId)
            ->where('start_time', 'like', $month . '%');

        if ($vetId) {
            $monthQuery->where('veterinarian_id', $vetId);
        }

        $monthlyCounts = $monthQuery->selectRaw('DATE(start_time) as date, count(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        $veterinarians = User::where('branch_id', $branchId)
            ->whereIn('role', ['admin', 'veterinarian', 'surgeon', 'specialist', 'groomer'])
            ->get(['id', 'name']);

        $pets = Pet::where('branch_id', $branchId)->with('owner')->get();

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'selectedDate' => $date,
            'selectedVet' => $vetId,
            'monthlyCounts' => $monthlyCounts,
            'veterinarians' => $veterinarians,
            'pets' => $pets
        ]);
    }

    public function create()
    {
        $branchId = Auth::user()->branch_id;
        
        $pets = Pet::where('branch_id', $branchId)->with('owner')->get();
        $veterinarians = User::where('branch_id', $branchId)
            ->whereIn('role', ['admin', 'veterinarian', 'surgeon', 'specialist', 'groomer'])
            ->get(['id', 'name']);

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
            'duration' => 'required|integer|min:15|max:240', // duration in minutes
            'type' => 'required|in:consultation,surgery,grooming,follow-up,emergency',
            'reason' => 'nullable|string',
        ]);

        $pet = Pet::findOrFail($validated['pet_id']);
        
        $appointment = new Appointment($validated);
        $appointment->user_id = $pet->user_id; // Primary owner
        $appointment->branch_id = Auth::user()->branch_id;
        $appointment->end_time = Carbon::parse($validated['start_time'])->addMinutes($validated['duration']);
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
            ->with('message', 'Cita eliminada.');
    }
}
