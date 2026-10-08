<?php
require __DIR__ . '/../vendor/autoload.php';
 = require_once __DIR__ . '/../bootstrap/app.php';
->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

 = App\Models\Product::with('distributor', 'distributors')->get();
echo Total products:  . ->count() . PHP_EOL;

 = ->groupBy(fn() => strtolower(trim(->name)))->filter(fn() => ->count() > 1);
echo Duplicate product names:  . ->count() . PHP_EOL;
foreach ( as  => ) {
    echo Product: '{}' across IDs:  . ->pluck('id')->implode(', ') .  (Distributors:  . ->pluck('distributor_id')->implode(', ') . ) . PHP_EOL;
}
