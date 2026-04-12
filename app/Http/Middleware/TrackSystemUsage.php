<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TrackSystemUsage
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only track successful GET requests and ignore AJAX/Inertia partial reloads if desired
        // But for usage stats, tracking everything is okay
        if ($request->isMethod('get') && !$request->routeIs('*.print') && !$request->routeIs('sitemap.xml')) {
            try {
                DB::table('internal_analytics')->insert([
                    'user_id' => Auth::id(),
                    'page_url' => $request->path(),
                    'page_name' => $request->route() ? $request->route()->getName() : null,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'viewed_at' => now(),
                ]);
            } catch (\Exception $e) {
                // Silently fail to not break the app
            }
        }

        return $response;
    }
}
