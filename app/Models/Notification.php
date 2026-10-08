<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type_id',
        'message',
        'details',
        'link',
        'is_read',
        'actor_id',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    protected $appends = [
        'title',
        'type',
        'actor_name',
        'actor_role',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function typeRelation()
    {
        return $this->belongsTo(NotificationType::class, 'type_id', 'type_id');
    }

    public function getTitleAttribute(): string
    {
        return $this->typeRelation?->title ?? $this->typeRelation?->default_title ?? 'Notification';
    }

    public function getTypeAttribute(): string
    {
        return $this->typeRelation?->code ?? 'general';
    }

    public function getActorNameAttribute(): string
    {
        return $this->actor?->name ?? 'System';
    }

    public function getActorRoleAttribute(): string
    {
        return $this->actor?->role ?? 'system';
    }

    /**
     * Create a notification for all users using normalized actor_id & type_id only.
     */
    public static function notifyAll(string $type, string $title, string $message, ?string $link = null, ?string $details = null): void
    {
        $actorId = auth()->id();

        $typeModel = NotificationType::firstOrCreate(
            ['code' => $type],
            ['name' => ucwords(str_replace('_', ' ', $type)), 'title' => $title, 'default_title' => $title]
        );

        $users = User::all();
        foreach ($users as $user) {
            self::create([
                'user_id' => $user->id,
                'type_id' => $typeModel->id,
                'message' => $message,
                'details' => $details,
                'link' => $link,
                'actor_id' => $actorId,
            ]);
        }
    }

    /**
     * Create a notification for a specific user using normalized actor_id & type_id only.
     */
    public static function notifyUser(int $userId, string $type, string $title, string $message, ?string $link = null, ?string $details = null): self
    {
        $actorId = auth()->id();

        $typeModel = NotificationType::firstOrCreate(
            ['code' => $type],
            ['name' => ucwords(str_replace('_', ' ', $type)), 'title' => $title, 'default_title' => $title]
        );

        return self::create([
            'user_id' => $userId,
            'type_id' => $typeModel->id,
            'message' => $message,
            'details' => $details,
            'link' => $link,
            'actor_id' => $actorId,
        ]);
    }
}
