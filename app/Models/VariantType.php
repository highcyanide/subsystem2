<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariantType extends Model
{
    use HasFactory;

    protected $table = 'flavors';
    protected $primaryKey = 'flavor_id';

    protected $fillable = [
        'name',
    ];

    protected $appends = ['id', 'variant_type_id'];

    public function getIdAttribute()
    {
        return $this->attributes['flavor_id'] ?? null;
    }

    public function getVariantTypeIdAttribute()
    {
        return $this->attributes['flavor_id'] ?? null;
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'flavor_id', 'flavor_id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'flavor_id', 'flavor_id');
    }
}
