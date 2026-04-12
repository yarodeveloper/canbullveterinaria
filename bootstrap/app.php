<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\TrackSystemUsage::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
            if (in_array($e->getStatusCode(), [500, 503, 404, 403])) {
                if (!app()->environment(['local', 'testing']) || in_array($e->getStatusCode(), [403, 404])) {
                    return Inertia::render('Error', [
                        'status' => $e->getStatusCode(),
                    ])->toResponse($request)->setStatusCode($e->getStatusCode());
                }
            } elseif ($e->getStatusCode() === 419) {
                return back()->with(['error' => 'La página expiró, por favor intente nuevamente.']);
            }
        });
    })->create();
