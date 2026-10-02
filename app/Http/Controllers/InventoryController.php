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
        
        // Parse multi-select distributors (array, comma-separated, or single string)
        $rawDistributors = $request->input('distributors', $request->query('distributor', []));
        $selectedDistributors = is_array($rawDistributors) 
            ? $rawDistributors 
            : (is_string($rawDistributors) && strlen($rawDistributors) > 0 ? explode(',', $rawDistributors) : []);
        $selectedDistributors = array_values(array_filter(array_map('trim', $selectedDistributors)));

        // Parse multi-select categories (array, comma-separated, or single string)
        $rawCategories = $request->input('categories', $request->query('category', []));
        $selectedCategories = is_array($rawCategories) 
            ? $rawCategories 
            : (is_string($rawCategories) && strlen($rawCategories) > 0 ? explode(',', $rawCategories) : []);
        $selectedCategories = array_values(array_filter(array_map('trim', $selectedCategories)));

        $query = Inventory::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('distributor_name', 'like', "%{$search}%");
            });
        }

        if (!empty($selectedCategories)) {
            $query->whereIn('category', $selectedCategories);
        }

        if (!empty($selectedDistributors)) {
            $query->whereIn('distributor_name', $selectedDistributors);
        }

        $inventories = $query->orderBy('updated_at', 'desc')->get();

        $categories = Inventory::whereNotNull('category')->distinct()->pluck('category')->filter()->values();
        $distributors = Inventory::whereNotNull('distributor_name')->distinct()->pluck('distributor_name')->filter()->values();

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
                'categories' => $selectedCategories,
                'distributors' => $selectedDistributors,
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
