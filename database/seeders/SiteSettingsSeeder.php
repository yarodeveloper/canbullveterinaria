<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SiteSetting;

class SiteSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'primary_color',
                'value' => '#84329B',
                'type' => 'color',
                'group' => 'business_profile',
                'label' => 'Color Principal',
            ],
            [
                'key' => 'secondary_color',
                'value' => '#C4D600',
                'type' => 'color',
                'group' => 'business_profile',
                'label' => 'Color Secundario',
            ],
            [
                'key' => 'accent_color',
                'value' => '#63666A',
                'type' => 'color',
                'group' => 'business_profile',
                'label' => 'Color de Acento',
            ],
            [
                'key' => 'system_theme',
                'value' => 'light',
                'type' => 'text',
                'group' => 'system',
                'label' => 'Tema del Sistema',
            ],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
