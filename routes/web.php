<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DistributorController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

// ─── Auth Routes (Guest Only) ───────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

// ─── Authenticated Routes ───────────────────────────────────────────────────
Route::middleware('auth')->group(function () {

    // Default redirect to Inventory Management Module
    Route::get('/', function () {
        return redirect()->route('inventory.index');
    })->name('home');

    // Subsystem 1: Module 1 - Inventory Management System
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/', [InventoryController::class, 'index'])->name('index');
        Route::post('/stock-in', [InventoryController::class, 'stockIn'])->name('stock-in')->middleware('role:admin,owner');
        Route::post('/stock-out', [InventoryController::class, 'stockOut'])->name('stock-out')->middleware('role:admin,owner');
        Route::post('/adjust', [InventoryController::class, 'adjust'])->name('adjust')->middleware('role:admin,owner');
        Route::patch('/{inventory}/quantity', [InventoryController::class, 'updateQuantity'])->name('update-quantity');
        Route::post('/batch', [InventoryController::class, 'batchUpdate'])->name('batch-update');
    });

    // Subsystem 2: Module 1 - Adding of Distributors
    Route::prefix('distributors')->name('distributors.')->group(function () {
        Route::get('/', [DistributorController::class, 'index'])->name('index');
        Route::post('/', [DistributorController::class, 'store'])->middleware('role:admin,owner');
        Route::put('/{distributor}', [DistributorController::class, 'update'])->name('update')->middleware('role:admin,owner');
        Route::post('/{distributor}/toggle-favorite', [DistributorController::class, 'toggleFavorite'])->name('toggle-favorite');
        Route::delete('/{distributor}', [DistributorController::class, 'destroy'])->name('destroy')->middleware('role:admin');
        Route::post('/{id}/restore', [DistributorController::class, 'restore'])->name('restore')->middleware('role:admin');
    });

    // Subsystem 2: Module 2 - Adding and Updating of Items of Each Distributor
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('/create', [ProductController::class, 'create'])->name('create')->middleware('role:admin,owner');
        Route::post('/', [ProductController::class, 'store'])->name('store')->middleware('role:admin,owner');
        Route::put('/{product}', [ProductController::class, 'update'])->name('update')->middleware('role:admin,owner');
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy')->middleware('role:admin');
        Route::post('/{id}/restore', [ProductController::class, 'restore'])->name('restore')->middleware('role:admin');
    });

    // Subsystem 2: Module 3 - SALES & PURCHASE Page
    Route::prefix('sales-purchase')->name('sales-purchase.')->group(function () {
        Route::get('/', [PurchaseController::class, 'index'])->name('index');
        Route::post('/', [PurchaseController::class, 'store'])->middleware('role:admin,owner');
        Route::put('/{purchase}', [PurchaseController::class, 'update'])->name('update')->middleware('role:admin,owner');
        Route::delete('/{purchase}', [PurchaseController::class, 'destroy'])->name('destroy')->middleware('role:admin');
        Route::post('/{id}/restore', [PurchaseController::class, 'restore'])->name('restore')->middleware('role:admin');
    });

    // Units Module (used by Inventory modal & Product Management)
    Route::resource('units', UnitController::class)->only(['index', 'store', 'update', 'destroy']);

    // User Manual / Interactive Demo Guide
    Route::get('/guide', function () {
        return \Inertia\Inertia::render('Guide/Index');
    })->name('guide.index');

    // Notifications API
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('read-all');
    });

    // Activity Log (Admin & Owner only)
    Route::get('/activity-log', [ActivityLogController::class, 'index'])
        ->middleware('role:admin,owner')
        ->name('activity-log.index');

    // Profile update for any authenticated user
    Route::put('/profile', [SettingsController::class, 'updateProfile'])->name('profile.update');

    // Settings (Admin only)
    Route::prefix('settings')->name('settings.')->middleware('role:admin')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::put('/', [SettingsController::class, 'update'])->name('update');
        Route::post('/users', [SettingsController::class, 'storeUser'])->name('users.store');
        Route::put('/users/{user}', [SettingsController::class, 'updateUser'])->name('users.update');
        Route::delete('/users/{user}', [SettingsController::class, 'destroyUser'])->name('users.destroy');
        Route::post('/users/{id}/restore', [SettingsController::class, 'restoreUser'])->name('users.restore');
    });
});
