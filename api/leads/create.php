<?php
// api/leads/create.php — POST (public, from contact form on website)
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$body = get_json_body();
$name = sanitize($body['name'] ?? '');
$email = sanitize($body['email'] ?? '');
$phone = sanitize($body['phone'] ?? '');
$message = sanitize($body['message'] ?? '');

if (!$name || !$email || !$message) {
    json_response(['error' => 'Nome, email e mensagem são obrigatórios.'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'Email inválido.'], 422);
}

// Basic rate limiting: max 3 leads per IP per hour
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$stmt = db()->prepare(
    'SELECT COUNT(*) FROM leads WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)'
);
$stmt->execute([$ip]);
if ((int)$stmt->fetchColumn() >= 3) {
    json_response(['error' => 'Muitas tentativas. Tente novamente mais tarde.'], 429);
}

$stmt = db()->prepare(
    'INSERT INTO leads (name, email, phone, message, ip_address) VALUES (?, ?, ?, ?, ?)'
);
$stmt->execute([$name, $email, $phone, $message, $ip]);

json_response(['success' => true, 'message' => 'Mensagem enviada com sucesso!'], 201);
