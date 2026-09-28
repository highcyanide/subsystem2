<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('distributor_id')->constrained('distributors')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('purchase_price', 10, 2);
            $table->decimal('total_purchase', 10, 2);
            $table->decimal('dealing_price', 10, 2);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('gross_amount', 10, 2);
            $table->decimal('vat_percentage', 5, 2)->default(12.00);
            $table->decimal('vat_adjusted_amount', 10, 2);
            $table->decimal('net_profit', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
