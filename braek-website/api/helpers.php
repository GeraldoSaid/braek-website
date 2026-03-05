<?php
// ============================================================
// api/helpers.php — Shared utilities for all API endpoints
// ============================================================

require_once __DIR__ . '/config.php';

// Start session so require_auth() can read $_SESSION['admin_id']
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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

/**
 * Send a JSON response and exit.
 */
function json_response(array $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Check if the admin is authenticated via session.
 * If not, return 401 and stop execution.
 */
function require_auth(): void
{
    if (empty($_SESSION['admin_id'])) {
        json_response(['error' => 'Unauthorized. Please log in.'], 401);
    }
}

/**
 * Get JSON body from request.
 */
function get_json_body(): array
{
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

/**
 * Sanitize a string value.
 */
function sanitize(string $value): string
{
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

