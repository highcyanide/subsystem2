<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Get a setting value by key with an optional default.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        try {
            $setting = self::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        } catch (\Throwable $e) {
            return $default;
        }
    }

    /**
     * Set a setting value (create or update).
     */
    public static function setValue(string $key, mixed $value): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => (string) $value]
        );
        try {
            Cache::forget("setting.{$key}");
        } catch (\Throwable $e) {}
    }

    /**
     * Get all settings as key-value pairs.
     */
    public static function allValues(): array
    {
        return self::pluck('value', 'key')->toArray();
    }
}
