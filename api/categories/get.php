<?php
// api/categories/get.php — GET all categories (public)
require_once __DIR__ . '/../helpers.php';

$stmt = db()->query('SELECT id, name, slug FROM categories ORDER BY name ASC');
$categories = $stmt->fetchAll();

// Count projects per category
$counts = [];
$cStmt = db()->query('SELECT category, COUNT(*) as total FROM projects GROUP BY category');
foreach ($cStmt->fetchAll() as $row) {
    $counts[strtolower($row['category'])] = (int)$row['total'];
}

foreach ($categories as &$cat) {
    $cat['total'] = $counts[strtolower($cat['name'])] ?? 0;
}

json_response(['categories' => $categories]);
