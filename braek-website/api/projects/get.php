<?php
// api/projects/get.php — GET all projects (public)
// Optional query params: ?category=branding | ?featured=1
require_once __DIR__ . '/../helpers.php';

$sql = 'SELECT * FROM projects WHERE 1=1';
$params = [];

if (!empty($_GET['category'])) {
    $sql .= ' AND LOWER(category) = LOWER(?)';
    $params[] = sanitize($_GET['category']);
}

if (!empty($_GET['featured'])) {
    $sql .= ' AND featured = 1';
}

$sql .= ' ORDER BY sort_order ASC, created_at DESC';

$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Parse JSON fields and normalize keys for frontend compatibility
$projects = array_map(function ($row) {
    return [
    'id' => $row['slug'], // keep "id" as slug for URL compat
    'title' => $row['title'],
    'subtitle' => $row['subtitle'],
    'category' => $row['category'],
    'heroImage' => $row['hero_image'],
    'pageLink' => $row['page_link'],
    'role' => $row['role'],
    'client' => $row['client'],
    'year' => $row['year'],
    'duration' => $row['duration'],
    'about' => $row['about'],
    'challenge' => $row['challenge'],
    'tags' => json_decode($row['tags'] ?? '[]', true),
    'gallery' => json_decode($row['gallery'] ?? '[]', true),
    'visitLink' => $row['visit_link'],
    'featured' => (bool)$row['featured'],
    ];
}, $rows);

json_response(['projects' => $projects]);
