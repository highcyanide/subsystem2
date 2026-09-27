<?php

namespace App\Http\Controllers;

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
        
        $distributors = Distributor::orderBy('name')->get();
        
        $selectedDistributor = $distributorId 
            ? Distributor::find($distributorId)
            : $distributors->first();

        $products = $selectedDistributor 
            ? Product::where('distributor_id', $selectedDistributor->id)->orderBy('name')->get()
            : collect([]);

        return Inertia::render('Products/Index', [
            'distributors' => $distributors,
            'selectedDistributor' => $selectedDistributor,
            'products' => $products,
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

        return redirect()->back()->with('success', 'Product updated successfully!');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Product removed successfully.');
    }
}
