<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('branch') : null,
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name') : [],
            ],
            'settings' => \App\Models\SiteSetting::all()->pluck('value', 'key'),
            'branches' => $request->user() && $request->user()->role === 'admin' ? \App\Models\Branch::where('is_active', true)->get() : [],
            'flash' => [
                'message' => $request->session()->get('message'),
                'error' => $request->session()->get('error'),
                'print_movement_id' => $request->session()->get('print_movement_id'),
                'print_receipt_id' => $request->session()->get('print_receipt_id'),
            ],
        ];
    }
}
