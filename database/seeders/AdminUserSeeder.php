<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Create default admin, owner, and checker accounts.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@winzelle.com'],
            [
                'name' => 'System Admin',
                'role' => 'admin',
                'password' => Hash::make('password123'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'owner@winzelle.com'],
            [
                'name' => 'Store Owner',
                'role' => 'owner',
                'password' => Hash::make('password123'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'checker@winzelle.com'],
            [
                'name' => 'Inventory Checker',
                'role' => 'checker',
                'password' => Hash::make('password123'),
            ]
        );
    }
}
