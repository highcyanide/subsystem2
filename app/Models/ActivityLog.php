<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action_id',
        'model_type_id',
        'model_id',
        'description',
        'old_values',
        'new_values',
        'ip_address',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    protected $appends = [
        'action',
        'model_type',
        'action_name',
        'model_name',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function actionRelation()
    {
        return $this->belongsTo(ActivityAction::class, 'action_id', 'action_id');
    }

    public function modelTypeRelation()
    {
        return $this->belongsTo(ActivityModelType::class, 'model_type_id', 'model_type_id');
    }

    public function getActionAttribute(): string
    {
        return $this->actionRelation?->name ?? '';
    }

    public function getModelTypeAttribute(): string
    {
        return $this->modelTypeRelation?->name ?? '';
    }

    public function getActionNameAttribute(): string
    {
        return $this->actionRelation?->name ?? '';
    }

    public function getModelNameAttribute(): string
    {
        return $this->modelTypeRelation?->name ?? '';
    }

    /**
     * Log an activity using normalized IDs only.
     */
    public static function log(
        string $action,
        string $modelType,
        ?int $modelId,
        string $description,
        ?array $oldValues = null,
        ?array $newValues = null,
    ): self {
        $actModel = ActivityAction::firstOrCreate(
            ['name' => strtolower($action)]
        );

        $modModel = ActivityModelType::firstOrCreate(
            ['name' => $modelType]
        );

        return self::create([
            'user_id' => auth()->id(),
            'action_id' => $actModel->action_id,
            'model_type_id' => $modModel->model_type_id,
            'model_id' => $modelId,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
        ]);
    }
}
