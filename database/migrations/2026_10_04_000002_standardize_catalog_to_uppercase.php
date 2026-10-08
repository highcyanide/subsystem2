<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $uploadDir = public_path('uploads/products');
        if (!file_exists($uploadDir)) {
            @mkdir($uploadDir, 0777, true);
        }

        // Helper to convert base64 image data URI to static WebP file
        $saveBase64ToFile = function (?string $dataUri, string $prefix) use ($uploadDir): ?string {
            if (!$dataUri || !str_starts_with($dataUri, 'data:image')) {
                return $dataUri;
            }

            try {
                $parts = explode(',', $dataUri, 2);
                if (count($parts) < 2) return null;
                $raw = base64_decode($parts[1]);
                if (!$raw) return null;

                $filename = $prefix . '_' . uniqid() . '_' . time() . '.webp';
                $fullPath = $uploadDir . DIRECTORY_SEPARATOR . $filename;
                file_put_contents($fullPath, $raw);
                return '/uploads/products/' . $filename;
            } catch (\Throwable $e) {
                return null;
            }
        };

        // 1. Migrate Base64 images to static files in products table
        if (DB::getSchemaBuilder()->hasTable('products') && DB::getSchemaBuilder()->hasColumn('products', 'image')) {
            $productsWithBase64 = DB::table('products')->where('image', 'LIKE', 'data:image%')->get(['product_id', 'image']);
            foreach ($productsWithBase64 as $p) {
                $filePath = $saveBase64ToFile($p->image, 'p_' . $p->product_id);
                if ($filePath) {
                    DB::table('products')->where('product_id', $p->product_id)->update(['image' => $filePath]);
                }
            }
        }

        // 2. Migrate Base64 images to static files in product_variants table
        if (DB::getSchemaBuilder()->hasTable('product_variants') && DB::getSchemaBuilder()->hasColumn('product_variants', 'image')) {
            $variantsWithBase64 = DB::table('product_variants')->where('image', 'LIKE', 'data:image%')->get(['variant_id', 'image']);
            foreach ($variantsWithBase64 as $v) {
                $filePath = $saveBase64ToFile($v->image, 'v_' . $v->variant_id);
                if ($filePath) {
                    DB::table('product_variants')->where('variant_id', $v->variant_id)->update(['image' => $filePath]);
                }
            }
        }

        // 3. Deduplicate and UPPERCASE Categories
        if (DB::getSchemaBuilder()->hasTable('categories')) {
            $cats = DB::table('categories')->get();
            $seenCats = [];
            foreach ($cats as $cat) {
                $upper = mb_strtoupper(trim($cat->name));
                if (!isset($seenCats[$upper])) {
                    $seenCats[$upper] = $cat->category_id;
                    DB::table('categories')->where('category_id', $cat->category_id)->update(['name' => $upper]);
                } else {
                    $canonicalId = $seenCats[$upper];
                    DB::table('products')->where('category_id', $cat->category_id)->update(['category_id' => $canonicalId]);
                    DB::table('categories')->where('category_id', $cat->category_id)->delete();
                }
            }
        }

        // 4. Deduplicate and UPPERCASE Packagings
        if (DB::getSchemaBuilder()->hasTable('packagings')) {
            $packs = DB::table('packagings')->get();
            $seenPacks = [];
            foreach ($packs as $pack) {
                $upper = mb_strtoupper(trim($pack->name));
                if (!isset($seenPacks[$upper])) {
                    $seenPacks[$upper] = $pack->packaging_id;
                    DB::table('packagings')->where('packaging_id', $pack->packaging_id)->update(['name' => $upper]);
                } else {
                    $canonicalId = $seenPacks[$upper];
                    DB::table('product_variants')->where('packaging_id', $pack->packaging_id)->update(['packaging_id' => $canonicalId]);
                    DB::table('packagings')->where('packaging_id', $pack->packaging_id)->delete();
                }
            }
        }

        // 5. Deduplicate and UPPERCASE Units (symbol & name)
        if (DB::getSchemaBuilder()->hasTable('units')) {
            $units = DB::table('units')->get();
            $seenUnits = [];
            foreach ($units as $u) {
                $upperSym = mb_strtoupper(trim($u->symbol));
                $upperName = mb_strtoupper(trim($u->name));
                if (!isset($seenUnits[$upperSym])) {
                    $seenUnits[$upperSym] = $u->unit_id;
                    DB::table('units')->where('unit_id', $u->unit_id)->update([
                        'symbol' => $upperSym,
                        'name' => $upperName,
                    ]);
                } else {
                    $canonicalId = $seenUnits[$upperSym];
                    DB::table('product_variants')->where('unit_id', $u->unit_id)->update(['unit_id' => $canonicalId]);
                    DB::table('units')->where('unit_id', $u->unit_id)->delete();
                }
            }
        }

        // 6. Deduplicate and UPPERCASE Flavors
        if (DB::getSchemaBuilder()->hasTable('flavors')) {
            $flavors = DB::table('flavors')->get();
            $seenFlavors = [];
            foreach ($flavors as $f) {
                $upper = mb_strtoupper(trim($f->name));
                if (!isset($seenFlavors[$upper])) {
                    $seenFlavors[$upper] = $f->flavor_id;
                    DB::table('flavors')->where('flavor_id', $f->flavor_id)->update(['name' => $upper]);
                } else {
                    $canonicalId = $seenFlavors[$upper];
                    DB::table('product_variants')->where('flavor_id', $f->flavor_id)->update(['flavor_id' => $canonicalId]);
                    DB::table('flavors')->where('flavor_id', $f->flavor_id)->delete();
                }
            }
        }

        // 7. UPPERCASE Variant Types & Subtypes
        if (DB::getSchemaBuilder()->hasTable('variant_types')) {
            DB::statement("UPDATE variant_types SET name = UPPER(TRIM(name))");
        }
        if (DB::getSchemaBuilder()->hasTable('subtypes')) {
            DB::statement("UPDATE subtypes SET name = UPPER(TRIM(name))");
        }

        // 8. UPPERCASE Distributors
        if (DB::getSchemaBuilder()->hasTable('distributors')) {
            DB::statement("UPDATE distributors SET name = UPPER(TRIM(name))");
        }

        // 9. UPPERCASE Products (Master name)
        if (DB::getSchemaBuilder()->hasTable('products')) {
            DB::statement("UPDATE products SET name = UPPER(TRIM(name))");
        }

        // 10. UPPERCASE Product Variants (variant_name and sku)
        if (DB::getSchemaBuilder()->hasTable('product_variants')) {
            DB::statement("UPDATE product_variants SET variant_name = UPPER(TRIM(variant_name)), sku = UPPER(TRIM(sku))");
        }

        // 11. UPPERCASE Inventories (distributor_name)
        if (DB::getSchemaBuilder()->hasTable('inventories')) {
            if (DB::getSchemaBuilder()->hasColumn('inventories', 'distributor_name')) {
                DB::statement("UPDATE inventories SET distributor_name = UPPER(TRIM(distributor_name)) WHERE distributor_name IS NOT NULL");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down operation needed for uppercase normalization
    }
};
