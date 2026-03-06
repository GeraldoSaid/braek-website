<?php
// api/auth/check.php — GET (check if session is active)
require_once __DIR__ . '/../helpers.php';

if (!empty($_SESSION['admin_id'])) {
    json_response([
        'authenticated' => true,
        'user' => [
            'id'   => $_SESSION['admin_id'],
            'name' => $_SESSION['admin_name'] ?? 'Admin'
        ]
    ]);
}

json_response(['authenticated' => false], 401);