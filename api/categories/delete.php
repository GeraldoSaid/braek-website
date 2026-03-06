<?php
// api/categories/delete.php — POST {id} (auth required)
require_once __DIR__ . '/../helpers.php';
require_auth();

$body = get_json_body();
$id = (int)($body['id'] ?? 0);

if (!$id) {
    json_response(['error' => 'ID da categoria é obrigatório.'], 422);
}

$stmt = db()->prepare('DELETE FROM categories WHERE id = ?');
$stmt->execute([$id]);

if ($stmt->rowCount() === 0) {
    json_response(['error' => 'Categoria não encontrada.'], 404);
}

json_response(['success' => true]);
