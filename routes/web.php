<?php

use App\Http\Controllers\DistributorController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use Illuminate\Support\Facades\Route;

// Default redirect to Sales & Purchase Module
Route::get('/', function () {
    return redirect()->route('sales-purchase.index');
})->name('home');

// Subsystem 1: Module 1 - Inventory Management System
Route::prefix('inventory')->name('inventory.')->group(function () {
    Route::get('/', [InventoryController::class, 'index'])->name('index');
    Route::patch('/{inventory}/quantity', [InventoryController::class, 'updateQuantity'])->name('update-quantity');
});

// Subsystem 2: Module 1 - Adding of Distributors
Route::prefix('distributors')->name('distributors.')->group(function () {
    Route::get('/', [DistributorController::class, 'index'])->name('index');
    Route::post('/', [DistributorController::class, 'store'])->name('store');
    Route::put('/{distributor}', [DistributorController::class, 'update'])->name('update');
    Route::post('/{distributor}/toggle-favorite', [DistributorController::class, 'toggleFavorite'])->name('toggle-favorite');
    Route::delete('/{distributor}', [DistributorController::class, 'destroy'])->name('destroy');
});

// Subsystem 2: Module 2 - Adding and Updating of Items of Each Distributor
Route::prefix('products')->name('products.')->group(function () {
    Route::get('/', [ProductController::class, 'index'])->name('index');
    Route::post('/', [ProductController::class, 'store'])->name('store');
    Route::put('/{product}', [ProductController::class, 'update'])->name('update');
    Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
});

// Subsystem 2: Module 3 - SALES & PURCHASE Page
Route::prefix('sales-purchase')->name('sales-purchase.')->group(function () {
    Route::get('/', [PurchaseController::class, 'index'])->name('index');
    Route::post('/', [PurchaseController::class, 'store'])->name('store');
    Route::put('/{purchase}', [PurchaseController::class, 'update'])->name('update');
    Route::delete('/{purchase}', [PurchaseController::class, 'destroy'])->name('destroy');
});
