<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Distributors
        $pepsi = Distributor::create([
            'name' => 'PEPSI',
            'contact_number' => '+63 917 555 0101',
            'email' => 'sales@pepsico.com.ph',
            'address' => 'Pepsi-Cola Products Phils., Inc., Muntinlupa City',
            'is_favorite' => true,
        ]);

        $cocaCola = Distributor::create([
            'name' => 'COCA-COLA BOTTLERS',
            'contact_number' => '+63 918 555 0202',
            'email' => 'orders@coca-cola.com.ph',
            'address' => 'Coca-Cola Beverages Phils., Taguig City',
            'is_favorite' => true,
        ]);

        $sanMiguel = Distributor::create([
            'name' => 'SAN MIGUEL BREWERY',
            'contact_number' => '+63 919 555 0303',
            'email' => 'distribution@sanmiguel.com.ph',
            'address' => 'San Miguel Head Office Complex, Mandaluyong',
            'is_favorite' => true,
        ]);

        $nestle = Distributor::create([
            'name' => 'NESTLE PHILIPPINES',
            'contact_number' => '+63 920 555 0404',
            'email' => 'sales@nestle.com.ph',
            'address' => 'Nestle Center, Rockwell Center, Makati City',
            'is_favorite' => true,
        ]);

        $urc = Distributor::create([
            'name' => 'UNIVERSAL ROBINA CORP',
            'contact_number' => '+63 921 555 0505',
            'email' => 'orders@urc.com.ph',
            'address' => 'Tera Tower, Bridgetowne, Quezon City',
            'is_favorite' => false,
        ]);

        $alaska = Distributor::create([
            'name' => 'ALASKA MILK CORP',
            'contact_number' => '+63 922 555 0606',
            'email' => 'info@alaskamilk.com',
            'address' => 'Corinthian Plaza, Paseo de Roxas, Makati',
            'is_favorite' => false,
        ]);

        // 2. Create Products for Pepsi
        $pepsiProductsData = [
            ['name' => 'Pep Reg 195ml PET/12', 'sku' => 'PEP-195-PET', 'category' => 'Carbonated', 'purchase_price' => 114.00, 'default_discount' => 6.00, 'default_dealing_price' => 120.00],
            ['name' => 'Pep Reg 290ml PET/12', 'sku' => 'PEP-290-PET', 'category' => 'Carbonated', 'purchase_price' => 176.00, 'default_discount' => 8.00, 'default_dealing_price' => 184.00],
            ['name' => 'Sti Str 240ml RGB/24', 'sku' => 'STI-240-RGB', 'category' => 'Energy Drinks', 'purchase_price' => 280.00, 'default_discount' => 20.00, 'default_dealing_price' => 300.00],
            ['name' => 'Sti Str 290ml RGB/2', 'sku' => 'STI-290-RGB', 'category' => 'Energy Drinks', 'purchase_price' => 180.00, 'default_discount' => 10.00, 'default_dealing_price' => 190.00],
            ['name' => 'Mdew Reg 8oz RGB/24', 'sku' => 'MDEW-8OZ-RGB', 'category' => 'Carbonated', 'purchase_price' => 169.00, 'default_discount' => 7.00, 'default_dealing_price' => 176.00],
            ['name' => 'Pep Reg 8oz RGB /24', 'sku' => 'PEP-8OZ-RGB', 'category' => 'Carbonated', 'purchase_price' => 169.00, 'default_discount' => 7.00, 'default_dealing_price' => 176.00],
            ['name' => 'Mdew Reg 290ml PET /12', 'sku' => 'MDEW-290-PET', 'category' => 'Carbonated', 'purchase_price' => 182.00, 'default_discount' => 8.00, 'default_dealing_price' => 190.00],
            ['name' => 'Pep Reg 1L RGB /12', 'sku' => 'PEP-1L-RGB', 'category' => 'Carbonated', 'purchase_price' => 351.00, 'default_discount' => 11.00, 'default_dealing_price' => 362.00],
            ['name' => 'Sev Reg 7oz RGB /24', 'sku' => 'SEV-7OZ-RGB', 'category' => 'Carbonated', 'purchase_price' => 169.00, 'default_discount' => 7.00, 'default_dealing_price' => 176.00],
            ['name' => 'Gat Blu 500ml /24', 'sku' => 'GAT-500-BLU', 'category' => 'Sports Drinks', 'purchase_price' => 894.00, 'default_discount' => 20.00, 'default_dealing_price' => 914.00],
            ['name' => 'Gat Blu 350ml /24', 'sku' => 'GAT-350-BLU', 'category' => 'Sports Drinks', 'purchase_price' => 695.00, 'default_discount' => 20.00, 'default_dealing_price' => 715.00],
        ];

        $createdProducts = [];
        foreach ($pepsiProductsData as $pData) {
            $pData['distributor_id'] = $pepsi->id;
            $prod = Product::create($pData);
            $createdProducts[$pData['name']] = $prod;
        }

        // Products for Coca Cola
        $cokeProducts = [
            ['name' => 'Coke Original 1.5L /12', 'sku' => 'COKE-1.5L', 'category' => 'Carbonated', 'purchase_price' => 450.00, 'default_discount' => 30.00, 'default_dealing_price' => 480.00],
            ['name' => 'Sprite 290ml PET /12', 'sku' => 'SPR-290-PET', 'category' => 'Carbonated', 'purchase_price' => 175.00, 'default_discount' => 10.00, 'default_dealing_price' => 185.00],
            ['name' => 'Royal Tru Orange 8oz /24', 'sku' => 'ROY-8OZ', 'category' => 'Carbonated', 'purchase_price' => 165.00, 'default_discount' => 8.00, 'default_dealing_price' => 173.00],
        ];
        foreach ($cokeProducts as $pData) {
            $pData['distributor_id'] = $cocaCola->id;
            Product::create($pData);
        }

        // Products for San Miguel
        $smbProducts = [
            ['name' => 'San Mig Light 330ml /24', 'sku' => 'SML-330', 'category' => 'Alcoholic Beverage', 'purchase_price' => 820.00, 'default_discount' => 40.00, 'default_dealing_price' => 860.00],
            ['name' => 'Red Horse Beer 500ml /12', 'sku' => 'RHB-500', 'category' => 'Alcoholic Beverage', 'purchase_price' => 540.00, 'default_discount' => 25.00, 'default_dealing_price' => 565.00],
        ];
        foreach ($smbProducts as $pData) {
            $pData['distributor_id'] = $sanMiguel->id;
            Product::create($pData);
        }

        // Products for Nestle
        $nestleProducts = [
            ['name' => 'Nescafe 3in1 Original 30g /240', 'sku' => 'NES-3IN1', 'category' => 'Coffee & Milk', 'purchase_price' => 1250.00, 'default_discount' => 50.00, 'default_dealing_price' => 1300.00],
            ['name' => 'Bear Brand Fortified 330g /24', 'sku' => 'BB-330G', 'category' => 'Coffee & Milk', 'purchase_price' => 1100.00, 'default_discount' => 45.00, 'default_dealing_price' => 1145.00],
        ];
        foreach ($nestleProducts as $pData) {
            $pData['distributor_id'] = $nestle->id;
            Product::create($pData);
        }

        // 3. Populate Purchases matching the exact reference image
        $samplePurchases = [
            ['date' => '2023-11-02', 'prod' => 'Pep Reg 195ml PET/12', 'qty' => 10, 'price' => 114.00, 'disc' => 6.00],
            ['date' => '2023-11-02', 'prod' => 'Pep Reg 290ml PET/12', 'qty' => 10, 'price' => 176.00, 'disc' => 8.00],
            ['date' => '2023-11-02', 'prod' => 'Sti Str 240ml RGB/24', 'qty' => 100, 'price' => 280.00, 'disc' => 20.00],
            ['date' => '2023-11-02', 'prod' => 'Sti Str 290ml RGB/2', 'qty' => 10, 'price' => 180.00, 'disc' => 10.00],
            ['date' => '2023-11-02', 'prod' => 'Mdew Reg 8oz RGB/24', 'qty' => 100, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-11-02', 'prod' => 'Pep Reg 8oz RGB /24', 'qty' => 100, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-11-13', 'prod' => 'Mdew Reg 290ml PET /12', 'qty' => 20, 'price' => 182.00, 'disc' => 8.00],
            ['date' => '2023-11-13', 'prod' => 'Pep Reg 195ml PET/12', 'qty' => 13, 'price' => 114.00, 'disc' => 6.00],
            ['date' => '2023-11-13', 'prod' => 'Sti Str 240ml RGB/24', 'qty' => 50, 'price' => 280.00, 'disc' => 20.00],
            ['date' => '2023-11-13', 'prod' => 'Pep Reg 1L RGB /12', 'qty' => 8, 'price' => 351.00, 'disc' => 11.00],
            ['date' => '2023-11-13', 'prod' => 'Sev Reg 7oz RGB /24', 'qty' => 30, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-11-15', 'prod' => 'Mdew Reg 8oz RGB/24', 'qty' => 60, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-11-15', 'prod' => 'Pep Reg 195ml PET/12', 'qty' => 10, 'price' => 114.00, 'disc' => 6.00],
            ['date' => '2023-11-15', 'prod' => 'Mdew Reg 290ml PET /12', 'qty' => 20, 'price' => 182.00, 'disc' => 10.00],
            ['date' => '2023-11-15', 'prod' => 'Pep Reg 8oz RGB /24', 'qty' => 100, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-11-15', 'prod' => 'Pep Reg 1L RGB /12', 'qty' => 30, 'price' => 351.00, 'disc' => 11.00],
            ['date' => '2023-11-15', 'prod' => 'Pep Reg 195ml PET/12', 'qty' => 10, 'price' => 114.00, 'disc' => 6.00],
            ['date' => '2023-11-20', 'prod' => 'Pep Reg 8oz RGB /24', 'qty' => 50, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-11-20', 'prod' => 'Mdew Reg 290ml PET /12', 'qty' => 10, 'price' => 182.00, 'disc' => 8.00],
            ['date' => '2023-11-20', 'prod' => 'Pep Reg 195ml PET/12', 'qty' => 20, 'price' => 114.00, 'disc' => 6.00],
            ['date' => '2023-11-20', 'prod' => 'Sev Reg 7oz RGB /24', 'qty' => 50, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-11-20', 'prod' => 'Sti Str 240ml RGB/24', 'qty' => 70, 'price' => 280.00, 'disc' => 20.00],
            ['date' => '2023-11-24', 'prod' => 'Pep Reg 195ml PET/12', 'qty' => 6, 'price' => 163.00, 'disc' => 6.00],
            ['date' => '2023-11-24', 'prod' => 'Sev Reg 7oz RGB /24', 'qty' => 30, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-11-24', 'prod' => 'Gat Blu 500ml /24', 'qty' => 1, 'price' => 894.00, 'disc' => 20.00],
            ['date' => '2023-11-24', 'prod' => 'Gat Blu 350ml /24', 'qty' => 1, 'price' => 695.00, 'disc' => 20.00],
            ['date' => '2023-12-06', 'prod' => 'Pep Reg 195ml PET/12', 'qty' => 2, 'price' => 114.00, 'disc' => 6.00],
            ['date' => '2023-12-06', 'prod' => 'Pep Reg 8oz RGB /24', 'qty' => 10, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-12-06', 'prod' => 'Pep Reg 195ml PET/12', 'qty' => 3, 'price' => 114.00, 'disc' => 6.00],
            ['date' => '2023-12-06', 'prod' => 'Sev Reg 7oz RGB /24', 'qty' => 23, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-12-08', 'prod' => 'Pep Reg 195ml PET/12', 'qty' => 5, 'price' => 114.00, 'disc' => 6.00],
            ['date' => '2023-12-08', 'prod' => 'Pep Reg 8oz RGB /24', 'qty' => 30, 'price' => 169.00, 'disc' => 7.00],
            ['date' => '2023-12-08', 'prod' => 'Sti Str 240ml RGB/24', 'qty' => 20, 'price' => 280.00, 'disc' => 20.00],
            ['date' => '2023-12-11', 'prod' => 'Mdew Reg 8oz RGB/24', 'qty' => 20, 'price' => 169.00, 'disc' => 7.00],
        ];

        foreach ($samplePurchases as $sp) {
            $product = $createdProducts[$sp['prod']] ?? null;
            if (!$product) continue;

            $qty = $sp['qty'];
            $price = $sp['price'];
            $disc = $sp['disc'];
            $totalPurchase = $qty * $price;
            $dealingPrice = $price + $disc;
            $grossAmount = $qty * $dealingPrice;
            $vatAdjusted = $grossAmount * 0.88; // 12% VAT adjustment
            $netProfit = $grossAmount - $totalPurchase;

            Purchase::create([
                'date' => $sp['date'],
                'distributor_id' => $pepsi->id,
                'product_id' => $product->id,
                'quantity' => $qty,
                'purchase_price' => $price,
                'total_purchase' => $totalPurchase,
                'dealing_price' => $dealingPrice,
                'discount' => $disc,
                'gross_amount' => $grossAmount,
                'vat_percentage' => 12.00,
                'vat_adjusted_amount' => $vatAdjusted,
                'net_profit' => $netProfit,
            ]);

            // Sync with Subsystem 1 Inventory Management
            $inv = Inventory::firstOrCreate(
                ['product_id' => $product->id],
                [
                    'sku' => $product->sku,
                    'category' => $product->category,
                    'distributor_name' => $pepsi->name,
                    'product_name' => $product->name,
                    'quantity' => 0,
                    'purchase_price' => $price,
                    'selling_price' => $dealingPrice,
                ]
            );
            $inv->increment('quantity', $qty);
            $inv->update([
                'purchase_price' => $price,
                'selling_price' => $dealingPrice,
            ]);
        }
    }
}
