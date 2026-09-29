-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 29, 2026 at 08:13 AM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 8.0.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `subsystem2`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `distributors`
--

CREATE TABLE `distributors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_favorite` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `distributors`
--

INSERT INTO `distributors` (`id`, `name`, `contact_number`, `email`, `address`, `is_favorite`, `created_at`, `updated_at`) VALUES
(1, 'PEPSI', '+63 917 555 0101', 'sales@pepsico.com.ph', 'Pepsi-Cola Products Phils., Inc., Muntinlupa City', 1, '2026-09-27 04:12:25', '2026-09-28 22:07:21'),
(2, 'COCA-COLA BOTTLERS', '+63 918 555 0202', 'orders@coca-cola.com.ph', 'Coca-Cola Beverages Phils., Taguig City', 1, '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(3, 'SAN MIGUEL BREWERY', '+63 919 555 0303', 'distribution@sanmiguel.com.ph', 'San Miguel Head Office Complex, Mandaluyong', 0, '2026-09-27 04:12:25', '2026-09-28 22:07:17'),
(4, 'NESTLE PHILIPPINES', '+63 920 555 0404', 'sales@nestle.com.ph', 'Nestle Center, Rockwell Center, Makati City', 0, '2026-09-27 04:12:25', '2026-09-28 22:07:19'),
(5, 'UNIVERSAL ROBINA CORP', '+63 921 555 0505', 'orders@urc.com.ph', 'Tera Tower, Bridgetowne, Quezon City', 0, '2026-09-27 04:12:25', '2026-09-28 22:07:15'),
(6, 'ALASKA MILK CORP', '+63 922 555 0606', 'info@alaskamilk.com', 'Corinthian Plaza, Paseo de Roxas, Makati', 0, '2026-09-27 04:12:25', '2026-09-27 04:12:25');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'General',
  `distributor_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `purchase_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventories`
--

INSERT INTO `inventories` (`id`, `product_id`, `sku`, `category`, `distributor_name`, `product_name`, `quantity`, `purchase_price`, `selling_price`, `created_at`, `updated_at`) VALUES
(1, 1, 'PEP-195-PET', 'Carbonated', 'PEPSI', 'Pep Reg 195ml PET/12', 79, '114.00', '120.00', '2026-09-27 04:12:25', '2026-09-27 04:12:26'),
(2, 2, 'PEP-290-PET', 'Carbonated', 'PEPSI', 'Pep Reg 290ml PET/12', 10, '176.00', '184.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(3, 3, 'STI-240-RGB', 'Energy Drinks', 'PEPSI', 'Sti Str 240ml RGB/24', 240, '280.00', '300.00', '2026-09-27 04:12:25', '2026-09-27 04:12:26'),
(4, 4, 'STI-290-RGB', 'Energy Drinks', 'PEPSI', 'Sti Str 290ml RGB/2', 10, '180.00', '190.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(5, 5, 'MDEW-8OZ-RGB', 'Carbonated', 'PEPSI', 'Mdew Reg 8oz RGB/24', 180, '169.00', '176.00', '2026-09-27 04:12:25', '2026-09-27 04:12:26'),
(6, 6, 'PEP-8OZ-RGB', 'Carbonated', 'PEPSI', 'Pep Reg 8oz RGB /24', 290, '169.00', '176.00', '2026-09-27 04:12:25', '2026-09-27 04:12:26'),
(7, 7, 'MDEW-290-PET', 'Carbonated', 'PEPSI', 'Mdew Reg 290ml PET /12', 50, '182.00', '190.00', '2026-09-27 04:12:25', '2026-09-27 04:12:26'),
(8, 8, 'PEP-1L-RGB', 'Carbonated', 'PEPSI', 'Pep Reg 1L RGB /12', 38, '351.00', '362.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(9, 9, 'SEV-7OZ-RGB', 'Carbonated', 'PEPSI', 'Sev Reg 7oz RGB /24', 133, '169.00', '176.00', '2026-09-27 04:12:25', '2026-09-27 04:12:26'),
(10, 10, 'GAT-500-BLU', 'Sports Drinks', 'PEPSI', 'Gat Blu 500ml /24', 1, '894.00', '914.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(11, 11, 'GAT-350-BLU', 'Sports Drinks', 'PEPSI', 'Gat Blu 350ml /24', 1, '695.00', '715.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(12, 12, 'COKE-1.5L', 'Carbonated', 'COCA-COLA BOTTLERS', 'Coke Original 1.5L /12', 10, '450.00', '480.00', '2026-09-27 06:13:30', '2026-09-27 06:13:30');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_09_27_000001_create_distributors_table', 1),
(5, '2026_09_27_000002_create_products_table', 1),
(6, '2026_09_27_000003_create_inventories_table', 1),
(7, '2026_09_27_000004_create_purchases_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `distributor_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'General',
  `purchase_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `default_discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `default_dealing_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `distributor_id`, `name`, `sku`, `category`, `purchase_price`, `default_discount`, `default_dealing_price`, `created_at`, `updated_at`) VALUES
(1, 1, 'Pep Reg 195ml PET/12', 'PEP-195-PET', 'Carbonated', '114.00', '6.00', '120.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(2, 1, 'Pep Reg 290ml PET/12', 'PEP-290-PET', 'Carbonated', '176.00', '8.00', '184.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(3, 1, 'Sti Str 240ml RGB/24', 'STI-240-RGB', 'Energy Drinks', '280.00', '20.00', '300.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(4, 1, 'Sti Str 290ml RGB/2', 'STI-290-RGB', 'Energy Drinks', '180.00', '10.00', '190.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(5, 1, 'Mdew Reg 8oz RGB/24', 'MDEW-8OZ-RGB', 'Carbonated', '169.00', '7.00', '176.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(6, 1, 'Pep Reg 8oz RGB /24', 'PEP-8OZ-RGB', 'Carbonated', '169.00', '7.00', '176.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(7, 1, 'Mdew Reg 290ml PET /12', 'MDEW-290-PET', 'Carbonated', '182.00', '8.00', '190.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(8, 1, 'Pep Reg 1L RGB /12', 'PEP-1L-RGB', 'Carbonated', '351.00', '11.00', '362.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(9, 1, 'Sev Reg 7oz RGB /24', 'SEV-7OZ-RGB', 'Carbonated', '169.00', '7.00', '176.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(10, 1, 'Gat Blu 500ml /24', 'GAT-500-BLU', 'Sports Drinks', '894.00', '20.00', '914.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(11, 1, 'Gat Blu 350ml /24', 'GAT-350-BLU', 'Sports Drinks', '695.00', '20.00', '715.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(12, 2, 'Coke Original 1.5L /12', 'COKE-1.5L', 'Carbonated', '450.00', '30.00', '480.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(13, 2, 'Sprite 290ml PET /12', 'SPR-290-PET', 'Carbonated', '175.00', '10.00', '185.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(14, 2, 'Royal Tru Orange 8oz /24', 'ROY-8OZ', 'Carbonated', '165.00', '8.00', '173.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(15, 3, 'San Mig Light 330ml /24', 'SML-330', 'Alcoholic Beverage', '820.00', '40.00', '860.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(16, 3, 'Red Horse Beer 500ml /12', 'RHB-500', 'Alcoholic Beverage', '540.00', '25.00', '565.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(17, 4, 'Nescafe 3in1 Original 30g /240', 'NES-3IN1', 'Coffee & Milk', '1250.00', '50.00', '1300.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(18, 4, 'Bear Brand Fortified 330g /24', 'BB-330G', 'Coffee & Milk', '1100.00', '45.00', '1145.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `distributor_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `purchase_price` decimal(10,2) NOT NULL,
  `total_purchase` decimal(10,2) NOT NULL,
  `dealing_price` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `gross_amount` decimal(10,2) NOT NULL,
  `vat_percentage` decimal(5,2) NOT NULL DEFAULT 12.00,
  `vat_adjusted_amount` decimal(10,2) NOT NULL,
  `net_profit` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `date`, `distributor_id`, `product_id`, `quantity`, `purchase_price`, `total_purchase`, `dealing_price`, `discount`, `gross_amount`, `vat_percentage`, `vat_adjusted_amount`, `net_profit`, `created_at`, `updated_at`) VALUES
