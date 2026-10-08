<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlavorType extends Model
{
    use HasFactory;
    protected $primaryKey = 'flavor_type_id';


    protected $fillable = ['name', 'slug'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getIdAttribute()
    {
        return $this->attributes['flavor_type_id'] ?? null;
    }
}
