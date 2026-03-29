<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteSettingController extends Controller
{
    public function index()
    {
        $settings = SiteSetting::orderBy('group')->get();
        return Inertia::render('Settings/Web', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            // Note: Validation of nested items with files can be complex, 
            // we will handle the logic inside the loop for simplicity and flexibility.
        ]);

        foreach ($request->input('settings') as $index => $item) {
            $setting = SiteSetting::findOrFail($item['id']);
            
            // Check if there is a file for this setting
            if ($request->hasFile("settings.{$index}.file")) {
                $file = $request->file("settings.{$index}.file");
                $path = $file->store('settings', 'public');
                $setting->update(['value' => '/storage/' . $path]);
            } else {
                // Regular field update
                $setting->update(['value' => $item['value'] ?? $setting->value]);
            }
        }

        return redirect()->back()->with('success', 'Configuración web actualizada correctamente.');
    }

    public function updatePosPrinter(Request $request)
    {
        $request->validate([
            'pos_printer_name' => 'required|string|max:255',
            'pos_ticket_preview' => 'nullable|boolean',
        ]);

        SiteSetting::updateOrCreate(
            ['key' => 'pos_printer_name'],
            [
                'value' => $request->pos_printer_name,
                'type' => 'text',
                'group' => 'finances',
                'label' => 'Nombre de la Impresora de PDV (80mm)'
            ]
        );

        SiteSetting::updateOrCreate(
            ['key' => 'pos_ticket_preview'],
            [
                'value' => $request->pos_ticket_preview ? '1' : '0',
                'type' => 'boolean',
                'group' => 'finances',
                'label' => 'Mostrar vista previa del ticket'
            ]
        );

        return redirect()->back()->with('success', 'Configuración de impresora PDV actualizada.');
    }
}
