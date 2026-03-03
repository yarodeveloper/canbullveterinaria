<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\DocumentTemplate;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DocumentTemplateController extends Controller
{
    public function index()
    {
        $branchId = Auth::user()->branch_id;
        $templates = DocumentTemplate::where('branch_id', $branchId)
            ->orWhereNull('branch_id')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Settings/Documents/Index', [
            'templates' => $templates
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:surgery,hospitalization,general,euthanasia',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $validated['branch_id'] = Auth::user()->branch_id;

        DocumentTemplate::create($validated);

        return redirect()->back()->with('message', 'Plantilla creada con éxito.');
    }

    public function update(Request $request, DocumentTemplate $template)
    {
        if ($template->branch_id && $template->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:surgery,hospitalization,general,euthanasia',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return redirect()->back()->with('message', 'Plantilla actualizada con éxito.');
    }

    public function destroy(DocumentTemplate $template)
    {
        if ($template->branch_id && $template->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }
        
        $template->delete();

        return redirect()->back()->with('message', 'Plantilla eliminada.');
    }
}
