-- =============================================================================
-- MYSQL / MARIADB SCHEMA & SEED DATA FOR EDUBARI CENTRAL WEBSITE & SAAS
-- Compatible with phpMyAdmin, MySQL Workbench, Laravel DB, and Node.js (mysql2)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `edubari` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `edubari`;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 0. CLEAN RESET BLOCK
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `domain_ai_transactions`;
DROP TABLE IF EXISTS `domain_ai_credits`;
DROP TABLE IF EXISTS `ai_purchase_requests`;
DROP TABLE IF EXISTS `ai_packages`;
DROP TABLE IF EXISTS `banners`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `blog_posts`;
DROP TABLE IF EXISTS `work_proofs`;
DROP TABLE IF EXISTS `subscription_requests`;
DROP TABLE IF EXISTS `erp_connections`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `plans`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `team_members`;
DROP TABLE IF EXISTS `feature_videos`;
DROP TABLE IF EXISTS `collected_leads`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE (Admin & Staff Authentication)
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL, -- SHA-256 or bcrypt hash
    `role` VARCHAR(50) DEFAULT 'admin',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. CLIENTS TABLE (SaaS Tenants)
-- -----------------------------------------------------------------------------
CREATE TABLE `clients` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `client_name` VARCHAR(255) NOT NULL,
    `domain` VARCHAR(255) NOT NULL UNIQUE,
    `phone` VARCHAR(50) DEFAULT NULL,
    `logo_url` TEXT DEFAULT NULL,
    `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
    `client_type` ENUM('single_teacher', 'school_erp') NOT NULL DEFAULT 'single_teacher',
    `erp_api_token` VARCHAR(64) DEFAULT NULL UNIQUE,
    `erp_secret` VARCHAR(64) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_clients_domain` (`domain`),
    INDEX `idx_clients_erp_token` (`erp_api_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. SUBSCRIPTION PLANS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `plans` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `plan_name` VARCHAR(255) NOT NULL,
    `plan_type` ENUM('single_teacher', 'school_erp') NOT NULL DEFAULT 'single_teacher',
    `duration_days` INT NOT NULL,
    `max_students` INT NOT NULL,
    `max_instructors` INT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `features` JSON NOT NULL,
    `plan_tier` VARCHAR(50) DEFAULT 'free',
    `max_batches` INT DEFAULT 1,
    `monthly_ai_credits` INT DEFAULT 0,
    `show_branding` BOOLEAN DEFAULT TRUE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `sort_order` INT DEFAULT 0,
    `feature_gates` JSON DEFAULT NULL,
    `old_price` DECIMAL(10, 2) DEFAULT NULL,
    `price_label` VARCHAR(255) DEFAULT NULL,
    `duration` VARCHAR(100) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `popular` BOOLEAN DEFAULT FALSE,
    `badge` VARCHAR(100) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. SUBSCRIPTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `subscriptions` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `client_id` VARCHAR(36) NOT NULL,
    `plan_id` VARCHAR(36) NOT NULL,
    `start_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `end_date` DATETIME NOT NULL,
    `grace_end_date` DATETIME NOT NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT TRUE,
    `payment_status` ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4b. ERP CONNECTIONS TABLE (School ERP → EduBari link tracking)
-- -----------------------------------------------------------------------------
CREATE TABLE `erp_connections` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `client_id` VARCHAR(36) NOT NULL,
    `domain` VARCHAR(255) NOT NULL,
    `erp_api_token` VARCHAR(64) NOT NULL UNIQUE,
    `laravel_version` VARCHAR(20) DEFAULT NULL,
    `erp_version` VARCHAR(50) DEFAULT NULL,
    `last_ping_at` DATETIME DEFAULT NULL,
    `connection_status` ENUM('connected', 'disconnected', 'pending') DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
    INDEX `idx_erp_token` (`erp_api_token`),
    INDEX `idx_erp_domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4c. SUBSCRIPTION PAYMENTS TABLE (School ERP: bKash / Nagad / manual by admin)
-- -----------------------------------------------------------------------------
CREATE TABLE `subscription_payments` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `client_id` VARCHAR(36) NOT NULL,
    `plan_id` VARCHAR(36) DEFAULT NULL,
    `subscription_id` VARCHAR(36) DEFAULT NULL,
    `method` ENUM('bkash', 'nagad', 'manual') NOT NULL,
    `source` ENUM('gateway', 'admin') NOT NULL DEFAULT 'gateway',
    `channel` VARCHAR(30) DEFAULT NULL,
    `periods` INT NOT NULL DEFAULT 1,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'BDT',
    `status` ENUM('initiated', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'initiated',
    `merchant_invoice` VARCHAR(40) NOT NULL UNIQUE,
    `gateway_payment_id` VARCHAR(100) DEFAULT NULL UNIQUE,
    `trx_id` VARCHAR(100) DEFAULT NULL UNIQUE,
    `payer_reference` VARCHAR(100) DEFAULT NULL,
    `return_url` VARCHAR(500) DEFAULT NULL,
    `period_start` DATETIME DEFAULT NULL,
    `period_end` DATETIME DEFAULT NULL,
    `recorded_by` VARCHAR(36) DEFAULT NULL,
    `note` VARCHAR(500) DEFAULT NULL,
    `failure_reason` VARCHAR(255) DEFAULT NULL,
    `gateway_response` LONGTEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `completed_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE SET NULL,
    INDEX `idx_sp_client` (`client_id`, `created_at`),
    INDEX `idx_sp_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4d. SECURITY THROTTLE TABLES (admin login attempts, used ERP request nonces)
-- -----------------------------------------------------------------------------
CREATE TABLE `admin_login_attempts` (
    `ip` VARCHAR(64) NOT NULL PRIMARY KEY,
    `attempts` INT NOT NULL DEFAULT 0,
    `reset_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `erp_request_nonces` (
    `nonce_key` VARCHAR(160) NOT NULL PRIMARY KEY,
    `expires_at` DATETIME NOT NULL,
    INDEX `idx_nonce_expiry` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. SUBSCRIPTION REQUESTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `subscription_requests` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `institution_name` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `preferred_domain` VARCHAR(255) NOT NULL,
    `address` TEXT DEFAULT NULL,
    `payment_method` VARCHAR(50) DEFAULT NULL,
    `transaction_id` VARCHAR(100) DEFAULT NULL UNIQUE,
    `selected_plan_id` VARCHAR(36) DEFAULT NULL,
    `selected_plan_name` VARCHAR(255) DEFAULT NULL,
    `selected_plan_duration` INT DEFAULT NULL,
    `selected_plan_price` DECIMAL(10, 2) DEFAULT NULL,
    `verified` BOOLEAN DEFAULT FALSE,
    `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`selected_plan_id`) REFERENCES `plans`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. WORK PROOFS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `work_proofs` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `image_url` TEXT DEFAULT NULL,
    `client_name` VARCHAR(255) DEFAULT NULL,
    `project_url` TEXT DEFAULT NULL,
    `order_index` INT DEFAULT 1,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. BLOG POSTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `blog_posts` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `content` LONGTEXT NOT NULL,
    `excerpt` TEXT DEFAULT NULL,
    `cover_image` TEXT DEFAULT NULL,
    `author_name` VARCHAR(100) DEFAULT 'Admin',
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. CONTACT MESSAGES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `contact_messages` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `subject` VARCHAR(255) DEFAULT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN DEFAULT FALSE,
    `response` TEXT DEFAULT NULL,
    `replied_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. BANNERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `banners` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) DEFAULT NULL,
    `subtitle` TEXT DEFAULT NULL,
    `image` TEXT NOT NULL,
    `alt` VARCHAR(255) DEFAULT NULL,
    `order_index` INT DEFAULT 1,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. AI PACKAGES TIER TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `ai_packages` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `credits` INT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `validity_days` INT DEFAULT 30,
    `is_active` BOOLEAN DEFAULT TRUE,
    `highlight` BOOLEAN DEFAULT FALSE,
    `currency` VARCHAR(10) DEFAULT 'BDT',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. AI PURCHASE REQUESTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `ai_purchase_requests` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `domain` VARCHAR(255) NOT NULL,
    `package_id` VARCHAR(36) DEFAULT NULL,
    `package_name` VARCHAR(255) DEFAULT NULL,
    `user_name` VARCHAR(255) DEFAULT NULL,
    `user_phone` VARCHAR(50) DEFAULT NULL,
    `credits` INT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(10) DEFAULT 'BDT',
    `payment_method` VARCHAR(50) DEFAULT NULL,
    `transaction_id` VARCHAR(100) DEFAULT NULL UNIQUE,
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `processed_at` DATETIME DEFAULT NULL,
    FOREIGN KEY (`package_id`) REFERENCES `ai_packages`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. DOMAIN ACTIVE AI CREDIT LEDGER
-- -----------------------------------------------------------------------------
CREATE TABLE `domain_ai_credits` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `domain` VARCHAR(255) NOT NULL UNIQUE,
    `remaining_credits` INT NOT NULL DEFAULT 0,
    `total_credits_purchased` INT NOT NULL DEFAULT 0,
    `expires_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_domain_credits` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. DOMAIN AI TRANSACTION LEDGER
-- -----------------------------------------------------------------------------
CREATE TABLE `domain_ai_transactions` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `domain` VARCHAR(255) NOT NULL,
    `teacher_id` VARCHAR(36) NOT NULL,
    `teacher_name` VARCHAR(255) DEFAULT NULL,
    `type` ENUM('purchase', 'usage', 'expiry', 'refund') NOT NULL,
    `feature` ENUM('presentation', 'question_maker', 'batch_cover', 'billing') NOT NULL,
    `amount` INT NOT NULL,
    `description` TEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_domain_transactions` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. TEAM MEMBERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `team_members` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `image_url` TEXT DEFAULT NULL,
    `order_index` INT DEFAULT 1,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. FEATURE VIDEOS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `feature_videos` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `feature_title` VARCHAR(255) NOT NULL UNIQUE,
    `video_url` TEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 16. COLLECTED LEADS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `collected_leads` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Seed Admin User: botbari@edubari.bd | Password: Edu@@@@1234 (SHA-256: b8c3390b674eb668e161d7279a6daa3ace8e4e2de0a9a0316f459ff675d6f268)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`)
