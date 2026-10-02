<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$req6 = Illuminate\Http\Request::create('/products?distributor_id=6', 'GET');
$controller = new App\Http\Controllers\ProductController();
$response = $controller->index($req6);

// Inspect the props passed to Inertia
$ref = new ReflectionClass($response);
$prop = $ref->getProperty('props');
$prop->setAccessible(true);
$props = $prop->getValue($response);

echo "distributor_id=6 -> selectedDistributor ID: " . ($props['selectedDistributor']->id ?? 'NONE') . " Name: " . ($props['selectedDistributor']->name ?? 'NONE') . "\n";

$req17 = Illuminate\Http\Request::create('/products?distributor_id=17', 'GET');
$response17 = $controller->index($req17);
$props17 = $prop->getValue($response17);
echo "distributor_id=17 -> selectedDistributor ID: " . ($props17['selectedDistributor']->id ?? 'NONE') . " Name: " . ($props17['selectedDistributor']->name ?? 'NONE') . "\n";
