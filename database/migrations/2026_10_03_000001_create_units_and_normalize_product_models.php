<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Units / Measurements Table
        if (!Schema::hasTable('units')) {
            Schema::create('units', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('symbol')->unique();
                $table->string('category')->default('volume'); // volume, weight, package, count
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });

            // Seed standard measurements
            DB::table('units')->insert([
                ['name' => 'Milliliter', 'symbol' => 'mL', 'category' => 'volume', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Liter', 'symbol' => 'L', 'category' => 'volume', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Fluid Ounces', 'symbol' => 'oz', 'category' => 'volume', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Gram', 'symbol' => 'g', 'category' => 'weight', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Kilogram', 'symbol' => 'kg', 'category' => 'weight', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Piece', 'symbol' => 'pc', 'category' => 'count', 'created_at' => now(), 'updated_at' => now()],
                ['name' => '12-Pack Case', 'symbol' => '12P', 'category' => 'package', 'created_at' => now(), 'updated_at' => now()],
                ['name' => '24-Pack Case', 'symbol' => '24P', 'category' => 'package', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Plastic Bottle (PET)', 'symbol' => 'PET', 'category' => 'package', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Glass Bottle (RGB)', 'symbol' => 'RGB', 'category' => 'package', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Can', 'symbol' => 'CAN', 'category' => 'package', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // 2. Extend products table for normalization
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'brand')) {
                $table->string('brand')->nullable()->after('name');
            }
            if (!Schema::hasColumn('products', 'flavor_type')) {
                $table->string('flavor_type')->nullable()->after('brand');
            }
            if (!Schema::hasColumn('products', 'size_value')) {
                $table->string('size_value')->nullable()->after('flavor_type');
            }
            if (!Schema::hasColumn('products', 'unit_id')) {
                $table->foreignId('unit_id')->nullable()->after('size_value')->constrained('units')->nullOnDelete();
            }
            if (!Schema::hasColumn('products', 'packaging')) {
                $table->string('packaging')->nullable()->after('unit_id');
            }
            if (!Schema::hasColumn('products', 'description')) {
                $table->text('description')->nullable()->after('category');
            }
        });

        // 3. Product Distributors Pivot (Multiple distributors per master product)
        if (!Schema::hasTable('product_distributors')) {
            Schema::create('product_distributors', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('distributor_id')->constrained('distributors')->cascadeOnDelete();
                $table->decimal('purchase_price', 10, 2)->default(0.00);
                $table->decimal('default_discount', 10, 2)->default(0.00);
                $table->decimal('default_dealing_price', 10, 2)->default(0.00);
                $table->boolean('is_primary')->default(false);
                $table->timestamps();

                $table->unique(['product_id', 'distributor_id']);
            });

            // Populate product_distributors from existing products data
            $existing = DB::table('products')->select('id', 'distributor_id', 'purchase_price', 'default_discount', 'default_dealing_price')->get();
            foreach ($existing as $p) {
                if ($p->distributor_id) {
                    DB::table('product_distributors')->insertOrIgnore([
                        'product_id' => $p->id,
                        'distributor_id' => $p->distributor_id,
                        'purchase_price' => $p->purchase_price,
                        'default_discount' => $p->default_discount,
                        'default_dealing_price' => $p->default_dealing_price,
                        'is_primary' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // 4. Extend Inventories table with unit_id & reorder_level
        Schema::table('inventories', function (Blueprint $table) {
            if (!Schema::hasColumn('inventories', 'unit_id')) {
                $table->foreignId('unit_id')->nullable()->after('quantity')->constrained('units')->nullOnDelete();
            }
            if (!Schema::hasColumn('inventories', 'reorder_level')) {
                $table->integer('reorder_level')->default(10)->after('unit_id');
            }
        });

        // 5. Stock Movements table (audit trail for stock in, stock out, adjustments)
        if (!Schema::hasTable('stock_movements')) {
            Schema::create('stock_movements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('type'); // in, out, adjustment
                $table->integer('quantity'); // positive or negative
                $table->integer('balance_before')->default(0);
                $table->integer('balance_after')->default(0);
                $table->string('reason')->default('Stock Adjustment');
                $table->text('remarks')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('product_distributors');
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropColumn(['unit_id', 'reorder_level']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropColumn(['brand', 'flavor_type', 'size_value', 'unit_id', 'packaging', 'description']);
        });
        Schema::dropIfExists('units');
    }
};
