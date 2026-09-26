-- School ERP subscription payments (bKash / Nagad gateway and manual entries by an admin).
-- One row per payment attempt; a completed row extends the school's subscription exactly once.
-- Apply once:  mysql -u root edubari < migrations/2026-09-26-subscription-payments.sql

CREATE TABLE IF NOT EXISTS `subscription_payments` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `client_id` VARCHAR(36) NOT NULL,
    `plan_id` VARCHAR(36) DEFAULT NULL,
    `subscription_id` VARCHAR(36) DEFAULT NULL,
    `method` ENUM('bkash', 'nagad', 'manual') NOT NULL,
    `source` ENUM('gateway', 'admin') NOT NULL DEFAULT 'gateway',
    `channel` VARCHAR(30) DEFAULT NULL,                 -- manual entries: cash, bank, bkash_send_money ...
    `periods` INT NOT NULL DEFAULT 1,                   -- how many plan terms were bought
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'BDT',
    `status` ENUM('initiated', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'initiated',
    `merchant_invoice` VARCHAR(40) NOT NULL UNIQUE,     -- our order id sent to the gateway
    `gateway_payment_id` VARCHAR(100) DEFAULT NULL UNIQUE,
    `trx_id` VARCHAR(100) DEFAULT NULL UNIQUE,
    `payer_reference` VARCHAR(100) DEFAULT NULL,
    `return_url` VARCHAR(500) DEFAULT NULL,
    `period_start` DATETIME DEFAULT NULL,
    `period_end` DATETIME DEFAULT NULL,
    `recorded_by` VARCHAR(36) DEFAULT NULL,             -- admin user for manual entries
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
