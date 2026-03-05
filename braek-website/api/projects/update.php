<?php
// api/projects/update.php — POST {id, ...fields} (auth required)
require_once __DIR__ . '/../helpers.php';
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$body = get_json_body();
$id = sanitize($body['id'] ?? '');

if (!$id) {
    json_response(['error' => 'ID do projeto é obrigatório.'], 422);
}

// Build dynamic SET clause from provided fields
$allowed = [
    'title', 'subtitle', 'category', 'hero_image', 'page_link',
    'role', 'client', 'year', 'duration', 'about', 'challenge',
    'visit_link', 'featured', 'sort_order'
];

$map = [
    'heroImage' => 'hero_image',
    'pageLink' => 'page_link',
    'visitLink' => 'visit_link',
    'sortOrder' => 'sort_order',
];

$sets = [];
$params = [];

foreach ($body as $key => $value) {
    $col = $map[$key] ?? $key;
    if (in_array($col, $allowed)) {
        $sets[] = "`$col` = ?";
        $params[] = is_array($value) ? json_encode($value) : sanitize((string)$value);
    }
}

// Handle JSON fields separately
foreach (['tags', 'gallery'] as $jsonField) {
    if (isset($body[$jsonField])) {
        $sets[] = "`$jsonField` = ?";
        $params[] = json_encode($body[$jsonField]);
    }
}

if (empty($sets)) {
    json_response(['error' => 'Nenhum campo para atualizar.'], 422);
}

$params[] = $id;
$sql = 'UPDATE projects SET ' . implode(', ', $sets) . ' WHERE slug = ?';

$stmt = db()->prepare($sql);
$stmt->execute($params);

if ($stmt->rowCount() === 0) {
    json_response(['error' => 'Projeto não encontrado.'], 404);
}

json_response(['success' => true]);
