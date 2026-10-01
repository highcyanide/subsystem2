-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 01, 2026 at 05:14 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.3.35

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
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `model_type`, `model_id`, `description`, `old_values`, `new_values`, `ip_address`, `created_at`, `updated_at`) VALUES
(1, 1, 'updated', 'Setting', NULL, 'Changed setting \'company_name\' from \'WINZELLE\' to \'LIEL\'', NULL, NULL, '127.0.0.1', '2026-09-30 05:50:42', '2026-09-30 05:50:42'),
(2, 1, 'updated', 'Setting', NULL, 'Changed setting \'company_name\' from \'LIEL\' to \'WINZELLE\'', NULL, NULL, '127.0.0.1', '2026-09-30 05:51:52', '2026-09-30 05:51:52'),
(3, 1, 'updated', 'Inventory', 13, 'Updated stock for Lava Cake: 0 → 5', '{\"quantity\":0}', '{\"quantity\":5}', '127.0.0.1', '2026-09-30 06:28:13', '2026-09-30 06:28:13'),
(4, 1, 'updated', 'Inventory', 13, 'Updated stock for Lava Cake: 5 → 5', '{\"quantity\":5}', '{\"quantity\":5}', '127.0.0.1', '2026-09-30 06:28:15', '2026-09-30 06:28:15'),
(5, 1, 'updated', 'Setting', NULL, 'Changed setting \'notification_style\' from \'number\' to \'dot\'', NULL, NULL, '127.0.0.1', '2026-09-30 06:28:29', '2026-09-30 06:28:29'),
(6, 1, 'updated', 'Setting', NULL, 'Changed setting \'notification_style\' from \'dot\' to \'number\'', NULL, NULL, '127.0.0.1', '2026-09-30 06:28:34', '2026-09-30 06:28:34'),
(7, 1, 'updated', 'Distributor', 1, 'Unfavorited distributor: PEPSI', NULL, NULL, '127.0.0.1', '2026-09-30 06:40:44', '2026-09-30 06:40:44'),
(8, 1, 'created', 'Distributor', 8, 'Added new distributor: BATMAN TRADING', NULL, '{\"name\":\"BATMAN TRADING\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:46:12', '2026-09-30 06:46:12'),
(9, 1, 'created', 'Distributor', 9, 'Added new distributor: BATMAN TRADING', NULL, '{\"name\":\"BATMAN TRADING\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:46:14', '2026-09-30 06:46:14'),
(10, 1, 'created', 'Distributor', 10, 'Added new distributor: FAST DISTRIBUTION', NULL, '{\"name\":\"FAST DISTRIBUTION\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:46:25', '2026-09-30 06:46:25'),
(11, 1, 'created', 'Distributor', 11, 'Added new distributor: G11 GOLDEN CENTURY MARKETING', NULL, '{\"name\":\"G11 GOLDEN CENTURY MARKETING\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:46:40', '2026-09-30 06:46:40'),
(12, 1, 'created', 'Distributor', 12, 'Added new distributor: SUVISCO INDUSTRIES INC.', NULL, '{\"name\":\"SUVISCO INDUSTRIES INC.\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:47:00', '2026-09-30 06:47:00'),
(13, 1, 'created', 'Distributor', 13, 'Added new distributor: CDO RRC MARKETING', NULL, '{\"name\":\"CDO RRC MARKETING\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:47:21', '2026-09-30 06:47:21'),
(14, 1, 'deleted', 'Distributor', NULL, 'Deleted distributor: BATMAN TRADING', '{\"id\":8,\"name\":\"BATMAN TRADING\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"logo\":null,\"address\":null,\"is_favorite\":false,\"created_at\":\"2026-09-30T14:46:12.000000Z\",\"updated_at\":\"2026-09-30T14:46:12.000000Z\"}', NULL, '127.0.0.1', '2026-09-30 06:47:47', '2026-09-30 06:47:47'),
(15, 1, 'created', 'Distributor', 14, 'Added new distributor: HAPPY NORTHMIN INC.', NULL, '{\"name\":\"HAPPY NORTHMIN INC.\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:47:59', '2026-09-30 06:47:59'),
(16, 1, 'created', 'Distributor', 15, 'Added new distributor: SALWIN MART', NULL, '{\"name\":\"SALWIN MART\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:48:12', '2026-09-30 06:48:12'),
(17, 1, 'created', 'Distributor', 16, 'Added new distributor: LIMAC ENTERPRISES', NULL, '{\"name\":\"LIMAC ENTERPRISES\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:49:15', '2026-09-30 06:49:15'),
(18, 1, 'created', 'Distributor', 17, 'Added new distributor: ANAND MKTG CORP', NULL, '{\"name\":\"ANAND MKTG CORP\",\"contact_number\":\"+63 918 555 0202\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:49:35', '2026-09-30 06:49:35'),
(19, 1, 'created', 'Distributor', 18, 'Added new distributor: NORTH MINDANAO DIST.', NULL, '{\"name\":\"NORTH MINDANAO DIST.\",\"contact_number\":\"+63 917 123 4567\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:50:24', '2026-09-30 06:50:24'),
(20, 1, 'created', 'Distributor', 19, 'Added new distributor: GMB GENERAL MERCHANDISE', NULL, '{\"name\":\"GMB GENERAL MERCHANDISE\",\"contact_number\":\"+63 917 123 4567\",\"email\":null,\"address\":null,\"is_favorite\":false}', '127.0.0.1', '2026-09-30 06:50:40', '2026-09-30 06:50:40'),
(21, 1, 'created', 'Product', 20, 'Added product: Birtch Tree (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Birtch Tree\",\"sku\":\"BT-200\",\"category\":\"Milk\",\"purchase_price\":69.07,\"default_discount\":4.93,\"default_dealing_price\":74}', '127.0.0.1', '2026-09-30 06:52:27', '2026-09-30 06:52:27'),
(22, 1, 'created', 'Product', 21, 'Added product: Birtch Tree Choco (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Birtch Tree Choco\",\"sku\":\"BT-C-20\",\"category\":\"Milk\",\"purchase_price\":74.48,\"default_discount\":0.52,\"default_dealing_price\":75}', '127.0.0.1', '2026-09-30 06:53:07', '2026-09-30 06:53:07'),
(23, 1, 'created', 'Product', 22, 'Added product: Century Tuna Flakes in Oil (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Century Tuna Flakes in Oil\",\"sku\":\"CT-FIO-12\",\"category\":\"Canned Goods\",\"purchase_price\":34.03,\"default_discount\":1.97,\"default_dealing_price\":36}', '127.0.0.1', '2026-09-30 06:53:50', '2026-09-30 06:53:50'),
(24, 1, 'created', 'Product', 23, 'Added product: Century Tuna Flakes Hot & Spicy (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Century Tuna Flakes Hot & Spicy\",\"sku\":\"CT-FHS-12\",\"category\":\"Canned Goods\",\"purchase_price\":34.4,\"default_discount\":1.6,\"default_dealing_price\":36}', '127.0.0.1', '2026-09-30 06:55:52', '2026-09-30 06:55:52'),
(25, 1, 'created', 'Product', 24, 'Added product: Fresca Flakes in Oil (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Fresca Flakes in Oil\",\"sku\":\"F-FIO-12\",\"category\":\"Canned Goods\",\"purchase_price\":28.62,\"default_discount\":1.38,\"default_dealing_price\":30}', '127.0.0.1', '2026-09-30 06:56:33', '2026-09-30 06:56:33'),
(26, 1, 'created', 'Product', 25, 'Added product: Fresca Hot & Spicy (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Fresca Hot & Spicy\",\"sku\":\"F-HS-12\",\"category\":\"Canned Goods\",\"purchase_price\":28.94,\"default_discount\":1.06,\"default_dealing_price\":30}', '127.0.0.1', '2026-09-30 06:56:58', '2026-09-30 06:56:58'),
(27, 1, 'created', 'Product', 26, 'Added product: Fresca Tuna Afritada (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Fresca Tuna Afritada\",\"sku\":\"F-TA-2\",\"category\":\"Canned Goods\",\"purchase_price\":25.42,\"default_discount\":2.58,\"default_dealing_price\":28}', '127.0.0.1', '2026-09-30 06:58:17', '2026-09-30 06:58:17'),
(28, 1, 'created', 'Product', 27, 'Added product: Coco Mama 400ml (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Coco Mama 400ml\",\"sku\":\"CM-400ML-24\",\"category\":\"Coconut Milk & Cream\",\"purchase_price\":60,\"default_discount\":2,\"default_dealing_price\":62}', '127.0.0.1', '2026-09-30 06:59:35', '2026-09-30 06:59:35'),
(29, 1, 'created', 'Product', 28, 'Added product: 555 Sardines T.S. (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"555 Sardines T.S.\",\"sku\":\"S555-TS-12\",\"category\":\"Canned Goods\",\"purchase_price\":22.33,\"default_discount\":1.67,\"default_dealing_price\":24}', '127.0.0.1', '2026-09-30 07:00:08', '2026-09-30 07:00:08'),
(30, 1, 'created', 'Product', 29, 'Added product: Hunts 175g (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Hunts 175g\",\"sku\":\"H-175G-12\",\"category\":\"Canned Beans\",\"purchase_price\":22.14,\"default_discount\":2.86,\"default_dealing_price\":25}', '127.0.0.1', '2026-09-30 07:03:14', '2026-09-30 07:03:14'),
(31, 1, 'created', 'Product', 30, 'Added product: Argentina Corned Beef 150g (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Argentina Corned Beef 150g\",\"sku\":\"A-CB-150G\",\"category\":\"Canned Meat\",\"purchase_price\":33.57,\"default_discount\":2.43,\"default_dealing_price\":36}', '127.0.0.1', '2026-09-30 07:04:01', '2026-09-30 07:04:01'),
(32, 1, 'created', 'Product', 31, 'Added product: Argentina Beef Loaf 250g (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Argentina Beef Loaf 250g\",\"sku\":\"A-BF-250G\",\"category\":\"Canned Meat\",\"purchase_price\":29.05,\"default_discount\":2.95,\"default_dealing_price\":32}', '127.0.0.1', '2026-09-30 07:05:36', '2026-09-30 07:05:36'),
(33, 1, 'created', 'Product', 32, 'Added product: Lucky 7 Carne Norte 150g (Distributor: ANAND MKTG CORP)', NULL, '{\"distributor_id\":17,\"name\":\"Lucky 7 Carne Norte 150g\",\"sku\":\"L7-CN-150G\",\"category\":\"Canned Meat\",\"purchase_price\":20.71,\"default_discount\":1.29,\"default_dealing_price\":22}', '127.0.0.1', '2026-09-30 07:06:02', '2026-09-30 07:06:02'),
(34, 1, 'created', 'Product', 33, 'Added product: EGG XL (Distributor: BATMAN TRADING)', NULL, '{\"distributor_id\":9,\"name\":\"EGG XL\",\"sku\":\"EGG-XL\",\"category\":\"Fresh Eggs\",\"purchase_price\":240,\"default_discount\":10,\"default_dealing_price\":250}', '127.0.0.1', '2026-09-30 07:07:23', '2026-09-30 07:07:23'),
(35, 1, 'created', 'Product', 34, 'Added product: Princess Bea (Distributor: BATMAN TRADING)', NULL, '{\"distributor_id\":9,\"name\":\"Princess Bea\",\"sku\":\"PB-53\",\"category\":\"Rice\",\"purchase_price\":1300,\"default_discount\":30,\"default_dealing_price\":1330}', '127.0.0.1', '2026-09-30 07:08:11', '2026-09-30 07:08:11'),
(36, 1, 'created', 'Product', 35, 'Added product: Payless (Distributor: CDO RRC MARKETING)', NULL, '{\"distributor_id\":13,\"name\":\"Payless\",\"sku\":\"P-96\",\"category\":\"Instant Noodles\",\"purchase_price\":17.5,\"default_discount\":0.63,\"default_dealing_price\":18.13}', '127.0.0.1', '2026-09-30 07:09:30', '2026-09-30 07:09:30'),
(37, 1, 'created', 'Product', 36, 'Added product: BEARBRAND SWAK /24 (Distributor: FAST DISTRIBUTION)', NULL, '{\"distributor_id\":10,\"name\":\"BEARBRAND SWAK \\/24\",\"sku\":\"BB-S-24\",\"category\":\"Powdered Milk\",\"purchase_price\":83.96,\"default_discount\":3.05,\"default_dealing_price\":87.00999999999999}', '127.0.0.1', '2026-09-30 07:10:24', '2026-09-30 07:10:24'),
(38, 1, 'created', 'Product', 37, 'Added product: Milo /42 (Distributor: FAST DISTRIBUTION)', NULL, '{\"distributor_id\":10,\"name\":\"Milo \\/42\",\"sku\":\"M-42\",\"category\":\"Powdered Malt Drinks\",\"purchase_price\":103.1,\"default_discount\":2.9,\"default_dealing_price\":106}', '127.0.0.1', '2026-09-30 07:11:15', '2026-09-30 07:11:15'),
(39, 1, 'created', 'Product', 38, 'Added product: Magic Sarap (Distributor: FAST DISTRIBUTION)', NULL, '{\"distributor_id\":10,\"name\":\"Magic Sarap\",\"sku\":\"MS-60\",\"category\":\"All-Purpose Seasonings\",\"purchase_price\":60.8,\"default_discount\":2.2,\"default_dealing_price\":63}', '127.0.0.1', '2026-09-30 07:11:46', '2026-09-30 07:11:46'),
(40, 1, 'created', 'Product', 39, 'Added product: Nescafe Stick (Distributor: FAST DISTRIBUTION)', NULL, '{\"distributor_id\":10,\"name\":\"Nescafe Stick\",\"sku\":\"N-S-21\",\"category\":\"Instant Coffee\",\"purchase_price\":108,\"default_discount\":2,\"default_dealing_price\":110}', '127.0.0.1', '2026-09-30 07:12:26', '2026-09-30 07:12:26'),
(41, 1, 'created', 'Product', 40, 'Added product: Nescafe Twin Orig (Distributor: FAST DISTRIBUTION)', NULL, '{\"distributor_id\":10,\"name\":\"Nescafe Twin Orig\",\"sku\":\"N-TO-20\",\"category\":\"Instant Coffee\",\"purchase_price\":118.5,\"default_discount\":2.5,\"default_dealing_price\":121}', '127.0.0.1', '2026-09-30 07:14:25', '2026-09-30 07:14:25');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('winzelle-inventory-cache-setting.company_name', 's:8:\"WINZELLE\";', 1790831785),
('winzelle-inventory-cache-setting.default_vat_percentage', 's:2:\"12\";', 1790831785),
('winzelle-inventory-cache-setting.low_stock_threshold', 's:2:\"15\";', 1790831741),
('winzelle-inventory-cache-setting.notification_style', 's:6:\"number\";', 1790831785);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `distributors`
--

