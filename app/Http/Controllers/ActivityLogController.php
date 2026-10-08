<?php

namespace App\Http\Controllers;

use App\Models\ActivityAction;
use App\Models\ActivityLog;
use App\Models\ActivityModelType;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with(['user', 'actionRelation', 'modelTypeRelation'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        if ($request->filled('action_id')) {
            $query->where('action_id', $request->query('action_id'));
        } elseif ($request->filled('action')) {
            $query->where(function($q) use ($request) {
                $q->where('action', $request->query('action'))
                  ->orWhereHas('actionRelation', function($aq) use ($request) {
                      $aq->where('slug', $request->query('action'));
                  });
            });
        }

        if ($request->filled('model_type_id')) {
            $query->where('model_type_id', $request->query('model_type_id'));
        } elseif ($request->filled('model_type')) {
            $query->where(function($q) use ($request) {
                $q->where('model_type', $request->query('model_type'))
                  ->orWhereHas('modelTypeRelation', function($mq) use ($request) {
                      $mq->where('code', $request->query('model_type'));
                  });
            });
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('description', 'like', "%{$search}%");
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->query('date'));
        }

        $logs = $query->paginate(50);
        $users = User::orderBy('name')->get(['id', 'name', 'role']);
        $actions = ActivityAction::orderBy('name')->get(['action_id as id', 'action_id', 'name']);
        $models = ActivityModelType::orderBy('name')->get(['model_type_id as id', 'model_type_id', 'name']);

        return Inertia::render('ActivityLog/Index', [
            'logs' => $logs,
            'users' => $users,
            'actions' => $actions,
            'models' => $models,
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
