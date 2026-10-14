-- Shared (multi-server safe) security state that used to live in one server's memory:
--   admin_login_attempts — failed admin logins per IP (10 per 15 minutes)
--   erp_request_nonces   — nonces of signed School ERP requests already used (replay protection)
-- Apply once:  mysql -u root edubari < migrations/2026-09-26-security-throttle.sql

CREATE TABLE IF NOT EXISTS `admin_login_attempts` (
    `ip` VARCHAR(64) NOT NULL PRIMARY KEY,
    `attempts` INT NOT NULL DEFAULT 0,
    `reset_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `erp_request_nonces` (
    `nonce_key` VARCHAR(160) NOT NULL PRIMARY KEY,
    `expires_at` DATETIME NOT NULL,
    INDEX `idx_nonce_expiry` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
