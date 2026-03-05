<?php
// api/categories/create.php — POST {name} (auth required)
require_once __DIR__ . '/../helpers.php';
require_auth();

$body = get_json_body();
$name = sanitize($body['name'] ?? '');

if (!$name) {
    json_response(['error' => 'Nome da categoria é obrigatório.'], 422);
}

$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));

try {
    $stmt = db()->prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
    $stmt->execute([$name, $slug]);
    json_response(['success' => true, 'id' => (int)db()->lastInsertId(), 'slug' => $slug], 201);
}
catch (PDOException $e) {
    json_response(['error' => 'Categoria já existe.'], 409);
}
