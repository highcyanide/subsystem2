<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'role_label' => $user->role_label,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => $user
                ? [
                    'unread_count' => Notification::where('user_id', $user->id)->where('is_read', false)->count(),
                    'items' => Notification::where('user_id', $user->id)
                        ->orderBy('created_at', 'desc')
                        ->limit(10)
                        ->get(),
                ]
                : ['unread_count' => 0, 'items' => []],
            'settings' => fn () => [
                'company_name' => Setting::getValue('company_name', 'WINZELLE'),
                'low_stock_threshold' => (int) Setting::getValue('low_stock_threshold', 15),
                'default_vat_percentage' => (float) Setting::getValue('default_vat_percentage', 12),
                'notification_style' => Setting::getValue('notification_style', 'number'),
            ],
        ];
    }
}
