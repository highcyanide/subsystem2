<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$prods = App\Models\Product::withTrashed()->get(['id', 'distributor_id', 'name', 'deleted_at']);
foreach ($prods as $p) {
    echo "PID: {$p->id} | DistID: {$p->distributor_id} | Name: {$p->name}\n";
}
