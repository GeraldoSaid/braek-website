<?php
// api/dashboard/get.php
require_once __DIR__ . '/../helpers.php';
require_auth();

$db = db();

// Ensure 'settings' table exists (auto-migration)
$db->exec("CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` VARCHAR(50) PRIMARY KEY,
  `key_value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Ensure 'testimonials' table exists
$db->exec("CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(150),
  `message` TEXT,
  `avatar` VARCHAR(300),
  `column_id` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$stats = [
    'total_projects' => 0,
    'featured_projects' => 0,
    'new_leads' => 0,
    'visits' => 0,
    'whatsapp_clicks' => 0
];

try {
    // Total Projects
    $stmt = $db->query("SELECT COUNT(*) FROM projects");
    $stats['total_projects'] = (int)$stmt->fetchColumn();

    // Featured Projects
    $stmt = $db->query("SELECT COUNT(*) FROM projects WHERE featured = 1");
    $stats['featured_projects'] = (int)$stmt->fetchColumn();

    // Unread Leads
    $stmt = $db->query("SELECT COUNT(*) FROM leads WHERE status = 'unread'");
    $stats['new_leads'] = (int)$stmt->fetchColumn();

    // Stats from Settings table
    $stmt = $db->query("SELECT key_name, key_value FROM settings WHERE key_name IN ('visits', 'whatsapp_clicks')");
    $dbSettings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $stats['visits'] = (int)($dbSettings['visits'] ?? 1248); // mock initial value
    $stats['whatsapp_clicks'] = (int)($dbSettings['whatsapp_clicks'] ?? 34);

    json_response(['success' => true, 'stats' => $stats]);
}
catch (Exception $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
