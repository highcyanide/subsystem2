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
        ini_set('memory_limit', '256M');
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

        $selectedDistributors = Distributor::whereIn('distributor_id', $selectedDistributorIds)->get();

        $purchases = collect([]);
        $products = collect([]);
        $summary = [
            'total_purchase' => 0,
            'gross_amount' => 0,
            'vat_adjusted_amount' => 0,
            'net_profit' => 0,
            'total_items' => 0,
        ];

        $purchasesPaginator = null;
        if (!empty($selectedDistributorIds)) {
            $products = Product::select(['product_id', 'name', 'category_id'])
                ->where(function($q) use ($selectedDistributorIds) {
                    $q->whereHas('distributors', function($dq) use ($selectedDistributorIds) {
                        $dq->whereIn('distributors.distributor_id', $selectedDistributorIds);
                    });
                })
                ->with([
                    'unit',
                    'distributors:distributors.distributor_id,name',
                    'variants:variant_id,product_id,sku,purchase_price,default_discount,default_dealing_price,size_value,packaging_id,unit_id',
                    'variants.packagingRelation:packaging_id,name',
                    'variants.unit:unit_id,name,symbol'
                ])
                ->orderBy('name')
                ->get();

            $purchasesQuery = Purchase::whereIn('distributor_id', $selectedDistributorIds);

            if (!empty($search)) {
                $purchasesQuery->where(function($q) use ($search) {
                    $q->whereHas('product', function($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%");
                    })->orWhereHas('variant', function($vq) use ($search) {
                        $vq->where('variant_name', 'like', "%{$search}%")
                           ->orWhere('sku', 'like', "%{$search}%");
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

            // Database-level KPI aggregation without loading all records into memory
            $aggregates = (clone $purchasesQuery)->selectRaw('
                COALESCE(SUM(total_purchase), 0) as total_purchase,
                COALESCE(SUM(gross_amount), 0) as gross_amount,
                COALESCE(SUM(vat_adjusted_amount), 0) as vat_adjusted_amount,
                COALESCE(SUM(net_profit), 0) as net_profit,
                COALESCE(SUM(quantity), 0) as total_items
            ')->first();

            $summary['total_purchase'] = (float)($aggregates->total_purchase ?? 0);
            $summary['gross_amount'] = (float)($aggregates->gross_amount ?? 0);
            $summary['vat_adjusted_amount'] = (float)($aggregates->vat_adjusted_amount ?? 0);
            $summary['net_profit'] = (float)($aggregates->net_profit ?? 0);
            $summary['total_items'] = (int)($aggregates->total_items ?? 0);

            // Server-side pagination: only fetch the requested rows (e.g. 15 per page)
            $perPage = (int) $request->input('per_page', $request->input('pageSize', 15));
            $sortKey = $request->input('sort', 'date');
            $sortDirection = $request->input('direction', 'desc');

            $allowedSorts = ['id', 'date', 'quantity', 'purchase_price', 'total_purchase', 'dealing_price', 'discount', 'gross_amount', 'vat_percentage', 'vat_adjusted_amount', 'net_profit'];
            if (!in_array($sortKey, $allowedSorts)) {
                $sortKey = 'date';
            }
            if (!in_array(strtolower($sortDirection), ['asc', 'desc'])) {
                $sortDirection = 'desc';
            }

            $purchasesPaginator = $purchasesQuery->select([
                'id', 'date', 'distributor_id', 'product_id', 'variant_id',
                'quantity', 'purchase_price', 'total_purchase', 'dealing_price',
                'discount', 'gross_amount', 'vat_percentage', 'vat_adjusted_amount', 'net_profit'
            ])->with([
                'distributor:distributor_id,name,contact_number',
                'product:product_id,name,category_id',
                'product.unit',
                'variant:variant_id,product_id,sku,size_value,packaging_id,unit_id',
                'variant.packagingRelation:packaging_id,name',
                'variant.unit:unit_id,name,symbol',
            ])->orderBy($sortKey, $sortDirection)->orderBy('id', 'desc')->paginate($perPage)->withQueryString();
        }

        $allProducts = Product::select(['product_id', 'name', 'category_id'])
            ->with([
                'unit',
                'distributors:distributors.distributor_id,name',
                'variants:variant_id,product_id,sku,purchase_price,default_discount,default_dealing_price,size_value,packaging_id,unit_id',
                'variants.packagingRelation:packaging_id,name',
                'variants.unit:unit_id,name,symbol'
            ])
            ->orderBy('name')
            ->get();

        // Lightweight transformers to avoid deep Eloquent model trees and memory exhaustion
        $formatDistributor = function ($d) {
            if (!$d) return null;
            return [
                'id' => $d->distributor_id ?? $d->id,
                'name' => $d->name,
                'contact_number' => $d->contact_number ?? '',
                'email' => $d->email ?? '',
                'address' => $d->address ?? '',
                'logo' => $d->logo ?? '',
                'is_favorite' => (bool)$d->is_favorite,
                'products_count' => (int)($d->products_count ?? 0),
            ];
        };

        $formatProduct = function ($p) {
            if (!$p) return null;
            return [
                'id' => $p->product_id ?? $p->id,
                'distributor_id' => $p->distributor_id ?? ($p->distributors->first()?->distributor_id ?? 0),
                'name' => $p->name,
                'sku' => $p->sku ?? 'N/A',
                'category' => $p->category ?? 'General',
                'size_value' => $p->size_value ?? '',
                'packaging' => $p->packaging ?? '',
                'unit_id' => $p->unit_id ?? null,
                'unit' => $p->unit ? [
                    'id' => $p->unit->unit_id ?? $p->unit->id,
                    'symbol' => $p->unit->symbol ?? '',
                    'name' => $p->unit->name ?? '',
                ] : null,
                'purchase_price' => (float)($p->purchase_price ?? 0),
                'default_discount' => (float)($p->default_discount ?? 0),
                'default_dealing_price' => (float)($p->default_dealing_price ?? 0),
                'distributor' => $p->distributor ? [
                    'id' => $p->distributor->distributor_id ?? $p->distributor->id,
                    'name' => $p->distributor->name,
                ] : null,
            ];
        };

        $formatPurchase = function ($p) {
            if (!$p) return null;
            $prod = $p->product;
            $v = $p->variant;
            $unit = $v?->unit ?? $prod?->unit;
            return [
                'id' => $p->id,
                'date' => (string)$p->date,
                'distributor_id' => (int)$p->distributor_id,
                'product_id' => (int)$p->product_id,
                'variant_id' => $p->variant_id ? (int)$p->variant_id : null,
                'quantity' => (int)$p->quantity,
                'purchase_price' => (float)$p->purchase_price,
                'total_purchase' => (float)$p->total_purchase,
                'dealing_price' => (float)$p->dealing_price,
                'discount' => (float)$p->discount,
                'gross_amount' => (float)$p->gross_amount,
                'vat_percentage' => (float)$p->vat_percentage,
                'vat_adjusted_amount' => (float)$p->vat_adjusted_amount,
                'net_profit' => (float)$p->net_profit,
                'distributor' => $p->distributor ? [
                    'id' => $p->distributor->distributor_id ?? $p->distributor->id,
                    'name' => $p->distributor->name,
                    'contact_number' => $p->distributor->contact_number ?? '',
                ] : null,
                'product' => $prod ? [
                    'id' => $prod->product_id ?? $prod->id,
                    'distributor_id' => (int)$p->distributor_id,
                    'name' => $prod->name,
                    'sku' => $v?->sku ?? $prod->sku ?? 'N/A',
                    'category' => $prod->category ?? 'General',
                    'size_value' => $v?->size_value ?? $prod->size_value ?? '',
                    'packaging' => $v?->packaging ?? $prod->packaging ?? '',
                    'purchase_price' => (float)$p->purchase_price,
                    'default_discount' => (float)$p->discount,
                    'default_dealing_price' => (float)$p->dealing_price,
                    'unit' => $unit ? [
                        'id' => $unit->unit_id ?? $unit->id,
                        'symbol' => $unit->symbol ?? '',
                        'name' => $unit->name ?? '',
                    ] : null,
                ] : null,
            ];
        };

        $formattedAllDistributors = $allDistributors->map($formatDistributor)->values()->all();
        $formattedFavorites = collect($formattedAllDistributors)->filter(fn($d) => $d['is_favorite'])->values()->all();
        $formattedOthers = collect($formattedAllDistributors)->filter(fn($d) => !$d['is_favorite'])->values()->all();

        $formattedProducts = $products->map($formatProduct)->values()->all();
        $formattedAllProducts = $allProducts->map($formatProduct)->values()->all();
        
        $formattedPurchases = $purchasesPaginator ? [
            'data' => $purchasesPaginator->getCollection()->map($formatPurchase)->values()->all(),
            'current_page' => $purchasesPaginator->currentPage(),
            'last_page' => $purchasesPaginator->lastPage(),
            'per_page' => $purchasesPaginator->perPage(),
            'total' => $purchasesPaginator->total(),
            'from' => $purchasesPaginator->firstItem(),
            'to' => $purchasesPaginator->lastItem(),
        ] : [
            'data' => [],
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 15,
            'total' => 0,
            'from' => null,
            'to' => null,
        ];

        $formattedSelectedDistributors = $selectedDistributors->map($formatDistributor)->values()->all();
        $formattedSelectedDistributor = $selectedDistributor ? $formatDistributor($selectedDistributor) : null;

        // Available dates for filter dropdown
        $availableDates = Purchase::select('date')
            ->distinct()
            ->orderBy('date', 'desc')
            ->pluck('date');

        return Inertia::render('SalesPurchase/Index', [
            'favorites' => $formattedFavorites,
            'others' => $formattedOthers,
            'allDistributors' => $formattedAllDistributors,
            'selectedDistributor' => $formattedSelectedDistributor,
            'selectedDistributorIds' => $selectedDistributorIds,
            'selectedDistributors' => $formattedSelectedDistributors,
            'isAllDistributors' => $isAllDistributors,
            'products' => $formattedProducts,
            'allProducts' => $formattedAllProducts,
            'purchases' => $formattedPurchases,
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
            'distributor_id' => 'required|exists:distributors,distributor_id',
            'product_id' => 'required|exists:products,product_id',
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

        $distId = $distributor->distributor_id ?? $distributor->id;
        $prodId = $product->product_id ?? $product->id;

        // Rapid double-click / debounce protection (within 3 seconds)
        $recentDuplicate = Purchase::where('distributor_id', $distId)
            ->where('product_id', $prodId)
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
            'distributor_id' => $distId,
            'product_id' => $prodId,
            'variant_id' => $product->variant_id ?? null,
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
        if (request()->user() && request()->user()->isChecker()) {
            abort(403, "Checkers are not authorized to archive purchase records.");
        }
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
        if (request()->user() && request()->user()->isChecker()) {
            abort(403, "Checkers are not authorized to restore purchase records.");
        }
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
