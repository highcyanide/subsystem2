<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Flavor extends Model
{
    use HasFactory;

    protected $primaryKey = 'flavor_id';

    protected $fillable = [
        'name',
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

    public function getIdAttribute()
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