<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityModelType extends Model
{
    use HasFactory;
    protected $primaryKey = 'model_type_id';


    protected $fillable = ['name', 'code'];

    public function getIdAttribute()
    {
        return $this->attributes['model_type_id'] ?? null;
    }
}
