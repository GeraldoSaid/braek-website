-- ============================================================
-- Braek Agency - Database Schema
-- Import via phpMyAdmin or: mysql -u root -p braek_db < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS `braek_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `braek_db`;

-- ------------------------------------------------------------
-- Table: users (admin accounts)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(100) NOT NULL,
  `email`      VARCHAR(150) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,  -- bcrypt hash
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default admin user: email=admin@braek.com / password=braek2024
-- Change this password immediately after first login!
INSERT INTO `users` (`name`, `email`, `password`) VALUES
('Admin Braek', 'admin@braek.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- ------------------------------------------------------------
-- Table: categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(100) NOT NULL,
  `slug`       VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `categories` (`name`, `slug`) VALUES
('Branding', 'branding'),
('Web Design', 'web-design'),
('UX/UI Design', 'ux-ui-design');

-- ------------------------------------------------------------
-- Table: projects
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug`        VARCHAR(150) NOT NULL UNIQUE,
  `title`       VARCHAR(150) NOT NULL,
  `subtitle`    VARCHAR(200) DEFAULT '',
  `category`    VARCHAR(100) NOT NULL,
  `hero_image`  VARCHAR(300) DEFAULT '',
  `page_link`   VARCHAR(300) DEFAULT '',
  `role`        VARCHAR(150) DEFAULT '',
  `client`      VARCHAR(150) DEFAULT '',
  `year`        CHAR(4) DEFAULT '',
  `duration`    VARCHAR(100) DEFAULT '',
  `about`       TEXT DEFAULT NULL,
  `challenge`   TEXT DEFAULT NULL,
  `tags`        JSON DEFAULT NULL,        -- ["Branding", "Figma"]
  `gallery`     JSON DEFAULT NULL,        -- ["assets/img1.jpg", ...]
  `visit_link`  VARCHAR(300) DEFAULT '#',
  `featured`    TINYINT(1) DEFAULT 0,
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `projects` 
  (`slug`,`title`,`subtitle`,`category`,`hero_image`,`page_link`,`role`,`client`,`year`,`duration`,`about`,`challenge`,`tags`,`gallery`,`visit_link`,`featured`,`sort_order`) 
VALUES
(
  'enix', 'Enix', 'Agência de marketing', 'Branding',
  'assets/projetos/enix/enix.png', 'project-enix.html',
  'Brand Designer', 'Enix Agência', '2024', '2 Meses',
  'Criação de identidade visual completa para a Enix, agência de marketing digital.',
  'O desafio foi criar uma marca forte e contemporânea no competitivo mercado de agências.',
  '["Brand Identity","Visual System","Logotipo"]',
  '["assets/projetos/enix/enix.png"]',
  '#', 1, 1
),
(
  'ssg-saude', 'SSG SAÚDE', 'Identidade Visual & Web', 'Web Design',
  'assets/projetos/ssg/ssg.png', 'project-ssg.html',
  'Lead Designer', 'SSG Saúde', '2024', '3 Meses',
  'Experiência digital moderna e acessível para o setor de saúde.',
  'Organizar vasta gama de informações em layout limpo, mantendo a identidade forte.',
  '["UX/UI","Design System","Web"]',
  '["assets/projetos/ssg/ssg.png"]',
  '#', 1, 2
),
(
  'aurora', 'AURORA', 'Design de Marca & Embalagem', 'Branding',
  'assets/projetos/aurora/aurora.png', 'project-aurora.html',
  'Brand Designer', 'Aurora Cosméticos', '2023', '2 Meses',
  'Evolução de marca para o mercado de cosméticos premium.',
  'Transmitir sofisticação mantendo praticabilidade em diferentes formatos de embalagem.',
  '["Brand Identity","Packaging","Luxury"]',
  '["assets/projetos/aurora/aurora.png"]',
  '#', 1, 3
);

-- ------------------------------------------------------------
-- Table: leads (contact form submissions)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leads` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(150) NOT NULL,
  `email`      VARCHAR(150) NOT NULL,
  `phone`      VARCHAR(30) DEFAULT '',
  `message`    TEXT DEFAULT NULL,
  `status`     ENUM('unread','read') DEFAULT 'unread',
  `ip_address` VARCHAR(45) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
