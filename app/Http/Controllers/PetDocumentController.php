<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\PetDocument;
use Illuminate\Support\Facades\Storage;

class PetDocumentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'name' => 'required|string|max:255',
            'document' => 'required|file|max:10240', // max 10MB
        ]);

        $file = $request->file('document');
        $path = $file->store('pet_documents', 'public');

        PetDocument::create([
            'pet_id' => $request->pet_id,
            'uploaded_by' => auth()->id(),
            'name' => $request->name,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return back()->with('message', 'Documento subido correctamente.');
    }

    public function download(PetDocument $document)
    {
        // Add authorization check if needed
        return response()->download(storage_path('app/public/' . $document->file_path), $document->name . '.' . pathinfo($document->file_path, PATHINFO_EXTENSION));
    }

    public function destroy(PetDocument $document)
    {
        // Add authorization check if needed
        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return back()->with('message', 'Documento eliminado.');
    }
}
