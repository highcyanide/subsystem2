<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$req = Illuminate\Http\Request::create('/distributors', 'GET');
$controller = new App\Http\Controllers\DistributorController();
$response = $controller->index($req);

$ref = new ReflectionClass($response);
$prop = $ref->getProperty('props');
$prop->setAccessible(true);
$props = $prop->getValue($response);

echo "Favorites:\n";
foreach ($props['favorites'] as $f) {
    echo " - ID: {$f->id} | Name: {$f->name}\n";
}

echo "\nOthers:\n";
foreach ($props['others'] as $o) {
    echo " - ID: {$o->id} | Name: {$o->name}\n";
}
