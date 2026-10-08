<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Distributor;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        ini_set('memory_limit', '256M');
        $search = $request->query('search', '');
        
        // Parse multi-select distributors
        $rawDistributors = $request->input('distributors', $request->query('distributor', []));
        $selectedDistributors = is_array($rawDistributors) 
            ? $rawDistributors 
            : (is_string($rawDistributors) && strlen($rawDistributors) > 0 ? explode(',', $rawDistributors) : []);
        $selectedDistributors = array_values(array_filter(array_map('trim', $selectedDistributors)));

        // Parse multi-select categories
        $rawCategories = $request->input('categories', $request->query('category', []));
        $selectedCategories = is_array($rawCategories) 
            ? $rawCategories 
            : (is_string($rawCategories) && strlen($rawCategories) > 0 ? explode(',', $rawCategories) : []);
        $selectedCategories = array_values(array_filter(array_map('trim', $selectedCategories)));

        $baseQuery = Inventory::with([
            'product.categoryRelation',
            'product.distributors',
            'variant.unit',
            'variant.flavor',
            'variant.size',
            'variant.distributors'
        ]);

        // Full warehouse inventory dataset (ALWAYS un-filtered for graphs, KPI summaries, and alert center)
        $allInventories = (clone $baseQuery)->orderBy('updated_at', 'desc')->get();

        $totalItems = $allInventories->sum('quantity');
        $totalValuation = $allInventories->sum(function ($item) {
            return $item->quantity * $item->purchase_price;
        });

        // Threshold and low stock list (ALWAYS based on full warehouse inventory)
        $lowStockThreshold = (int) Setting::getValue('low_stock_threshold', 15);
        $rawLowStock = $allInventories->filter(function ($item) use ($lowStockThreshold) {
            return $item->quantity <= $lowStockThreshold;
        })->values();

        // Top moving products (ALWAYS based on full warehouse inventory)
        $rawTopMoving = (clone $allInventories)
            ->sortByDesc('quantity')
            ->values()
            ->take(5);

        // Filtered catalog query for the table
        $query = clone $baseQuery;
        if (!empty($search)) {
            $query->where(function ($topQ) use ($search) {
                $topQ->whereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhereHas('categoryRelation', function ($cq) use ($search) {
                          $cq->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('distributors', function ($dq) use ($search) {
                          $dq->where('name', 'like', "%{$search}%");
                      });
                })->orWhereHas('variant', function ($vq) use ($search) {
                    $vq->where('sku', 'like', "%{$search}%")
                       ->orWhere('variant_name', 'like', "%{$search}%");
                });
            });
        }

        if (!empty($selectedCategories)) {
            $query->whereHas('product', function ($q) use ($selectedCategories) {
                $q->whereHas('categoryRelation', function ($cq) use ($selectedCategories) {
                    $cq->whereIn('name', $selectedCategories);
                });
            });
        }

        if (!empty($selectedDistributors)) {
            $query->whereHas('product', function ($q) use ($selectedDistributors) {
                $q->whereHas('distributors', function ($dq) use ($selectedDistributors) {
                    $dq->whereIn('name', $selectedDistributors);
                });
            });
        }

        $inventories = $query->orderBy('updated_at', 'desc')->get();

        // Lightweight transformer to avoid serializing deep Eloquent relationship trees and prevent memory exhaustion
        $formatInventory = function ($item, $includeImage = true) {
            $unit = $item->unit;
            $unitArr = $unit ? [
                'id' => $unit->unit_id ?? $unit->id ?? null,
                'name' => $unit->name ?? '',
                'symbol' => $unit->symbol ?? '',
                'category' => $unit->category ?? '',
            ] : null;

            $product = $item->product;

            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'sku' => $item->sku,
                'product_name' => $item->product_name,
                'category' => $item->category,
                'distributor_name' => $item->distributor_name,
                'quantity' => (int) $item->quantity,
                'purchase_price' => (float) $item->purchase_price,
                'selling_price' => (float) $item->selling_price,
                'size_value' => $item->size_value,
                'packaging' => $item->packaging,
                'unit' => $unitArr,
                'product' => [
                    'id' => $item->product_id,
                    'name' => $product?->name ?? $item->product_name,
                    'size_value' => $item->size_value,
                    'packaging' => $item->packaging,
                    'unit' => $unitArr,
                ],
                'image' => $includeImage ? $item->image : null,
                'updated_at' => $item->updated_at ? $item->updated_at->toIso8601String() : '',
            ];
        };

        // Graph and KPI source does not require heavy base64 product images
        $formattedAll = $allInventories->map(fn($i) => $formatInventory($i, false))->values()->all();
        $formattedInventories = $inventories->map(fn($i) => $formatInventory($i, true))->values()->all();
        $formattedLowStock = $rawLowStock->map(fn($i) => $formatInventory($i, true))->values()->all();
        $formattedTopMoving = $rawTopMoving->map(fn($i) => $formatInventory($i, true))->values()->all();

        $categories = Category::where('is_active', true)->orderBy('name')->pluck('name')->values()->all();
        $distributors = Distributor::orderBy('name')->pluck('name')->values()->all();
        $units = Unit::where('is_active', true)->orderBy('name')->get();

        // Recent stock movements (audit trail - mapped cleanly)
        $recentMovements = StockMovement::with(['product.variants', 'user'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'product' => [
                        'name' => $m->product?->name ?? 'N/A',
                        'sku' => $m->product?->variants->first()?->sku ?? $m->product?->sku ?? 'N/A',
                    ],
                    'user' => [
                        'name' => $m->user?->name ?? 'System',
                    ],
                    'type' => $m->type,
                    'quantity' => $m->quantity,
                    'balance_before' => $m->balance_before,
                    'balance_after' => $m->balance_after,
                    'reason' => $m->reason,
                    'created_at' => $m->created_at ? $m->created_at->toIso8601String() : '',
                ];
            })
            ->values()
            ->all();

        // Available active products for quick stock-in / stock-out dropdowns (without heavy image loads)
        $productList = Product::select(['product_id', 'name', 'category_id'])
            ->with([
                'categoryRelation:category_id,name',
                'variants:variant_id,product_id,sku,purchase_price,default_dealing_price'
            ])
            ->orderBy('name')
            ->get()
            ->map(function ($p) {
                $variant = $p->variants->first();
                return [
                    'id' => $p->product_id,
                    'name' => $p->name,
                    'sku' => $variant?->sku ?? 'N/A',
                    'category' => $p->categoryRelation?->name ?? 'General',
                    'purchase_price' => (float) ($variant?->purchase_price ?? 0),
                    'default_dealing_price' => (float) ($variant?->default_dealing_price ?? 0),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Inventory/Index', [
            'inventories' => $formattedInventories,
            'allInventories' => $formattedAll,
            'topMovingProducts' => $formattedTopMoving,
            'categories' => $categories,
            'distributors' => $distributors,
            'units' => $units,
            'productList' => $productList,
            'recentMovements' => $recentMovements,
            'lowStockItems' => $formattedLowStock,
            'summary' => [
                'total_products' => count($formattedAll),
                'total_items' => $totalItems,
                'total_valuation' => $totalValuation,
                'low_stock_count' => count($formattedLowStock),
            ],
            'filters' => [
                'search' => $search,
                'categories' => $selectedCategories,
                'distributors' => $selectedDistributors,
            ],
            'lowStockThreshold' => $lowStockThreshold,
        ]);
    }

    public function stockIn(Request $request)
    {
        $validated = $request->validate([
            'inventory_id' => 'nullable|exists:inventories,id',
            'product_id' => 'required|exists:products,product_id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:100',
            'remarks' => 'nullable|string|max:255',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $inventory = null;
        if (!empty($validated['inventory_id'])) {
            $inventory = Inventory::find($validated['inventory_id']);
        }
        if (!$inventory) {
            $inventory = Inventory::firstOrCreate(
                ['product_id' => $product->product_id ?? $product->id],
                [
                    'quantity' => 0,
                    'reorder_level' => 15,
                ]
            );
        }

        $oldQty = (int) $inventory->quantity;
        $qtyAdded = (int) $validated['quantity'];
        $newQty = $oldQty + $qtyAdded;

        $inventory->update(['quantity' => $newQty]);

        $user = auth()->user();

        StockMovement::create([
            'product_id' => $product->product_id ?? $product->id,
            'variant_id' => $inventory->variant_id ?? null,
            'user_id' => $user?->id,
            'type' => 'in',
            'quantity' => $qtyAdded,
            'balance_before' => $oldQty,
            'balance_after' => $newQty,
            'reason' => $validated['reason'],
            'remarks' => $validated['remarks'] ?? null,
        ]);

        ActivityLog::log(
            'updated',
            'Inventory',
            $inventory->id,
            "Stock In (+{$qtyAdded}) for {$inventory->product_name} by {$user->name}. Reason: {$validated['reason']}",
            ['quantity' => $oldQty],
            ['quantity' => $newQty]
        );

        \App\Models\Notification::notifyAll(
            'stock_in',
            'Stock In Received',
            "+{$qtyAdded} units received for '{$inventory->product_name}'. New stock: {$newQty} units.",
            '/inventory',
            "Reason: {$validated['reason']} | Handled by: {$user->name}"
        );

        return redirect()->back()->with('success', "Stock In recorded: +{$qtyAdded} units for {$inventory->product_name}.");
    }

    public function stockOut(Request $request)
    {
        $validated = $request->validate([
            'inventory_id' => 'nullable|exists:inventories,id',
            'product_id' => 'required|exists:products,product_id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:100',
            'remarks' => 'nullable|string|max:255',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $inventory = null;
        if (!empty($validated['inventory_id'])) {
            $inventory = Inventory::find($validated['inventory_id']);
        }
        if (!$inventory) {
            $inventory = Inventory::where('product_id', $product->product_id ?? $product->id)->first();
        }

        if (!$inventory) {
            return redirect()->back()->with('error', 'No inventory record exists for this product.');
        }

        $oldQty = (int) $inventory->quantity;
        $qtyOut = (int) $validated['quantity'];

        if ($qtyOut > $oldQty) {
            return redirect()->back()->with('error', "Cannot stock out {$qtyOut} units. Current stock is only {$oldQty} units.");
        }

        $newQty = max(0, $oldQty - $qtyOut);
        $inventory->update(['quantity' => $newQty]);

        $user = auth()->user();

        StockMovement::create([
            'product_id' => $product->product_id ?? $product->id,
            'variant_id' => $inventory->variant_id ?? null,
            'user_id' => $user?->id,
            'type' => 'out',
            'quantity' => -$qtyOut,
            'balance_before' => $oldQty,
            'balance_after' => $newQty,
            'reason' => $validated['reason'],
            'remarks' => $validated['remarks'] ?? null,
        ]);

        ActivityLog::log(
            'updated',
            'Inventory',
            $inventory->id,
            "Stock Out (-{$qtyOut}) for {$inventory->product_name} by {$user->name}. Reason: {$validated['reason']}",
            ['quantity' => $oldQty],
            ['quantity' => $newQty]
        );

        $threshold = (int) Setting::getValue('low_stock_threshold', 15);
        if ($newQty <= $threshold) {
            \App\Models\Notification::notifyAll(
                'low_stock',
                'Low Stock Warning (Stock Out)',
                "Stock for '{$inventory->product_name}' dropped to {$newQty} units following a stock out.",
                '/inventory'
            );
        }

        return redirect()->back()->with('success', "Stock Out recorded: -{$qtyOut} units for {$inventory->product_name}.");
    }

    public function adjust(Request $request)
    {
        return $this->adjustStock($request);
    }

    public function adjustStock(Request $request)
    {
        $validated = $request->validate([
            'inventory_id' => 'nullable|exists:inventories,id',
            'product_id' => 'required|exists:products,product_id',
            'new_quantity' => 'required|integer|min:0',
            'reason' => 'required|string|max:100',
            'remarks' => 'nullable|string|max:255',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $inventory = null;
        if (!empty($validated['inventory_id'])) {
            $inventory = Inventory::find($validated['inventory_id']);
        }
        if (!$inventory) {
            $inventory = Inventory::firstOrCreate(
                ['product_id' => $product->product_id ?? $product->id],
                [
                    'quantity' => 0,
                    'reorder_level' => 10,
                ]
            );
        }

        $oldQty = (int) $inventory->quantity;
        $newQty = (int) $validated['new_quantity'];
        $diff = $newQty - $oldQty;

        $inventory->update(['quantity' => $newQty]);

        $user = auth()->user();

        StockMovement::create([
            'product_id' => $product->product_id ?? $product->id,
            'variant_id' => $inventory->variant_id ?? null,
            'user_id' => $user?->id,
            'type' => 'adjustment',
            'quantity' => $diff,
            'balance_before' => $oldQty,
            'balance_after' => $newQty,
            'reason' => $validated['reason'],
            'remarks' => $validated['remarks'] ?? null,
        ]);

        ActivityLog::log(
            'updated',
            'Inventory',
            $inventory->id,
            "Physical Inventory Adjustment for {$inventory->product_name}: {$oldQty} -> {$newQty} by {$user->name}. Reason: {$validated['reason']}",
            ['quantity' => $oldQty],
            ['quantity' => $newQty]
        );

        \App\Models\Notification::notifyAll(
            'stock_adjusted',
            'Stock Adjustment Verified',
            "Stock for '{$inventory->product_name}' was corrected from {$oldQty} to {$newQty} by {$user->name}.",
            '/inventory'
        );

        return redirect()->back()->with('success', "Stock adjusted: {$oldQty} -> {$newQty} for {$inventory->product_name}.");
    }

    public function updateQuantity(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $oldQty = (int) $inventory->quantity;
        $newQty = (int) $validated['quantity'];
        $diff = $newQty - $oldQty;

        $inventory->update(['quantity' => $newQty]);

        $actor = auth()->user();
        $actorName = $actor ? $actor->name : 'Someone';

        StockMovement::create([
            'product_id' => $inventory->product_id,
            'user_id' => $actor?->id,
            'type' => 'adjustment',
            'quantity' => $diff,
            'balance_before' => $oldQty,
            'balance_after' => $newQty,
            'reason' => 'Quick Quantity Inline Update',
        ]);

        ActivityLog::log('updated', 'Inventory', $inventory->id,
            "Updated stock for {$inventory->product_name}: {$oldQty} -> {$newQty}",
            ['quantity' => $oldQty],
            ['quantity' => $newQty]
        );

        return redirect()->back()->with('success', "Stock updated for {$inventory->product_name}: {$oldQty} -> {$newQty}.");
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

        if ($action === 'set_quantity') {
            $qty = (int) $validated['quantity'];
            Inventory::whereIn('id', $ids)->update(['quantity' => $qty]);

            ActivityLog::log('updated', 'Inventory', null,
                "Batch updated stock quantity to {$qty} for {$count} item(s)",
                null,
                ['ids' => $ids, 'quantity' => $qty]
            );

            return redirect()->back()->with('success', "Successfully updated stock quantity to {$qty} for {$count} item(s).");
        } elseif ($action === 'add_quantity') {
            $adj = (int) $validated['adjustment'];
            $sign = $adj >= 0 ? "+{$adj}" : "{$adj}";

            foreach (Inventory::whereIn('id', $ids)->get() as $inv) {
                $newQty = max(0, $inv->quantity + $adj);
                $inv->update(['quantity' => $newQty]);
            }

            ActivityLog::log('updated', 'Inventory', null,
                "Batch adjusted stock by {$sign} for {$count} item(s)",
                null,
                ['ids' => $ids, 'adjustment' => $adj]
            );

            return redirect()->back()->with('success', "Successfully adjusted stock by {$sign} for {$count} item(s).");
        } elseif ($action === 'set_category') {
            $cat = trim($validated['category']);
            $category = \App\Models\Category::firstOrCreate(['name' => $cat], ['is_active' => true]);
            $invItems = Inventory::whereIn('id', $ids)->get();
            Product::whereIn('id', $invItems->pluck('product_id'))->update(['category_id' => $category->id]);

            ActivityLog::log('updated', 'Inventory', null,
                "Batch updated category to '{$cat}' for {$count} item(s)",
                null,
                ['ids' => $ids, 'category' => $cat]
            );

            return redirect()->back()->with('success', "Successfully updated category to '{$cat}' for {$count} item(s).");
        }

        return redirect()->back()->with('success', 'Batch action completed successfully.');
    }
}
