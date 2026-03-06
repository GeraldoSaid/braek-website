<?php
// api/projects/delete.php — POST {id} (auth required)
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

$stmt = db()->prepare('DELETE FROM projects WHERE slug = ?');
$stmt->execute([$id]);

if ($stmt->rowCount() === 0) {
    json_response(['error' => 'Projeto não encontrado.'], 404);
}

json_response(['success' => true]);
