<?php
// ============================================================
// api/config.php — Database connection + base settings
// 
// LOCAL (Laragon): host=localhost, user=root, pass=''
// HOSTINGER: fill with credentials from hPanel > MySQL Databases
// ============================================================

if ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1') {
    // LOCAL CONFIGURATION (Laragon)
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'braek');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_CHARSET', 'utf8mb4');
    define('BASE_URL', 'http://localhost/braek-website/braek-website');
}
else {
    // PRODUCTION CONFIGURATION (Hostinger)
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'u733058857_braek');
    define('DB_USER', 'u733058857_braek');
    define('DB_PASS', 'AgenciaBraek@2025');
    define('DB_CHARSET', 'utf8mb4');
    define('BASE_URL', 'https://braek.com.br');
}

// Session name (avoids conflicts if running multiple sites on same server)
define('SESSION_NAME', 'braek_admin');

// Start session
session_name(SESSION_NAME);
session_start();

// PDO connection (singleton pattern)
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        }
        catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}
