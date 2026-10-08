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

        $showArchived = $request->boolean('archived', false);
        $archivedCount = Distributor::onlyTrashed()->count();

        $query = $showArchived 
            ? Distributor::onlyTrashed()->withCount('products') 
            : Distributor::withCount('products');

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
            'archivedCount' => $archivedCount,
            'showArchived' => $showArchived,
            'filters' => [
                'search' => $search,
                'archived' => $showArchived,
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

        $validated['name'] = mb_strtoupper(trim($validated['name']));

        // Duplicate name check (case-insensitive)
        $exists = Distributor::whereRaw('LOWER(TRIM(name)) = ?', [strtolower($validated['name'])])->exists();
        if ($exists) {
            return redirect()->back()->withErrors([
                'name' => "Distributor '{$validated['name']}' already exists in the system."
            ])->with('error', "Distributor '{$validated['name']}' already exists!");
        }

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

        $validated['name'] = mb_strtoupper(trim($validated['name']));

        $oldValues = $distributor->toArray();
        $distributor->update($validated);

        // Dynamically sync updated distributor name across all inventory records
        if (isset($oldValues['name']) && $oldValues['name'] !== $distributor->name) {
            \App\Models\Inventory::where('distributor_name', $oldValues['name'])
                ->orWhereIn('product_id', $distributor->products()->pluck('id'))
                ->update(['distributor_name' => $distributor->name]);
        }

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
        if (request()->user() && request()->user()->isChecker()) {
            abort(403, "Checkers are not authorized to archive distributors.");
        }
        $name = $distributor->name;
        $oldValues = $distributor->toArray();

        $distributor->delete(); // Soft delete

        ActivityLog::log('deleted', 'Distributor', null,
            "Archived distributor: {$name}",
            $oldValues,
            null
        );

        \App\Models\Notification::notifyAll(
            'distributor_deleted',
            'Distributor Moved to Archive',
            "Distributor '{$name}' was archived.",
            '/distributors?archived=1'
        );

        return redirect()->back()->with('success', "Distributor '{$name}' moved to archive.");
    }

    public function restore($id)
    {
        if (request()->user() && request()->user()->isChecker()) {
            abort(403, "Checkers are not authorized to restore distributors.");
        }
        $distributor = Distributor::onlyTrashed()->findOrFail($id);
        $distributor->restore();

        ActivityLog::log('updated', 'Distributor', $distributor->id,
            "Restored archived distributor: {$distributor->name}"
        );

        \App\Models\Notification::notifyAll(
            'distributor_restored',
            'Distributor Restored',
            "Distributor '{$distributor->name}' was restored from archive.",
            '/distributors'
        );

        return redirect()->back()->with('success', "Distributor '{$distributor->name}' restored successfully!");
    }
}
