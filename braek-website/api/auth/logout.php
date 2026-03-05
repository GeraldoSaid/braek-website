<?php
// api/auth/logout.php — POST (destroys session)
require_once __DIR__ . '/../helpers.php';

$_SESSION = [];
session_destroy();

json_response(['success' => true]);
