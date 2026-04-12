<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:training,call,course,personal,administrative',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'priority' => 'required|in:low,medium,high',
            'user_id' => 'required|exists:users,id',
            'is_recurring' => 'boolean',
            'recurrence_weeks' => 'nullable|integer|min:1|max:12',
        ]);

        $branchId = Auth::user()->branch_id;
        $isRecurring = $request->get('is_recurring', false);
        $weeks = $request->get('recurrence_weeks', 1);

        if ($isRecurring && $weeks > 1) {
            $startTime = Carbon::parse($validated['start_time']);
            $endTime = Carbon::parse($validated['end_time']);

            for ($i = 0; $i < $weeks; $i++) {
                Task::create([
                    ...$validated,
                    'branch_id' => $branchId,
                    'start_time' => $startTime->copy()->addWeeks($i),
                    'end_time' => $endTime->copy()->addWeeks($i),
                ]);
            }
        } else {
            Task::create([
                ...$validated,
                'branch_id' => $branchId,
            ]);
        }

        return redirect()->back()->with('message', 'Tarea agendada correctamente.');
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:training,call,course,personal,administrative',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'sometimes|required|date|after:start_time',
            'status' => 'sometimes|required|in:pending,completed,cancelled',
            'priority' => 'sometimes|required|in:low,medium,high',
        ]);

        $task->update($validated);

        return redirect()->back()->with('message', 'Tarea actualizada.');
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return redirect()->back()->with('message', 'Tarea eliminada.');
    }
}
