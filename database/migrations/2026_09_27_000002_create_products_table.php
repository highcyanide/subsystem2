<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('distributor_id')->constrained('distributors')->onDelete('cascade');
            $table->string('name');
            $table->string('sku')->nullable();
            $table->string('category')->default('General');
            $table->decimal('purchase_price', 10, 2)->default(0.00);
            $table->decimal('default_discount', 10, 2)->default(0.00);
            $table->decimal('default_dealing_price', 10, 2)->default(0.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
