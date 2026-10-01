<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });

        // Insert default settings
        DB::table('settings')->insert([
            ['key' => 'low_stock_threshold', 'value' => '15', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'default_vat_percentage', 'value' => '12', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'company_name', 'value' => 'WINZELLE', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'notification_style', 'value' => 'number', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
