<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Distributor;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $distributorParam = $request->query('distributor_id');
        if ($request->has('distributor_ids') && !$request->has('distributor_id')) {
            $rawIds = $request->query('distributor_ids');
            $idsArr = is_array($rawIds) ? $rawIds : explode(',', (string) $rawIds);
            $cleanIds = implode(',', array_values(array_filter(array_map('intval', $idsArr))));
            $queryParams = $request->except('distributor_ids');
            if (!empty($cleanIds)) {
                $queryParams['distributor_id'] = $cleanIds;
            }
            return redirect()->route('sales-purchase.index', $queryParams);
        }

        $search = $request->query('search', '');
        $dateFilter = $request->query('date', '');
        $startDate = $request->query('start_date', '');
        $endDate = $request->query('end_date', '');
        $monthFilter = $request->query('month', '');

        $distributorsQuery = Distributor::withCount('products');
        if (!empty($search)) {
            $distributorsQuery->where('name', 'like', "%{$search}%");
        }
        $allDistributors = $distributorsQuery->orderBy('name')->get();

        $favorites = $allDistributors->where('is_favorite', true)->values();
        $others = $allDistributors->where('is_favorite', false)->values();

        // Determine selected distributor IDs
        $selectedDistributorIds = [];
        $isAllDistributors = false;

        if ($distributorParam === 'all') {
            $isAllDistributors = true;
            $selectedDistributorIds = $allDistributors->pluck('id')->toArray();
        } elseif ($distributorParam !== null && $distributorParam !== '') {
            if (str_contains($distributorParam, ',')) {
                $selectedDistributorIds = array_values(array_filter(array_map('intval', explode(',', $distributorParam))));
            } else {
                $val = (int) $distributorParam;
                $selectedDistributorIds = $val > 0 ? [$val] : [];
            }
        }

        if (count($selectedDistributorIds) > 0 && count($selectedDistributorIds) === $allDistributors->count() && $allDistributors->count() > 0) {
            $isAllDistributors = true;
        }

        $selectedDistributor = null;
        if (count($selectedDistributorIds) === 1 && !$isAllDistributors) {
            $selectedDistributor = Distributor::find($selectedDistributorIds[0]);
        }

        $selectedDistributors = Distributor::whereIn('id', $selectedDistributorIds)->get();

        $purchases = collect([]);
        $products = collect([]);
        $summary = [
            'total_purchase' => 0,
            'gross_amount' => 0,
            'vat_adjusted_amount' => 0,
            'net_profit' => 0,
            'total_items' => 0,
        ];

        if (!empty($selectedDistributorIds)) {
            $products = Product::whereIn('distributor_id', $selectedDistributorIds)->orderBy('name')->get();

            $purchasesQuery = Purchase::with(['distributor', 'product'])
                ->whereIn('distributor_id', $selectedDistributorIds);

            if (!empty($search)) {
                $purchasesQuery->where(function($q) use ($search) {
                    $q->whereHas('product', function($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%");
                    })->orWhereHas('distributor', function($dq) use ($search) {
                        $dq->where('name', 'like', "%{$search}%");
                    });
                });
            }

            // Date Filtering Logic (Single Date, Month, or Date Range)
            if (!empty($startDate) && !empty($endDate)) {
                $purchasesQuery->whereBetween('date', [$startDate, $endDate]);
            } elseif (!empty($monthFilter)) {
                $parts = explode('-', $monthFilter);
                if (count($parts) === 2) {
                    $purchasesQuery->whereYear('date', $parts[0])->whereMonth('date', $parts[1]);
                }
            } elseif (!empty($dateFilter)) {
                if (str_contains($dateFilter, '..')) {
                    $range = explode('..', $dateFilter);
                    $purchasesQuery->whereBetween('date', [$range[0], $range[1]]);
                } elseif (strlen($dateFilter) === 7) {
                    $parts = explode('-', $dateFilter);
                    $purchasesQuery->whereYear('date', $parts[0])->whereMonth('date', $parts[1]);
                } else {
                    $purchasesQuery->whereDate('date', $dateFilter);
                }
            }

            $purchases = $purchasesQuery->orderBy('date', 'desc')->orderBy('id', 'desc')->get();

            $summary['total_purchase'] = $purchases->sum('total_purchase');
            $summary['gross_amount'] = $purchases->sum('gross_amount');
            $summary['vat_adjusted_amount'] = $purchases->sum('vat_adjusted_amount');
            $summary['net_profit'] = $purchases->sum('net_profit');
            $summary['total_items'] = $purchases->sum('quantity');
        }

        $allProducts = Product::with('distributor')->orderBy('name')->get();

        // Available dates for filter dropdown
        $availableDates = Purchase::select('date')
            ->distinct()
            ->orderBy('date', 'desc')
            ->pluck('date');

        return Inertia::render('SalesPurchase/Index', [
            'favorites' => $favorites,
            'others' => $others,
            'allDistributors' => $allDistributors,
            'selectedDistributor' => $selectedDistributor,
            'selectedDistributorIds' => $selectedDistributorIds,
            'selectedDistributors' => $selectedDistributors,
            'isAllDistributors' => $isAllDistributors,
            'products' => $products,
            'allProducts' => $allProducts,
            'purchases' => $purchases,
            'summary' => $summary,
            'availableDates' => $availableDates,
            'filters' => [
                'search' => $search,
                'date' => $dateFilter,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'month' => $monthFilter,
                'distributor_id' => $distributorParam,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'distributor_id' => 'required|exists:distributors,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'purchase_price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'vat_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $distributor = Distributor::findOrFail($validated['distributor_id']);

        $discount = $validated['discount'] ?? 0;
        $defaultVat = (float) Setting::getValue('default_vat_percentage', 12);
        $vatRate = $validated['vat_percentage'] ?? $defaultVat;
        $quantity = $validated['quantity'];
        $purchasePrice = $validated['purchase_price'];

        $totalPurchase = $quantity * $purchasePrice;
        $dealingPrice = $purchasePrice + $discount;
        $grossAmount = $quantity * $dealingPrice;
        // Formula matching spreadsheet reference (1200 * 0.88 = 1056.00):
        $vatAdjustedAmount = $grossAmount * (1 - ($vatRate / 100));
        $netProfit = $grossAmount - $totalPurchase;

        // Rapid double-click / debounce protection (within 3 seconds)
        $recentDuplicate = Purchase::where('distributor_id', $distributor->id)
            ->where('product_id', $product->id)
            ->where('date', $validated['date'])
            ->where('quantity', $quantity)
            ->where('purchase_price', $purchasePrice)
            ->where('created_at', '>=', now()->subSeconds(3))
            ->first();

        if ($recentDuplicate) {
            return redirect()->back()->with('error', 'Duplicate transaction prevented. Please avoid rapid double-clicking.');
        }

        $purchase = Purchase::create([
            'date' => $validated['date'],
            'distributor_id' => $distributor->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'purchase_price' => $purchasePrice,
            'total_purchase' => $totalPurchase,
            'dealing_price' => $dealingPrice,
            'discount' => $discount,
            'gross_amount' => $grossAmount,
            'vat_percentage' => $vatRate,
            'vat_adjusted_amount' => $vatAdjustedAmount,
            'net_profit' => $netProfit,
        ]);

        // CRITICAL REQUIREMENT:
        // "ALL PURCHASED INSERTS WILL BE RECORDED IN THE SUBSYSTEM 1 Module 1, INVENTORY MANAGEMENT"
        $inventory = Inventory::firstOrCreate(
            ['product_id' => $product->id],
            [
                'sku' => $product->sku ?? ('SKU-' . $product->id),
                'category' => $product->category ?? 'General',
                'distributor_name' => $distributor->name,
                'product_name' => $product->name,
                'quantity' => 0,
                'purchase_price' => $purchasePrice,
                'selling_price' => $dealingPrice,
            ]
        );

        $inventory->increment('quantity', $quantity);
        $inventory->update([
            'purchase_price' => $purchasePrice,
            'selling_price' => $dealingPrice,
        ]);

        ActivityLog::log('created', 'Purchase', $purchase->id,
            "Recorded purchase: {$quantity}x {$product->name} from {$distributor->name} (₱" . number_format($totalPurchase, 2) . ")",
            null,
            ['quantity' => $quantity, 'purchase_price' => $purchasePrice, 'product' => $product->name, 'distributor' => $distributor->name]
        );

        // Notify about the purchase
        \App\Models\Notification::notifyAll(
            'purchase_recorded',
            'New Purchase Recorded',
            "{$quantity}x {$product->name} purchased from {$distributor->name} for ₱" . number_format($totalPurchase, 2),
            '/sales-purchase?distributor_id=' . $distributor->id
        );

        return redirect()->back()->with('success', 'Purchase recorded and stock added to Subsystem 1 Inventory!');
    }

    public function update(Request $request, Purchase $purchase)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'quantity' => 'required|integer|min:1',
            'purchase_price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'vat_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $oldValues = $purchase->toArray();
        $oldQty = $purchase->quantity;
        $discount = $validated['discount'] ?? 0;
        $defaultVat = (float) Setting::getValue('default_vat_percentage', 12);
        $vatRate = $validated['vat_percentage'] ?? $defaultVat;
        $quantity = $validated['quantity'];
        $purchasePrice = $validated['purchase_price'];

        $totalPurchase = $quantity * $purchasePrice;
        $dealingPrice = $purchasePrice + $discount;
        $grossAmount = $quantity * $dealingPrice;
        $vatAdjustedAmount = $grossAmount * (1 - ($vatRate / 100));
        $netProfit = $grossAmount - $totalPurchase;

        $purchase->update([
            'date' => $validated['date'],
            'quantity' => $quantity,
            'purchase_price' => $purchasePrice,
            'total_purchase' => $totalPurchase,
            'dealing_price' => $dealingPrice,
            'discount' => $discount,
            'gross_amount' => $grossAmount,
            'vat_percentage' => $vatRate,
            'vat_adjusted_amount' => $vatAdjustedAmount,
            'net_profit' => $netProfit,
        ]);

        // Sync quantity difference to Subsystem 1 Inventory
        $qtyDiff = $quantity - $oldQty;
        $inventory = Inventory::where('product_id', $purchase->product_id)->first();
        if ($inventory) {
            $inventory->quantity = max(0, $inventory->quantity + $qtyDiff);
            $inventory->purchase_price = $purchasePrice;
            $inventory->selling_price = $dealingPrice;
            $inventory->save();
        }

        ActivityLog::log('updated', 'Purchase', $purchase->id,
            "Updated purchase record #{$purchase->id}",
            $oldValues,
            $validated
        );

        \App\Models\Notification::notifyAll(
            'purchase_updated',
            'Purchase Transaction Updated',
            "Purchase record #{$purchase->id} ({$purchase->product?->name}) was updated.",
            '/sales-purchase?distributor_id=' . $purchase->distributor_id,
            "Quantity: {$quantity} | Purchase Price: ₱{$purchasePrice}"
        );

        return redirect()->back()->with('success', 'Purchase record updated.');
    }

    public function destroy(Purchase $purchase)
    {
        $oldValues = $purchase->toArray();
        $prodName = $purchase->product?->name ?? 'Item';
        $distId = $purchase->distributor_id;
        $qty = $purchase->quantity;

        // Revert quantity from inventory
        $inventory = Inventory::where('product_id', $purchase->product_id)->first();
        if ($inventory) {
            $inventory->quantity = max(0, $inventory->quantity - $purchase->quantity);
            $inventory->save();
        }

        $purchase->delete(); // Soft delete

        ActivityLog::log('deleted', 'Purchase', null,
            "Archived purchase record (Product: {$prodName}, Qty: {$qty})",
            $oldValues,
            null
        );

        \App\Models\Notification::notifyAll(
            'purchase_deleted',
            'Purchase Record Archived',
            "A purchase entry for {$qty}x {$prodName} was archived.",
            '/sales-purchase?distributor_id=' . $distId
        );

        return redirect()->back()->with('success', 'Purchase record archived and inventory adjusted.');
    }

    public function restore($id)
    {
        $purchase = Purchase::onlyTrashed()->findOrFail($id);
        $purchase->restore();

        // Restore quantity in inventory
        $inventory = Inventory::where('product_id', $purchase->product_id)->first();
        if ($inventory) {
            $inventory->increment('quantity', $purchase->quantity);
        }

        ActivityLog::log('updated', 'Purchase', $purchase->id,
            "Restored archived purchase transaction #{$purchase->id}"
        );

        \App\Models\Notification::notifyAll(
            'purchase_restored',
            'Purchase Record Restored',
            "Purchase record #{$purchase->id} was restored from archive.",
            '/sales-purchase?distributor_id=' . $purchase->distributor_id
        );

        return redirect()->back()->with('success', 'Purchase record restored from archive.');
    }
}
