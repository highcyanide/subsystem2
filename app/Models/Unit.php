<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;
    protected $primaryKey = 'unit_id';


    protected $fillable = [
        'name',
        'symbol',
        'category',
        'is_active',
    ];

    protected static function booted()
    {
        static::saving(function ($model) {
            if (!empty($model->symbol)) {
                $model->symbol = mb_strtoupper(trim($model->symbol));
            }
            if (!empty($model->name)) {
                $model->name = mb_strtoupper(trim($model->name));
            }
        });
    }

    protected $appends = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getIdAttribute()
    {
        return $this->attributes['unit_id'] ?? null;
    }
}
