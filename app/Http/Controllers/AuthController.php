<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login', [
            'companyName' => \App\Models\Setting::getValue('company_name', config('app.name', 'WINZELLE')),
            'settings' => \App\Models\Setting::allValues(),
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = trim($request->input('username'));
        $password = $request->input('password');
        $remember = $request->boolean('remember');

        // Look up user by username, email, or name
        $user = User::whereRaw('LOWER(username) = ?', [strtolower($loginInput)])
            ->orWhereRaw('LOWER(email) = ?', [strtolower($loginInput)])
            ->orWhereRaw('LOWER(name) = ?', [strtolower($loginInput)])
            ->first();

        if ($user && Hash::check($password, $user->password)) {
            Auth::login($user, $remember);
            $request->session()->regenerate();

            \App\Models\ActivityLog::log('login', 'User', $user->id, "User {$user->name} logged in.");

            return redirect()->intended(route('inventory.index'));
        }

        return back()->withErrors([
            'username' => 'These credentials do not match our records.',
        ]);
    }

    public function showRegister()
    {
        return redirect()->route('login');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:8',
            'role' => 'required|in:admin,owner,checker',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        Auth::login($user);

        return redirect()->route('inventory.index');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
