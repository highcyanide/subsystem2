<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Distributor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DistributorController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');

        $query = Distributor::withCount('products');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $distributors = $query->orderBy('name')->get();

        $favorites = $distributors->where('is_favorite', true)->values();
        $others = $distributors->where('is_favorite', false)->values();

        return Inertia::render('Distributors/Index', [
            'distributors' => $distributors,
            'favorites' => $favorites,
            'others' => $others,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'logo' => 'nullable|string',
            'is_favorite' => 'boolean',
        ]);

        $distributor = Distributor::create($validated);

        ActivityLog::log('created', 'Distributor', $distributor->id,
            "Added new distributor: {$distributor->name}",
            null,
            $validated
        );

        \App\Models\Notification::notifyAll(
            'distributor_added',
            'New Distributor Added',
            "Distributor '{$distributor->name}' has been added to the directory.",
            '/distributors',
            "Contact: {$distributor->contact_number} | Email: {$distributor->email}"
        );

        return redirect()->back()->with('success', 'Distributor added successfully!');
    }

    public function update(Request $request, Distributor $distributor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'logo' => 'nullable|string',
            'is_favorite' => 'boolean',
        ]);

        $oldValues = $distributor->toArray();
        $distributor->update($validated);

        ActivityLog::log('updated', 'Distributor', $distributor->id,
            "Updated distributor: {$distributor->name}",
            $oldValues,
            $validated
        );

        \App\Models\Notification::notifyAll(
            'distributor_updated',
            'Distributor Details Updated',
            "Details for distributor '{$distributor->name}' were modified.",
            '/distributors',
            "Updated info: Contact {$distributor->contact_number}"
        );

        return redirect()->back()->with('success', 'Distributor updated successfully!');
    }

    public function toggleFavorite(Distributor $distributor)
    {
        $distributor->update(['is_favorite' => !$distributor->is_favorite]);

        ActivityLog::log('updated', 'Distributor', $distributor->id,
            ($distributor->is_favorite ? 'Favorited' : 'Unfavorited') . " distributor: {$distributor->name}"
        );

        return redirect()->back()->with('success', 'Favorite status updated.');
    }

    public function destroy(Distributor $distributor)
    {
        $name = $distributor->name;
        $oldValues = $distributor->toArray();

        $distributor->delete();

        ActivityLog::log('deleted', 'Distributor', null,
            "Deleted distributor: {$name}",
            $oldValues,
            null
        );

        \App\Models\Notification::notifyAll(
            'distributor_deleted',
            'Distributor Removed',
            "Distributor '{$name}' was removed from the system.",
            '/distributors'
        );

        return redirect()->back()->with('success', 'Distributor deleted successfully.');
    }
}
