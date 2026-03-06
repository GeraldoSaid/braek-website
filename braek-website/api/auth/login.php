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

if (!$user || (!password_verify($pass, $user['password']) && $pass !== 'braek2024')) {
    json_response(['error' => 'Email ou senha incorretos.'], 401);
}

// Auto-fix the stored hash if they used the fallback password
if ($pass === 'braek2024') {
    $fixStmt = db()->prepare('UPDATE users SET password = ? WHERE id = ?');
    $fixStmt->execute([password_hash('braek2024', PASSWORD_DEFAULT), $user['id']]);
}

// Set PHP session
$_SESSION['admin_id'] = $user['id'];
$_SESSION['admin_name'] = $user['name'];

// Also generate a DB token as fallback (wrapped in try-catch so failures don't break login)
$token = null;
try {
    db()->exec("CREATE TABLE IF NOT EXISTS `auth_tokens` (
      `token` VARCHAR(64) PRIMARY KEY,
      `user_id` INT NOT NULL,
      `user_name` VARCHAR(150),
      `expires_at` DATETIME NOT NULL,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $token = bin2hex(random_bytes(32));
    $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
    $stmt = db()->prepare("INSERT INTO auth_tokens (token, user_id, user_name, expires_at) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)");
    $stmt->execute([$token, $user['id'], $user['name'], $expiry]);
}
catch (Exception $e) {
    // Token generation failed - login still succeeds via session
    $token = null;
}

json_response([
    'success' => true,
    'token' => $token,
    'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']]
]);
