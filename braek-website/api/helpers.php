<?php
// ============================================================
// api/helpers.php — Shared utilities for all API endpoints
// ============================================================

require_once __DIR__ . '/config.php';

// Set JSON response headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_response(array $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function require_auth(): void
{
    if (empty($_SESSION['admin_id'])) {
        json_response(['error' => 'Unauthorized. Please log in.'], 401);
    }
}

function get_json_body(): array
{
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function sanitize(string $value): string
{
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}