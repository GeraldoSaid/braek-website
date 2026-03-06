<?php
// api/track/visit.php
require_once __DIR__ . '/../helpers.php';

// Allow from any origin since this is a public endpoint used for tracking
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}

try {
    $db = db();

    // Ensure 'daily_visits' table exists
    $db->exec("CREATE TABLE IF NOT EXISTS `daily_visits` (
      `visit_date` DATE PRIMARY KEY,
      `visits` INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $today = date('Y-m-d');

    $stmt = $db->prepare("INSERT INTO daily_visits (visit_date, visits) VALUES (?, 1) ON DUPLICATE KEY UPDATE visits = visits + 1");
    $stmt->execute([$today]);

    // Also update global settings just in case
    $db->exec("INSERT INTO settings (key_name, key_value) VALUES ('visits', '1') ON DUPLICATE KEY UPDATE key_value = CAST(key_value AS UNSIGNED) + 1");

    json_response(['success' => true]);
}
catch (Exception $e) {
    json_response(['success' => false, 'error' => $e->getMessage()], 500);
}
?>
