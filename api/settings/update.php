<?php
// api/settings/update.php
require_once __DIR__ . '/../helpers.php';
require_auth(); // Only admins can update settings

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if (empty($data)) {
    json_response(['success' => false, 'error' => 'No settings provided'], 400);
}

try {
    $db = db();

    $stmt = $db->prepare("REPLACE INTO settings (key_name, key_value) VALUES (?, ?)");

    $db->beginTransaction();
    foreach ($data as $key => $value) {
        $stmt->execute([sanitize($key), sanitize($value)]);
    }
    $db->commit();

    json_response(['success' => true]);
}
catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    json_response(['success' => false, 'error' => $e->getMessage()], 500);
}
?>
