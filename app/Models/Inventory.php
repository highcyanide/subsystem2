<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'category',
        'distributor_name',
        'product_name',
        'quantity',
        'purchase_price',
        'selling_price',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
