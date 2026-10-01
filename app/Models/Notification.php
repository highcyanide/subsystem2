<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'actor_id',
        'actor_name',
        'actor_role',
        'type',
        'title',
        'message',
        'details',
        'link',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Create a notification for all users.
     */
    public static function notifyAll(string $type, string $title, string $message, ?string $link = null, ?string $details = null): void
    {
        $actor = auth()->user();
        $actorId = $actor ? $actor->id : null;
        $actorName = $actor ? $actor->name : 'System';
        $actorRole = $actor ? $actor->role : 'system';

        $users = User::all();
        foreach ($users as $user) {
            self::create([
                'user_id' => $user->id,
                'actor_id' => $actorId,
                'actor_name' => $actorName,
                'actor_role' => $actorRole,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'details' => $details,
                'link' => $link,
            ]);
        }
    }

    /**
     * Create a notification for a specific user.
     */
    public static function notifyUser(int $userId, string $type, string $title, string $message, ?string $link = null, ?string $details = null): self
    {
        $actor = auth()->user();
        return self::create([
            'user_id' => $userId,
            'actor_id' => $actor ? $actor->id : null,
            'actor_name' => $actor ? $actor->name : 'System',
            'actor_role' => $actor ? $actor->role : 'system',
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'details' => $details,
            'link' => $link,
        ]);
    }
}
