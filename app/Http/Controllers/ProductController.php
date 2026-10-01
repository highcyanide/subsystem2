<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Distributor;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $distributorId = $request->query('distributor_id');
        $search = $request->query('search', '');

        $distributors = Distributor::orderBy('name')->get();

        $selectedDistributor = $distributorId
            ? Distributor::find($distributorId)
            : $distributors->first();

        $productsQuery = $selectedDistributor
            ? Product::where('distributor_id', $selectedDistributor->id)
            : Product::query()->whereRaw('0 = 1'); // empty query

        if (!empty($search) && $selectedDistributor) {
            $productsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $products = $productsQuery->orderBy('name')->get();

        // Get distinct categories for the dropdown
        $categories = Product::select('category')->distinct()->orderBy('category')->pluck('category');

        return Inertia::render('Products/Index', [
            'distributors' => $distributors,
            'selectedDistributor' => $selectedDistributor,
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'distributor_id' => 'required|exists:distributors,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'category' => 'required|string|max:100',
            'purchase_price' => 'required|numeric|min:0',
            'default_discount' => 'nullable|numeric|min:0',
            'default_dealing_price' => 'nullable|numeric|min:0',
        ]);

        if (empty($validated['default_discount'])) {
            $validated['default_discount'] = 0;
        }

        if (empty($validated['default_dealing_price'])) {
            $validated['default_dealing_price'] = $validated['purchase_price'] + $validated['default_discount'];
        }

        $distributor = Distributor::findOrFail($validated['distributor_id']);

        if (empty($validated['sku'])) {
            $validated['sku'] = strtoupper(substr($distributor->name, 0, 3)) . '-' . rand(100, 999);
        }

        $product = Product::create($validated);

        // Ensure inventory record exists in Subsystem 1 Module 1
        Inventory::firstOrCreate(
            ['product_id' => $product->id],
            [
                'sku' => $product->sku,
                'category' => $product->category,
                'distributor_name' => $distributor->name,
                'product_name' => $product->name,
                'quantity' => 0,
                'purchase_price' => $product->purchase_price,
                'selling_price' => $product->default_dealing_price,
            ]
        );

        ActivityLog::log('created', 'Product', $product->id,
            "Added product: {$product->name} (Distributor: {$distributor->name})",
            null,
            $validated
        );

        \App\Models\Notification::notifyAll(
            'product_added',
            'New Product Added',
            "Product '{$product->name}' was added under {$distributor->name}.",
            '/products?distributor_id=' . $distributor->id,
            "SKU: {$product->sku} | Purchase Price: ₱{$product->purchase_price} | Dealing Price: ₱{$product->default_dealing_price}"
        );

        return redirect()->back()->with('success', 'Product created successfully!');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'category' => 'required|string|max:100',
            'purchase_price' => 'required|numeric|min:0',
            'default_discount' => 'nullable|numeric|min:0',
            'default_dealing_price' => 'nullable|numeric|min:0',
        ]);

        $oldValues = $product->toArray();
        $product->update($validated);

        // Sync to inventory table
        $distributor = $product->distributor;
        Inventory::updateOrCreate(
            ['product_id' => $product->id],
            [
                'sku' => $product->sku,
                'category' => $product->category,
                'distributor_name' => $distributor ? $distributor->name : 'Unknown',
                'product_name' => $product->name,
                'purchase_price' => $product->purchase_price,
                'selling_price' => $product->default_dealing_price,
            ]
        );

        ActivityLog::log('updated', 'Product', $product->id,
            "Updated product: {$product->name}",
            $oldValues,
            $validated
        );

        \App\Models\Notification::notifyAll(
            'product_updated',
            'Product Price/Details Updated',
            "Product '{$product->name}' has been updated.",
            '/products?distributor_id=' . $product->distributor_id,
            "Cost: ₱{$product->purchase_price} | Dealing: ₱{$product->default_dealing_price}"
        );

        return redirect()->back()->with('success', 'Product updated successfully!');
    }

    public function destroy(Product $product)
    {
        $name = $product->name;
        $distId = $product->distributor_id;
        $oldValues = $product->toArray();

        $product->delete();

        ActivityLog::log('deleted', 'Product', null,
            "Deleted product: {$name}",
            $oldValues,
            null
        );

        \App\Models\Notification::notifyAll(
            'product_deleted',
            'Product Removed',
            "Product '{$name}' was deleted from the catalog.",
            '/products?distributor_id=' . $distId
        );

        return redirect()->back()->with('success', 'Product removed successfully.');
    }
}
