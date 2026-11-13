-- Yarl Creators website database (MySQL 5.7+ / MariaDB 10.3+)
-- Import in phpMyAdmin: create a database (e.g. yarlcreators), open it, Import -> this file.
-- For the existing posts, team and images as well, import yarlcreators.sql instead.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `media` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `mime` VARCHAR(40) NOT NULL,
  `data` LONGTEXT NOT NULL COMMENT 'Image file encoded as base64',
  `size` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Decoded size in bytes',
  `name` VARCHAR(200) NOT NULL DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `excerpt` VARCHAR(400) NOT NULL DEFAULT '',
  `category` VARCHAR(80) NOT NULL DEFAULT '',
  `content` MEDIUMTEXT NOT NULL,
  `cover_id` INT UNSIGNED NULL DEFAULT NULL,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('draft','published') NOT NULL DEFAULT 'draft',
  `reading_minutes` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `published_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_slug` (`slug`),
  KEY `idx_listing` (`status`, `featured`, `published_at`),
  CONSTRAINT `fk_blog_cover` FOREIGN KEY (`cover_id`) REFERENCES `media` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `team` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `role` VARCHAR(120) NOT NULL DEFAULT '',
  `bio` TEXT NULL,
  `photo_id` INT UNSIGNED NULL DEFAULT NULL,
  `visible` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`sort_order`),
  CONSTRAINT `fk_team_photo` FOREIGN KEY (`photo_id`) REFERENCES `media` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `logos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL DEFAULT '',
  `image_id` INT UNSIGNED NULL DEFAULT NULL,
  `src` VARCHAR(255) NULL DEFAULT NULL,
  `visible` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `phone` VARCHAR(40) NOT NULL,
  `service` VARCHAR(80) NOT NULL DEFAULT '',
  `message` TEXT NULL,
  `status` ENUM('new','read','replied','archived') NOT NULL DEFAULT 'new',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_created` (`created_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Used to slow down repeated contact-form posts and login attempts
CREATE TABLE IF NOT EXISTS `rate_hits` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bucket` VARCHAR(20) NOT NULL,
  `ip` VARCHAR(64) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lookup` (`bucket`, `ip`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
