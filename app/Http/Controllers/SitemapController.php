<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pet;

class SitemapController extends Controller
{
    public function index()
    {
        $urls = [
            ['loc' => url('/'), 'lastmod' => now()->toAtomString(), 'changefreq' => 'daily', 'priority' => '1.0'],
            ['loc' => url('/login'), 'lastmod' => now()->toAtomString(), 'changefreq' => 'monthly', 'priority' => '0.5'],
            ['loc' => url('/register'), 'lastmod' => now()->toAtomString(), 'changefreq' => 'monthly', 'priority' => '0.5'],
        ];

        // Add public pet carnets (only those with status not deceased and visible?)
        $pets = Pet::where('status', '!=', 'deceased')->limit(500)->get();
        foreach ($pets as $pet) {
            $urls[] = [
                'loc' => route('public.carnet', $pet->uuid),
                'lastmod' => $pet->updated_at->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.8'
            ];
        }

        $xml = view('sitemap', compact('urls'))->render();

        return response($xml, 200, [
            'Content-Type' => 'application/xml'
        ]);
    }
}
