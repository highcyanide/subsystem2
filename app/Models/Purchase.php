<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'distributor_id',
        'product_id',
        'quantity',
        'purchase_price',
        'total_purchase',
        'dealing_price',
        'discount',
        'gross_amount',
        'vat_percentage',
        'vat_adjusted_amount',
        'net_profit',
    ];

    public function distributor()
    {
        return $this->belongsTo(Distributor::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
