<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->with(['typeRelation', 'actor'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->update(['is_read' => true]);

        if ($request->expectsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        return redirect()->back();
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()->where('is_read', false)->update(['is_read' => true]);

        if ($request->expectsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        return redirect()->back();
    }
}
