<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $category = $request->query('category', '');
        $distributor = $request->query('distributor', '');

        $query = Inventory::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('distributor_name', 'like', "%{$search}%");
            });
        }

        if (!empty($category)) {
            $query->where('category', $category);
        }

        if (!empty($distributor)) {
            $query->where('distributor_name', $distributor);
        }

        $inventories = $query->orderBy('updated_at', 'desc')->get();

        $categories = Inventory::select('category')->distinct()->pluck('category');
        $distributors = Inventory::select('distributor_name')->distinct()->pluck('distributor_name');

        $totalItems = $inventories->sum('quantity');
        $totalValuation = $inventories->sum(function ($item) {
            return $item->quantity * $item->purchase_price;
        });

        return Inertia::render('Inventory/Index', [
            'inventories' => $inventories,
            'categories' => $categories,
            'distributors' => $distributors,
            'summary' => [
                'total_products' => $inventories->count(),
                'total_items' => $totalItems,
                'total_valuation' => $totalValuation,
            ],
            'filters' => [
                'search' => $search,
                'category' => $category,
                'distributor' => $distributor,
            ],
        ]);
    }

    public function updateQuantity(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $inventory->update(['quantity' => $validated['quantity']]);

        return redirect()->back()->with('success', 'Stock quantity updated.');
    }
}
