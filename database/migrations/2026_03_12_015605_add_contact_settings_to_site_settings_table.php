<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            [
                'key' => 'contact_address',
                'value' => 'Calzada Rosario Sabinal #54 Col. La Gloria, Rumbo al club Campestre., Tuxtla Gutiérrez, Mexico, 29038',
                'label' => 'Dirección Física',
                'type' => 'textarea',
                'group' => 'contact',
            ],
            [
                'key' => 'contact_email',
                'value' => 'canbull_c.v@hotmail.com',
                'label' => 'Correo Electrónico Principal',
                'type' => 'text',
                'group' => 'contact',
            ],
            [
                'key' => 'contact_phone',
                'value' => '961 701 9517',
                'label' => 'Teléfono Principal',
                'type' => 'text',
                'group' => 'contact',
            ],
            [
                'key' => 'social_facebook',
                'value' => 'https://www.facebook.com/profile.php?id=100057574212916',
                'label' => 'Enlace a Facebook',
                'type' => 'text',
                'group' => 'social',
            ],
            [
                'key' => 'social_instagram',
                'value' => 'https://www.instagram.com/canbullvet',
                'label' => 'Enlace a Instagram',
                'type' => 'text',
                'group' => 'social',
            ],
            [
                'key' => 'contact_maps_url',
                'value' => 'https://www.google.com/maps?q=Can+Bull+Cl%C3%ADnica+Veterinaria,+Rosario+Sabinal,+Ter%C3%A1n,+29057+Tuxtla+Guti%C3%A9rrez,+Chis.',
                'label' => 'Enlace a Google Maps',
                'type' => 'textarea',
                'group' => 'contact',
            ],
        ];

        $now = now();
        foreach ($settings as $setting) {
            DB::table('site_settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, ['created_at' => $now, 'updated_at' => $now])
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('site_settings')->whereIn('key', [
            'contact_address',
            'contact_email',
            'contact_phone',
            'social_facebook',
            'social_instagram',
            'contact_maps_url',
        ])->delete();
    }
};
