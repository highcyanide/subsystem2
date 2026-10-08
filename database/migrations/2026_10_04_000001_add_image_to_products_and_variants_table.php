<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('products', 'image')) {
            Schema::table('products', function (Blueprint $table) {
                $table->longText('image')->nullable()->after('description');
            });
        }

        if (Schema::hasTable('product_variants') && !Schema::hasColumn('product_variants', 'image')) {
            Schema::table('product_variants', function (Blueprint $table) {
                $table->longText('image')->nullable()->after('sku');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'image')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }

        if (Schema::hasTable('product_variants') && Schema::hasColumn('product_variants', 'image')) {
            Schema::table('product_variants', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }
    }
};
