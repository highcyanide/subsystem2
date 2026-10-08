<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationType extends Model
{
    use HasFactory;
    protected $primaryKey = 'type_id';


    protected $fillable = ['name', 'code', 'default_title', 'icon'];

    public function getIdAttribute()
    {
        return $this->attributes['type_id'] ?? null;
    }
}
