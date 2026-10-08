<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'date',
        'distributor_id',
        'product_id',
        'variant_id',
        'quantity',
        'purchase_price',
        'total_purchase',
        'dealing_price',
        'discount',
        'gross_amount',
        'vat_percentage',
        'vat_adjusted_amount',
        'net_profit',
    ];

    protected $appends = [
        'product_name',
        'distributor_name',
    ];

    public function distributor()
    {
        return $this->belongsTo(Distributor::class, 'distributor_id', 'distributor_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id', 'variant_id');
    }

    public function getProductNameAttribute(): string
    {
        if ($this->variant) {
            return $this->variant->variant_name 
                ?: ($this->variant->product?->name ?? 'N/A');
        }
        return $this->product?->name ?? 'N/A';
    }

    public function getDistributorNameAttribute(): string
    {
        return $this->distributor?->name ?? 'N/A';
    }
}
