<?php
// api/testimonials/create.php
require_once __DIR__ . '/../helpers.php';
require_auth(); // Only admins can add

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if (empty($data['name']) || empty($data['message'])) {
    json_response(['success' => false, 'error' => 'Name and message are required'], 400);
}

try {
    $db = db();
    $stmt = $db->prepare("INSERT INTO testimonials (name, role, message, avatar, column_id) VALUES (?, ?, ?, ?, ?)");

    // Assign column sequentially or random for marquee distribution
    // Let's just default to column 1, frontend can distribute them
    $column_id = isset($data['column_id']) ? (int)$data['column_id'] : 1;

    $stmt->execute([
        sanitize($data['name']),
        sanitize($data['role'] ?? ''),
        sanitize($data['message']),
        sanitize($data['avatar'] ?? ''),
        $column_id
    ]);

    json_response(['success' => true, 'id' => $db->lastInsertId()]);
}
catch (Exception $e) {
    json_response(['success' => false, 'error' => $e->getMessage()], 500);
}
?>
