<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;
    protected $primaryKey = 'category_id';


    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected static function booted()
    {
        static::saving(function ($model) {
            if (!empty($model->name)) {
                $model->name = mb_strtoupper(trim($model->name));
            }
        });
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getIdAttribute()
    {
        return $this->attributes['category_id'] ?? null;
    }
}
