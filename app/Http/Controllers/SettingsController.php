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
        $users = User::withTrashed()->orderBy('name')->get(['id', 'name', 'username', 'avatar', 'email', 'role', 'created_at', 'deleted_at']);

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

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:100|unique:users,username,' . $user->id,
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'avatar' => 'nullable|string',
            'password' => 'nullable|min:8',
        ]);

        $oldName = $user->name;
        $user->name = $validated['name'];
        if (isset($validated['username'])) {
            $user->username = $validated['username'];
        }
        $user->email = $validated['email'];
        if (array_key_exists('avatar', $validated)) {
            $user->avatar = $validated['avatar'];
        }
        if (!empty($validated['password'])) {
            $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }
        $user->save();

        ActivityLog::log(
            'updated',
            'User',
            $user->id,
            "User {$oldName} updated their profile info/avatar"
        );

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:100|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'avatar' => 'nullable|string',
            'password' => 'required|min:8',
            'role' => 'required|in:admin,owner,checker',
        ]);

        $username = $validated['username'] ?? explode('@', $validated['email'])[0];

        $user = User::create([
            'name' => $validated['name'],
            'username' => $username,
            'email' => $validated['email'],
            'avatar' => $validated['avatar'] ?? null,
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        ActivityLog::log(
            'created',
            'User',
            $user->id,
            "Created user '{$user->name}' with role '{$user->role}'"
        );

        return redirect()->back()->with('success', "User '{$user->name}' created successfully!");
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:100|unique:users,username,' . $user->id,
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'avatar' => 'nullable|string',
            'role' => 'required|in:admin,owner,checker',
            'password' => 'nullable|min:8',
        ]);

        $oldName = $user->name;
        $user->name = $validated['name'];
        if (isset($validated['username'])) {
            $user->username = $validated['username'];
        }
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        if (array_key_exists('avatar', $validated)) {
            $user->avatar = $validated['avatar'];
        }
        if (!empty($validated['password'])) {
            $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }
        $user->save();

        ActivityLog::log(
            'updated',
            'User',
            $user->id,
            "Updated user #{$user->id} ({$oldName} → {$user->name}, role: {$user->role})"
        );

        return redirect()->back()->with('success', "User '{$user->name}' updated successfully!");
    }

    public function destroyUser(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot archive your own active account!');
        }

        $name = $user->name;
        $user->delete(); // Soft delete

        ActivityLog::log('deleted', 'User', null, "Archived user: {$name}");

        return redirect()->back()->with('success', "User '{$name}' has been archived.");
    }

    public function restoreUser($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        ActivityLog::log('updated', 'User', $user->id, "Restored archived user: {$user->name}");

        return redirect()->back()->with('success', "User '{$user->name}' restored successfully!");
    }
}
