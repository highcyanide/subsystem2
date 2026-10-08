<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Distributor;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductDistributor;
use App\Models\Packaging;
use App\Models\Flavor;
use App\Models\VariantType;
use App\Models\StockMovement;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $showArchived = $request->boolean('archived', false);
        $search = $request->query('search', '');

        $distributors = Distributor::orderBy('name')->get();

        // Support multiple distributor_ids (e.g. "1,4" or array) as well as single distributor_id
        $rawDistIds = $request->input('distributor_ids', $request->query('distributor_id'));
        $distributorIds = is_array($rawDistIds)
            ? $rawDistIds
            : (is_string($rawDistIds) && strlen($rawDistIds) > 0 ? explode(',', $rawDistIds) : []);
        $distributorIds = array_values(array_filter(array_map('intval', $distributorIds)));

        $selectedDistributor = count($distributorIds) === 1 ? Distributor::find($distributorIds[0]) : null;
        $selectedDistributors = !empty($distributorIds) ? Distributor::whereIn('distributor_id', $distributorIds)->get() : collect();

        $productsQuery = Product::query();
        if ($showArchived) {
            $productsQuery->onlyTrashed();
        }

        if (!empty($distributorIds)) {
            $productsQuery->whereHas('distributors', function ($d) use ($distributorIds) {
                $d->whereIn('distributors.distributor_id', $distributorIds);
            });
        }

        $archivedCount = !empty($distributorIds)
            ? Product::onlyTrashed()->whereHas('distributors', function ($d) use ($distributorIds) {
                $d->whereIn('distributors.distributor_id', $distributorIds);
            })->count()
            : Product::onlyTrashed()->count();

        if (!empty($search)) {
            $productsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('variants', function ($vq) use ($search) {
                      $vq->where('sku', 'like', "%{$search}%")
                         ->orWhere('variant_name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('categoryRelation', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $products = $productsQuery->with([
            'categoryRelation',
            'variants.unit',
            'variants.flavor',
            'variants.size',
            'variants.packagingRelation',
            'variants.distributors',
            'distributors'
        ])->orderBy('name')->get();

        $categories = Category::where('is_active', true)->orderBy('name')->pluck('name');
        $units = Unit::where('is_active', true)->orderBy('name')->get();
        $packagings = \App\Models\Packaging::orderBy('name')->get();
        $variantsList = \App\Models\Flavor::orderBy('name')->get();

        return Inertia::render('Products/Index', [
            'distributors' => $distributors,
            'selectedDistributor' => $selectedDistributor,
            'selectedDistributors' => $selectedDistributors,
            'selectedDistributorIds' => $distributorIds,
            'products' => $products,
            'archivedCount' => $archivedCount,
            'showArchived' => $showArchived,
            'categories' => $categories,
            'units' => $units,
            'packagings' => $packagings,
            'variantsList' => $variantsList,
            'flavors' => $variantsList,
            'filters' => [
                'search' => $search,
                'archived' => $showArchived,
                'distributor_id' => $selectedDistributor ? $selectedDistributor->id : null,
            ],
        ]);
    }

    public function create()
    {
        $distributors = Distributor::orderBy('name')->get();
        $categories = Category::where('is_active', true)->orderBy('name')->pluck('name');
        $units = Unit::where('is_active', true)->orderBy('name')->get();
        $packagings = \App\Models\Packaging::orderBy('name')->get();
        $variantsList = \App\Models\Flavor::orderBy('name')->get();

        $existingProducts = Product::select(['product_id', 'name', 'category_id'])
            ->with([
                'unit',
                'distributors:distributors.distributor_id,name',
                'categoryRelation:category_id,name'
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render('Products/Create', [
            'distributors' => $distributors,
            'categories' => $categories,
            'units' => $units,
            'packagings' => $packagings,
            'variantsList' => $variantsList,
            'flavors' => $variantsList,
            'existingProducts' => $existingProducts,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user() && $request->user()->isChecker()) {
            abort(403, 'Checkers are not authorized to add products.');
        }

        // Auto-sanitize image if uploaded
        if (!empty($request->image)) {
            $request->merge(['image' => $this->processProductImage($request->image)]);
        }

        $validated = $request->validate([
            'distributor_id' => 'nullable|exists:distributors,distributor_id',
            'distributors' => 'nullable|array',
            'distributors.*.distributor_id' => 'required|exists:distributors,distributor_id',
            'distributors.*.purchase_price' => 'nullable|numeric|min:0',
            'distributors.*.default_discount' => 'nullable|numeric|min:0',
            'distributors.*.default_dealing_price' => 'nullable|numeric|min:0',
            'distributors.*.is_primary' => 'nullable|boolean',
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:100',
            'variant_id' => 'nullable',
            'variant_type' => 'nullable|string|max:100',
            'flavor_id' => 'nullable|exists:flavors,flavor_id',
            'flavor_type' => 'nullable|string|max:100',
            'custom_variant' => 'nullable|string|max:100',
            'size_value' => 'nullable|string|max:50',
            'unit_id' => 'nullable|exists:units,unit_id',
            'unit_name' => 'nullable|string|max:50',
            'unit_symbol' => 'nullable|string|max:20',
            'custom_unit_symbol' => 'nullable|string|max:20',
            'custom_unit_name' => 'nullable|string|max:50',
            'packaging' => 'nullable|string|max:100',
            'packaging_id' => 'nullable|exists:packagings,packaging_id',
            'custom_packaging' => 'nullable|string|max:100',
            'image' => 'nullable|string',
            'sku' => 'nullable|string|max:100',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'purchase_price' => 'nullable|numeric|min:0',
            'default_discount' => 'nullable|numeric|min:0',
            'default_dealing_price' => 'nullable|numeric|min:0',
            'opening_quantity' => 'nullable|integer|min:0',
            'reorder_level' => 'nullable|integer|min:0',
        ]);

        // Build normalized distributor assignments
        $distributorRows = [];
        if (!empty($validated['distributors']) && is_array($validated['distributors'])) {
            foreach ($validated['distributors'] as $dItem) {
                $cost = (float) ($dItem['purchase_price'] ?? 0);
                $disc = (float) ($dItem['default_discount'] ?? 0);
                $deal = (float) ($dItem['default_dealing_price'] ?? ($cost + $disc));
                $distributorRows[(int) $dItem['distributor_id']] = [
                    'purchase_price' => $cost,
                    'default_discount' => $disc,
                    'default_dealing_price' => $deal,
                    'is_primary' => !empty($dItem['is_primary']),
                ];
            }
        } elseif (!empty($validated['distributor_id'])) {
            $cost = (float) ($validated['purchase_price'] ?? 0);
            $disc = (float) ($validated['default_discount'] ?? 0);
            $deal = (float) ($validated['default_dealing_price'] ?? ($cost + $disc));
            $distributorRows[(int) $validated['distributor_id']] = [
                'purchase_price' => $cost,
                'default_discount' => $disc,
                'default_dealing_price' => $deal,
                'is_primary' => true,
            ];
        }

        // Determine primary distributor if provided
        $primaryDistId = null;
        if (!empty($distributorRows)) {
            $primaryDistId = array_key_first($distributorRows);
            foreach ($distributorRows as $id => $dData) {
                if (!empty($dData['is_primary'])) {
                    $primaryDistId = $id;
                    break;
                }
            }
            $primaryData = $distributorRows[$primaryDistId];
            $validated['distributor_id'] = $primaryDistId;
            $validated['purchase_price'] = $validated['purchase_price'] ?? $primaryData['purchase_price'];
            $validated['default_discount'] = $validated['default_discount'] ?? $primaryData['default_discount'];
            $validated['default_dealing_price'] = $validated['default_dealing_price'] ?? $primaryData['default_dealing_price'];
        } else {
            $validated['purchase_price'] = $validated['purchase_price'] ?? 0;
            $validated['default_discount'] = $validated['default_discount'] ?? 0;
            $validated['default_dealing_price'] = $validated['default_dealing_price'] ?? 0;
        }

        // Store uploaded image as a static WebP file to permanently prevent max_allowed_packet errors
        $storedImage = $this->storeProductImage($validated['image'] ?? null);
        $validated['image'] = $storedImage;

        // Enforce UPPERCASE across all catalog inputs
        $cleanName = mb_strtoupper(trim($validated['name']));
        $validated['name'] = $cleanName;

        // Normalize category to category_id (UPPERCASE)
        $categoryId = 1;
        if (!empty($validated['category'])) {
            $catName = mb_strtoupper(trim($validated['category']));
            $catModel = Category::firstOrCreate(
                ['name' => $catName],
                ['is_active' => true]
            );
            $categoryId = $catModel->category_id;
        }

        // Resolve packaging_id (UPPERCASE)
        $packagingId = $validated['packaging_id'] ?? null;
        $rawPackaging = !empty($validated['custom_packaging']) 
            ? mb_strtoupper(trim($validated['custom_packaging'])) 
            : (!empty($validated['packaging']) ? mb_strtoupper(trim($validated['packaging'])) : null);
        if (!$packagingId && !empty($rawPackaging)) {
            $pkg = \App\Models\Packaging::firstOrCreate(['name' => $rawPackaging]);
            $packagingId = $pkg->packaging_id;
        }

        // Resolve unit_id (UPPERCASE)
        $unitId = $validated['unit_id'] ?? null;
        $rawUnitSymbol = mb_strtoupper(trim($validated['custom_unit_symbol'] ?? $validated['unit_symbol'] ?? ''));
        $rawUnitName = mb_strtoupper(trim($validated['custom_unit_name'] ?? $validated['unit_name'] ?? ''));
        if (!$unitId && (!empty($rawUnitSymbol) || !empty($rawUnitName))) {
            $sym = $rawUnitSymbol ?: $rawUnitName;
            $uName = $rawUnitName ?: $sym;
            $unitModel = Unit::firstOrCreate(
                ['symbol' => $sym],
                [
                    'name' => $uName,
                    'category' => 'Custom',
                    'is_active' => true,
                ]
            );
            $unitId = $unitModel->unit_id;
        }

        // Resolve variant/flavor (UPPERCASE)
        $flavorId = $validated['flavor_id'] ?? null;
        $rawVariantName = mb_strtoupper(trim($validated['variant_type'] ?? $validated['custom_variant'] ?? $validated['flavor_type'] ?? ''));
        if (!$flavorId && !empty($rawVariantName)) {
            $flv = \App\Models\Flavor::firstOrCreate(['name' => $rawVariantName]);
            $flavorId = $flv->flavor_id;
        }
        $flavorName = $flavorId ? \App\Models\Flavor::find($flavorId)?->name : $rawVariantName;

        // Check if master product already exists (by name, case-insensitive)
        $product = Product::whereRaw('LOWER(TRIM(name)) = ?', [strtolower($cleanName)])->first();

        if (!$product) {
            $product = Product::create([
                'category_id' => $categoryId,
                'name' => $cleanName,
                'description' => $validated['description'] ?? null,
                'image' => $storedImage,
            ]);
        } elseif (!empty($storedImage) && empty($product->image)) {
            $product->update(['image' => $storedImage]);
        }

        // Auto-generate standardized SKU if blank or enforce standard
        $distributor = $primaryDistId ? Distributor::find($primaryDistId) : null;
        $pkgObj = $packagingId ? \App\Models\Packaging::find($packagingId) : null;
        $pkgName = $pkgObj ? $pkgObj->name : ($rawPackaging ?? 'EA');
        $unitObj = $unitId ? Unit::find($unitId) : null;
        $unitSymbol = $unitObj ? $unitObj->symbol : ($rawUnitSymbol ?? '');

        $brandCode = mb_strtoupper($validated['brand'] ?? ($distributor?->name ?? $product->name ?? 'WNZ'));
        $generatedSku = Product::generateSku(
            $brandCode,
            $flavorName ?: 'REG',
            $validated['size_value'] ?? '',
            $unitSymbol,
            $pkgName
        );
        $finalSku = mb_strtoupper(!empty($validated['sku']) ? $validated['sku'] : $generatedSku);

        // Construct descriptive variant_name (UPPERCASE)
        $nameParts = [$product->name];
        if (!empty($flavorName)) $nameParts[] = trim($flavorName);
        $sizeStr = ($validated['size_value'] ?? '') . $unitSymbol;
        if ($sizeStr !== '') $nameParts[] = $sizeStr;
        if ($pkgName) $nameParts[] = '(' . $pkgName . ')';
        $variantName = mb_strtoupper(implode(' ', $nameParts));

        // Create or update ProductVariant
        $variant = ProductVariant::create([
            'product_id' => $product->product_id,
            'variant_name' => $variantName,
            'variant_type_id' => $flavorId,
            'flavor_id' => $flavorId,
            'size_value' => $validated['size_value'] ?? null,
            'unit_id' => $unitId,
            'packaging_id' => $packagingId,
            'sku' => $finalSku,
            'image' => $storedImage,
            'purchase_price' => $validated['purchase_price'] ?? 0,
            'default_discount' => $validated['default_discount'] ?? 0,
            'default_dealing_price' => $validated['default_dealing_price'] ?? 0,
            'description' => $validated['description'] ?? null,
        ]);

        // Attach distributors to product_distributors pivot with both product_id and variant_id
        if (!empty($distributorRows)) {
            foreach ($distributorRows as $dId => $pData) {
                \App\Models\ProductDistributor::updateOrCreate(
                    [
                        'product_id' => $product->product_id,
                        'variant_id' => $variant->variant_id,
                        'distributor_id' => $dId,
                    ],
                    [
                        'purchase_price' => $pData['purchase_price'],
                        'default_discount' => $pData['default_discount'],
                        'default_dealing_price' => $pData['default_dealing_price'],
                        'is_primary' => $pData['is_primary'],
                    ]
                );
            }
        }

        // Create opening inventory for this variant
        $openingQty = (int) ($validated['opening_quantity'] ?? 0);
        $reorderLevel = (int) ($validated['reorder_level'] ?? 10);

        $inventory = Inventory::firstOrCreate(
            [
                'product_id' => $product->product_id,
                'variant_id' => $variant->variant_id,
            ],
            [
                'quantity' => $openingQty,
                'reorder_level' => $reorderLevel,
            ]
        );

        if ($openingQty > 0) {
            StockMovement::create([
                'product_id' => $product->product_id,
                'variant_id' => $variant->variant_id,
                'user_id' => auth()->id(),
                'type' => 'in',
                'quantity' => $openingQty,
                'balance_before' => 0,
                'balance_after' => $openingQty,
                'reason' => 'Opening Stock',
                'remarks' => 'Initial inventory recorded on product master creation'
            ]);
        }

        ActivityLog::log('created', 'Product', $product->product_id,
            "Added product variant: {$variantName} (SKU: {$variant->sku}, Opening Stock: {$openingQty})",
            null,
            $variant->toArray()
        );

        \App\Models\Notification::notifyAll(
            'product_added',
            'New Product Variant Added',
            "Product Variant '{$variantName}' was added to catalog.",
            '/products?search=' . urlencode($product->name),
            "SKU: {$variant->sku} | Primary: {$distributor?->name}"
        );

        return redirect()->route('products.index', ['product' => $product->name])
            ->with('success', "Master Product '{$product->name}' & Variant '{$variantName}' created successfully with SKU {$variant->sku}!");
    }

    public function update(Request $request, Product $product)
    {
        if ($request->user() && $request->user()->isChecker()) {
            abort(403, 'Checkers are not authorized to edit products.');
        }

        // Quick image upload handler (e.g. from hover upload or change picture)
        if ($request->has('image') && !$request->has('name')) {
            $validated = $request->validate([
                'image' => 'nullable|string',
                'variant_id' => 'nullable|exists:product_variants,variant_id',
            ]);
            $img = $this->processProductImage($validated['image'] ?? null);
            if (!empty($validated['variant_id'])) {
                $variant = \App\Models\ProductVariant::find($validated['variant_id']);
                if ($variant) {
                    $variant->update(['image' => $img]);
                    ActivityLog::log('updated', 'ProductVariant', $variant->variant_id,
                        "Updated variant photo for {$variant->variant_name}"
                    );
                    return redirect()->back()->with('success', 'Variant picture updated successfully!');
                }
            }
            $product->update(['image' => $img]);

            ActivityLog::log('updated', 'Product', $product->product_id,
                "Updated product photo for {$product->name}"
            );

            return redirect()->back()->with('success', 'Product picture updated successfully!');
        }

        $validated = $request->validate([
            'distributor_id' => 'nullable|exists:distributors,distributor_id',
            'distributors' => 'nullable|array',
            'distributors.*.distributor_id' => 'required|exists:distributors,distributor_id',
            'distributors.*.purchase_price' => 'nullable|numeric|min:0',
            'distributors.*.default_discount' => 'nullable|numeric|min:0',
            'distributors.*.default_dealing_price' => 'nullable|numeric|min:0',
            'distributors.*.is_primary' => 'nullable|boolean',
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:100',
            'variant_type' => 'nullable|string|max:100',
            'flavor_type' => 'nullable|string|max:100',
            'custom_variant' => 'nullable|string|max:100',
            'size_value' => 'nullable|string|max:50',
            'unit_id' => 'nullable|exists:units,unit_id',
            'custom_unit_symbol' => 'nullable|string|max:20',
            'custom_unit_name' => 'nullable|string|max:50',
            'unit_symbol' => 'nullable|string|max:20',
            'unit_name' => 'nullable|string|max:50',
            'packaging' => 'nullable|string|max:100',
            'packaging_id' => 'nullable|exists:packagings,packaging_id',
            'custom_packaging' => 'nullable|string|max:100',
            'variant_id' => 'nullable|exists:product_variants,variant_id',
            'sku' => 'nullable|string|max:100',
            'image' => 'nullable|string',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'purchase_price' => 'nullable|numeric|min:0',
            'default_discount' => 'nullable|numeric|min:0',
            'default_dealing_price' => 'nullable|numeric|min:0',
        ]);

        // Build normalized distributor assignments
        $distributorRows = [];
        if (!empty($validated['distributors']) && is_array($validated['distributors'])) {
            foreach ($validated['distributors'] as $dItem) {
                $cost = (float) ($dItem['purchase_price'] ?? 0);
                $disc = (float) ($dItem['default_discount'] ?? 0);
                $deal = (float) ($dItem['default_dealing_price'] ?? ($cost + $disc));
                $distributorRows[(int) $dItem['distributor_id']] = [
                    'purchase_price' => $cost,
                    'default_discount' => $disc,
                    'default_dealing_price' => $deal,
                    'is_primary' => !empty($dItem['is_primary']),
                ];
            }
        } elseif (!empty($validated['distributor_id'])) {
            $cost = (float) ($validated['purchase_price'] ?? 0);
            $disc = (float) ($validated['default_discount'] ?? 0);
            $deal = (float) ($validated['default_dealing_price'] ?? ($cost + $disc));
            $distributorRows[(int) $validated['distributor_id']] = [
                'purchase_price' => $cost,
                'default_discount' => $disc,
                'default_dealing_price' => $deal,
                'is_primary' => true,
            ];
        }

        // Determine primary distributor and sync main pricing
        if (!empty($distributorRows)) {
            $primaryDistId = array_key_first($distributorRows);
            foreach ($distributorRows as $id => $dData) {
                if (!empty($dData['is_primary'])) {
                    $primaryDistId = $id;
                    break;
                }
            }
            foreach ($distributorRows as $id => &$dData) {
                $dData['is_primary'] = ($id === $primaryDistId);
            }
            unset($dData);

            $primaryData = $distributorRows[$primaryDistId];
            $validated['distributor_id'] = $primaryDistId;
            $validated['purchase_price'] = $primaryData['purchase_price'];
            $validated['default_discount'] = $primaryData['default_discount'];
            $validated['default_dealing_price'] = $primaryData['default_dealing_price'];
        } else {
            $validated['purchase_price'] = (float) ($validated['purchase_price'] ?? 0);
            $validated['default_discount'] = (float) ($validated['default_discount'] ?? 0);
            $validated['default_dealing_price'] = (float) ($validated['default_dealing_price'] ?? ($validated['purchase_price'] + $validated['default_discount']));
        }

        // Normalize Category (UPPERCASE)
        if (!empty($validated['category'])) {
            $catName = mb_strtoupper(trim($validated['category']));
            $catModel = Category::firstOrCreate(
                ['name' => $catName],
                ['is_active' => true]
            );
            $product->update(['category_id' => $catModel->category_id]);
        }

        // Resolve packaging_id (UPPERCASE)
        $packagingId = $validated['packaging_id'] ?? null;
        $rawPackaging = !empty($validated['custom_packaging']) 
            ? mb_strtoupper(trim($validated['custom_packaging'])) 
            : (!empty($validated['packaging']) ? mb_strtoupper(trim($validated['packaging'])) : null);
        if (!$packagingId && !empty($rawPackaging)) {
            $pkg = \App\Models\Packaging::firstOrCreate(['name' => $rawPackaging]);
            $packagingId = $pkg->packaging_id;
        }

        // Resolve unit_id (UPPERCASE)
        $unitId = $validated['unit_id'] ?? null;
        $rawUnitSymbol = mb_strtoupper(trim($validated['custom_unit_symbol'] ?? $validated['unit_symbol'] ?? ''));
        $rawUnitName = mb_strtoupper(trim($validated['custom_unit_name'] ?? $validated['unit_name'] ?? ''));
        if (!$unitId && (!empty($rawUnitSymbol) || !empty($rawUnitName))) {
            $sym = $rawUnitSymbol ?: $rawUnitName;
            $uName = $rawUnitName ?: $sym;
            $unitModel = Unit::firstOrCreate(
                ['symbol' => $sym],
                [
                    'name' => $uName,
                    'category' => 'Custom',
                    'is_active' => true,
                ]
            );
            $unitId = $unitModel->unit_id;
        }

        // Resolve Variant (UPPERCASE)
        $variantLookupId = null;
        $rawVariantName = mb_strtoupper(trim($validated['variant_type'] ?? $validated['custom_variant'] ?? $validated['flavor_type'] ?? ''));
        if (!empty($rawVariantName)) {
            $flv = \App\Models\Flavor::firstOrCreate(['name' => $rawVariantName]);
            $variantLookupId = $flv->flavor_id;
        }

        // Find and update the specific variant
        $variant = null;
        if (!empty($validated['variant_id'])) {
            $variant = \App\Models\ProductVariant::find($validated['variant_id']);
        } elseif ($product->variants()->count() === 1) {
            $variant = $product->variants()->first();
        }

        // Auto-Structure & Adapt fixed SKU (SKU can't be manually edited, adapts dynamically)
        $distributor = !empty($validated['distributor_id']) ? Distributor::find($validated['distributor_id']) : null;
        $brandCode = mb_strtoupper($validated['brand'] ?? ($distributor?->name ?? $product->name ?? 'WNZ'));
        $pkgObj = $packagingId ? \App\Models\Packaging::find($packagingId) : null;
        $pkgName = $pkgObj ? $pkgObj->name : ($rawPackaging ?? 'EA');
        $unitObj = $unitId ? Unit::find($unitId) : null;
        $unitSymbol = $unitObj ? $unitObj->symbol : ($rawUnitSymbol ?? '');

        $adaptedSku = Product::generateSku(
            $brandCode,
            $rawVariantName ?: 'REG',
            $validated['size_value'] ?? '',
            $unitSymbol,
            $pkgName,
            $variant?->variant_id
        );
        $adaptedSku = mb_strtoupper($adaptedSku);

        $oldValues = $product->toArray();
        if (array_key_exists('image', $validated) && !empty($validated['image'])) {
            $validated['image'] = $this->storeProductImage($validated['image']);
        }

        $cleanName = mb_strtoupper(trim($validated['name']));
        $validated['name'] = $cleanName;

        $productUpdates = [
            'name' => $cleanName,
            'description' => $validated['description'] ?? null,
        ];
        if (array_key_exists('image', $validated) && empty($validated['variant_id'])) {
            $productUpdates['image'] = $validated['image'];
        }
        $product->update($productUpdates);

        if ($variant) {
            $variantUpdates = [
                'sku' => $adaptedSku,
                'purchase_price' => $validated['purchase_price'],
                'default_discount' => $validated['default_discount'],
                'default_dealing_price' => $validated['default_dealing_price'],
                'size_value' => $validated['size_value'] ?? null,
                'unit_id' => $unitId,
                'packaging_id' => $packagingId,
            ];

            if ($variantLookupId) {
                $variantUpdates['flavor_id'] = $variantLookupId;
                $variantUpdates['variant_type_id'] = $variantLookupId;
            }

            if (array_key_exists('image', $validated)) {
                $variantUpdates['image'] = $validated['image'];
            }

            $variant->update($variantUpdates);

            // Recompute variant_name: e.g. Coca-Cola Cola 1.5L (12-Pack PET) in UPPERCASE
            $variant->load(['product', 'flavor', 'unit', 'packagingRelation']);
            $nameParts = [$variant->product?->name ?? $product->name];
            if ($variant->flavor?->name) $nameParts[] = $variant->flavor->name;
            $sizeStr = ($variant->size_value ?? '') . ($variant->unit?->symbol ?? '');
            if ($sizeStr !== '') $nameParts[] = $sizeStr;
            if ($variant->packagingRelation?->name) $nameParts[] = '(' . $variant->packagingRelation->name . ')';
            $variant->update(['variant_name' => mb_strtoupper(implode(' ', $nameParts))]);
        }

        // Update product_distributors pivot for this specific variant and distributors
        if ($variant && !empty($distributorRows)) {
            // Delete product_distributors entries for this variant that were removed
            \App\Models\ProductDistributor::where('variant_id', $variant->variant_id)
                ->whereNotIn('distributor_id', array_keys($distributorRows))
                ->delete();

            foreach ($distributorRows as $dId => $pData) {
                \App\Models\ProductDistributor::updateOrCreate(
                    [
                        'product_id' => $product->product_id,
                        'variant_id' => $variant->variant_id,
                        'distributor_id' => $dId,
                    ],
                    [
                        'purchase_price' => $pData['purchase_price'],
                        'default_discount' => $pData['default_discount'],
                        'default_dealing_price' => $pData['default_dealing_price'],
                        'is_primary' => $pData['is_primary'],
                    ]
                );
            }
        } elseif ($variant && array_key_exists('distributors', $validated) && empty($distributorRows)) {
            // All distributors were removed for this variant
            \App\Models\ProductDistributor::where('variant_id', $variant->variant_id)->delete();
        } elseif (!empty($validated['distributor_id'])) {
            \App\Models\ProductDistributor::updateOrCreate(
                [
                    'product_id' => $product->product_id,
                    'variant_id' => $variant?->variant_id,
                    'distributor_id' => $validated['distributor_id'],
                ],
                [
                    'purchase_price' => $validated['purchase_price'],
                    'default_discount' => $validated['default_discount'],
                    'default_dealing_price' => $validated['default_dealing_price'],
                    'is_primary' => true,
                ]
            );
        }

        // Keep inventory timestamp in sync
        $inventory = Inventory::where('product_id', $product->id)->first();
        if ($inventory) {
            $inventory->touch();
        }

        ActivityLog::log('updated', 'Product', $product->id,
            "Updated product: {$product->name} (SKU: {$adaptedSku})",
            $oldValues,
            $product->toArray()
        );

        \App\Models\Notification::notifyAll(
            'product_updated',
            'Product Updated',
            "Product '{$product->name}' details were updated (SKU: {$adaptedSku}).",
            '/products?distributor_id=' . ($product->distributors->first()?->id ?? 1),
            "Cost: ₱{$product->purchase_price} | Dealing: ₱{$product->default_dealing_price}"
        );

        return redirect()->back()->with('success', "Product updated successfully with adapted SKU {$adaptedSku}!");
    }

    public function destroy(Product $product)
    {
        if (request()->user() && request()->user()->isChecker()) {
            abort(403, "Checkers are not authorized to archive products.");
        }

        $name = $product->name;
        $distId = $product->distributors->first()?->id ?? 1;
        $oldValues = $product->toArray();

        $product->delete();

        // Also soft-delete inventory entry if present
        Inventory::where('product_id', $product->id)->delete();

        ActivityLog::log('deleted', 'Product', null,
            "Archived product: {$name}",
            $oldValues,
            null
        );

        \App\Models\Notification::notifyAll(
            'product_deleted',
            'Product Moved to Archive',
            "Product '{$name}' was archived.",
            '/products?distributor_id=' . $distId . '&archived=1'
        );

        return redirect()->back()->with('success', "Product '{$name}' moved to archive.");
    }

    public function restore($id)
    {
        if (request()->user() && request()->user()->isChecker()) {
            abort(403, "Checkers are not authorized to restore products.");
        }

        $product = Product::onlyTrashed()->find($id)
            ?? Product::onlyTrashed()->whereHas('variants', function ($q) use ($id) {
                $q->where('variant_id', $id);
            })->first();

        if (!$product) {
            abort(404, "Product not found or not in archive.");
        }

        $product->restore();

        // Also restore inventory entry if present
        Inventory::onlyTrashed()->where('product_id', $product->id)->restore();

        ActivityLog::log('updated', 'Product', $product->id,
            "Restored archived product: {$product->name}"
        );

        \App\Models\Notification::notifyAll(
            'product_restored',
            'Product Restored',
            "Product '{$product->name}' was restored from archive.",
            '/products?distributor_id=' . ($product->distributors->first()?->id ?? 1)
        );

        return redirect()->back()->with('success', "Product '{$product->name}' restored successfully!");
    }

    /**
     * Store uploaded product image (base64 data URI) as an optimized static WebP file on disk.
     * Prevents database bloating, packet size failures (max_allowed_packet), and memory issues.
     */
    private function storeProductImage(?string $imageData): ?string
    {
        if (!$imageData) {
            return null;
        }

        // If it's already an uploaded file path or external URL, keep as is
        if (!str_starts_with($imageData, 'data:image')) {
            return $imageData;
        }

        try {
            @ini_set('memory_limit', '512M');
            $uploadDir = public_path('uploads/products');
            if (!file_exists($uploadDir)) {
                @mkdir($uploadDir, 0777, true);
            }

            // Process image to WebP with transparent background and max 600px
            $processedDataUri = $this->processProductImage($imageData);
            if ($processedDataUri && str_contains($processedDataUri, ',')) {
                $parts = explode(',', $processedDataUri, 2);
                $rawBinary = base64_decode($parts[1]);
            } else {
                $parts = explode(',', $imageData, 2);
                $rawBinary = base64_decode($parts[1] ?? '');
            }

            if ($rawBinary) {
                $filename = 'prod_' . uniqid() . '_' . time() . '.webp';
                $filePath = $uploadDir . DIRECTORY_SEPARATOR . $filename;
                file_put_contents($filePath, $rawBinary);
                return '/uploads/products/' . $filename;
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to save product image to file: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Automatic white-background elimination for uploaded product pictures.
     * Uses boundary flood-fill transparency so images float cleanly in dark mode.
     */
    private function processProductImage(?string $base64Data, int $tolerance = 32): ?string
    {
        if (!$base64Data || !str_contains($base64Data, ',')) {
            return $base64Data;
        }

        try {
            @ini_set('memory_limit', '512M');
            $parts = explode(',', $base64Data, 2);
            $raw = @base64_decode($parts[1]);
            if (!$raw) return $base64Data;

            $img = @imagecreatefromstring($raw);
            if (!$img) return $base64Data;

            $w = imagesx($img);
            $h = imagesy($img);

            // Scale down if image is large to prevent memory exhaustion
            $maxDim = 600;
            if ($w > $maxDim || $h > $maxDim) {
                $scaleRatio = min($maxDim / $w, $maxDim / $h);
                $newW = max(1, (int) round($w * $scaleRatio));
                $newH = max(1, (int) round($h * $scaleRatio));
                $scaled = imagescale($img, $newW, $newH);
                if ($scaled) {
                    imagedestroy($img);
                    $img = $scaled;
                    $w = $newW;
                    $h = $newH;
                }
            }

            $out = imagecreatetruecolor($w, $h);
            imagealphablending($out, false);
            imagesavealpha($out, true);
            $transparent = imagecolorallocatealpha($out, 0, 0, 0, 127);
            imagefill($out, 0, 0, $transparent);
            imagecopy($out, $img, 0, 0, 0, 0, $w, $h);

            $isNearWhite = function($c) use ($tolerance) {
                return ($c['red'] >= (255 - $tolerance)) &&
                       ($c['green'] >= (255 - $tolerance)) &&
                       ($c['blue'] >= (255 - $tolerance)) &&
                       ($c['alpha'] == 0);
            };

            $tl = imagecolorsforindex($out, imagecolorat($out, 0, 0));
            $tr = imagecolorsforindex($out, imagecolorat($out, $w-1, 0));
            $bl = imagecolorsforindex($out, imagecolorat($out, 0, $h-1));
            $br = imagecolorsforindex($out, imagecolorat($out, $w-1, $h-1));

            if (!$isNearWhite($tl) && !$isNearWhite($tr) && !$isNearWhite($bl) && !$isNearWhite($br)) {
                imagedestroy($img);
                imagedestroy($out);
                return $base64Data;
            }

            // Use a compact byte buffer for visited pixels (1 byte per pixel instead of PHP array overhead)
            $visited = str_repeat("\0", $w * $h);
            $queue = new \SplQueue();

            for ($x = 0; $x < $w; $x++) {
                $cTop = imagecolorsforindex($out, imagecolorat($out, $x, 0));
                if ($isNearWhite($cTop)) {
                    $queue->enqueue([$x, 0]);
                    $visited[0 * $w + $x] = "\1";
                }
                $cBot = imagecolorsforindex($out, imagecolorat($out, $x, $h - 1));
                if ($isNearWhite($cBot)) {
                    $queue->enqueue([$x, $h - 1]);
                    $visited[($h - 1) * $w + $x] = "\1";
                }
            }
            for ($y = 0; $y < $h; $y++) {
                $cLeft = imagecolorsforindex($out, imagecolorat($out, 0, $y));
                if ($isNearWhite($cLeft) && $visited[$y * $w + 0] === "\0") {
                    $queue->enqueue([0, $y]);
                    $visited[$y * $w + 0] = "\1";
                }
                $cRight = imagecolorsforindex($out, imagecolorat($out, $w - 1, $y));
                if ($isNearWhite($cRight) && $visited[$y * $w + ($w - 1)] === "\0") {
                    $queue->enqueue([$w - 1, $y]);
                    $visited[$y * $w + ($w - 1)] = "\1";
                }
            }

            $dirs = [[1,0], [-1,0], [0,1], [0,-1]];
            while (!$queue->isEmpty()) {
                [$cx, $cy] = $queue->dequeue();
                imagesetpixel($out, $cx, $cy, $transparent);

                foreach ($dirs as [$dx, $dy]) {
                    $nx = $cx + $dx;
                    $ny = $cy + $dy;
                    if ($nx >= 0 && $nx < $w && $ny >= 0 && $ny < $h) {
                        $idx = $ny * $w + $nx;
                        if ($visited[$idx] === "\0") {
                            $visited[$idx] = "\1";
                            $c = imagecolorsforindex($out, imagecolorat($out, $nx, $ny));
                            if ($isNearWhite($c)) {
                                $queue->enqueue([$nx, $ny]);
                            }
                        }
                    }
                }
            }

            ob_start();
            imagewebp($out, null, 85);
            $webpData = ob_get_clean();
            imagedestroy($img);
            imagedestroy($out);

            return 'data:image/webp;base64,' . base64_encode($webpData);
        } catch (\Throwable $e) {
            return $base64Data;
        }
    }
}
