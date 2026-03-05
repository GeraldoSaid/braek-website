<?php
// api/auth/logout.php — POST (destroys session and invalidates token)
require_once __DIR__ . '/../helpers.php';

$_SESSION = [];
if (session_id())
    session_destroy();

// Also invalidate token if provided
$token = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? null;
if (!$token && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
}
if ($token) {
    try {
        $db = db();
        $stmt = $db->prepare("DELETE FROM auth_tokens WHERE token = ?");
        $stmt->execute([$token]);
    }
    catch (Exception $e) { /* silent */
    }
}

json_response(['success' => true]);
