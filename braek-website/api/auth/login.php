<?php
// api/auth/login.php — POST {email, password}
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$body = get_json_body();
$email = sanitize($body['email'] ?? '');
$pass = $body['password'] ?? '';

if (!$email || !$pass) {
    json_response(['error' => 'Email e senha são obrigatórios.'], 422);
}

$stmt = db()->prepare('SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($pass, $user['password'])) {
    json_response(['error' => 'Email ou senha incorretos.'], 401);
}

$_SESSION['admin_id'] = $user['id'];
$_SESSION['admin_name'] = $user['name'];

json_response([
    'success' => true,
    'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']]
]);
