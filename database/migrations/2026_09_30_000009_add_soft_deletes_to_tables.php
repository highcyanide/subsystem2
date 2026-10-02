<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('distributors') && !Schema::hasColumn('distributors', 'deleted_at')) {
            Schema::table('distributors', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (Schema::hasTable('products') && !Schema::hasColumn('products', 'deleted_at')) {
            Schema::table('products', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'deleted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (Schema::hasTable('purchases') && !Schema::hasColumn('purchases', 'deleted_at')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (Schema::hasTable('inventories') && !Schema::hasColumn('inventories', 'deleted_at')) {
            Schema::table('inventories', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('distributors', 'deleted_at')) {
            Schema::table('distributors', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasColumn('products', 'deleted_at')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasColumn('users', 'deleted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasColumn('purchases', 'deleted_at')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasColumn('inventories', 'deleted_at')) {
            Schema::table('inventories', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
