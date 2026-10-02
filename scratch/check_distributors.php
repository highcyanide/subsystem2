<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$alaska = App\Models\Distributor::find(6);
echo "ID 6: {$alaska->name} | is_favorite: {$alaska->is_favorite} | products_count: " . $alaska->products()->count() . "\n";

$anand = App\Models\Distributor::find(17);
echo "ID 17: {$anand->name} | is_favorite: {$anand->is_favorite} | products_count: " . $anand->products()->count() . "\n";