VALUES ('3dfd52ed-c3e8-4973-997f-906169626880', 'Edubari Admin', 'botbari@edubari.bd', 'b8c3390b674eb668e161d7279a6daa3ace8e4e2de0a9a0316f459ff675d6f268', 'admin')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `email` = VALUES(`email`), `password` = VALUES(`password`);

-- Seed Standard SaaS Plans (single_teacher type)
INSERT INTO `plans` (`id`, `plan_name`, `plan_type`, `duration_days`, `max_students`, `max_instructors`, `price`, `features`, `plan_tier`, `max_batches`, `monthly_ai_credits`, `show_branding`, `is_active`, `sort_order`, `feature_gates`)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'EDUBARI Free', 'single_teacher', 365, 20, 1, 0.00, '["Limited Personal Website", "Personal Profile", "Limited Student Management", "1 Batch Management", "Basic Class & Exam System", "Basic Attendance", "Basic Payment Tracking", "Limited Online Class", "Limited AI Presentation Maker", "Powered by EDUBARI Branding", "2 AI Credits / Month"]', 'free', 1, 2, TRUE, TRUE, 1, '{"personal_website": true, "online_class": true, "recorded_class": false, "ai_presentation": true, "ai_presentation_limited": true, "guardian_portal": false, "advanced_analytics": false, "multi_teacher": false, "salary_management": false, "custom_branding": false, "course_management": false, "student_performance": false, "assignment_system": false, "payment_tracking": true}'),
('f0000000-0000-0000-0000-000000000002', 'EDUBARI Starter', 'single_teacher', 30, 100, 1, 250.00, '["Personal Digital Academy", "Personal Website & Profile", "Student & Batch Management", "Monthly Payment & Due Tracking", "Online & Recorded Class", "Exam, Result & Assignment", "Auto Attendance", "AI Presentation Maker", "Student Performance Tracking", "Course Management", "10 AI Credits / Month"]', 'starter', 5, 10, FALSE, TRUE, 2, '{"personal_website": true, "online_class": true, "recorded_class": true, "ai_presentation": true, "ai_presentation_limited": false, "guardian_portal": false, "advanced_analytics": false, "multi_teacher": false, "salary_management": false, "custom_branding": false, "course_management": true, "student_performance": true, "assignment_system": true, "payment_tracking": true}'),
('f0000000-0000-0000-0000-000000000003', 'EDUBARI Professional', 'single_teacher', 30, 300, 1, 350.00, '["Starter Plan-এর সকল সুবিধা", "অধিক Student & Batch", "Advanced Student Analytics", "Guardian Portal", "Smart Payment Tracking", "Advanced AI Tools", "Personal Branded Platform", "Online + Offline Class", "Advanced Reports & Analytics", "Priority Support", "15 AI Credits / Month"]', 'professional', 15, 15, FALSE, TRUE, 3, '{"personal_website": true, "online_class": true, "recorded_class": true, "ai_presentation": true, "ai_presentation_limited": false, "guardian_portal": true, "advanced_analytics": true, "multi_teacher": false, "salary_management": false, "custom_branding": false, "course_management": true, "student_performance": true, "assignment_system": true, "payment_tracking": true, "payment_tracking_advanced": true}'),
('f0000000-0000-0000-0000-000000000004', 'EDUBARI Business', 'single_teacher', 30, 500, 10, 550.00, '["Multiple Teacher Management", "Student & Batch Management", "Batch-wise Payment System", "Teacher Activity Tracking", "Student Performance Tracking", "Guardian Portal & Notification", "Teacher Salary Management", "Online + Offline Class", "Exam, Assignment & Result", "AI Presentation Maker", "Branded Website & Platform", "Advanced Analytics", "30 AI Credits / Month"]', 'business', 30, 30, FALSE, TRUE, 4, '{"personal_website": true, "online_class": true, "recorded_class": true, "ai_presentation": true, "ai_presentation_limited": false, "guardian_portal": true, "advanced_analytics": true, "multi_teacher": true, "salary_management": true, "custom_branding": false, "course_management": true, "student_performance": true, "assignment_system": true, "payment_tracking": true, "payment_tracking_advanced": true}'),
('f0000000-0000-0000-0000-000000000005', 'EDUBARI Enterprise', 'single_teacher', 30, 2000, 50, 700.00, '["Complete Institution Management", "Multiple Teacher & Student Management", "Department & Campus Management", "Teacher Class Tracking", "Auto Attendance System", "Student Performance Analytics", "Guardian Monitoring", "Payment & Salary Management", "AI-Powered Education Tools", "Custom Website & App", "Central Digital Dashboard", "Upazila & District Level Monitoring", "Advanced Analytics & Reports", "Dedicated Support", "Custom Development & Integration", "50 AI Credits / Month"]', 'enterprise', 999, 50, FALSE, TRUE, 5, '{"personal_website": true, "online_class": true, "recorded_class": true, "ai_presentation": true, "ai_presentation_limited": false, "guardian_portal": true, "advanced_analytics": true, "multi_teacher": true, "salary_management": true, "custom_branding": true, "course_management": true, "student_performance": true, "assignment_system": true, "payment_tracking": true, "payment_tracking_advanced": true, "custom_development": true}')
ON DUPLICATE KEY UPDATE `plan_name` = VALUES(`plan_name`), `plan_type` = VALUES(`plan_type`);

