<?php

namespace App\Http\Controllers;

use App\Models\Distributor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DistributorController extends Controller
{
    public function index()
    {
        $distributors = Distributor::withCount('products')
            ->orderBy('name')
            ->get();

        $favorites = $distributors->where('is_favorite', true)->values();
        $others = $distributors->where('is_favorite', false)->values();

        return Inertia::render('Distributors/Index', [
            'distributors' => $distributors,
            'favorites' => $favorites,
            'others' => $others,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'is_favorite' => 'boolean',
        ]);

        $distributor = Distributor::create($validated);

        return redirect()->back()->with('success', 'Distributor added successfully!');
    }

    public function update(Request $request, Distributor $distributor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'is_favorite' => 'boolean',
        ]);

        $distributor->update($validated);

        return redirect()->back()->with('success', 'Distributor updated successfully!');
    }

    public function toggleFavorite(Distributor $distributor)
    {
        $distributor->update(['is_favorite' => !$distributor->is_favorite]);

        return redirect()->back()->with('success', 'Favorite status updated.');
    }

    public function destroy(Distributor $distributor)
    {
        $distributor->delete();

        return redirect()->back()->with('success', 'Distributor deleted successfully.');
    }
}
