<?php
// api/testimonials/delete.php
require_once __DIR__ . '/../helpers.php';
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if (empty($data['id'])) {
    json_response(['success' => false, 'error' => 'Testimonial ID required'], 400);
}

try {
    $db = db();
    $stmt = $db->prepare("DELETE FROM testimonials WHERE id = ?");
    $stmt->execute([(int)$data['id']]);

    json_response(['success' => true]);
}
catch (Exception $e) {
    json_response(['success' => false, 'error' => $e->getMessage()], 500);
}
?>
