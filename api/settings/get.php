<?php
// api/settings/get.php
require_once __DIR__ . '/../helpers.php';

try {
    $db = db();
    $stmt = $db->query("SELECT key_name, key_value FROM settings");
    $settingsRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert to simple key-value object
    $settings = [];
    foreach ($settingsRaw as $row) {
        $settings[$row['key_name']] = $row['key_value'];
    }

    json_response(['success' => true, 'settings' => $settings]);
}
catch (Exception $e) {
    json_response(['success' => false, 'error' => $e->getMessage()], 500);
}
?>
