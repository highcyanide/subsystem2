<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Packaging extends Model
{
    use HasFactory;

    protected $table = 'packagings';
    protected $primaryKey = 'packaging_id';

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

    public function getIdAttribute(): ?int
    {
        return $this->attributes['packaging_id'] ?? null;
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'packaging_id', 'packaging_id');
    }
}
