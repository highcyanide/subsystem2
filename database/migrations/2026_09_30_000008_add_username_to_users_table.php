<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 100)->nullable()->unique()->after('name');
        });

        // Set default usernames for existing users based on email prefix
        DB::statement("UPDATE users SET username = SUBSTRING_INDEX(email, '@', 1) WHERE username IS NULL OR username = ''");
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username']);
        });
    }
};
