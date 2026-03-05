<?php
// api/projects/create.php — POST (auth required)
require_once __DIR__ . '/../helpers.php';
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$body = get_json_body();

// Required fields
$title = sanitize($body['title'] ?? '');
$category = sanitize($body['category'] ?? '');

if (!$title || !$category) {
    json_response(['error' => 'Título e categoria são obrigatórios.'], 422);
}

// Generate slug from title
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));

// Check slug uniqueness, append timestamp if duplicate
$stmt = db()->prepare('SELECT id FROM projects WHERE slug = ?');
$stmt->execute([$slug]);
if ($stmt->fetch()) {
    $slug .= '-' . time();
}

$stmt = db()->prepare('
    INSERT INTO projects 
        (slug, title, subtitle, category, hero_image, page_link, role, client, year, duration, about, challenge, tags, gallery, visit_link, featured, sort_order)
    VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
');

$stmt->execute([
    $slug,
    $title,
    sanitize($body['subtitle'] ?? ''),
    $category,
    sanitize($body['heroImage'] ?? ''),
    sanitize($body['pageLink'] ?? ''),
    sanitize($body['role'] ?? ''),
    sanitize($body['client'] ?? ''),
    sanitize($body['year'] ?? ''),
    sanitize($body['duration'] ?? ''),
    $body['about'] ?? '',
    $body['challenge'] ?? '',
    json_encode($body['tags'] ?? []),
    json_encode($body['gallery'] ?? []),
    sanitize($body['visitLink'] ?? '#'),
    (int)($body['featured'] ?? 0),
    (int)($body['sortOrder'] ?? 0),
]);

json_response(['success' => true, 'id' => $slug, 'db_id' => (int)db()->lastInsertId()], 201);
