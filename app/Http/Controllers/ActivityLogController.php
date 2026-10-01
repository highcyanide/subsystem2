<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user')
            ->orderBy('created_at', 'desc');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }

        if ($request->filled('model_type')) {
            $query->where('model_type', $request->query('model_type'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('description', 'like', "%{$search}%");
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->query('date'));
        }

        $logs = $query->paginate(50);
        $users = \App\Models\User::orderBy('name')->get(['id', 'name', 'role']);

        return Inertia::render('ActivityLog/Index', [
            'logs' => $logs,
            'users' => $users,
            'filters' => [
                'user_id' => $request->query('user_id', ''),
                'action' => $request->query('action', ''),
                'model_type' => $request->query('model_type', ''),
                'search' => $request->query('search', ''),
                'date' => $request->query('date', ''),
            ],
        ]);
    }
}
