<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\SiteSetting;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PublicPetController extends Controller
{
    public function carnet($uuid)
    {
        $pet = Pet::where('uuid', $uuid)
            ->with(['preventiveRecords.veterinarian', 'branch', 'owners'])
            ->firstOrFail();

        // Get Clinic Logo/Settings for the header
        $settings = SiteSetting::whereIn('key', ['hero_title', 'contact_phone', 'contact_email', 'site_logo'])
            ->get()
            ->pluck('value', 'key');

        $branchName = $pet->branch ? $pet->branch->name : null;
        $clinicName = $settings['hero_title'] ?? 'Canbull Veterinary';

        return Inertia::render('Public/PetCarnet', [
            'pet' => $pet,
            'clinic' => [
                'name' => $clinicName,
                'branch' => $branchName,
                'phone' => $settings['contact_phone'] ?? '',
                'email' => $settings['contact_email'] ?? '',
                'logo' => $settings['site_logo'] ?? null,
            ]
        ]);
    }
}
