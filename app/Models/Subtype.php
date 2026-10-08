<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subtype extends Model
{
    use HasFactory;

    protected $primaryKey = 'subtype_id';

    protected $fillable = [
        'name',
    ];

    protected $appends = ['id'];

    public function getIdAttribute()
    {
        return $this->attributes['subtype_id'] ?? null;
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'subtype_id', 'subtype_id');
    }
}