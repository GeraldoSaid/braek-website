<?php
// api/leads/update.php — POST {id, status} (auth required)
require_once __DIR__ . '/../helpers.php';
require_auth();

$body = get_json_body();
$id = (int)($body['id'] ?? 0);
$status = sanitize($body['status'] ?? '');

if (!$id || !in_array($status, ['read', 'unread'])) {
    json_response(['error' => 'ID e status válidos são obrigatórios.'], 422);
}

$stmt = db()->prepare('UPDATE leads SET status = ? WHERE id = ?');
$stmt->execute([$status, $id]);

json_response(['success' => true]);
