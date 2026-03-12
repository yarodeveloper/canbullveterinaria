<?php
require 'vendor/autoload.php';
require 'bootstrap/app.php';
$app = app();
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
foreach(\App\Models\ProductCategory::all() as $c) {
    echo $c->name . " | is_service: " . ($c->is_service ? 'yes' : 'no') . "\n";
}