-- Seed School ERP Plans (school_erp type)
INSERT INTO `plans` (`id`, `plan_name`, `plan_type`, `duration_days`, `max_students`, `max_instructors`, `price`, `features`, `plan_tier`, `max_batches`, `monthly_ai_credits`, `show_branding`, `is_active`, `sort_order`, `feature_gates`)
VALUES
('e0000000-0000-0000-0000-000000000001', 'ERP Basic School', 'school_erp', 365, 300, 10, 2000.00, '["School ERP API Connection", "Up to 300 Students", "10 Teachers", "Basic Attendance & Exam", "Student Payment Tracking", "Guardian SMS Alerts", "20 AI Credits / Month"]', 'starter', 20, 20, TRUE, TRUE, 10, '{"multi_teacher": true, "guardian_portal": true, "salary_management": false, "advanced_analytics": false, "ai_presentation": true, "custom_branding": false, "erp_api_access": true}'),
('e0000000-0000-0000-0000-000000000002', 'ERP Standard School', 'school_erp', 365, 1000, 30, 4500.00, '["School ERP API Connection", "Up to 1000 Students", "30 Teachers", "Full Attendance & Exam System", "Advanced Payment Management", "Teacher Salary System", "Guardian Portal", "Advanced Analytics", "50 AI Credits / Month"]', 'professional', 50, 50, FALSE, TRUE, 11, '{"multi_teacher": true, "guardian_portal": true, "salary_management": true, "advanced_analytics": true, "ai_presentation": true, "custom_branding": false, "erp_api_access": true}'),
('e0000000-0000-0000-0000-000000000003', 'ERP Enterprise School', 'school_erp', 365, 5000, 100, 8000.00, '["School ERP API Connection", "Up to 5000 Students", "100 Teachers", "Multi-Campus Management", "Department Management", "Full Salary & HR System", "District Level Monitoring", "Custom Branding & Domain", "Priority Support", "100 AI Credits / Month"]', 'enterprise', 999, 100, FALSE, TRUE, 12, '{"multi_teacher": true, "guardian_portal": true, "salary_management": true, "advanced_analytics": true, "ai_presentation": true, "custom_branding": true, "erp_api_access": true, "multi_campus": true, "custom_development": true}')
ON DUPLICATE KEY UPDATE `plan_name` = VALUES(`plan_name`);

