<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityAction extends Model
{
    use HasFactory;
    protected $primaryKey = 'action_id';


    protected $fillable = ['name', 'slug'];

    public function getIdAttribute()
    {
        return $this->attributes['action_id'] ?? null;
    }
}
