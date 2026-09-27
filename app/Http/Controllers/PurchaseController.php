<?php

namespace App\Http\Controllers;

use App\Models\Distributor;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $distributorId = $request->query('distributor_id');
        $search = $request->query('search', '');
        $dateFilter = $request->query('date', '');

        $distributorsQuery = Distributor::withCount('products');
        if (!empty($search)) {
            $distributorsQuery->where('name', 'like', "%{$search}%");
        }
        $allDistributors = $distributorsQuery->orderBy('name')->get();

        $favorites = $allDistributors->where('is_favorite', true)->values();
        // If favorites count < 4, auto fill top distributors to guarantee at least 4 cards in favorites section as requested
        if ($favorites->count() < 4 && $allDistributors->count() > 0) {
            $favIds = $favorites->pluck('id')->toArray();
            $needed = 4 - $favorites->count();
            $extraFavs = $allDistributors->whereNotIn('id', $favIds)->take($needed);
            $favorites = $favorites->concat($extraFavs)->values();
        }

        $favIds = $favorites->pluck('id')->toArray();
        $others = $allDistributors->whereNotIn('id', $favIds)->values();

        $selectedDistributor = null;
        $purchases = collect([]);
        $products = collect([]);
        $summary = [
            'total_purchase' => 0,
            'gross_amount' => 0,
            'vat_adjusted_amount' => 0,
            'net_profit' => 0,
            'total_items' => 0,
        ];

        if ($distributorId) {
            $selectedDistributor = Distributor::find($distributorId);
            if ($selectedDistributor) {
                $products = Product::where('distributor_id', $selectedDistributor->id)->orderBy('name')->get();

                $purchasesQuery = Purchase::with(['distributor', 'product'])
                    ->where('distributor_id', $selectedDistributor->id);

                if (!empty($dateFilter)) {
                    $purchasesQuery->whereDate('date', $dateFilter);
                }

                $purchases = $purchasesQuery->orderBy('date', 'desc')->orderBy('id', 'desc')->get();

                $summary['total_purchase'] = $purchases->sum('total_purchase');
                $summary['gross_amount'] = $purchases->sum('gross_amount');
                $summary['vat_adjusted_amount'] = $purchases->sum('vat_adjusted_amount');
                $summary['net_profit'] = $purchases->sum('net_profit');
                $summary['total_items'] = $purchases->sum('quantity');
            }
        }

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
            'products' => $products,
            'purchases' => $purchases,
            'summary' => $summary,
            'availableDates' => $availableDates,
            'filters' => [
                'search' => $search,
                'date' => $dateFilter,
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
        $vatRate = $validated['vat_percentage'] ?? 12.00;
        $quantity = $validated['quantity'];
        $purchasePrice = $validated['purchase_price'];

        $totalPurchase = $quantity * $purchasePrice;
        $dealingPrice = $purchasePrice + $discount;
        $grossAmount = $quantity * $dealingPrice;
        // Formula matching spreadsheet reference (1200 * 0.88 = 1056.00):
        $vatAdjustedAmount = $grossAmount * (1 - ($vatRate / 100));
        $netProfit = $grossAmount - $totalPurchase;

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

        $oldQty = $purchase->quantity;
        $discount = $validated['discount'] ?? 0;
        $vatRate = $validated['vat_percentage'] ?? 12.00;
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

        return redirect()->back()->with('success', 'Purchase record updated.');
    }

    public function destroy(Purchase $purchase)
    {
        // Revert quantity from inventory
        $inventory = Inventory::where('product_id', $purchase->product_id)->first();
        if ($inventory) {
            $inventory->quantity = max(0, $inventory->quantity - $purchase->quantity);
            $inventory->save();
        }

        $purchase->delete();

        return redirect()->back()->with('success', 'Purchase record deleted and inventory adjusted.');
    }
}
