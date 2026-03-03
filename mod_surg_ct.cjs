const fs = require('fs');

let content = fs.readFileSync('app/Http/Controllers/SurgeryController.php', 'utf8');

const oldIndex = `    public function index()
    {
        $branchId = Auth::user()->branch_id;
        $surgeries = Surgery::where('branch_id', $branchId)
            ->with(['pet', 'leadSurgeon'])
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return Inertia::render('Surgeries/Index', [
            'surgeries' => $surgeries
        ]);
    }`;

const newIndex = `    public function index(Request $request)
    {
        $branchId = Auth::user()->branch_id;
        
        $query = Surgery::where('branch_id', $branchId)->with(['pet', 'leadSurgeon']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->whereHas('pet', function($petQ) use ($search) {
                    $petQ->where('name', 'like', "%{$search}%");
                })
                ->orWhere('surgery_type', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $surgeries = $query->orderBy('scheduled_at', 'desc')->get();

        return Inertia::render('Surgeries/Index', [
            'surgeries' => $surgeries,
            'filters' => $request->only(['search', 'status'])
        ]);
    }`;

content = content.replace(oldIndex, newIndex);
fs.writeFileSync('app/Http/Controllers/SurgeryController.php', content);
