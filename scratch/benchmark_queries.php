<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$start = microtime(true);
$clients = \App\Models\User::where('role', 'client')
    ->where('email', '!=', 'publico@general.com')
    ->where('name', 'NOT LIKE', '%Sin Asignar%')
    ->limit(100)
    ->get(['id', 'name']);
echo "Clients query: " . (microtime(true) - $start) . "s\n";

$start = microtime(true);
$products = \App\Models\Product::where('is_active', true)
    ->orderByRaw("CASE WHEN is_controlled = 1 THEN 0 ELSE 1 END")
    ->orderBy('name')
    ->get(['id', 'name', 'unit', 'is_controlled', 'price', 'is_service']);
echo "Products query: " . (microtime(true) - $start) . "s\n";