-- Seed Standard Active Clients
INSERT INTO `clients` (`id`, `client_name`, `domain`, `phone`, `status`)
VALUES 
('c1000000-0000-0000-0000-000000000001', 'AVA School & College', 'ava.edubari.bd', '+8801700000001', 'active'),
('c1000000-0000-0000-0000-000000000002', 'School 1 Demo', 'school1.edubari.bd', '+8801700000002', 'active'),
('c1000000-0000-0000-0000-000000000003', 'Asif Rabetul Personal Domain', 'asifrabetul.com', '+8801700000003', 'active'),
('c1000000-0000-0000-0000-000000000101', 'Local Testing Environment', 'localhost', '+8801700000000', 'active'),
('c1000000-0000-0000-0000-000000000102', 'Local Loopback Environment', '127.0.0.1', '+8801700000000', 'active')
ON DUPLICATE KEY UPDATE `client_name` = VALUES(`client_name`);

-- Seed Client Subscriptions
INSERT INTO `subscriptions` (`id`, `client_id`, `plan_id`, `start_date`, `end_date`, `grace_end_date`, `is_current`, `payment_status`)
VALUES
('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 372 DAY), TRUE, 'paid'),
('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 37 DAY), TRUE, 'paid'),
('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 372 DAY), TRUE, 'paid'),
('a1000000-0000-0000-0000-000000000101', 'c1000000-0000-0000-0000-000000000101', 'f0000000-0000-0000-0000-000000000005', NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 372 DAY), TRUE, 'paid'),
('a1000000-0000-0000-0000-000000000102', 'c1000000-0000-0000-0000-000000000102', 'f0000000-0000-0000-0000-000000000005', NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 372 DAY), TRUE, 'paid')
ON DUPLICATE KEY UPDATE `is_current` = VALUES(`is_current`);

-- Seed AI Credits for domains
INSERT INTO `domain_ai_credits` (`id`, `domain`, `remaining_credits`, `total_credits_purchased`, `expires_at`)
VALUES
('d1000000-0000-0000-0000-000000000001', 'ava.edubari.bd', 500, 500, DATE_ADD(NOW(), INTERVAL 365 DAY)),
('d1000000-0000-0000-0000-000000000002', 'school1.edubari.bd', 150, 150, DATE_ADD(NOW(), INTERVAL 365 DAY)),
('d1000000-0000-0000-0000-000000000003', 'asifrabetul.com', 1000, 1000, DATE_ADD(NOW(), INTERVAL 365 DAY)),
('d1000000-0000-0000-0000-000000000101', 'localhost', 1000, 1000, DATE_ADD(NOW(), INTERVAL 365 DAY)),
('d1000000-0000-0000-0000-000000000102', '127.0.0.1', 1000, 1000, DATE_ADD(NOW(), INTERVAL 365 DAY))
ON DUPLICATE KEY UPDATE `remaining_credits` = VALUES(`remaining_credits`);

-- Seed default AI package plans
INSERT INTO `ai_packages` (`id`, `name`, `credits`, `price`, `validity_days`, `is_active`, `highlight`, `currency`)
VALUES
('b0000000-0000-0000-0000-000000000001', 'Starter Pack', 5, 99.00, 30, TRUE, FALSE, 'BDT'),
('b0000000-0000-0000-0000-000000000002', 'Pro Pack', 10, 179.00, 30, TRUE, TRUE, 'BDT'),
('b0000000-0000-0000-0000-000000000003', 'Power Pack', 20, 299.00, 30, TRUE, FALSE, 'BDT')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
