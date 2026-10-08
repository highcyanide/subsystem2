<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Distributor extends Model
{
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'distributor_id';

    protected $fillable = [
        'name',
        'contact_number',
        'email',
        'address',
        'logo',
        'is_favorite',
    ];

    protected $casts = [
        'is_favorite' => 'boolean',
    ];

    protected static function booted()
    {
        static::saving(function ($model) {
            if (!empty($model->name)) {
                $model->name = mb_strtoupper(trim($model->name));
            }
        });
    }

    protected $appends = ['id'];

    public function getIdAttribute(): ?int
    {
        return $this->attributes['distributor_id'] ?? null;
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_distributors', 'distributor_id', 'product_id', 'distributor_id', 'product_id')
            ->withPivot('purchase_price', 'default_discount', 'default_dealing_price', 'is_primary')
            ->withTimestamps();
    }

    public function variants()
    {
        return $this->belongsToMany(ProductVariant::class, 'product_distributors', 'distributor_id', 'variant_id', 'distributor_id', 'variant_id')
            ->withPivot('purchase_price', 'default_discount', 'default_dealing_price', 'is_primary')
            ->withTimestamps();
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'distributor_id', 'distributor_id');
    }
}