CREATE TABLE `distributors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `logo` varchar(500) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_favorite` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `distributors`
--

INSERT INTO `distributors` (`id`, `name`, `contact_number`, `email`, `logo`, `address`, `is_favorite`, `created_at`, `updated_at`) VALUES
(1, 'PEPSI', '+63 917 555 0101', 'sales@pepsico.com.ph', NULL, 'Pepsi-Cola Products Phils., Inc., Muntinlupa City', 0, '2026-09-27 04:12:25', '2026-09-30 06:40:44'),
(2, 'COCA-COLA BOTTLERS', '+63 918 555 0202', 'orders@coca-cola.com.ph', NULL, 'Coca-Cola Beverages Phils., Taguig City', 1, '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(3, 'SAN MIGUEL BREWERY', '+63 919 555 0303', 'distribution@sanmiguel.com.ph', NULL, 'San Miguel Head Office Complex, Mandaluyong', 0, '2026-09-27 04:12:25', '2026-09-28 22:07:17'),
(4, 'NESTLE PHILIPPINES', '+63 920 555 0404', 'sales@nestle.com.ph', NULL, 'Nestle Center, Rockwell Center, Makati City', 0, '2026-09-27 04:12:25', '2026-09-28 22:07:19'),
(5, 'UNIVERSAL ROBINA CORP', '+63 921 555 0505', 'orders@urc.com.ph', NULL, 'Tera Tower, Bridgetowne, Quezon City', 0, '2026-09-27 04:12:25', '2026-09-28 22:07:15'),
(6, 'ALASKA MILK CORP', '+63 922 555 0606', 'info@alaskamilk.com', NULL, 'Corinthian Plaza, Paseo de Roxas, Makati', 0, '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(7, 'LEMON SQUARE', '+63 9947546327', NULL, NULL, NULL, 0, '2026-09-30 04:39:36', '2026-09-30 04:39:36'),
(9, 'BATMAN TRADING', '+63 918 555 0202', NULL, NULL, NULL, 0, '2026-09-30 06:46:14', '2026-09-30 06:46:14'),
(10, 'FAST DISTRIBUTION', '+63 918 555 0202', NULL, NULL, NULL, 0, '2026-09-30 06:46:25', '2026-09-30 06:46:25'),
(11, 'G11 GOLDEN CENTURY MARKETING', '+63 918 555 0202', NULL, NULL, NULL, 0, '2026-09-30 06:46:40', '2026-09-30 06:46:40'),
(12, 'SUVISCO INDUSTRIES INC.', '+63 918 555 0202', NULL, NULL, NULL, 0, '2026-09-30 06:47:00', '2026-09-30 06:47:00'),
(13, 'CDO RRC MARKETING', '+63 918 555 0202', NULL, NULL, NULL, 0, '2026-09-30 06:47:21', '2026-09-30 06:47:21'),
(14, 'HAPPY NORTHMIN INC.', '+63 918 555 0202', NULL, NULL, NULL, 0, '2026-09-30 06:47:59', '2026-09-30 06:47:59'),
(15, 'SALWIN MART', '+63 918 555 0202', NULL, NULL, NULL, 0, '2026-09-30 06:48:12', '2026-09-30 06:48:12'),
(16, 'LIMAC ENTERPRISES', '+63 918 555 0202', NULL, NULL, NULL, 0, '2026-09-30 06:49:15', '2026-09-30 06:49:15'),
(17, 'ANAND MKTG CORP', '+63 918 555 0202', NULL, NULL, NULL, 0, '2026-09-30 06:49:35', '2026-09-30 06:49:35'),
(18, 'NORTH MINDANAO DIST.', '+63 917 123 4567', NULL, NULL, NULL, 0, '2026-09-30 06:50:24', '2026-09-30 06:50:24'),
(19, 'GMB GENERAL MERCHANDISE', '+63 917 123 4567', NULL, NULL, NULL, 0, '2026-09-30 06:50:40', '2026-09-30 06:50:40');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'General',
  `distributor_name` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
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
(12, 12, 'COKE-1.5L', 'Carbonated', 'COCA-COLA BOTTLERS', 'Coke Original 1.5L /12', 10, '450.00', '480.00', '2026-09-27 06:13:30', '2026-09-27 06:13:30'),
(13, 19, 'LS-LV-6', 'Dessert', 'LEMON SQUARE', 'Lava Cake', 5, '70.83', '74.00', '2026-09-30 04:44:37', '2026-09-30 06:28:13'),
(14, 20, 'BT-200', 'Milk', 'ANAND MKTG CORP', 'Birtch Tree', 0, '69.07', '74.00', '2026-09-30 06:52:27', '2026-09-30 06:52:27'),
(15, 21, 'BT-C-20', 'Milk', 'ANAND MKTG CORP', 'Birtch Tree Choco', 0, '74.48', '75.00', '2026-09-30 06:53:07', '2026-09-30 06:53:07'),
(16, 22, 'CT-FIO-12', 'Canned Goods', 'ANAND MKTG CORP', 'Century Tuna Flakes in Oil', 0, '34.03', '36.00', '2026-09-30 06:53:50', '2026-09-30 06:53:50'),
(17, 23, 'CT-FHS-12', 'Canned Goods', 'ANAND MKTG CORP', 'Century Tuna Flakes Hot & Spicy', 0, '34.40', '36.00', '2026-09-30 06:55:52', '2026-09-30 06:55:52'),
(18, 24, 'F-FIO-12', 'Canned Goods', 'ANAND MKTG CORP', 'Fresca Flakes in Oil', 0, '28.62', '30.00', '2026-09-30 06:56:33', '2026-09-30 06:56:33'),
(19, 25, 'F-HS-12', 'Canned Goods', 'ANAND MKTG CORP', 'Fresca Hot & Spicy', 0, '28.94', '30.00', '2026-09-30 06:56:58', '2026-09-30 06:56:58'),
(20, 26, 'F-TA-2', 'Canned Goods', 'ANAND MKTG CORP', 'Fresca Tuna Afritada', 0, '25.42', '28.00', '2026-09-30 06:58:17', '2026-09-30 06:58:17'),
(21, 27, 'CM-400ML-24', 'Coconut Milk & Cream', 'ANAND MKTG CORP', 'Coco Mama 400ml', 0, '60.00', '62.00', '2026-09-30 06:59:35', '2026-09-30 06:59:35'),
(22, 28, 'S555-TS-12', 'Canned Goods', 'ANAND MKTG CORP', '555 Sardines T.S.', 0, '22.33', '24.00', '2026-09-30 07:00:08', '2026-09-30 07:00:08'),
(23, 29, 'H-175G-12', 'Canned Beans', 'ANAND MKTG CORP', 'Hunts 175g', 0, '22.14', '25.00', '2026-09-30 07:03:14', '2026-09-30 07:03:14'),
(24, 30, 'A-CB-150G', 'Canned Meat', 'ANAND MKTG CORP', 'Argentina Corned Beef 150g', 0, '33.57', '36.00', '2026-09-30 07:04:01', '2026-09-30 07:04:01'),
(25, 31, 'A-BF-250G', 'Canned Meat', 'ANAND MKTG CORP', 'Argentina Beef Loaf 250g', 0, '29.05', '32.00', '2026-09-30 07:05:36', '2026-09-30 07:05:36'),
(26, 32, 'L7-CN-150G', 'Canned Meat', 'ANAND MKTG CORP', 'Lucky 7 Carne Norte 150g', 0, '20.71', '22.00', '2026-09-30 07:06:02', '2026-09-30 07:06:02'),
(27, 33, 'EGG-XL', 'Fresh Eggs', 'BATMAN TRADING', 'EGG XL', 0, '240.00', '250.00', '2026-09-30 07:07:23', '2026-09-30 07:07:23'),
(28, 34, 'PB-53', 'Rice', 'BATMAN TRADING', 'Princess Bea', 0, '1300.00', '1330.00', '2026-09-30 07:08:11', '2026-09-30 07:08:11'),
(29, 35, 'P-96', 'Instant Noodles', 'CDO RRC MARKETING', 'Payless', 0, '17.50', '18.13', '2026-09-30 07:09:30', '2026-09-30 07:09:30'),
(30, 36, 'BB-S-24', 'Powdered Milk', 'FAST DISTRIBUTION', 'BEARBRAND SWAK /24', 0, '83.96', '87.01', '2026-09-30 07:10:24', '2026-09-30 07:10:24'),
(31, 37, 'M-42', 'Powdered Malt Drinks', 'FAST DISTRIBUTION', 'Milo /42', 0, '103.10', '106.00', '2026-09-30 07:11:15', '2026-09-30 07:11:15'),
(32, 38, 'MS-60', 'All-Purpose Seasonings', 'FAST DISTRIBUTION', 'Magic Sarap', 0, '60.80', '63.00', '2026-09-30 07:11:46', '2026-09-30 07:11:46'),
(33, 39, 'N-S-21', 'Instant Coffee', 'FAST DISTRIBUTION', 'Nescafe Stick', 0, '108.00', '110.00', '2026-09-30 07:12:26', '2026-09-30 07:12:26'),
(34, 40, 'N-TO-20', 'Instant Coffee', 'FAST DISTRIBUTION', 'Nescafe Twin Orig', 0, '118.50', '121.00', '2026-09-30 07:14:25', '2026-09-30 07:14:25');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
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
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
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
  `migration` varchar(255) NOT NULL,
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
(7, '2026_09_27_000004_create_purchases_table', 1),
(8, '2026_09_30_000001_add_role_to_users_table', 2),
(9, '2026_09_30_000002_create_activity_logs_table', 2),
(10, '2026_09_30_000003_create_notifications_table', 2),
(11, '2026_09_30_000004_create_settings_table', 2),
(12, '2026_09_30_000005_add_actor_to_notifications_table', 3),
(13, '2026_09_30_000006_add_logo_to_distributors_table', 3);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `details` text DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `actor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `actor_name` varchar(255) DEFAULT NULL,
  `actor_role` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `details`, `link`, `is_read`, `created_at`, `updated_at`, `actor_id`, `actor_name`, `actor_role`) VALUES
(1, 1, 'low_stock', 'Low Stock Alert', 'Lava Cake is running low (5 units remaining).', NULL, '/inventory', 1, '2026-09-30 06:28:14', '2026-09-30 06:45:29', NULL, NULL, NULL),
(2, 2, 'low_stock', 'Low Stock Alert', 'Lava Cake is running low (5 units remaining).', NULL, '/inventory', 1, '2026-09-30 06:28:14', '2026-09-30 06:30:11', NULL, NULL, NULL),
(3, 3, 'low_stock', 'Low Stock Alert', 'Lava Cake is running low (5 units remaining).', NULL, '/inventory', 0, '2026-09-30 06:28:14', '2026-09-30 06:28:14', NULL, NULL, NULL),
(4, 1, 'low_stock', 'Low Stock Alert', 'Lava Cake is running low (5 units remaining).', NULL, '/inventory', 1, '2026-09-30 06:28:15', '2026-09-30 06:45:29', NULL, NULL, NULL),
(5, 2, 'low_stock', 'Low Stock Alert', 'Lava Cake is running low (5 units remaining).', NULL, '/inventory', 1, '2026-09-30 06:28:15', '2026-09-30 06:29:39', NULL, NULL, NULL),
(6, 3, 'low_stock', 'Low Stock Alert', 'Lava Cake is running low (5 units remaining).', NULL, '/inventory', 0, '2026-09-30 06:28:15', '2026-09-30 06:28:15', NULL, NULL, NULL),
(7, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'BATMAN TRADING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:12', '2026-09-30 06:46:12', 1, 'System Admin', 'admin'),
(8, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'BATMAN TRADING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:12', '2026-09-30 06:46:12', 1, 'System Admin', 'admin'),
(9, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'BATMAN TRADING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:12', '2026-09-30 06:46:12', 1, 'System Admin', 'admin'),
(10, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'BATMAN TRADING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:14', '2026-09-30 06:46:14', 1, 'System Admin', 'admin'),
(11, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'BATMAN TRADING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:14', '2026-09-30 06:46:14', 1, 'System Admin', 'admin'),
(12, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'BATMAN TRADING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:14', '2026-09-30 06:46:14', 1, 'System Admin', 'admin'),
(13, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'FAST DISTRIBUTION\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:25', '2026-09-30 06:46:25', 1, 'System Admin', 'admin'),
(14, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'FAST DISTRIBUTION\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:25', '2026-09-30 06:46:25', 1, 'System Admin', 'admin'),
(15, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'FAST DISTRIBUTION\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:25', '2026-09-30 06:46:25', 1, 'System Admin', 'admin'),
(16, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'G11 GOLDEN CENTURY MARKETING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:40', '2026-09-30 06:46:40', 1, 'System Admin', 'admin'),
(17, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'G11 GOLDEN CENTURY MARKETING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:40', '2026-09-30 06:46:40', 1, 'System Admin', 'admin'),
(18, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'G11 GOLDEN CENTURY MARKETING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:46:40', '2026-09-30 06:46:40', 1, 'System Admin', 'admin'),
(19, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'SUVISCO INDUSTRIES INC.\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:47:00', '2026-09-30 06:47:00', 1, 'System Admin', 'admin'),
(20, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'SUVISCO INDUSTRIES INC.\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:47:00', '2026-09-30 06:47:00', 1, 'System Admin', 'admin'),
(21, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'SUVISCO INDUSTRIES INC.\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:47:00', '2026-09-30 06:47:00', 1, 'System Admin', 'admin'),
(22, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'CDO RRC MARKETING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:47:21', '2026-09-30 06:47:21', 1, 'System Admin', 'admin'),
(23, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'CDO RRC MARKETING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:47:21', '2026-09-30 06:47:21', 1, 'System Admin', 'admin'),
(24, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'CDO RRC MARKETING\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:47:21', '2026-09-30 06:47:21', 1, 'System Admin', 'admin'),
(25, 1, 'distributor_deleted', 'Distributor Removed', 'Distributor \'BATMAN TRADING\' was removed from the system.', NULL, '/distributors', 0, '2026-09-30 06:47:47', '2026-09-30 06:47:47', 1, 'System Admin', 'admin'),
(26, 2, 'distributor_deleted', 'Distributor Removed', 'Distributor \'BATMAN TRADING\' was removed from the system.', NULL, '/distributors', 0, '2026-09-30 06:47:47', '2026-09-30 06:47:47', 1, 'System Admin', 'admin'),
(27, 3, 'distributor_deleted', 'Distributor Removed', 'Distributor \'BATMAN TRADING\' was removed from the system.', NULL, '/distributors', 0, '2026-09-30 06:47:47', '2026-09-30 06:47:47', 1, 'System Admin', 'admin'),
(28, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'HAPPY NORTHMIN INC.\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:47:59', '2026-09-30 06:47:59', 1, 'System Admin', 'admin'),
(29, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'HAPPY NORTHMIN INC.\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:48:00', '2026-09-30 06:48:00', 1, 'System Admin', 'admin'),
(30, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'HAPPY NORTHMIN INC.\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:48:00', '2026-09-30 06:48:00', 1, 'System Admin', 'admin'),
(31, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'SALWIN MART\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:48:12', '2026-09-30 06:48:12', 1, 'System Admin', 'admin'),
(32, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'SALWIN MART\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:48:12', '2026-09-30 06:48:12', 1, 'System Admin', 'admin'),
(33, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'SALWIN MART\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:48:12', '2026-09-30 06:48:12', 1, 'System Admin', 'admin'),
(34, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'LIMAC ENTERPRISES\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:49:15', '2026-09-30 06:49:15', 1, 'System Admin', 'admin'),
(35, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'LIMAC ENTERPRISES\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:49:15', '2026-09-30 06:49:15', 1, 'System Admin', 'admin'),
(36, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'LIMAC ENTERPRISES\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:49:15', '2026-09-30 06:49:15', 1, 'System Admin', 'admin'),
(37, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'ANAND MKTG CORP\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:49:35', '2026-09-30 06:49:35', 1, 'System Admin', 'admin'),
(38, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'ANAND MKTG CORP\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:49:35', '2026-09-30 06:49:35', 1, 'System Admin', 'admin'),
(39, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'ANAND MKTG CORP\' has been added to the directory.', 'Contact: +63 918 555 0202 | Email: ', '/distributors', 0, '2026-09-30 06:49:35', '2026-09-30 06:49:35', 1, 'System Admin', 'admin'),
(40, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'NORTH MINDANAO DIST.\' has been added to the directory.', 'Contact: +63 917 123 4567 | Email: ', '/distributors', 0, '2026-09-30 06:50:24', '2026-09-30 06:50:24', 1, 'System Admin', 'admin'),
(41, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'NORTH MINDANAO DIST.\' has been added to the directory.', 'Contact: +63 917 123 4567 | Email: ', '/distributors', 0, '2026-09-30 06:50:24', '2026-09-30 06:50:24', 1, 'System Admin', 'admin'),
(42, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'NORTH MINDANAO DIST.\' has been added to the directory.', 'Contact: +63 917 123 4567 | Email: ', '/distributors', 0, '2026-09-30 06:50:24', '2026-09-30 06:50:24', 1, 'System Admin', 'admin'),
(43, 1, 'distributor_added', 'New Distributor Added', 'Distributor \'GMB GENERAL MERCHANDISE\' has been added to the directory.', 'Contact: +63 917 123 4567 | Email: ', '/distributors', 0, '2026-09-30 06:50:40', '2026-09-30 06:50:40', 1, 'System Admin', 'admin'),
(44, 2, 'distributor_added', 'New Distributor Added', 'Distributor \'GMB GENERAL MERCHANDISE\' has been added to the directory.', 'Contact: +63 917 123 4567 | Email: ', '/distributors', 0, '2026-09-30 06:50:40', '2026-09-30 06:50:40', 1, 'System Admin', 'admin'),
(45, 3, 'distributor_added', 'New Distributor Added', 'Distributor \'GMB GENERAL MERCHANDISE\' has been added to the directory.', 'Contact: +63 917 123 4567 | Email: ', '/distributors', 0, '2026-09-30 06:50:40', '2026-09-30 06:50:40', 1, 'System Admin', 'admin'),
(46, 1, 'product_added', 'New Product Added', 'Product \'Birtch Tree\' was added under ANAND MKTG CORP.', 'SKU: BT-200 | Purchase Price: ₱69.07 | Dealing Price: ₱74', '/products?distributor_id=17', 0, '2026-09-30 06:52:27', '2026-09-30 06:52:27', 1, 'System Admin', 'admin'),
(47, 2, 'product_added', 'New Product Added', 'Product \'Birtch Tree\' was added under ANAND MKTG CORP.', 'SKU: BT-200 | Purchase Price: ₱69.07 | Dealing Price: ₱74', '/products?distributor_id=17', 0, '2026-09-30 06:52:27', '2026-09-30 06:52:27', 1, 'System Admin', 'admin'),
(48, 3, 'product_added', 'New Product Added', 'Product \'Birtch Tree\' was added under ANAND MKTG CORP.', 'SKU: BT-200 | Purchase Price: ₱69.07 | Dealing Price: ₱74', '/products?distributor_id=17', 0, '2026-09-30 06:52:27', '2026-09-30 06:52:27', 1, 'System Admin', 'admin'),
(49, 1, 'product_added', 'New Product Added', 'Product \'Birtch Tree Choco\' was added under ANAND MKTG CORP.', 'SKU: BT-C-20 | Purchase Price: ₱74.48 | Dealing Price: ₱75', '/products?distributor_id=17', 0, '2026-09-30 06:53:07', '2026-09-30 06:53:07', 1, 'System Admin', 'admin'),
(50, 2, 'product_added', 'New Product Added', 'Product \'Birtch Tree Choco\' was added under ANAND MKTG CORP.', 'SKU: BT-C-20 | Purchase Price: ₱74.48 | Dealing Price: ₱75', '/products?distributor_id=17', 0, '2026-09-30 06:53:07', '2026-09-30 06:53:07', 1, 'System Admin', 'admin'),
(51, 3, 'product_added', 'New Product Added', 'Product \'Birtch Tree Choco\' was added under ANAND MKTG CORP.', 'SKU: BT-C-20 | Purchase Price: ₱74.48 | Dealing Price: ₱75', '/products?distributor_id=17', 0, '2026-09-30 06:53:07', '2026-09-30 06:53:07', 1, 'System Admin', 'admin'),
(52, 1, 'product_added', 'New Product Added', 'Product \'Century Tuna Flakes in Oil\' was added under ANAND MKTG CORP.', 'SKU: CT-FIO-12 | Purchase Price: ₱34.03 | Dealing Price: ₱36', '/products?distributor_id=17', 0, '2026-09-30 06:53:50', '2026-09-30 06:53:50', 1, 'System Admin', 'admin'),
(53, 2, 'product_added', 'New Product Added', 'Product \'Century Tuna Flakes in Oil\' was added under ANAND MKTG CORP.', 'SKU: CT-FIO-12 | Purchase Price: ₱34.03 | Dealing Price: ₱36', '/products?distributor_id=17', 0, '2026-09-30 06:53:50', '2026-09-30 06:53:50', 1, 'System Admin', 'admin'),
(54, 3, 'product_added', 'New Product Added', 'Product \'Century Tuna Flakes in Oil\' was added under ANAND MKTG CORP.', 'SKU: CT-FIO-12 | Purchase Price: ₱34.03 | Dealing Price: ₱36', '/products?distributor_id=17', 0, '2026-09-30 06:53:50', '2026-09-30 06:53:50', 1, 'System Admin', 'admin'),
(55, 1, 'product_added', 'New Product Added', 'Product \'Century Tuna Flakes Hot & Spicy\' was added under ANAND MKTG CORP.', 'SKU: CT-FHS-12 | Purchase Price: ₱34.4 | Dealing Price: ₱36', '/products?distributor_id=17', 0, '2026-09-30 06:55:52', '2026-09-30 06:55:52', 1, 'System Admin', 'admin'),
(56, 2, 'product_added', 'New Product Added', 'Product \'Century Tuna Flakes Hot & Spicy\' was added under ANAND MKTG CORP.', 'SKU: CT-FHS-12 | Purchase Price: ₱34.4 | Dealing Price: ₱36', '/products?distributor_id=17', 0, '2026-09-30 06:55:52', '2026-09-30 06:55:52', 1, 'System Admin', 'admin'),
(57, 3, 'product_added', 'New Product Added', 'Product \'Century Tuna Flakes Hot & Spicy\' was added under ANAND MKTG CORP.', 'SKU: CT-FHS-12 | Purchase Price: ₱34.4 | Dealing Price: ₱36', '/products?distributor_id=17', 0, '2026-09-30 06:55:52', '2026-09-30 06:55:52', 1, 'System Admin', 'admin'),
(58, 1, 'product_added', 'New Product Added', 'Product \'Fresca Flakes in Oil\' was added under ANAND MKTG CORP.', 'SKU: F-FIO-12 | Purchase Price: ₱28.62 | Dealing Price: ₱30', '/products?distributor_id=17', 0, '2026-09-30 06:56:33', '2026-09-30 06:56:33', 1, 'System Admin', 'admin'),
(59, 2, 'product_added', 'New Product Added', 'Product \'Fresca Flakes in Oil\' was added under ANAND MKTG CORP.', 'SKU: F-FIO-12 | Purchase Price: ₱28.62 | Dealing Price: ₱30', '/products?distributor_id=17', 0, '2026-09-30 06:56:33', '2026-09-30 06:56:33', 1, 'System Admin', 'admin'),
(60, 3, 'product_added', 'New Product Added', 'Product \'Fresca Flakes in Oil\' was added under ANAND MKTG CORP.', 'SKU: F-FIO-12 | Purchase Price: ₱28.62 | Dealing Price: ₱30', '/products?distributor_id=17', 0, '2026-09-30 06:56:33', '2026-09-30 06:56:33', 1, 'System Admin', 'admin'),
(61, 1, 'product_added', 'New Product Added', 'Product \'Fresca Hot & Spicy\' was added under ANAND MKTG CORP.', 'SKU: F-HS-12 | Purchase Price: ₱28.94 | Dealing Price: ₱30', '/products?distributor_id=17', 0, '2026-09-30 06:56:58', '2026-09-30 06:56:58', 1, 'System Admin', 'admin'),
(62, 2, 'product_added', 'New Product Added', 'Product \'Fresca Hot & Spicy\' was added under ANAND MKTG CORP.', 'SKU: F-HS-12 | Purchase Price: ₱28.94 | Dealing Price: ₱30', '/products?distributor_id=17', 0, '2026-09-30 06:56:58', '2026-09-30 06:56:58', 1, 'System Admin', 'admin'),
(63, 3, 'product_added', 'New Product Added', 'Product \'Fresca Hot & Spicy\' was added under ANAND MKTG CORP.', 'SKU: F-HS-12 | Purchase Price: ₱28.94 | Dealing Price: ₱30', '/products?distributor_id=17', 0, '2026-09-30 06:56:58', '2026-09-30 06:56:58', 1, 'System Admin', 'admin'),
(64, 1, 'product_added', 'New Product Added', 'Product \'Fresca Tuna Afritada\' was added under ANAND MKTG CORP.', 'SKU: F-TA-2 | Purchase Price: ₱25.42 | Dealing Price: ₱28', '/products?distributor_id=17', 0, '2026-09-30 06:58:17', '2026-09-30 06:58:17', 1, 'System Admin', 'admin'),
(65, 2, 'product_added', 'New Product Added', 'Product \'Fresca Tuna Afritada\' was added under ANAND MKTG CORP.', 'SKU: F-TA-2 | Purchase Price: ₱25.42 | Dealing Price: ₱28', '/products?distributor_id=17', 0, '2026-09-30 06:58:17', '2026-09-30 06:58:17', 1, 'System Admin', 'admin'),
(66, 3, 'product_added', 'New Product Added', 'Product \'Fresca Tuna Afritada\' was added under ANAND MKTG CORP.', 'SKU: F-TA-2 | Purchase Price: ₱25.42 | Dealing Price: ₱28', '/products?distributor_id=17', 0, '2026-09-30 06:58:17', '2026-09-30 06:58:17', 1, 'System Admin', 'admin'),
(67, 1, 'product_added', 'New Product Added', 'Product \'Coco Mama 400ml\' was added under ANAND MKTG CORP.', 'SKU: CM-400ML-24 | Purchase Price: ₱60 | Dealing Price: ₱62', '/products?distributor_id=17', 0, '2026-09-30 06:59:35', '2026-09-30 06:59:35', 1, 'System Admin', 'admin'),
(68, 2, 'product_added', 'New Product Added', 'Product \'Coco Mama 400ml\' was added under ANAND MKTG CORP.', 'SKU: CM-400ML-24 | Purchase Price: ₱60 | Dealing Price: ₱62', '/products?distributor_id=17', 0, '2026-09-30 06:59:35', '2026-09-30 06:59:35', 1, 'System Admin', 'admin'),
(69, 3, 'product_added', 'New Product Added', 'Product \'Coco Mama 400ml\' was added under ANAND MKTG CORP.', 'SKU: CM-400ML-24 | Purchase Price: ₱60 | Dealing Price: ₱62', '/products?distributor_id=17', 0, '2026-09-30 06:59:35', '2026-09-30 06:59:35', 1, 'System Admin', 'admin'),
(70, 1, 'product_added', 'New Product Added', 'Product \'555 Sardines T.S.\' was added under ANAND MKTG CORP.', 'SKU: S555-TS-12 | Purchase Price: ₱22.33 | Dealing Price: ₱24', '/products?distributor_id=17', 0, '2026-09-30 07:00:08', '2026-09-30 07:00:08', 1, 'System Admin', 'admin'),
(71, 2, 'product_added', 'New Product Added', 'Product \'555 Sardines T.S.\' was added under ANAND MKTG CORP.', 'SKU: S555-TS-12 | Purchase Price: ₱22.33 | Dealing Price: ₱24', '/products?distributor_id=17', 0, '2026-09-30 07:00:08', '2026-09-30 07:00:08', 1, 'System Admin', 'admin'),
(72, 3, 'product_added', 'New Product Added', 'Product \'555 Sardines T.S.\' was added under ANAND MKTG CORP.', 'SKU: S555-TS-12 | Purchase Price: ₱22.33 | Dealing Price: ₱24', '/products?distributor_id=17', 0, '2026-09-30 07:00:08', '2026-09-30 07:00:08', 1, 'System Admin', 'admin'),
(73, 1, 'product_added', 'New Product Added', 'Product \'Hunts 175g\' was added under ANAND MKTG CORP.', 'SKU: H-175G-12 | Purchase Price: ₱22.14 | Dealing Price: ₱25', '/products?distributor_id=17', 0, '2026-09-30 07:03:14', '2026-09-30 07:03:14', 1, 'System Admin', 'admin'),
(74, 2, 'product_added', 'New Product Added', 'Product \'Hunts 175g\' was added under ANAND MKTG CORP.', 'SKU: H-175G-12 | Purchase Price: ₱22.14 | Dealing Price: ₱25', '/products?distributor_id=17', 0, '2026-09-30 07:03:14', '2026-09-30 07:03:14', 1, 'System Admin', 'admin'),
(75, 3, 'product_added', 'New Product Added', 'Product \'Hunts 175g\' was added under ANAND MKTG CORP.', 'SKU: H-175G-12 | Purchase Price: ₱22.14 | Dealing Price: ₱25', '/products?distributor_id=17', 0, '2026-09-30 07:03:14', '2026-09-30 07:03:14', 1, 'System Admin', 'admin'),
(76, 1, 'product_added', 'New Product Added', 'Product \'Argentina Corned Beef 150g\' was added under ANAND MKTG CORP.', 'SKU: A-CB-150G | Purchase Price: ₱33.57 | Dealing Price: ₱36', '/products?distributor_id=17', 0, '2026-09-30 07:04:01', '2026-09-30 07:04:01', 1, 'System Admin', 'admin'),
(77, 2, 'product_added', 'New Product Added', 'Product \'Argentina Corned Beef 150g\' was added under ANAND MKTG CORP.', 'SKU: A-CB-150G | Purchase Price: ₱33.57 | Dealing Price: ₱36', '/products?distributor_id=17', 0, '2026-09-30 07:04:01', '2026-09-30 07:04:01', 1, 'System Admin', 'admin'),
(78, 3, 'product_added', 'New Product Added', 'Product \'Argentina Corned Beef 150g\' was added under ANAND MKTG CORP.', 'SKU: A-CB-150G | Purchase Price: ₱33.57 | Dealing Price: ₱36', '/products?distributor_id=17', 0, '2026-09-30 07:04:01', '2026-09-30 07:04:01', 1, 'System Admin', 'admin'),
(79, 1, 'product_added', 'New Product Added', 'Product \'Argentina Beef Loaf 250g\' was added under ANAND MKTG CORP.', 'SKU: A-BF-250G | Purchase Price: ₱29.05 | Dealing Price: ₱32', '/products?distributor_id=17', 0, '2026-09-30 07:05:36', '2026-09-30 07:05:36', 1, 'System Admin', 'admin'),
(80, 2, 'product_added', 'New Product Added', 'Product \'Argentina Beef Loaf 250g\' was added under ANAND MKTG CORP.', 'SKU: A-BF-250G | Purchase Price: ₱29.05 | Dealing Price: ₱32', '/products?distributor_id=17', 0, '2026-09-30 07:05:36', '2026-09-30 07:05:36', 1, 'System Admin', 'admin'),
(81, 3, 'product_added', 'New Product Added', 'Product \'Argentina Beef Loaf 250g\' was added under ANAND MKTG CORP.', 'SKU: A-BF-250G | Purchase Price: ₱29.05 | Dealing Price: ₱32', '/products?distributor_id=17', 0, '2026-09-30 07:05:36', '2026-09-30 07:05:36', 1, 'System Admin', 'admin'),
(82, 1, 'product_added', 'New Product Added', 'Product \'Lucky 7 Carne Norte 150g\' was added under ANAND MKTG CORP.', 'SKU: L7-CN-150G | Purchase Price: ₱20.71 | Dealing Price: ₱22', '/products?distributor_id=17', 0, '2026-09-30 07:06:02', '2026-09-30 07:06:02', 1, 'System Admin', 'admin'),
(83, 2, 'product_added', 'New Product Added', 'Product \'Lucky 7 Carne Norte 150g\' was added under ANAND MKTG CORP.', 'SKU: L7-CN-150G | Purchase Price: ₱20.71 | Dealing Price: ₱22', '/products?distributor_id=17', 0, '2026-09-30 07:06:02', '2026-09-30 07:06:02', 1, 'System Admin', 'admin'),
(84, 3, 'product_added', 'New Product Added', 'Product \'Lucky 7 Carne Norte 150g\' was added under ANAND MKTG CORP.', 'SKU: L7-CN-150G | Purchase Price: ₱20.71 | Dealing Price: ₱22', '/products?distributor_id=17', 0, '2026-09-30 07:06:02', '2026-09-30 07:06:02', 1, 'System Admin', 'admin'),
(85, 1, 'product_added', 'New Product Added', 'Product \'EGG XL\' was added under BATMAN TRADING.', 'SKU: EGG-XL | Purchase Price: ₱240 | Dealing Price: ₱250', '/products?distributor_id=9', 0, '2026-09-30 07:07:23', '2026-09-30 07:07:23', 1, 'System Admin', 'admin'),
(86, 2, 'product_added', 'New Product Added', 'Product \'EGG XL\' was added under BATMAN TRADING.', 'SKU: EGG-XL | Purchase Price: ₱240 | Dealing Price: ₱250', '/products?distributor_id=9', 0, '2026-09-30 07:07:23', '2026-09-30 07:07:23', 1, 'System Admin', 'admin'),
(87, 3, 'product_added', 'New Product Added', 'Product \'EGG XL\' was added under BATMAN TRADING.', 'SKU: EGG-XL | Purchase Price: ₱240 | Dealing Price: ₱250', '/products?distributor_id=9', 0, '2026-09-30 07:07:23', '2026-09-30 07:07:23', 1, 'System Admin', 'admin'),
(88, 1, 'product_added', 'New Product Added', 'Product \'Princess Bea\' was added under BATMAN TRADING.', 'SKU: PB-53 | Purchase Price: ₱1300 | Dealing Price: ₱1330', '/products?distributor_id=9', 0, '2026-09-30 07:08:11', '2026-09-30 07:08:11', 1, 'System Admin', 'admin'),
(89, 2, 'product_added', 'New Product Added', 'Product \'Princess Bea\' was added under BATMAN TRADING.', 'SKU: PB-53 | Purchase Price: ₱1300 | Dealing Price: ₱1330', '/products?distributor_id=9', 0, '2026-09-30 07:08:11', '2026-09-30 07:08:11', 1, 'System Admin', 'admin'),
(90, 3, 'product_added', 'New Product Added', 'Product \'Princess Bea\' was added under BATMAN TRADING.', 'SKU: PB-53 | Purchase Price: ₱1300 | Dealing Price: ₱1330', '/products?distributor_id=9', 0, '2026-09-30 07:08:11', '2026-09-30 07:08:11', 1, 'System Admin', 'admin'),
(91, 1, 'product_added', 'New Product Added', 'Product \'Payless\' was added under CDO RRC MARKETING.', 'SKU: P-96 | Purchase Price: ₱17.5 | Dealing Price: ₱18.13', '/products?distributor_id=13', 0, '2026-09-30 07:09:30', '2026-09-30 07:09:30', 1, 'System Admin', 'admin'),
(92, 2, 'product_added', 'New Product Added', 'Product \'Payless\' was added under CDO RRC MARKETING.', 'SKU: P-96 | Purchase Price: ₱17.5 | Dealing Price: ₱18.13', '/products?distributor_id=13', 0, '2026-09-30 07:09:30', '2026-09-30 07:09:30', 1, 'System Admin', 'admin'),
(93, 3, 'product_added', 'New Product Added', 'Product \'Payless\' was added under CDO RRC MARKETING.', 'SKU: P-96 | Purchase Price: ₱17.5 | Dealing Price: ₱18.13', '/products?distributor_id=13', 0, '2026-09-30 07:09:30', '2026-09-30 07:09:30', 1, 'System Admin', 'admin'),
(94, 1, 'product_added', 'New Product Added', 'Product \'BEARBRAND SWAK /24\' was added under FAST DISTRIBUTION.', 'SKU: BB-S-24 | Purchase Price: ₱83.96 | Dealing Price: ₱87.01', '/products?distributor_id=10', 0, '2026-09-30 07:10:24', '2026-09-30 07:10:24', 1, 'System Admin', 'admin'),
(95, 2, 'product_added', 'New Product Added', 'Product \'BEARBRAND SWAK /24\' was added under FAST DISTRIBUTION.', 'SKU: BB-S-24 | Purchase Price: ₱83.96 | Dealing Price: ₱87.01', '/products?distributor_id=10', 0, '2026-09-30 07:10:24', '2026-09-30 07:10:24', 1, 'System Admin', 'admin'),
(96, 3, 'product_added', 'New Product Added', 'Product \'BEARBRAND SWAK /24\' was added under FAST DISTRIBUTION.', 'SKU: BB-S-24 | Purchase Price: ₱83.96 | Dealing Price: ₱87.01', '/products?distributor_id=10', 0, '2026-09-30 07:10:24', '2026-09-30 07:10:24', 1, 'System Admin', 'admin'),
(97, 1, 'product_added', 'New Product Added', 'Product \'Milo /42\' was added under FAST DISTRIBUTION.', 'SKU: M-42 | Purchase Price: ₱103.1 | Dealing Price: ₱106', '/products?distributor_id=10', 0, '2026-09-30 07:11:15', '2026-09-30 07:11:15', 1, 'System Admin', 'admin'),
(98, 2, 'product_added', 'New Product Added', 'Product \'Milo /42\' was added under FAST DISTRIBUTION.', 'SKU: M-42 | Purchase Price: ₱103.1 | Dealing Price: ₱106', '/products?distributor_id=10', 0, '2026-09-30 07:11:15', '2026-09-30 07:11:15', 1, 'System Admin', 'admin'),
(99, 3, 'product_added', 'New Product Added', 'Product \'Milo /42\' was added under FAST DISTRIBUTION.', 'SKU: M-42 | Purchase Price: ₱103.1 | Dealing Price: ₱106', '/products?distributor_id=10', 0, '2026-09-30 07:11:15', '2026-09-30 07:11:15', 1, 'System Admin', 'admin'),
(100, 1, 'product_added', 'New Product Added', 'Product \'Magic Sarap\' was added under FAST DISTRIBUTION.', 'SKU: MS-60 | Purchase Price: ₱60.8 | Dealing Price: ₱63', '/products?distributor_id=10', 0, '2026-09-30 07:11:46', '2026-09-30 07:11:46', 1, 'System Admin', 'admin'),
(101, 2, 'product_added', 'New Product Added', 'Product \'Magic Sarap\' was added under FAST DISTRIBUTION.', 'SKU: MS-60 | Purchase Price: ₱60.8 | Dealing Price: ₱63', '/products?distributor_id=10', 0, '2026-09-30 07:11:46', '2026-09-30 07:11:46', 1, 'System Admin', 'admin'),
(102, 3, 'product_added', 'New Product Added', 'Product \'Magic Sarap\' was added under FAST DISTRIBUTION.', 'SKU: MS-60 | Purchase Price: ₱60.8 | Dealing Price: ₱63', '/products?distributor_id=10', 0, '2026-09-30 07:11:46', '2026-09-30 07:11:46', 1, 'System Admin', 'admin'),
(103, 1, 'product_added', 'New Product Added', 'Product \'Nescafe Stick\' was added under FAST DISTRIBUTION.', 'SKU: N-S-21 | Purchase Price: ₱108 | Dealing Price: ₱110', '/products?distributor_id=10', 0, '2026-09-30 07:12:26', '2026-09-30 07:12:26', 1, 'System Admin', 'admin'),
(104, 2, 'product_added', 'New Product Added', 'Product \'Nescafe Stick\' was added under FAST DISTRIBUTION.', 'SKU: N-S-21 | Purchase Price: ₱108 | Dealing Price: ₱110', '/products?distributor_id=10', 0, '2026-09-30 07:12:26', '2026-09-30 07:12:26', 1, 'System Admin', 'admin'),
(105, 3, 'product_added', 'New Product Added', 'Product \'Nescafe Stick\' was added under FAST DISTRIBUTION.', 'SKU: N-S-21 | Purchase Price: ₱108 | Dealing Price: ₱110', '/products?distributor_id=10', 0, '2026-09-30 07:12:26', '2026-09-30 07:12:26', 1, 'System Admin', 'admin'),
(106, 1, 'product_added', 'New Product Added', 'Product \'Nescafe Twin Orig\' was added under FAST DISTRIBUTION.', 'SKU: N-TO-20 | Purchase Price: ₱118.5 | Dealing Price: ₱121', '/products?distributor_id=10', 0, '2026-09-30 07:14:25', '2026-09-30 07:14:25', 1, 'System Admin', 'admin'),
(107, 2, 'product_added', 'New Product Added', 'Product \'Nescafe Twin Orig\' was added under FAST DISTRIBUTION.', 'SKU: N-TO-20 | Purchase Price: ₱118.5 | Dealing Price: ₱121', '/products?distributor_id=10', 0, '2026-09-30 07:14:25', '2026-09-30 07:14:25', 1, 'System Admin', 'admin'),
(108, 3, 'product_added', 'New Product Added', 'Product \'Nescafe Twin Orig\' was added under FAST DISTRIBUTION.', 'SKU: N-TO-20 | Purchase Price: ₱118.5 | Dealing Price: ₱121', '/products?distributor_id=10', 0, '2026-09-30 07:14:25', '2026-09-30 07:14:25', 1, 'System Admin', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `distributor_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'General',
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
(18, 4, 'Bear Brand Fortified 330g /24', 'BB-330G', 'Coffee & Milk', '1100.00', '45.00', '1145.00', '2026-09-27 04:12:25', '2026-09-27 04:12:25'),
(19, 7, 'Lava Cake', 'LS-LV-6', 'Dessert', '70.83', '3.17', '74.00', '2026-09-30 04:44:37', '2026-09-30 04:44:37'),
(20, 17, 'Birtch Tree', 'BT-200', 'Milk', '69.07', '4.93', '74.00', '2026-09-30 06:52:27', '2026-09-30 06:52:27'),
(21, 17, 'Birtch Tree Choco', 'BT-C-20', 'Milk', '74.48', '0.52', '75.00', '2026-09-30 06:53:07', '2026-09-30 06:53:07'),
(22, 17, 'Century Tuna Flakes in Oil', 'CT-FIO-12', 'Canned Goods', '34.03', '1.97', '36.00', '2026-09-30 06:53:50', '2026-09-30 06:53:50'),
(23, 17, 'Century Tuna Flakes Hot & Spicy', 'CT-FHS-12', 'Canned Goods', '34.40', '1.60', '36.00', '2026-09-30 06:55:52', '2026-09-30 06:55:52'),
(24, 17, 'Fresca Flakes in Oil', 'F-FIO-12', 'Canned Goods', '28.62', '1.38', '30.00', '2026-09-30 06:56:33', '2026-09-30 06:56:33'),
(25, 17, 'Fresca Hot & Spicy', 'F-HS-12', 'Canned Goods', '28.94', '1.06', '30.00', '2026-09-30 06:56:58', '2026-09-30 06:56:58'),
(26, 17, 'Fresca Tuna Afritada', 'F-TA-2', 'Canned Goods', '25.42', '2.58', '28.00', '2026-09-30 06:58:17', '2026-09-30 06:58:17'),
(27, 17, 'Coco Mama 400ml', 'CM-400ML-24', 'Coconut Milk & Cream', '60.00', '2.00', '62.00', '2026-09-30 06:59:35', '2026-09-30 06:59:35'),
(28, 17, '555 Sardines T.S.', 'S555-TS-12', 'Canned Goods', '22.33', '1.67', '24.00', '2026-09-30 07:00:08', '2026-09-30 07:00:08'),
(29, 17, 'Hunts 175g', 'H-175G-12', 'Canned Beans', '22.14', '2.86', '25.00', '2026-09-30 07:03:14', '2026-09-30 07:03:14'),
(30, 17, 'Argentina Corned Beef 150g', 'A-CB-150G', 'Canned Meat', '33.57', '2.43', '36.00', '2026-09-30 07:04:01', '2026-09-30 07:04:01'),
(31, 17, 'Argentina Beef Loaf 250g', 'A-BF-250G', 'Canned Meat', '29.05', '2.95', '32.00', '2026-09-30 07:05:36', '2026-09-30 07:05:36'),
(32, 17, 'Lucky 7 Carne Norte 150g', 'L7-CN-150G', 'Canned Meat', '20.71', '1.29', '22.00', '2026-09-30 07:06:02', '2026-09-30 07:06:02'),
(33, 9, 'EGG XL', 'EGG-XL', 'Fresh Eggs', '240.00', '10.00', '250.00', '2026-09-30 07:07:23', '2026-09-30 07:07:23'),
(34, 9, 'Princess Bea', 'PB-53', 'Rice', '1300.00', '30.00', '1330.00', '2026-09-30 07:08:11', '2026-09-30 07:08:11'),
(35, 13, 'Payless', 'P-96', 'Instant Noodles', '17.50', '0.63', '18.13', '2026-09-30 07:09:30', '2026-09-30 07:09:30'),
(36, 10, 'BEARBRAND SWAK /24', 'BB-S-24', 'Powdered Milk', '83.96', '3.05', '87.01', '2026-09-30 07:10:24', '2026-09-30 07:10:24'),
(37, 10, 'Milo /42', 'M-42', 'Powdered Malt Drinks', '103.10', '2.90', '106.00', '2026-09-30 07:11:15', '2026-09-30 07:11:15'),
(38, 10, 'Magic Sarap', 'MS-60', 'All-Purpose Seasonings', '60.80', '2.20', '63.00', '2026-09-30 07:11:46', '2026-09-30 07:11:46'),
(39, 10, 'Nescafe Stick', 'N-S-21', 'Instant Coffee', '108.00', '2.00', '110.00', '2026-09-30 07:12:26', '2026-09-30 07:12:26'),
(40, 10, 'Nescafe Twin Orig', 'N-TO-20', 'Instant Coffee', '118.50', '2.50', '121.00', '2026-09-30 07:14:25', '2026-09-30 07:14:25');

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
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('3ZrOgg42RKiCEtQeazS4HJznZVrXN7DOqGfF75PU', NULL, '127.0.0.1', 'Go-http-client/1.1', 'eyJfdG9rZW4iOiJKekNrNjFOaUVlZ1pHVUVUaEZiYTFhZTlWOGJCcXQzVGxkdVplbG5TIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1790776103),
('8bQ6tvnNwsIjRbZNYfiwBUgl9ftMjrx2kOAbDaVU', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.26100.9444', 'eyJfdG9rZW4iOiJsSENDakdLd3pOTm1IWEhkN1VVT3FHdG5Ib2lnU0pPaTFoek5TVHdDIiwidXJsIjp7ImludGVuZGVkIjoiaHR0cDpcL1wvMTI3LjAuMC4xOjgwMDAifSwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOiJob21lIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1790776166),
('8TnyPZiNY5oyUNdhe3ZnM7SM21HIMq3OWaWFzYxW', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJUSUdnMTRjZThvMlA2a0hab2d3UlRTNW5BZHRZUXpiMzNWcFV3MG8wIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6MSwicGFzc3dvcmRfaGFzaF93ZWIiOiJjYTU4ZTY0YjM1YWY4NDE5NWFjYjRmZTdjZGY0MDI3MDI1YmFiMDgxNDcyMWFiMjlhMzdlNGE5YTEzYWE1NzExIn0=', 1790831633),
('9oXB8lOAdRKZNQmtsqWIMpxo1L1hhWOSgyArCJNG', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJHRENGTmFKbE02ZVVGaGVYdDVST2hFbXFzd3NZZWFrV1I0SnJpS3ZhIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6MSwicGFzc3dvcmRfaGFzaF93ZWIiOiJjYTU4ZTY0YjM1YWY4NDE5NWFjYjRmZTdjZGY0MDI3MDI1YmFiMDgxNDcyMWFiMjlhMzdlNGE5YTEzYWE1NzExIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9wcm9kdWN0cyIsInJvdXRlIjoicHJvZHVjdHMuaW5kZXgifX0=', 1790781354),
('DN68qkWJTfMYPrCTVKBKljVavMS3pNPgRA0FYVGJ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.26100.9444', 'eyJfdG9rZW4iOiJUakRZYU04VmNoS0h1dEdORmJqeWNTc21uV3pFNmRCeTkweXlqSUpxIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1790776160),
('GYlQT3eF4ubAlEPrmjOxHl0F8guYeWZjYMtVMbIL', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.26100.9444', 'eyJfdG9rZW4iOiJ1WVZVNGF3OHBNY3pSOExTVWJVcDkyaDgyYVNHcUxENVRQeVJjdFpBIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1790777464),
('hXzQQ22Daw3hgBOkn9HwzpFqVOLsZTeS59bECroE', NULL, '127.0.0.1', 'Go-http-client/1.1', 'eyJfdG9rZW4iOiJ4S0JZbUhVVFM1emNvR3pWUnBsSTdyQkU2TmI0UTFxNmYzQTFGdVYyIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1790776104),
('mcLoyNemnZQ7PkazqoToFnTSwOaLnWANgksRZI7K', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJmZVFvZUdCRnY2R3gzTXVwT24xdlA5aTl6SzVoaWJaM2FicnYzSmhVIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJ1cmwiOnsiaW50ZW5kZWQiOiJodHRwOlwvXC8xMjcuMC4wLjE6ODAwMFwvcHJvZHVjdHM/ZGlzdHJpYnV0b3JfaWQ9NCJ9fQ==', 1790776025);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'low_stock_threshold', '15', '2026-09-30 05:47:53', '2026-09-30 05:47:53'),
(2, 'default_vat_percentage', '12', '2026-09-30 05:47:53', '2026-09-30 05:47:53'),
(3, 'company_name', 'WINZELLE', '2026-09-30 05:47:53', '2026-09-30 05:51:52'),
(4, 'notification_style', 'number', '2026-09-30 05:47:53', '2026-09-30 06:28:34');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'checker',
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `role`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'System Admin', 'admin', 'admin@winzelle.com', NULL, '$2y$12$8YSdUu68cjl9W/1CBVgsZ.CQSnISB7iej2ho59RU4S543oYiaKYgG', 'jcE0TjX0KM0mMdHaErnfVL5OT2Khmw03XA2DF1MNPqzhPn1C67JrYWVrRULH', '2026-09-30 05:48:01', '2026-09-30 05:48:01'),
(2, 'Store Owner', 'owner', 'owner@winzelle.com', NULL, '$2y$12$GnDSPs4KJkWv5mdXeFDLwOwR5T3VGzluMGIlXOW2fzvOYZWpltz1K', 'OQUv1iXWsJACnjEDTZyWqrDTpwUaRZkcin3YgQWMBodvwIOGKy7zW4H5M1Cq', '2026-09-30 05:48:02', '2026-09-30 05:48:02'),
(3, 'Inventory Checker', 'checker', 'checker@winzelle.com', NULL, '$2y$12$xDW6Ci52gNMi2sxKlw6FR.J2Hqk5oy1brJSmAdpEIp9Vn1b2cMic.', 'RiodTX2b2oAqvnpyGAfBL5mFOfgf8RPIU4N9xAg6ShFf5wqG38j8jX57shGH', '2026-09-30 05:48:02', '2026-09-30 05:48:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_model_type_model_id_index` (`model_type`,`model_id`),
  ADD KEY `activity_logs_user_id_index` (`user_id`),
  ADD KEY `activity_logs_created_at_index` (`created_at`);

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
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_is_read_index` (`user_id`,`is_read`),
  ADD KEY `notifications_created_at_index` (`created_at`),
  ADD KEY `notifications_actor_id_foreign` (`actor_id`);

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
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);

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
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `distributors`
--
ALTER TABLE `distributors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventories`
--
ALTER TABLE `inventories`
  ADD CONSTRAINT `inventories_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
