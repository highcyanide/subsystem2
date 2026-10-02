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

        $oldQty = (int) $inventory->quantity;
        $newQty = (int) $validated['quantity'];
        $inventory->update(['quantity' => $newQty]);

        $actor = auth()->user();
        $actorName = $actor ? $actor->name : 'Someone';
        $actorRole = $actor ? ucfirst($actor->role) : 'User';

        ActivityLog::log('updated', 'Inventory', $inventory->id,
            "{$actorRole} {$actorName} updated stock for {$inventory->product_name}: {$oldQty} → {$newQty}",
            ['quantity' => $oldQty],
            ['quantity' => $newQty]
        );

        $diff = $newQty - $oldQty;
        $change = $diff > 0 ? "+{$diff}" : "{$diff}";

        // Always notify all users that stock was updated
        \App\Models\Notification::notifyAll(
            'stock_adjusted',
            'Inventory Stock Adjusted',
            "Stock for '{$inventory->product_name}' was changed from {$oldQty} to {$newQty} ({$change} units) by {$actorName}.",
            '/inventory',
            "Product: {$inventory->product_name} | SKU: {$inventory->sku} | Distributor: {$inventory->distributor_name} | Adjusted by: {$actorName} ({$actorRole})"
        );

        // Check for low stock or out of stock alert
        $threshold = (int) Setting::getValue('low_stock_threshold', 15);
        if ($newQty === 0) {
            \App\Models\Notification::notifyAll(
                'out_of_stock',
                'Out of Stock Alert',
                "{$inventory->product_name} is now OUT OF STOCK (0 units remaining).",
                '/inventory',
                "Please re-order immediately from {$inventory->distributor_name}."
            );
        } elseif ($newQty <= $threshold) {
            \App\Models\Notification::notifyAll(
                'low_stock',
                'Low Stock Alert',
                "{$inventory->product_name} is running low ({$newQty} units remaining, threshold: {$threshold}).",
                '/inventory',
                "Distributor: {$inventory->distributor_name} | SKU: {$inventory->sku}"
            );
        }

        return redirect()->back()->with('success', "Stock updated for {$inventory->product_name}: {$oldQty} → {$newQty}.");
    }

    public function batchUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:inventories,id',
            'action' => 'required|string|in:set_quantity,add_quantity,set_category',
            'quantity' => 'nullable|required_if:action,set_quantity|integer|min:0',
            'adjustment' => 'nullable|required_if:action,add_quantity|integer',
            'category' => 'nullable|required_if:action,set_category|string|max:100',
        ]);

        $ids = $validated['ids'];
        $action = $validated['action'];
        $count = count($ids);

        $actor = auth()->user();
        $actorName = $actor ? $actor->name : 'Someone';
        $actorRole = $actor ? ucfirst($actor->role) : 'User';
        $threshold = (int) Setting::getValue('low_stock_threshold', 15);

        if ($action === 'set_quantity') {
            $qty = (int) $validated['quantity'];
            Inventory::whereIn('id', $ids)->update(['quantity' => $qty]);

            ActivityLog::log('updated', 'Inventory', null,
                "{$actorRole} {$actorName} batch updated stock quantity to {$qty} for {$count} item(s)",
                null,
                ['ids' => $ids, 'quantity' => $qty]
            );

            \App\Models\Notification::notifyAll(
                'batch_stock_adjusted',
                'Batch Stock Quantity Set',
                "{$actorRole} {$actorName} updated stock to {$qty} units for {$count} items.",
                '/inventory',
                "Quantity: {$qty} units | Affected items: {$count} | Updated by: {$actorName}"
            );

            if ($qty === 0) {
                \App\Models\Notification::notifyAll(
                    'out_of_stock',
                    'Out of Stock Alert (Batch)',
                    "{$count} items were set to 0 units and are now OUT OF STOCK.",
                    '/inventory'
                );
            } elseif ($qty <= $threshold) {
                \App\Models\Notification::notifyAll(
                    'low_stock',
                    'Low Stock Alert (Batch)',
                    "{$count} items were set to {$qty} units (low stock threshold: {$threshold}).",
                    '/inventory'
                );
            }

            $msg = "Successfully updated stock quantity to {$qty} for {$count} item(s).";
        } elseif ($action === 'add_quantity') {
            $adj = (int) $validated['adjustment'];
            $sign = $adj >= 0 ? "+{$adj}" : "{$adj}";

            $lowStockItems = [];
            $outOfStockItems = [];

            foreach (Inventory::whereIn('id', $ids)->get() as $inv) {
                $newQty = max(0, $inv->quantity + $adj);
                $inv->update(['quantity' => $newQty]);
                if ($newQty === 0) {
                    $outOfStockItems[] = $inv->product_name;
                } elseif ($newQty <= $threshold) {
                    $lowStockItems[] = $inv->product_name;
                }
            }

            ActivityLog::log('updated', 'Inventory', null,
                "{$actorRole} {$actorName} batch adjusted stock by {$sign} for {$count} item(s)",
                null,
                ['ids' => $ids, 'adjustment' => $adj]
            );

            \App\Models\Notification::notifyAll(
                'batch_stock_adjusted',
                'Batch Stock Adjusted',
                "{$actorRole} {$actorName} adjusted stock by {$sign} units across {$count} items.",
                '/inventory',
                "Adjustment: {$sign} across {$count} products | Updated by: {$actorName}"
            );

            if (count($outOfStockItems) > 0) {
                $sample = implode(', ', array_slice($outOfStockItems, 0, 3));
                if (count($outOfStockItems) > 3) $sample .= " and " . (count($outOfStockItems) - 3) . " more";
                \App\Models\Notification::notifyAll(
                    'out_of_stock',
                    'Out of Stock Alert (Batch)',
                    count($outOfStockItems) . " items are now out of stock ({$sample}).",
                    '/inventory'
                );
            }

            if (count($lowStockItems) > 0) {
                $sample = implode(', ', array_slice($lowStockItems, 0, 3));
                if (count($lowStockItems) > 3) $sample .= " and " . (count($lowStockItems) - 3) . " more";
                \App\Models\Notification::notifyAll(
                    'low_stock',
                    'Low Stock Alert (Batch)',
                    count($lowStockItems) . " items are now running low on stock ({$sample}).",
                    '/inventory'
                );
            }

            $msg = "Successfully adjusted stock by {$sign} for {$count} item(s).";
        } elseif ($action === 'set_category') {
            $cat = trim($validated['category']);
            Inventory::whereIn('id', $ids)->update(['category' => $cat]);

            ActivityLog::log('updated', 'Inventory', null,
                "{$actorRole} {$actorName} batch updated category to '{$cat}' for {$count} item(s)",
                null,
                ['ids' => $ids, 'category' => $cat]
            );

            \App\Models\Notification::notifyAll(
                'batch_category_updated',
                'Batch Category Updated',
                "{$actorRole} {$actorName} moved {$count} items to category '{$cat}'.",
                '/inventory',
                "Category: {$cat} | Items: {$count} | Updated by: {$actorName}"
            );

            $msg = "Successfully updated category to '{$cat}' for {$count} item(s).";
        }

        return redirect()->back()->with('success', $msg ?? 'Batch action completed successfully.');
    }
}
