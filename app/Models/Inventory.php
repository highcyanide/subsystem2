<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'variant_id',
        'quantity',
        'reorder_level',
    ];

    protected $appends = [
        'sku',
        'product_name',
        'category',
        'distributor_name',
        'purchase_price',
        'selling_price',
        'size_value',
        'packaging',
        'unit',
        'image',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id', 'variant_id');
    }

    public function getSkuAttribute(): string
    {
        return $this->variant?->sku ?? $this->product?->sku ?? 'N/A';
    }

    public function getProductNameAttribute(): string
    {
        return $this->variant?->variant_name ?? $this->product?->name ?? 'Unknown Product';
    }

    public function getCategoryAttribute(): string
    {
        return $this->product?->categoryRelation?->name ?? 'General';
    }

    public function getDistributorNameAttribute(): string
    {
        return $this->product?->distributors?->first()?->name 
            ?? $this->variant?->distributors?->first()?->name 
            ?? 'Direct';
    }

    public function getPurchasePriceAttribute(): float
    {
        return (float) ($this->variant?->purchase_price 
            ?? $this->product?->distributors?->first()?->pivot?->purchase_price 
            ?? 0);
    }

    public function getSellingPriceAttribute(): float
    {
        return (float) ($this->variant?->default_dealing_price 
            ?? $this->product?->distributors?->first()?->pivot?->default_dealing_price 
            ?? 0);
    }

    public function getSizeValueAttribute(): string
    {
        return (string) ($this->variant?->size_value ?? '');
    }

    public function getPackagingAttribute(): string
    {
        return $this->variant?->packaging ?? '';
    }

    public function getUnitAttribute()
    {
        return $this->variant?->unit ?? $this->product?->unit;
    }

    public function getImageAttribute(): ?string
    {
        return $this->variant?->image ?? $this->product?->image;
    }
}