<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'product_id';

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'image',
    ];

    protected static function booted()
    {
        static::saving(function ($model) {
            if (!empty($model->name)) {
                $model->name = mb_strtoupper(trim($model->name));
            }
        });
    }

    protected $appends = [
        'id',
        'variant_id',
        'category',
        'variant_name',
        'variant_type',
        'flavor_name',
        'flavor_type',
        'sku',
        'purchase_price',
        'default_discount',
        'default_dealing_price',
        'size_value',
        'packaging',
        'distributor_id',
        'unit',
    ];

    public function getIdAttribute()
    {
        return $this->attributes['product_id'] ?? null;
    }

    public function getVariantIdAttribute(): ?int
    {
        return $this->variants->first()?->variant_id;
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->withTrashed()->where($field ?? $this->getRouteKeyName(), $value)->first()
            ?? $this->withTrashed()->whereHas('variants', function ($q) use ($value) {
                $q->where('variant_id', $value);
            })->first();
    }

    public function categoryRelation()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id', 'product_id');
    }

    public function unit()
    {
        return $this->hasOneThrough(Unit::class, ProductVariant::class, 'product_id', 'unit_id', 'product_id', 'unit_id');
    }

    public function getUnitAttribute()
    {
        return $this->variants->first()?->unit;
    }

    public function distributors()
    {
        return $this->belongsToMany(Distributor::class, 'product_distributors', 'product_id', 'distributor_id', 'product_id', 'distributor_id')
            ->withPivot('variant_id', 'purchase_price', 'default_discount', 'default_dealing_price', 'is_primary')
            ->withTimestamps();
    }

    public function getDistributorAttribute()
    {
        return $this->distributors->where('pivot.is_primary', true)->first()
            ?? $this->distributors->first();
    }

    public function getDistributorIdAttribute(): ?int
    {
        return $this->distributors->where('pivot.is_primary', true)->first()?->distributor_id
            ?? $this->distributors->first()?->distributor_id;
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'product_id', 'product_id');
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'product_id', 'product_id');
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class, 'product_id', 'product_id');
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'product_id', 'product_id');
    }

    public function getCategoryAttribute(): string
    {
        return $this->categoryRelation?->name ?? 'General';
    }

    public function getVariantNameAttribute(): string
    {
        return $this->variants->first()?->flavor?->name ?? '';
    }

    public function getVariantTypeAttribute(): string
    {
        return $this->variants->first()?->flavor?->name ?? '';
    }

    public function getFlavorNameAttribute(): string
    {
        return $this->variants->first()?->flavor?->name ?? '';
    }

    public function getFlavorTypeAttribute(): string
    {
        return $this->variants->first()?->flavor?->name ?? '';
    }

    public function getSkuAttribute(): string
    {
        return $this->variants->first()?->sku ?? 'N/A';
    }

    public function getSizeValueAttribute(): string
    {
        return (string) ($this->variants->first()?->size_value ?? '');
    }

    public function getPackagingAttribute(): string
    {
        return $this->variants->first()?->packaging ?? '';
    }

    public function getPurchasePriceAttribute(): float
    {
        $vCost = (float) ($this->variants->first()?->purchase_price ?? 0);
        if ($vCost > 0) {
            return $vCost;
        }
        $primaryDist = $this->distributors->where('pivot.is_primary', true)->first() ?? $this->distributors->first();
        if ($primaryDist && (float) ($primaryDist->pivot?->purchase_price ?? 0) > 0) {
            return (float) $primaryDist->pivot->purchase_price;
        }
        return $vCost;
    }

    public function getDefaultDiscountAttribute(): float
    {
        $primaryDist = $this->distributors->where('pivot.is_primary', true)->first() ?? $this->distributors->first();
        if ($primaryDist && isset($primaryDist->pivot?->default_discount)) {
            return (float) $primaryDist->pivot->default_discount;
        }
        return (float) ($this->variants->first()?->default_discount ?? 0);
    }

    public function getDefaultDealingPriceAttribute(): float
    {
        $vDeal = (float) ($this->variants->first()?->default_dealing_price ?? 0);
        if ($vDeal > 0) {
            return $vDeal;
        }
        $primaryDist = $this->distributors->where('pivot.is_primary', true)->first() ?? $this->distributors->first();
        if ($primaryDist && (float) ($primaryDist->pivot?->default_dealing_price ?? 0) > 0) {
            return (float) $primaryDist->pivot->default_dealing_price;
        }
        return (float) ($this->purchase_price + $this->default_discount);
    }

    public static function generateSku(?string $brand, ?string $variant, ?string $size, ?string $unitSymbol, ?string $packaging, ?int $ignoreVariantId = null): string
    {
        $brandCode = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $brand ?: 'WNZ'), 0, 4)) ?: 'WNZ';
        $variantCode = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $variant ?: 'REG'), 0, 4)) ?: 'REG';
        
        $sizeClean = preg_replace('/[^A-Za-z0-9]/', '', (string)$size);
        $unitClean = preg_replace('/[^A-Za-z0-9]/', '', (string)$unitSymbol);
        $sizeCode = strtoupper($sizeClean . $unitClean) ?: 'STD';
        
        $packCode = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $packaging ?: 'EA'), 0, 4)) ?: 'EA';

        $baseSku = "WNZ-{$brandCode}-{$variantCode}-{$sizeCode}-{$packCode}";
        $sku = $baseSku;
        $counter = 1;

        $checkQuery = function($skuToCheck) use ($ignoreVariantId) {
            $q = \App\Models\ProductVariant::where('sku', $skuToCheck);
            if ($ignoreVariantId) {
                $q->where('variant_id', '!=', $ignoreVariantId);
            }
            return $q->exists();
        };

        while ($checkQuery($sku)) {
            $sku = "{$baseSku}-{$counter}";
            $counter++;
        }

        return $sku;
    }
}
