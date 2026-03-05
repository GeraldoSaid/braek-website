<?php
// api/auth/check.php — GET (check if session or token is active)
require_once __DIR__ . '/../helpers.php';

// Check session first
if (!empty($_SESSION['admin_id'])) {
    json_response([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['admin_id'],
            'name' => $_SESSION['admin_name'] ?? 'Admin'
        ]
    ]);
}

// Check token from Authorization header or query param as fallback
$token = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? ($_GET['token'] ?? null);
if (!$token && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
}

if ($token) {
    try {
        $db = db();
        // Ensure table exists
        $db->exec("CREATE TABLE IF NOT EXISTS `auth_tokens` (
          `token` VARCHAR(64) PRIMARY KEY,
          `user_id` INT NOT NULL,
          `user_name` VARCHAR(150),
          `expires_at` DATETIME NOT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $stmt = $db->prepare("SELECT user_id, user_name FROM auth_tokens WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $row = $stmt->fetch();

        if ($row) {
            // Restore session from token
            $_SESSION['admin_id'] = $row['user_id'];
            $_SESSION['admin_name'] = $row['user_name'];

            json_response([
                'authenticated' => true,
                'user' => ['id' => $row['user_id'], 'name' => $row['user_name']]
            ]);
        }
    }
    catch (Exception $e) {
    // fall through
    }
}

json_response(['authenticated' => false], 401);
