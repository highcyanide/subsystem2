<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $units = Unit::withCount('products')->orderBy('category')->orderBy('name')->get();

        if ($request->wantsJson()) {
            return response()->json($units);
        }

        return Inertia::render('Units/Index', [
            'units' => $units,
        ]);
    }

    public function store(Request $request)
    {
        if (request()->user() && request()->user()->isChecker()) {
            abort(403, 'Checkers cannot manage measurement units.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'symbol' => 'required|string|max:20|unique:units,symbol',
            'category' => 'required|string|in:volume,weight,package,count',
        ]);

        $validated['name'] = mb_strtoupper(trim($validated['name']));
        $validated['symbol'] = mb_strtoupper(trim($validated['symbol']));

        $unit = Unit::create($validated);

        ActivityLog::log('created', 'Unit', $unit->id, "Created measurement unit: {$unit->name} ({$unit->symbol})");

        return redirect()->back()->with('success', "Measurement unit '{$unit->name}' created.");
    }

    public function update(Request $request, Unit $unit)
    {
        if (request()->user() && request()->user()->isChecker()) {
            abort(403, 'Checkers cannot manage measurement units.');
        }

        $unitId = $unit->unit_id ?? $unit->id;
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'symbol' => 'required|string|max:20|unique:units,symbol,' . $unitId . ',unit_id',
            'category' => 'required|string|in:volume,weight,package,count',
            'is_active' => 'boolean',
        ]);

        $validated['name'] = mb_strtoupper(trim($validated['name']));
        $validated['symbol'] = mb_strtoupper(trim($validated['symbol']));

        $old = $unit->toArray();
        $unit->update($validated);

        ActivityLog::log('updated', 'Unit', $unit->id, "Updated measurement unit: {$unit->name}", $old, $unit->toArray());

        return redirect()->back()->with('success', "Measurement unit '{$unit->name}' updated.");
    }

    public function destroy(Unit $unit)
    {
        if (!request()->user() || !request()->user()->isAdmin()) {
            abort(403, 'Only administrators can delete measurement units.');
        }

        $name = $unit->name;
        $unit->delete();

        ActivityLog::log('deleted', 'Unit', null, "Deleted measurement unit: {$name}");

        return redirect()->back()->with('success', "Measurement unit '{$name}' deleted.");
    }
}
