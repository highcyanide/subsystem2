<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Inventory;
use App\Models\Setting;
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

        // Get low stock threshold from settings
        $lowStockThreshold = (int) Setting::getValue('low_stock_threshold', 15);

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
            'lowStockThreshold' => $lowStockThreshold,
        ]);
    }

    public function updateQuantity(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $oldQty = $inventory->quantity;
        $inventory->update(['quantity' => $validated['quantity']]);

        ActivityLog::log('updated', 'Inventory', $inventory->id,
            "Updated stock for {$inventory->product_name}: {$oldQty} → {$validated['quantity']}",
            ['quantity' => $oldQty],
            ['quantity' => $validated['quantity']]
        );

        // Check for low stock notification
        $threshold = (int) Setting::getValue('low_stock_threshold', 15);
        if ($validated['quantity'] <= $threshold && $validated['quantity'] > 0) {
            \App\Models\Notification::notifyAll(
                'low_stock',
                'Low Stock Alert',
                "{$inventory->product_name} is running low ({$validated['quantity']} units remaining).",
                '/inventory'
            );
        }

        return redirect()->back()->with('success', 'Stock quantity updated.');
    }
}
