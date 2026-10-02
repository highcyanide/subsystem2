<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'distributor_id',
        'name',
        'sku',
        'category',
        'purchase_price',
        'default_discount',
        'default_dealing_price',
    ];

    public function distributor()
    {
        return $this->belongsTo(Distributor::class);
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
