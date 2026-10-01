<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::allValues();
        $users = User::orderBy('name')->get(['id', 'name', 'email', 'role', 'created_at']);

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'users' => $users,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'low_stock_threshold' => 'required|integer|min:1|max:1000',
            'default_vat_percentage' => 'required|numeric|min:0|max:100',
            'company_name' => 'required|string|max:255',
            'notification_style' => 'required|in:number,dot',
        ]);

        foreach ($validated as $key => $value) {
            $oldValue = Setting::getValue($key);
            Setting::setValue($key, $value);

            if ($oldValue !== (string) $value) {
                ActivityLog::log(
                    'updated',
                    'Setting',
                    null,
                    "Changed setting '{$key}' from '{$oldValue}' to '{$value}'"
                );
            }
        }

        return redirect()->back()->with('success', 'Settings updated successfully!');
    }
}
