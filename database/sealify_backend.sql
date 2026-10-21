-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 18, 2026 at 02:10 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sealify_backend`
--

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `bank_code` varchar(10) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `account_number` varchar(20) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `recipient_code` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bank_accounts`
--

INSERT INTO `bank_accounts` (`id`, `user_id`, `bank_code`, `bank_name`, `account_number`, `account_name`, `recipient_code`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, '001', 'Paystack Test Bank', '0000000000', 'TEST ACCOUNT 0000000000', 'RCP_fake_test_001', 1, '2026-10-17 17:47:05', '2026-10-17 17:48:36');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `icon`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Phones & Tablets', 'phones-tablets', 'smartphone', 1, 1, '2026-10-17 10:10:01', '2026-10-17 10:10:01'),
(2, 1, 'Smartphones', 'smartphones', NULL, 1, 1, '2026-10-17 10:10:01', '2026-10-17 10:10:01'),
(3, 1, 'Tablets', 'tablets', NULL, 2, 1, '2026-10-17 10:10:01', '2026-10-17 10:10:01'),
(4, 1, 'Phone Accessories', 'phone-accessories', NULL, 3, 1, '2026-10-17 10:10:01', '2026-10-17 10:10:01'),
(5, 1, 'Phone Repairs', 'phone-repairs', NULL, 4, 1, '2026-10-17 10:10:01', '2026-10-17 10:10:01'),
(6, NULL, 'Vehicles', 'vehicles', 'car', 2, 1, '2026-10-17 10:10:01', '2026-10-17 10:10:01'),
(7, 6, 'Cars', 'cars', NULL, 1, 1, '2026-10-17 10:10:01', '2026-10-17 10:10:01'),
(8, 6, 'Motorcycles', 'motorcycles', NULL, 2, 1, '2026-10-17 10:10:01', '2026-10-17 10:10:01'),
(9, 6, 'Buses & Trucks', 'buses-trucks', NULL, 3, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(10, 6, 'Vehicle Parts', 'vehicle-parts', NULL, 4, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(11, NULL, 'Property', 'property', 'home', 3, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(12, 11, 'Houses for Sale', 'houses-for-sale', NULL, 1, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(13, 11, 'Houses for Rent', 'houses-for-rent', NULL, 2, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(14, 11, 'Land', 'land', NULL, 3, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(15, 11, 'Short Let', 'short-let', NULL, 4, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(16, NULL, 'Fashion', 'fashion', 'shirt', 4, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(17, 16, 'Men\'s Fashion', 'mens-fashion', NULL, 1, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(18, 16, 'Women\'s Fashion', 'womens-fashion', NULL, 2, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(19, 16, 'Shoes', 'shoes', NULL, 3, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(20, 16, 'Bags', 'bags', NULL, 4, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(21, NULL, 'Home & Garden', 'home-garden', 'sofa', 5, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(22, 21, 'Furniture', 'furniture', NULL, 1, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(23, 21, 'Appliances', 'appliances', NULL, 2, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(24, 21, 'Kitchen', 'kitchen', NULL, 3, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(25, 21, 'Decor', 'decor', NULL, 4, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(26, NULL, 'Services', 'services', 'wrench', 6, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(27, 26, 'Repairs', 'repairs', NULL, 1, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(28, 26, 'Tutoring', 'tutoring', NULL, 2, 1, '2026-10-17 10:10:02', '2026-10-17 10:10:02'),
(29, 26, 'Beauty & Spa', 'beauty-spa', NULL, 3, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(30, 26, 'Events', 'events', NULL, 4, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(31, NULL, 'Jobs', 'jobs', 'briefcase', 7, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(32, 31, 'Full-time', 'full-time', NULL, 1, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(33, 31, 'Part-time', 'part-time', NULL, 2, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(34, 31, 'Gig', 'gig', NULL, 3, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(35, 31, 'Freelance', 'freelance', NULL, 4, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(36, NULL, 'Electronics', 'electronics', 'laptop', 8, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(37, 36, 'Laptops', 'laptops', NULL, 1, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(38, 36, 'TVs & Audio', 'tvs-audio', NULL, 2, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(39, 36, 'Cameras', 'cameras', NULL, 3, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(40, 36, 'Gaming', 'gaming', NULL, 4, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(41, NULL, 'Babies & Kids', 'babies-kids', 'baby', 9, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(42, 41, 'Clothing', 'baby-clothing', NULL, 1, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(43, 41, 'Toys', 'toys', NULL, 2, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(44, 41, 'Furniture', 'baby-furniture', NULL, 3, 1, '2026-10-17 10:10:03', '2026-10-17 10:10:03'),
(45, 41, 'Gear', 'baby-gear', NULL, 4, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(46, NULL, 'Pets', 'pets', 'paw', 10, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(47, 46, 'Dogs', 'dogs', NULL, 1, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(48, 46, 'Cats', 'cats', NULL, 2, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(49, 46, 'Birds', 'birds', NULL, 3, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(50, 46, 'Pet Supplies', 'pet-supplies', NULL, 4, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(51, NULL, 'Agriculture', 'agriculture', 'leaf', 11, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(52, 51, 'Livestock', 'livestock', NULL, 1, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(53, 51, 'Farm Produce', 'farm-produce', NULL, 2, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(54, 51, 'Equipment', 'agriculture-equipment', NULL, 3, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(55, 51, 'Seeds', 'seeds', NULL, 4, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(56, NULL, 'Business & Industry', 'business-industry', 'factory', 12, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(57, 56, 'Machinery', 'machinery', NULL, 1, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(58, 56, 'Office Equipment', 'office-equipment', NULL, 2, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(59, 56, 'Wholesale', 'wholesale', NULL, 3, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04'),
(60, 56, 'Business Services', 'business-services', NULL, 4, 1, '2026-10-17 10:10:04', '2026-10-17 10:10:04');

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `listing_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `last_message_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `listing_id`, `created_by`, `last_message_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-10-17 12:14:11', '2026-10-17 11:11:57', '2026-10-17 11:14:11');

-- --------------------------------------------------------

--
-- Table structure for table `conversation_participants`
--

CREATE TABLE `conversation_participants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `last_read_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversation_participants`
--

INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-10-17 12:15:01', '2026-10-17 11:11:57', '2026-10-17 11:15:01'),
(2, 1, 4, '2026-10-17 12:14:11', '2026-10-17 11:11:57', '2026-10-17 11:14:11');

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
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `listing_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `listing_id`, `created_at`, `updated_at`) VALUES
(2, 1, 1, '2026-10-17 10:47:16', '2026-10-17 10:47:16'),
(3, 1, 7, '2026-10-17 10:47:17', '2026-10-17 10:47:17');

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
-- Table structure for table `kyc_verifications`
--

CREATE TABLE `kyc_verifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('nin','bvn','cac','drivers_license','voters_card') NOT NULL,
  `id_number_last4` varchar(4) NOT NULL,
  `id_number_hash` varchar(64) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `status` enum('pending','verified','rejected','failed') NOT NULL DEFAULT 'pending',
  `provider` varchar(32) NOT NULL DEFAULT 'bytid',
  `provider_reference` varchar(255) DEFAULT NULL,
  `provider_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`provider_response`)),
  `rejection_reason` varchar(255) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kyc_verifications`
--

INSERT INTO `kyc_verifications` (`id`, `user_id`, `type`, `id_number_last4`, `id_number_hash`, `first_name`, `last_name`, `date_of_birth`, `status`, `provider`, `provider_reference`, `provider_response`, `rejection_reason`, `verified_at`, `rejected_at`, `created_at`, `updated_at`) VALUES
(2, 1, 'nin', '8901', '254aa248acb47dd654ca3ea53f48c2c26d641d23d7e2e93a1ec56258df7674c4', 'Adaeze', 'Okafor', '1990-01-15', 'verified', 'bytid', 'KYC-NIN-1-1792323840', '{\"success\":true,\"data\":{\"id\":\"21d8111a-11dc-4057-bcdb-df9ccf9cf585\",\"reference\":\"KYC-NIN-1-1792323840\",\"type\":\"nin\",\"type_label\":\"NIN lookup\",\"service\":\"nin\",\"service_label\":\"NIN lookup\",\"environment\":\"test\",\"status\":\"verified\",\"message\":\"ID found and verified.\",\"id_number\":\"123*****901\",\"field_matches\":{\"first_name\":true,\"last_name\":true,\"date_of_birth\":true},\"face_match\":null,\"duplicate_check\":null,\"aml_screening\":null,\"data\":{\"id_number\":\"12345678901\",\"id_type\":\"NIN\",\"first_name\":\"ADAEZE\",\"middle_name\":\"TEST\",\"last_name\":\"OKAFOR\",\"full_name\":\"ADAEZE TEST OKAFOR\",\"date_of_birth\":\"15-Jan-1990\",\"gender\":\"Female\",\"phone_number\":\"08000000000\",\"state_of_origin\":\"Anambra\",\"state_of_residence\":\"Lagos\",\"nationality\":\"Nigerian\"},\"amount_charged\":0,\"currency\":\"NGN\",\"created_at\":\"2026-10-18T11:44:01.173Z\"},\"request_id\":\"req_470440e45466a437e384\"}', NULL, '2026-10-18 11:44:01', NULL, '2026-10-18 10:44:01', '2026-10-18 10:44:01');

-- --------------------------------------------------------

--
-- Table structure for table `listings`
--

CREATE TABLE `listings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `price_negotiable` tinyint(1) NOT NULL DEFAULT 0,
  `condition` enum('new','like_new','good','fair','needs_repair') NOT NULL DEFAULT 'good',
  `location` varchar(255) NOT NULL,
  `status` enum('draft','active','sold','archived') NOT NULL DEFAULT 'active',
  `views_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `listings`
--

INSERT INTO `listings` (`id`, `user_id`, `category_id`, `title`, `slug`, `description`, `price`, `price_negotiable`, `condition`, `location`, `status`, `views_count`, `expires_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 2, 'iPhone 13 Pro 256GB', 'iphone-13-pro-256gb', 'Clean iPhone 13 Pro, 256GB, no scratches, original box and charger included. Battery health 92%.', 620000.00, 1, 'like_new', 'Ogbomoso', 'active', 8, NULL, '2026-10-17 10:14:36', '2026-10-18 09:22:42', NULL),
(2, 1, 7, 'Toyota Corolla 2015', 'toyota-corolla-2015', 'Well maintained Toyota Corolla 2015, first body, AC working, papers complete. Serious buyers only.', 8500000.00, 1, 'good', 'Ibadan', 'active', 1, NULL, '2026-10-17 10:14:36', '2026-10-17 10:48:56', NULL),
(3, 1, 37, 'MacBook Air M1 8GB/256GB', 'macbook-air-m1-8gb256gb', 'MacBook Air M1 in excellent condition, battery cycle 89, with charger and sleeve. No dents.', 550000.00, 0, 'like_new', 'Lagos', 'active', 0, NULL, '2026-10-17 10:14:36', '2026-10-17 10:14:36', NULL),
(4, 1, 22, '6-Seater Dining Table Set', '6-seater-dining-table-set', 'Brand new 6-seater dining table with glass top and padded chairs, local hardwood.', 85000.00, 1, 'new', 'Oyo', 'active', 2, NULL, '2026-10-17 10:14:37', '2026-10-18 09:19:53', NULL),
(5, 1, 17, 'Ankara Native Senator Wear', 'ankara-native-senator-wear', 'Custom-made Ankara senator outfit, size 42, perfect for weddings and events.', 25000.00, 0, 'new', 'Osogbo', 'active', 0, NULL, '2026-10-17 10:14:37', '2026-10-17 10:14:37', NULL),
(6, 1, 2, 'Samsung Galaxy S21 Ultra', 'samsung-galaxy-s21-ultra', 'Samsung Galaxy S21 Ultra, 12GB/256GB, screen protector on since day one, no cracks.', 380000.00, 1, 'good', 'Ogbomoso', 'active', 0, NULL, '2026-10-17 10:14:37', '2026-10-17 10:14:37', NULL),
(7, 1, 8, 'Bajaj Boxer 150cc', 'bajaj-boxer-150cc', 'Bajaj Boxer 150cc, well-serviced, engine sound clean, papers intact.', 320000.00, 1, 'good', 'Oyo', 'active', 1, NULL, '2026-10-17 10:14:37', '2026-10-18 09:35:06', NULL),
(8, 1, 23, 'LG 1.5HP Split AC', 'lg-15hp-split-ac', 'LG 1.5HP split AC, barely used, comes with full installation kit.', 185000.00, 0, 'like_new', 'Ibadan', 'active', 1, NULL, '2026-10-17 10:14:37', '2026-10-18 09:38:28', NULL),
(9, 1, 2, 'Tecno Camon 20 Pro — price drop', 'tecno-camon-20-pro', 'Clean Tecno Camon 20 Pro, 8GB/256GB, still under warranty. Comes with original charger and box.', 175000.00, 1, 'like_new', 'Ogbomoso', 'active', 1, '2026-11-16 11:22:21', '2026-10-17 10:22:21', '2026-10-17 10:27:17', '2026-10-17 10:27:17');

-- --------------------------------------------------------

--
-- Table structure for table `listing_images`
--

CREATE TABLE `listing_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `listing_id` bigint(20) UNSIGNED NOT NULL,
  `path` varchar(255) NOT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `listing_images`
--

INSERT INTO `listing_images` (`id`, `listing_id`, `path`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 9, 'listings/9/listing-9-1792236298-0.jpg', 0, '2026-10-17 10:24:58', '2026-10-17 10:24:58'),
(2, 9, 'listings/9/listing-9-1792236298-1.jpg', 1, '2026-10-17 10:24:58', '2026-10-17 10:24:58');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `body` text DEFAULT NULL,
  `type` enum('text','image','file','voice','system') NOT NULL DEFAULT 'text',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `body`, `type`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'Hi Bob, is this iPhone still available?', 'text', '2026-10-17 11:11:57', '2026-10-17 11:11:57', NULL),
(2, 1, 4, 'Yes, still available. Nego small.', 'text', '2026-10-17 11:14:00', '2026-10-17 11:14:00', NULL),
(3, 1, 4, 'Here\'s a photo of the phone', 'image', '2026-10-17 11:14:11', '2026-10-17 11:14:11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `message_attachments`
--

CREATE TABLE `message_attachments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `message_id` bigint(20) UNSIGNED NOT NULL,
  `path` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `size_bytes` bigint(20) UNSIGNED NOT NULL,
  `duration_seconds` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `message_attachments`
--

INSERT INTO `message_attachments` (`id`, `message_id`, `path`, `original_name`, `mime_type`, `size_bytes`, `duration_seconds`, `created_at`, `updated_at`) VALUES
(1, 3, 'messages/1/msg-3-1792239251-6ad3669351428.jpg', 'listing-1.jpg', 'image/jpeg', 3100, NULL, '2026-10-17 11:14:11', '2026-10-17 11:14:11');

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
(4, '2026_10_16_133731_create_personal_access_tokens_table', 1),
(5, '2026_10_16_134853_create_otp_codes_table', 1),
(6, '2026_10_17_110402_create_categories_table', 2),
(7, '2026_10_17_110403_create_listings_table', 2),
(8, '2026_10_17_110404_create_listing_images_table', 2),
(9, '2026_10_17_113345_create_favorites_table', 3),
(10, '2026_10_17_115903_create_conversations_table', 4),
(11, '2026_10_17_115904_create_conversation_participants_table', 4),
(12, '2026_10_17_115905_create_messages_table', 4),
(13, '2026_10_17_115906_create_message_attachments_table', 4),
(15, '2026_10_17_175347_create_bank_accounts_table', 5),
(16, '2026_10_17_185420_create_transactions_table', 6),
(17, '2024_01_01_000000_create_payment_transactions_table', 7),
(18, '2024_01_01_000002_create_webhook_events_table', 7),
(19, '2024_01_04_000000_index_webhook_events_table', 7),
(20, '2024_01_02_000000_create_refund_transactions_table', 8),
(21, '2026_10_18_100757_add_has_used_free_promotion_to_users_table', 9),
(22, '2026_10_18_100759_create_promotions_table', 9),
(23, '2026_10_18_110637_create_kyc_verifications_table', 10),
(24, '2026_10_18_111158_create_withdrawals_and_wallets_tables', 10);

-- --------------------------------------------------------

--
-- Table structure for table `otp_codes`
--

CREATE TABLE `otp_codes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `purpose` enum('email_verification','password_reset') NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `consumed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otp_codes`
--

INSERT INTO `otp_codes` (`id`, `user_id`, `email`, `code`, `purpose`, `attempts`, `expires_at`, `consumed_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'yahayaibraheem808@gmail.com', '$2y$12$5P2Ov9opYAd4aRqFT529D..Y2Z0.dccmhouHYIpXNUBlcDmZ3fK5G', 'email_verification', 1, '2026-10-16 14:10:26', '2026-10-16 14:01:45', '2026-10-16 13:00:26', '2026-10-16 13:01:45'),
(2, 1, 'yahayaibraheem808@gmail.com', '$2y$12$rpyCrYdkEU2GjQK2P2nrjOLHiZjYgENuERbqrdHO/lLTVtECzjYgS', 'password_reset', 1, '2026-10-16 14:13:15', '2026-10-16 14:04:09', '2026-10-16 13:03:15', '2026-10-16 13:04:09'),
(3, 1, 'yahayaibraheem808@gmail.com', '$2y$12$dJtUssLIlcWhLzl5DoCNZ.U3S9L.gvzGeS6e0JoFnu3y3/YObM41m', 'password_reset', 0, '2026-10-16 14:14:52', NULL, '2026-10-16 13:04:52', '2026-10-16 13:04:52'),
(5, 4, 'bob@sealify.test', '$2y$12$VUgNIJx01EKAazYgsvJ5feMyOF0S9U07BYoY2D/fAJqxENorri9Jq', 'email_verification', 0, '2026-10-17 12:19:33', NULL, '2026-10-17 11:09:33', '2026-10-17 11:09:33'),
(6, 5, 'charlie@sealify.test', '$2y$12$ZsQrXM0pDWwJVoZ7DIpfJ.h23tIRE.WC.ZHNFqwVxJHOiv.0LMvRO', 'email_verification', 0, '2026-10-17 12:25:24', NULL, '2026-10-17 11:15:24', '2026-10-17 11:15:24');

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
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reference` varchar(255) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `email` varchar(255) NOT NULL,
  `channel` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `customer` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`customer`)),
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`id`, `reference`, `provider`, `status`, `amount`, `currency`, `email`, `channel`, `metadata`, `customer`, `paid_at`, `created_at`, `updated_at`) VALUES
(1, 'TEST_PAYMENT-1M5JNhu6ZwQSois8', 'paystack', 'pending', 100.00, 'NGN', 'yahayaibraheem808@gmail.com', NULL, '{\"note\":\"payzephyr live\",\"user_id\":1,\"purpose\":\"test_payment\",\"reference\":\"TEST_PAYMENT-1M5JNhu6ZwQSois8\",\"_provider_id\":\"uer94q0b84fchll\"}', 'null', NULL, '2026-10-17 19:07:38', '2026-10-17 19:07:38'),
(2, 'PZ-SMOKE-6ad3d611ba3fe', 'paystack', 'pending', 100.00, 'NGN', 'yahayaibraheem808@gmail.com', NULL, '{\"_provider_id\":\"xvdgodj2u9pu9zj\"}', 'null', NULL, '2026-10-17 19:09:55', '2026-10-17 19:09:55'),
(3, 'PROMOTION_BOOST-u1xBmb8mze7JcUrd', 'paystack', 'success', 500.00, 'NGN', 'yahayaibraheem808@gmail.com', 'card', '{\"listing_id\":1,\"days\":7,\"user_id\":1,\"purpose\":\"promotion_boost\",\"reference\":\"PROMOTION_BOOST-u1xBmb8mze7JcUrd\",\"_provider_id\":\"02wud4c0ds9fwik\"}', 'null', '2026-10-18 09:22:24', '2026-10-18 09:20:21', '2026-10-18 09:22:28'),
(4, 'PROMOTION_BOOST-p08Fn0C3taUsHNHH', 'paystack', 'success', 500.00, 'NGN', 'yahayaibraheem808@gmail.com', 'card', '{\"listing_id\":7,\"days\":7,\"user_id\":1,\"purpose\":\"promotion_boost\",\"reference\":\"PROMOTION_BOOST-p08Fn0C3taUsHNHH\",\"_provider_id\":\"9bht9c4x7ulyf6i\"}', 'null', '2026-10-18 09:27:31', '2026-10-18 09:23:28', '2026-10-18 09:34:33'),
(5, 'PROMOTION_BOOST-SDNfuZ6xLunYyWz3', 'paystack', 'success', 500.00, 'NGN', 'yahayaibraheem808@gmail.com', 'card', '{\"listing_id\":8,\"days\":7,\"user_id\":1,\"purpose\":\"promotion_boost\",\"reference\":\"PROMOTION_BOOST-SDNfuZ6xLunYyWz3\",\"_provider_id\":\"z2u11newr0q2lk5\"}', 'null', '2026-10-18 09:37:15', '2026-10-18 09:35:22', '2026-10-18 09:37:57');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\User', 1, 'user', '430364b6a4af166852fc8da771e8c3ac7cfc6983deb4d755c2e8c2b3703ac933', '[\"*\"]', '2026-10-17 09:59:57', NULL, '2026-10-17 09:56:09', '2026-10-17 09:59:57'),
(3, 'App\\Models\\User', 1, 'user', '1e51e79060c86b5ab0b1dbb15f9478967bd989ab55f645356174245b9874e9d7', '[\"*\"]', NULL, NULL, '2026-10-17 09:58:07', '2026-10-17 09:58:07'),
(4, 'App\\Models\\User', 1, 'user', '97169cc9f990388fad0f947d112250decc31d1622ee9aa92ff4bac94de449e04', '[\"*\"]', '2026-10-17 10:31:45', NULL, '2026-10-17 10:21:22', '2026-10-17 10:31:45'),
(5, 'App\\Models\\User', 1, 'user', '238b38eb45df76c5b725a80b4a53489024461f1aa9d4f66a26435d2b6926f745', '[\"*\"]', NULL, NULL, '2026-10-17 10:43:50', '2026-10-17 10:43:50'),
(6, 'App\\Models\\User', 1, 'user', 'b322e6704a56f15e1e2780494248941c0f739005b6f8cc95376bfb96998ae859', '[\"*\"]', '2026-10-17 10:57:24', NULL, '2026-10-17 10:44:42', '2026-10-17 10:57:24'),
(7, 'App\\Models\\User', 4, 'user', 'fa438b9c0fbb34a29c0072de29b56f8c3193392f5d7d1b907bb85c3c082f1638', '[\"*\"]', '2026-10-17 11:14:11', NULL, '2026-10-17 11:10:13', '2026-10-17 11:14:11'),
(8, 'App\\Models\\User', 1, 'user', 'ae1ce3a75cf7386967c00e7f8c3fa7fd984d2f5134c5e404adfe8493938f5989', '[\"*\"]', '2026-10-17 17:41:19', NULL, '2026-10-17 11:10:28', '2026-10-17 17:41:19'),
(9, 'App\\Models\\User', 5, 'user', '4a31b11846a93b1cd5cab6a77084190bffd1d7028d7e7bc2072193eb26c9558c', '[\"*\"]', '2026-10-17 11:17:24', NULL, '2026-10-17 11:15:48', '2026-10-17 11:17:24'),
(10, 'App\\Models\\User', 1, 'user', '519a7c14208a36b530278c5d81e2ff1918bdf44584a31e9d84bb31dc63363c08', '[\"*\"]', '2026-10-17 17:18:27', NULL, '2026-10-17 17:08:19', '2026-10-17 17:18:27'),
(11, 'App\\Models\\User', 1, 'user', 'e17aaca1e9b8eaff8b0bd031c76a672b9ae29a122da12737b8291a34d78692b5', '[\"*\"]', '2026-10-17 17:48:46', NULL, '2026-10-17 17:46:14', '2026-10-17 17:48:46'),
(12, 'App\\Models\\User', 1, 'user', 'aa0a347e6dd470e2ea2e3dc79a7611fae96d0cc8d741e01358985143848ec86e', '[\"*\"]', '2026-10-17 19:07:36', NULL, '2026-10-17 18:00:44', '2026-10-17 19:07:36'),
(13, 'App\\Models\\User', 4, 'user', '556390261823d17b1896a148e704bc64879896ca6e77b7d1431915d16de6e565', '[\"*\"]', '2026-10-17 18:43:35', NULL, '2026-10-17 18:43:09', '2026-10-17 18:43:35'),
(14, 'App\\Models\\User', 1, 'user', 'ae8f2a8a8573e13be78262b7276727004101f426084ab6b20be71c71ece253bc', '[\"*\"]', '2026-10-18 09:38:06', NULL, '2026-10-18 09:17:33', '2026-10-18 09:38:06'),
(15, 'App\\Models\\User', 4, 'user', '2cc723106d6f3bb0035a5a1bca53ee5e628e86c4730873114a6400d310b60189', '[\"*\"]', '2026-10-18 09:24:56', NULL, '2026-10-18 09:24:19', '2026-10-18 09:24:56'),
(16, 'App\\Models\\User', 1, 'user', '783fc19fb7d946a2b156d34187ae1917aa868f8c76c24912348ccebf993694d4', '[\"*\"]', '2026-10-18 10:50:14', NULL, '2026-10-18 10:39:25', '2026-10-18 10:50:14');

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `listing_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED DEFAULT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime NOT NULL,
  `is_free_trial` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `promotions`
--

INSERT INTO `promotions` (`id`, `listing_id`, `user_id`, `transaction_id`, `starts_at`, `ends_at`, `is_free_trial`, `status`, `created_at`, `updated_at`) VALUES
(1, 4, 1, NULL, '2026-10-18 10:18:35', '2026-10-18 10:19:36', 1, 'cancelled', '2026-10-18 09:18:35', '2026-10-18 09:19:36'),
(2, 1, 1, 4, '2026-10-18 10:22:28', '2026-10-25 10:22:28', 0, 'active', '2026-10-18 09:22:28', '2026-10-18 09:22:28'),
(3, 7, 1, 5, '2026-10-18 10:34:33', '2026-10-25 10:34:33', 0, 'active', '2026-10-18 09:34:33', '2026-10-18 09:34:33'),
(4, 8, 1, 6, '2026-10-18 10:37:57', '2026-10-25 10:37:57', 0, 'active', '2026-10-18 09:37:57', '2026-10-18 09:37:57');

-- --------------------------------------------------------

--
-- Table structure for table `refund_transactions`
--

CREATE TABLE `refund_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `refund_reference` varchar(255) NOT NULL,
  `transaction_reference` varchar(255) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('94J0nk09liPZxPQZccBdDhwJrCHdmtJb13BtURGM', NULL, '127.0.0.1', 'curl/8.5.0', 'eyJfdG9rZW4iOiI3Nk1NcXBPcDdSOU5EY2dPbEREelZ6YXJnM1JqREFhR3hlaDh4dHBKIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1792320969),
('cKO9bvmZRlvuUVisDPqX3i9tQ94KOuIR4zn34eB8', NULL, '127.0.0.1', 'curl/8.5.0', 'eyJfdG9rZW4iOiJ5VnRoRTZIVkZQT3RpS2l6c3lzM2tyRkVKeWZUWGxaNEpibG5PZTkzIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1792321478),
('gUflyENPBttPtXIhNaBp1lvA4Ym1hbGYEeljukHg', NULL, '127.0.0.1', 'curl/8.5.0', 'eyJfdG9rZW4iOiJjZlJIeTZBbzFLeURDZGluSTRQUUVwQUsweE1nZmx0ekoxYjBQbUJXIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1792320953),
('MJpvv6RkfpOmQ6VPCe8ok6nbOOKE37u2dP1FXToQ', NULL, '127.0.0.1', 'curl/8.5.0', 'eyJfdG9rZW4iOiI2NG1EUXRIVzVnYklLUEVvZ0dYTE5GWlJQVXJ1TnFiQ01CZE9mZGVmIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1792320578),
('RrSHhWp8FIQOGJoFnDJ9MHXTAvALwENM0An2ngyI', NULL, '127.0.0.1', 'curl/8.5.0', 'eyJfdG9rZW4iOiJWYW9mMExoSG1KZUgwNjV2eXlRbTVBR29BR2ZOdU9qOW1kMHRRcG9iIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1792324856),
('W82mfSuiIECLC7CMtbSZFx96fO8UbcmzpRVkRXZC', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJzVUx1bG5oclBFSWdWTk96QUJrNmEwOTdScWZZUTRQSWwxbnk2cW5iIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1792324886);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reference` varchar(64) NOT NULL,
  `provider_reference` varchar(128) DEFAULT NULL,
  `provider` varchar(32) NOT NULL DEFAULT 'paystack',
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'NGN',
  `purpose` enum('test_payment','promotion_boost','verification_fee','listing_fee','withdrawal_fee') NOT NULL,
  `status` enum('pending','success','failed','abandoned') NOT NULL DEFAULT 'pending',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `provider_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`provider_response`)),
  `error_message` varchar(255) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `failed_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `reference`, `provider_reference`, `provider`, `user_id`, `amount`, `currency`, `purpose`, `status`, `metadata`, `provider_response`, `error_message`, `paid_at`, `failed_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'TEST_PAYMENT-BK9YGR5BycJbIw30', 'TEST_PAYMENT-BK9YGR5BycJbIw30', 'paystack', 1, 100.00, 'NGN', 'test_payment', 'success', '{\"note\":\"testing phase 6b\"}', '{\"id\":6668685690,\"domain\":\"test\",\"status\":\"success\",\"reference\":\"TEST_PAYMENT-BK9YGR5BycJbIw30\",\"receipt_number\":null,\"amount\":10000,\"message\":null,\"gateway_response\":\"Successful\",\"gateway_response_code\":\"approved\",\"response_code\":\"00\",\"paid_at\":\"2026-10-17T19:03:38.000Z\",\"created_at\":\"2026-10-17T19:02:02.000Z\",\"channel\":\"card\",\"currency\":\"NGN\",\"ip_address\":\"102.89.69.224\",\"metadata\":{\"note\":\"testing phase 6b\",\"user_id\":1,\"purpose\":\"test_payment\",\"reference\":\"TEST_PAYMENT-BK9YGR5BycJbIw30\"},\"log\":{\"start_time\":1792263807,\"time_spent\":12,\"attempts\":1,\"errors\":0,\"success\":true,\"mobile\":false,\"input\":[],\"history\":[{\"type\":\"action\",\"message\":\"Attempted to pay with card\",\"time\":10},{\"type\":\"success\",\"message\":\"Successfully paid with card\",\"time\":12}]},\"fees\":150,\"fees_split\":null,\"authorization\":{\"authorization_code\":\"AUTH_mbood1efpn\",\"bin\":\"408408\",\"last4\":\"4081\",\"exp_month\":\"12\",\"exp_year\":\"2030\",\"channel\":\"card\",\"card_type\":\"visa \",\"bank\":\"TEST BANK\",\"country_code\":\"NG\",\"brand\":\"visa\",\"reusable\":true,\"signature\":\"SIG_F1KmDZSKhQP43NegaMV9\",\"account_name\":null,\"receiver_bank_account_number\":null,\"receiver_bank\":null},\"customer\":{\"id\":171191356,\"first_name\":\"Yahaya\",\"last_name\":\"Ibrahim\",\"email\":\"yahayaibraheem808@gmail.com\",\"customer_code\":\"CUS_fm0epv6056vvxua\",\"phone\":\"07084343765\",\"metadata\":[],\"risk_action\":\"default\",\"international_format_phone\":null},\"plan\":null,\"split\":[],\"order_id\":null,\"paidAt\":\"2026-10-17T19:03:38.000Z\",\"createdAt\":\"2026-10-17T19:02:02.000Z\",\"requested_amount\":10000,\"pos_transaction_data\":null,\"source\":null,\"fees_breakdown\":null,\"connect\":null,\"transaction_date\":\"2026-10-17T19:02:02.000Z\",\"plan_object\":[],\"subaccount\":[]}', NULL, '2026-10-17 19:15:18', NULL, '2026-10-17 20:02:00', '2026-10-17 18:02:00', '2026-10-17 18:15:18'),
(2, 'TEST_PAYMENT-ewOZuMvSdVfATzbW', 'TEST_PAYMENT-ewOZuMvSdVfATzbW', 'paystack', 1, 100.00, 'NGN', 'test_payment', 'success', '{\"note\":\"callback fix proof\"}', '{\"id\":6668804820,\"domain\":\"test\",\"status\":\"success\",\"reference\":\"TEST_PAYMENT-ewOZuMvSdVfATzbW\",\"receipt_number\":null,\"amount\":10000,\"message\":null,\"gateway_response\":\"Successful\",\"gateway_response_code\":\"approved\",\"response_code\":\"00\",\"paid_at\":\"2026-10-17T19:42:03.000Z\",\"created_at\":\"2026-10-17T19:39:52.000Z\",\"channel\":\"card\",\"currency\":\"NGN\",\"ip_address\":\"102.89.69.224\",\"metadata\":{\"note\":\"callback fix proof\",\"user_id\":1,\"purpose\":\"test_payment\",\"reference\":\"TEST_PAYMENT-ewOZuMvSdVfATzbW\"},\"log\":{\"start_time\":1792266117,\"time_spent\":7,\"attempts\":1,\"errors\":0,\"success\":true,\"mobile\":false,\"input\":[],\"history\":[{\"type\":\"action\",\"message\":\"Attempted to pay with card\",\"time\":5},{\"type\":\"success\",\"message\":\"Successfully paid with card\",\"time\":7}]},\"fees\":150,\"fees_split\":null,\"authorization\":{\"authorization_code\":\"AUTH_zljrc8p53x\",\"bin\":\"408408\",\"last4\":\"4081\",\"exp_month\":\"12\",\"exp_year\":\"2030\",\"channel\":\"card\",\"card_type\":\"visa \",\"bank\":\"TEST BANK\",\"country_code\":\"NG\",\"brand\":\"visa\",\"reusable\":true,\"signature\":\"SIG_F1KmDZSKhQP43NegaMV9\",\"account_name\":null,\"receiver_bank_account_number\":null,\"receiver_bank\":null},\"customer\":{\"id\":171191356,\"first_name\":\"Yahaya\",\"last_name\":\"Ibrahim\",\"email\":\"yahayaibraheem808@gmail.com\",\"customer_code\":\"CUS_fm0epv6056vvxua\",\"phone\":\"07084343765\",\"metadata\":[],\"risk_action\":\"default\",\"international_format_phone\":null},\"plan\":null,\"split\":[],\"order_id\":null,\"paidAt\":\"2026-10-17T19:42:03.000Z\",\"createdAt\":\"2026-10-17T19:39:52.000Z\",\"requested_amount\":10000,\"pos_transaction_data\":null,\"source\":null,\"fees_breakdown\":null,\"connect\":null,\"transaction_date\":\"2026-10-17T19:39:52.000Z\",\"plan_object\":[],\"subaccount\":[]}', NULL, '2026-10-17 19:42:05', NULL, '2026-10-17 20:39:50', '2026-10-17 18:39:50', '2026-10-17 18:42:05'),
(3, 'TEST_PAYMENT-1M5JNhu6ZwQSois8', 'TEST_PAYMENT-1M5JNhu6ZwQSois8', 'paystack', 1, 100.00, 'NGN', 'test_payment', 'abandoned', '{\"note\":\"payzephyr live\"}', '{\"redirect_url\":\"https:\\/\\/checkout.paystack.com\\/uer94q0b84fchll\"}', NULL, NULL, '2026-10-17 21:15:38', '2026-10-17 21:07:36', '2026-10-17 19:07:36', '2026-10-17 19:07:39'),
(4, 'PROMOTION_BOOST-u1xBmb8mze7JcUrd', 'PROMOTION_BOOST-u1xBmb8mze7JcUrd', 'paystack', 1, 500.00, 'NGN', 'promotion_boost', 'success', '{\"listing_id\":1,\"days\":7}', '{\"status\":\"success\",\"message\":null,\"data\":{\"reference\":\"PROMOTION_BOOST-u1xBmb8mze7JcUrd\",\"status\":\"success\",\"amount\":500,\"currency\":\"NGN\",\"paid_at\":\"2026-10-18T10:22:24.000Z\",\"metadata\":{\"listing_id\":1,\"days\":7,\"user_id\":1,\"purpose\":\"promotion_boost\",\"reference\":\"PROMOTION_BOOST-u1xBmb8mze7JcUrd\"},\"provider\":\"paystack\",\"channel\":\"card\",\"card_type\":\"visa \",\"bank\":\"TEST BANK\",\"customer\":{\"email\":\"yahayaibraheem808@gmail.com\",\"code\":\"CUS_fm0epv6056vvxua\"},\"authorization_code\":\"AUTH_iawbe0f6l7\"}}', NULL, '2026-10-18 10:22:28', NULL, '2026-10-18 11:20:19', '2026-10-18 09:20:19', '2026-10-18 09:22:28'),
(5, 'PROMOTION_BOOST-p08Fn0C3taUsHNHH', 'PROMOTION_BOOST-p08Fn0C3taUsHNHH', 'paystack', 1, 500.00, 'NGN', 'promotion_boost', 'success', '{\"listing_id\":7,\"days\":7}', '{\"status\":\"success\",\"message\":null,\"data\":{\"reference\":\"PROMOTION_BOOST-p08Fn0C3taUsHNHH\",\"status\":\"success\",\"amount\":500,\"currency\":\"NGN\",\"paid_at\":\"2026-10-18T10:27:31.000Z\",\"metadata\":{\"listing_id\":7,\"days\":7,\"user_id\":1,\"purpose\":\"promotion_boost\",\"reference\":\"PROMOTION_BOOST-p08Fn0C3taUsHNHH\"},\"provider\":\"paystack\",\"channel\":\"card\",\"card_type\":\"visa \",\"bank\":\"TEST BANK\",\"customer\":{\"email\":\"yahayaibraheem808@gmail.com\",\"code\":\"CUS_fm0epv6056vvxua\"},\"authorization_code\":\"AUTH_8y7opkl0hv\"}}', NULL, '2026-10-18 10:34:33', NULL, '2026-10-18 11:23:26', '2026-10-18 09:23:26', '2026-10-18 09:34:33'),
(6, 'PROMOTION_BOOST-SDNfuZ6xLunYyWz3', 'PROMOTION_BOOST-SDNfuZ6xLunYyWz3', 'paystack', 1, 500.00, 'NGN', 'promotion_boost', 'success', '{\"listing_id\":8,\"days\":7}', '{\"status\":\"success\",\"message\":null,\"data\":{\"reference\":\"PROMOTION_BOOST-SDNfuZ6xLunYyWz3\",\"status\":\"success\",\"amount\":500,\"currency\":\"NGN\",\"paid_at\":\"2026-10-18T10:37:15.000Z\",\"metadata\":{\"listing_id\":8,\"days\":7,\"user_id\":1,\"purpose\":\"promotion_boost\",\"reference\":\"PROMOTION_BOOST-SDNfuZ6xLunYyWz3\"},\"provider\":\"paystack\",\"channel\":\"card\",\"card_type\":\"visa \",\"bank\":\"TEST BANK\",\"customer\":{\"email\":\"yahayaibraheem808@gmail.com\",\"code\":\"CUS_fm0epv6056vvxua\"},\"authorization_code\":\"AUTH_vp8oyzncuw\"}}', NULL, '2026-10-18 10:37:57', NULL, '2026-10-18 11:35:20', '2026-10-18 09:35:20', '2026-10-18 09:37:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('active','suspended','banned') NOT NULL DEFAULT 'active',
  `avatar_url` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `is_verified_seller` tinyint(1) NOT NULL DEFAULT 0,
  `balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `kyc_verified_at` datetime DEFAULT NULL,
  `kyc_type` enum('nin','bvn','cac','drivers_license','voters_card') DEFAULT NULL,
  `has_used_free_promotion` tinyint(1) NOT NULL DEFAULT 0,
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `email_verified_at`, `phone_verified_at`, `password`, `status`, `avatar_url`, `location`, `bio`, `is_verified_seller`, `balance`, `kyc_verified_at`, `kyc_type`, `has_used_free_promotion`, `last_seen_at`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Alice Ade', 'alice', 'yahayaibraheem808@gmail.com', '08011112222', '2026-10-17 11:00:57', NULL, '$2y$12$hdhJYKDNzU9FmA2YfsL.JeyUzAwFVVOlhIB8arLSgt.FFHCbjji.6', 'active', 'http://localhost:8000/storage/avatars/user-1-1792234731.jpg', 'Ogbomoso, Oyo State', 'Selling quality phones and accessories.', 1, 3000.00, '2026-10-18 11:44:01', 'nin', 1, '2026-10-18 10:39:24', NULL, '2026-10-16 13:00:25', '2026-10-18 10:48:32', NULL),
(2, 'Test Other', 'testother', 'other@test.com', NULL, '2026-10-17 11:26:24', NULL, '$2y$12$abc', 'active', NULL, NULL, NULL, 0, 0.00, NULL, NULL, 0, NULL, NULL, '2026-10-17 11:26:24', '2026-10-17 11:26:24', NULL),
(4, 'Bob Seller', 'bobseller', 'bob@sealify.test', '08099998888', '2026-10-17 12:09:59', NULL, '$2y$12$EDyl9FbGbA6NBd8rAVbt5Olk9w8Ue/Vtn13JvpdAaKG5jAP4M4VSG', 'active', NULL, NULL, NULL, 0, 0.00, NULL, NULL, 0, '2026-10-18 09:24:19', NULL, '2026-10-17 11:09:32', '2026-10-18 09:24:19', NULL),
(5, 'Charlie', NULL, 'charlie@sealify.test', NULL, '2026-10-17 12:15:37', NULL, '$2y$12$oqS.wbLpjwG02M0n1fPQ.eLROm5Mw.K1yc92ooD.KL7TLkPNpJTve', 'active', NULL, NULL, NULL, 0, 0.00, NULL, NULL, 0, '2026-10-17 11:15:48', NULL, '2026-10-17 11:15:24', '2026-10-17 11:15:48', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('credit','debit','refund') NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `balance_after` decimal(14,2) NOT NULL,
  `description` varchar(255) NOT NULL,
  `source_type` varchar(255) DEFAULT NULL,
  `source_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallet_transactions`
--

INSERT INTO `wallet_transactions` (`id`, `user_id`, `type`, `amount`, `balance_after`, `description`, `source_type`, `source_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'credit', 5000.00, 5000.00, 'Test credit', NULL, NULL, '2026-10-18 10:48:01', '2026-10-18 10:48:01'),
(2, 1, 'debit', 2000.00, 3000.00, 'Withdrawal request — Paystack Test Bank 0000000000', NULL, NULL, '2026-10-18 10:48:32', '2026-10-18 10:48:32');

-- --------------------------------------------------------

--
-- Table structure for table `webhook_events`
--

CREATE TABLE `webhook_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `provider` varchar(255) NOT NULL,
  `event_key` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `withdrawals`
--

CREATE TABLE `withdrawals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `bank_account_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `fee` decimal(14,2) NOT NULL DEFAULT 0.00,
  `net_amount` decimal(14,2) NOT NULL,
  `status` enum('pending','approved','processing','completed','rejected','failed') NOT NULL DEFAULT 'pending',
  `reference` varchar(255) NOT NULL,
  `provider` varchar(32) NOT NULL DEFAULT 'paystack',
  `provider_transfer_code` varchar(255) DEFAULT NULL,
  `provider_reference` varchar(255) DEFAULT NULL,
  `provider_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`provider_response`)),
  `reviewed_by_admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `withdrawals`
--

INSERT INTO `withdrawals` (`id`, `user_id`, `bank_account_id`, `amount`, `fee`, `net_amount`, `status`, `reference`, `provider`, `provider_transfer_code`, `provider_reference`, `provider_response`, `reviewed_by_admin_id`, `reviewed_at`, `completed_at`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2000.00, 50.00, 1950.00, 'pending', 'WDR-DNWDTKUTKGYC5U', 'paystack', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-18 10:48:32', '2026-10-18 10:48:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bank_accounts_user_id_bank_code_account_number_unique` (`user_id`,`bank_code`,`account_number`),
  ADD KEY `bank_accounts_user_id_is_default_index` (`user_id`,`is_default`);

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
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`),
  ADD KEY `categories_parent_id_sort_order_index` (`parent_id`,`sort_order`),
  ADD KEY `categories_is_active_index` (`is_active`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversations_created_by_foreign` (`created_by`),
  ADD KEY `conversations_last_message_at_index` (`last_message_at`),
  ADD KEY `conversations_listing_id_index` (`listing_id`);

--
-- Indexes for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `conversation_participants_conversation_id_user_id_unique` (`conversation_id`,`user_id`),
  ADD KEY `conversation_participants_user_id_conversation_id_index` (`user_id`,`conversation_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `favorites_user_id_listing_id_unique` (`user_id`,`listing_id`),
  ADD KEY `favorites_listing_id_index` (`listing_id`);

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
-- Indexes for table `kyc_verifications`
--
ALTER TABLE `kyc_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kyc_verifications_user_id_status_index` (`user_id`,`status`),
  ADD KEY `kyc_verifications_type_index` (`type`),
  ADD KEY `kyc_verifications_provider_reference_index` (`provider_reference`);

--
-- Indexes for table `listings`
--
ALTER TABLE `listings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `listings_slug_unique` (`slug`),
  ADD KEY `listings_status_created_at_index` (`status`,`created_at`),
  ADD KEY `listings_category_id_status_index` (`category_id`,`status`),
  ADD KEY `listings_user_id_index` (`user_id`),
  ADD KEY `listings_location_index` (`location`),
  ADD KEY `listings_price_index` (`price`);

--
-- Indexes for table `listing_images`
--
ALTER TABLE `listing_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listing_images_listing_id_sort_order_index` (`listing_id`,`sort_order`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_conversation_id_created_at_index` (`conversation_id`,`created_at`),
  ADD KEY `messages_sender_id_index` (`sender_id`);

--
-- Indexes for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_attachments_message_id_foreign` (`message_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `otp_codes_email_purpose_index` (`email`,`purpose`),
  ADD KEY `otp_codes_user_id_purpose_index` (`user_id`,`purpose`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_transactions_reference_unique` (`reference`),
  ADD KEY `payment_transactions_provider_index` (`provider`),
  ADD KEY `payment_transactions_status_index` (`status`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promotions_transaction_id_foreign` (`transaction_id`),
  ADD KEY `promotions_listing_id_status_ends_at_index` (`listing_id`,`status`,`ends_at`),
  ADD KEY `promotions_user_id_status_index` (`user_id`,`status`),
  ADD KEY `promotions_ends_at_index` (`ends_at`);

--
-- Indexes for table `refund_transactions`
--
ALTER TABLE `refund_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refund_transactions_refund_reference_unique` (`refund_reference`),
  ADD KEY `refund_transactions_transaction_reference_index` (`transaction_reference`),
  ADD KEY `refund_transactions_provider_index` (`provider`),
  ADD KEY `refund_transactions_status_index` (`status`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_reference_unique` (`reference`),
  ADD KEY `transactions_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `transactions_status_purpose_index` (`status`,`purpose`),
  ADD KEY `transactions_provider_reference_index` (`provider_reference`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`),
  ADD KEY `users_status_index` (`status`),
  ADD KEY `users_is_verified_seller_index` (`is_verified_seller`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallet_transactions_source_type_source_id_index` (`source_type`,`source_id`),
  ADD KEY `wallet_transactions_user_id_created_at_index` (`user_id`,`created_at`);

--
-- Indexes for table `webhook_events`
--
ALTER TABLE `webhook_events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `webhook_events_provider_event_key_unique` (`provider`,`event_key`),
  ADD KEY `webhook_events_provider_index` (`provider`),
  ADD KEY `webhook_events_provider_created_at_index` (`provider`,`created_at`);

--
-- Indexes for table `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `withdrawals_reference_unique` (`reference`),
  ADD KEY `withdrawals_bank_account_id_foreign` (`bank_account_id`),
  ADD KEY `withdrawals_user_id_status_index` (`user_id`,`status`),
  ADD KEY `withdrawals_status_index` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kyc_verifications`
--
ALTER TABLE `kyc_verifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `listings`
--
ALTER TABLE `listings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `listing_images`
--
ALTER TABLE `listing_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `message_attachments`
--
ALTER TABLE `message_attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `otp_codes`
--
ALTER TABLE `otp_codes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `refund_transactions`
--
ALTER TABLE `refund_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `webhook_events`
--
ALTER TABLE `webhook_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `withdrawals`
--
ALTER TABLE `withdrawals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD CONSTRAINT `bank_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `conversations_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD CONSTRAINT `conversation_participants_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversation_participants_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kyc_verifications`
--
ALTER TABLE `kyc_verifications`
  ADD CONSTRAINT `kyc_verifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `listings`
--
ALTER TABLE `listings`
  ADD CONSTRAINT `listings_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `listings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `listing_images`
--
ALTER TABLE `listing_images`
  ADD CONSTRAINT `listing_images_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD CONSTRAINT `message_attachments_message_id_foreign` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD CONSTRAINT `otp_codes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotions`
--
ALTER TABLE `promotions`
  ADD CONSTRAINT `promotions_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `promotions_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `promotions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD CONSTRAINT `withdrawals_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`),
  ADD CONSTRAINT `withdrawals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
