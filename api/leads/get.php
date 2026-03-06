<?php
// api/leads/get.php — GET all leads (auth required)
require_once __DIR__ . '/../helpers.php';
require_auth();

$status = sanitize($_GET['status'] ?? '');
$sql = 'SELECT * FROM leads';
$params = [];

if ($status === 'unread' || $status === 'read') {
    $sql .= ' WHERE status = ?';
    $params[] = $status;
}

$sql .= ' ORDER BY created_at DESC';

$stmt = db()->prepare($sql);
$stmt->execute($params);

json_response(['leads' => $stmt->fetchAll()]);
