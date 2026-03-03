const fs = require('fs');

let content = fs.readFileSync('app/Http/Controllers/HospitalizationController.php', 'utf8');

const oldIndex = `    public function index()
    {
        $hospitalizations = Hospitalization::with(['pet', 'veterinarian'])
            ->where('branch_id', Auth::user()->branch_id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Hospitalizations/Index', [
            'hospitalizations' => $hospitalizations
        ]);
    }`;

const newIndex = `    public function index(Request $request)
    {
        $query = Hospitalization::with(['pet', 'veterinarian'])
            ->where('branch_id', Auth::user()->branch_id);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->whereHas('pet', function($petQ) use ($search) {
                    $petQ->where('name', 'like', "%{$search}%");
                })
                ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $hospitalizations = $query->latest()->get();

        return Inertia::render('Hospitalizations/Index', [
            'hospitalizations' => $hospitalizations,
            'filters' => $request->only(['search', 'status'])
        ]);
    }`;

const oldShow = `    public function show(Hospitalization $hospitalization)
    {
        return Inertia::render('Hospitalizations/Show', [
            'hospitalization' => $hospitalization->load(['pet.owner', 'veterinarian', 'monitorings.recorder'])
        ]);
    }`;

const newShow = `    public function show(Hospitalization $hospitalization)
    {
        $templates = \\App\\Models\\DocumentTemplate::whereIn('type', ['hospitalization', 'general'])
            ->where(function($q) use($hospitalization) {
                $q->where('branch_id', $hospitalization->branch_id)->orWhereNull('branch_id');
            })->where('is_active', true)->get();

        return Inertia::render('Hospitalizations/Show', [
            'hospitalization' => $hospitalization->load(['pet.owner', 'veterinarian', 'monitorings.recorder']),
            'templates' => $templates
        ]);
    }

    public function printConsent(Hospitalization $hospitalization, \\App\\Models\\DocumentTemplate $template)
    {
        $hospitalization->load('pet.owner', 'veterinarian');

        $content = $template->content;
        
        $replacements = [
            '{pet_name}' => $hospitalization->pet->name,
            '{client_name}' => $hospitalization->pet->owner->name ?? '_________________',
            '{date}' => \\Carbon\\Carbon::now()->format('d/m/Y'),
            '{veterinarian_name}' => $hospitalization->veterinarian ? $hospitalization->veterinarian->name : '_________________',
        ];

        foreach($replacements as $key => $val) {
            $content = str_replace($key, $val, $content);
        }

        return view('print.consent', [
            'content' => $content,
            'title' => $template->title,
            'pet' => $hospitalization->pet
        ]);
    }`;

content = content.replace(oldIndex, newIndex);
content = content.replace(oldShow, newShow);
fs.writeFileSync('app/Http/Controllers/HospitalizationController.php', content);
