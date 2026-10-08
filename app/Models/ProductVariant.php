<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'variant_id';

    protected $fillable = [
        'product_id',
        'variant_name',
        'variant_type_id',
        'flavor_id',
        'subtype_id',
        'size_id',
        'size_value',
        'unit_id',
        'packaging_id',
        'sku',
        'image',
        'purchase_price',
        'default_discount',
        'default_dealing_price',
        'description',
    ];

    protected static function booted()
    {
        static::saving(function ($model) {
            if (!empty($model->variant_name)) {
                $model->variant_name = mb_strtoupper(trim($model->variant_name));
            }
            if (!empty($model->sku)) {
                $model->sku = mb_strtoupper(trim($model->sku));
            }
        });
    }

    protected $appends = ['id', 'size_label', 'variant_type_name', 'flavor_name', 'subtype_name', 'packaging'];

    public function getIdAttribute(): ?int
    {
        return $this->attributes['variant_id'] ?? null;
    }

    public function getSizeLabelAttribute(): string
    {
        $val = $this->size_value ?? '';
        $unit = $this->unit?->symbol ?? $this->unit?->name ?? '';
        return trim("$val $unit");
    }

    public function getVariantTypeNameAttribute(): string
    {
        return $this->flavor?->name ?? '';
    }

    public function getFlavorNameAttribute(): string
    {
        return $this->flavor?->name ?? '';
    }

    public function getSubtypeNameAttribute(): string
    {
        return $this->subtype?->name ?? '';
    }

    public function getPackagingAttribute(): string
    {
        return $this->packagingRelation?->name ?? '';
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function variantType()
    {
        return $this->belongsTo(Flavor::class, 'flavor_id', 'flavor_id');
    }

    public function flavor()
    {
        return $this->belongsTo(Flavor::class, 'flavor_id', 'flavor_id');
    }

    public function subtype()
    {
        return $this->belongsTo(Subtype::class, 'subtype_id', 'subtype_id');
    }

    public function size()
    {
        return $this->belongsTo(Size::class, 'size_id', 'size_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'unit_id');
    }

    public function packagingRelation()
    {
        return $this->belongsTo(Packaging::class, 'packaging_id', 'packaging_id');
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'variant_id', 'variant_id');
    }

    public function distributors()
    {
        return $this->belongsToMany(Distributor::class, 'product_distributors', 'variant_id', 'distributor_id', 'variant_id', 'distributor_id')
            ->withPivot('purchase_price', 'default_discount', 'default_dealing_price', 'is_primary')
            ->withTimestamps();
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class, 'variant_id', 'variant_id');
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'variant_id', 'variant_id');
    }
}
