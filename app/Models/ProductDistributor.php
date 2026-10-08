<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductDistributor extends Model
{
    use HasFactory;

    protected $table = 'product_distributors';

    protected $fillable = [
        'product_id',
        'variant_id',
        'distributor_id',
        'purchase_price',
        'default_discount',
        'default_dealing_price',
        'is_primary',
    ];

    protected $casts = [
        'purchase_price' => 'float',
        'default_discount' => 'float',
        'default_dealing_price' => 'float',
        'is_primary' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id', 'variant_id');
    }

    public function distributor()
    {
        return $this->belongsTo(Distributor::class, 'distributor_id', 'distributor_id');
    }
}
