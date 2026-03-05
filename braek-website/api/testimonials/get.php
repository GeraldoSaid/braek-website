<?php
// api/testimonials/get.php
require_once __DIR__ . '/../helpers.php';

try {
    $db = db();
    $stmt = $db->query("SELECT * FROM testimonials ORDER BY created_at DESC");
    $testimonials = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response(['success' => true, 'testimonials' => $testimonials]);
}
catch (Exception $e) {
    json_response(['success' => false, 'error' => $e->getMessage()], 500);
}
?>
