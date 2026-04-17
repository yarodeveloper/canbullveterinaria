<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteSettingController extends Controller
{
    public function index()
    {
        $landingGroups = ['hero', 'contact', 'services', 'promos', 'about', 'vaccines', 'social', 'business_profile'];
        $settings = SiteSetting::whereIn('group', $landingGroups)->orderBy('group')->get();
        return Inertia::render('Settings/Web', [
            'settings' => $settings
        ]);
    }

    public function systemIndex()
    {
        $systemGroups = ['system', 'finances', 'grooming'];
        $settings = SiteSetting::whereIn('group', $systemGroups)->orderBy('group')->get();
        return Inertia::render('Settings/System', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->input('settings') as $index => $item) {
            $setting = SiteSetting::findOrFail($item['id']);
            
            if ($request->hasFile("settings.{$index}.file")) {
                $file = $request->file("settings.{$index}.file");
                $path = $file->store('settings', 'public');
                $setting->update(['value' => '/storage/' . $path]);
            } else {
                $setting->update(['value' => $item['value'] ?? $setting->value]);
            }
        }

        return redirect()->back()->with('success', 'Configuración actualizada correctamente.');
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
