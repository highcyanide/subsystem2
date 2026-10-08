<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Size extends Model
{
    use HasFactory;

    protected $primaryKey = 'size_id';

    protected $fillable = [
        'name',
        'code',
    ];

    protected $appends = ['id'];

    public function getIdAttribute()
    {
        return $this->attributes['size_id'] ?? null;
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'size_id', 'size_id');
    }
}