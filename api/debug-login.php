<?php
require_once 'config.php';

header('Content-Type: application/json');

$response = [
    'db_connection' => false,
    'user_found' => false,
    'password_verify' => false,
    'stored_hash' => null,
    'input_password' => 'braek2024',
    'input_hash_check' => null,
];

try {
    $db = db();
    $response['db_connection'] = true;

    $stmt = $db->prepare("SELECT * FROM users WHERE email = 'admin@braek.com'");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $response['user_found'] = true;
        $response['stored_hash'] = $user['password'];
        $response['password_verify'] = password_verify('braek2024', $user['password']);
        $response['input_hash_check'] = password_hash('braek2024', PASSWORD_DEFAULT);
    }
}
catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