(1, '2023-11-02', 1, 1, 10, '114.00', '1140.00', '120.00', '6.00', '1200.00', '12.00', '1056.00', '60.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(2, '2023-11-02', 1, 2, 10, '176.00', '1760.00', '184.00', '8.00', '1840.00', '12.00', '1619.20', '80.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(3, '2023-11-02', 1, 3, 100, '280.00', '28000.00', '300.00', '20.00', '30000.00', '12.00', '26400.00', '2000.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(4, '2023-11-02', 1, 4, 10, '180.00', '1800.00', '190.00', '10.00', '1900.00', '12.00', '1672.00', '100.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(5, '2023-11-02', 1, 5, 100, '169.00', '16900.00', '176.00', '7.00', '17600.00', '12.00', '15488.00', '700.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(6, '2023-11-02', 1, 6, 100, '169.00', '16900.00', '176.00', '7.00', '17600.00', '12.00', '15488.00', '700.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(7, '2023-11-13', 1, 7, 20, '182.00', '3640.00', '190.00', '8.00', '3800.00', '12.00', '3344.00', '160.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(8, '2023-11-13', 1, 1, 13, '114.00', '1482.00', '120.00', '6.00', '1560.00', '12.00', '1372.80', '78.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(9, '2023-11-13', 1, 3, 50, '280.00', '14000.00', '300.00', '20.00', '15000.00', '12.00', '13200.00', '1000.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(10, '2023-11-13', 1, 8, 8, '351.00', '2808.00', '362.00', '11.00', '2896.00', '12.00', '2548.48', '88.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(11, '2023-11-13', 1, 9, 30, '169.00', '5070.00', '176.00', '7.00', '5280.00', '12.00', '4646.40', '210.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(12, '2023-11-15', 1, 5, 60, '169.00', '10140.00', '176.00', '7.00', '10560.00', '12.00', '9292.80', '420.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(13, '2023-11-15', 1, 1, 10, '114.00', '1140.00', '120.00', '6.00', '1200.00', '12.00', '1056.00', '60.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(14, '2023-11-15', 1, 7, 20, '182.00', '3640.00', '192.00', '10.00', '3840.00', '12.00', '3379.20', '200.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(15, '2023-11-15', 1, 6, 100, '169.00', '16900.00', '176.00', '7.00', '17600.00', '12.00', '15488.00', '700.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(16, '2023-11-15', 1, 8, 30, '351.00', '10530.00', '362.00', '11.00', '10860.00', '12.00', '9556.80', '330.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(17, '2023-11-15', 1, 1, 10, '114.00', '1140.00', '120.00', '6.00', '1200.00', '12.00', '1056.00', '60.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(18, '2023-11-20', 1, 6, 50, '169.00', '8450.00', '176.00', '7.00', '8800.00', '12.00', '7744.00', '350.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(19, '2023-11-20', 1, 7, 10, '182.00', '1820.00', '190.00', '8.00', '1900.00', '12.00', '1672.00', '80.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(20, '2023-11-20', 1, 1, 20, '114.00', '2280.00', '120.00', '6.00', '2400.00', '12.00', '2112.00', '120.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(21, '2023-11-20', 1, 9, 50, '169.00', '8450.00', '176.00', '7.00', '8800.00', '12.00', '7744.00', '350.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(22, '2023-11-20', 1, 3, 70, '280.00', '19600.00', '300.00', '20.00', '21000.00', '12.00', '18480.00', '1400.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(23, '2023-11-24', 1, 1, 6, '163.00', '978.00', '169.00', '6.00', '1014.00', '12.00', '892.32', '36.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(24, '2023-11-24', 1, 9, 30, '169.00', '5070.00', '176.00', '7.00', '5280.00', '12.00', '4646.40', '210.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(25, '2023-11-24', 1, 10, 1, '894.00', '894.00', '914.00', '20.00', '914.00', '12.00', '804.32', '20.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(26, '2023-11-24', 1, 11, 1, '695.00', '695.00', '715.00', '20.00', '715.00', '12.00', '629.20', '20.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(27, '2023-12-06', 1, 1, 2, '114.00', '228.00', '120.00', '6.00', '240.00', '12.00', '211.20', '12.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(28, '2023-12-06', 1, 6, 10, '169.00', '1690.00', '176.00', '7.00', '1760.00', '12.00', '1548.80', '70.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(29, '2023-12-06', 1, 1, 3, '114.00', '342.00', '120.00', '6.00', '360.00', '12.00', '316.80', '18.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(30, '2023-12-06', 1, 9, 23, '169.00', '3887.00', '176.00', '7.00', '4048.00', '12.00', '3562.24', '161.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(31, '2023-12-08', 1, 1, 5, '114.00', '570.00', '120.00', '6.00', '600.00', '12.00', '528.00', '30.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(32, '2023-12-08', 1, 6, 30, '169.00', '5070.00', '176.00', '7.00', '5280.00', '12.00', '4646.40', '210.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(33, '2023-12-08', 1, 3, 20, '280.00', '5600.00', '300.00', '20.00', '6000.00', '12.00', '5280.00', '400.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(34, '2023-12-11', 1, 5, 20, '169.00', '3380.00', '176.00', '7.00', '3520.00', '12.00', '3097.60', '140.00', '2026-09-27 04:12:26', '2026-09-27 04:12:26'),
(35, '2026-09-27', 2, 12, 10, '450.00', '4500.00', '480.00', '30.00', '4800.00', '12.00', '4224.00', '300.00', '2026-09-27 06:13:30', '2026-09-27 06:13:30');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('kNTEA8gMx22eAOPBNDuRIY7xbqSKHXEVo7edfcyI', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJtRXBTRkNFTlFodVdjbHhQN0NMb1Y4ODhBNFBnU3VJaElQeFY0UE5vIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9zYWxlcy1wdXJjaGFzZSIsInJvdXRlIjoic2FsZXMtcHVyY2hhc2UuaW5kZXgifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1790662041);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `distributors`
--
ALTER TABLE `distributors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventories_product_id_foreign` (`product_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_distributor_id_foreign` (`distributor_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchases_distributor_id_foreign` (`distributor_id`),
  ADD KEY `purchases_product_id_foreign` (`product_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `distributors`
--
ALTER TABLE `distributors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inventories`
--
ALTER TABLE `inventories`
  ADD CONSTRAINT `inventories_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_distributor_id_foreign` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_distributor_id_foreign` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchases_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
