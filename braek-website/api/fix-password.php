<?php
require_once 'config.php';

try {
    $stmt = db()->prepare("UPDATE users SET password = ? WHERE email = 'admin@braek.com'");
    // Hash "braek2024" safely
    $hash = password_hash('braek2024', PASSWORD_DEFAULT);

    if ($stmt->execute([$hash])) {
        echo "<h1>Senha do Admin atualizada com sucesso para 'braek2024'</h1>";
    }
    else {
        echo "<h1>Erro ao atualizar a senha!</h1>";
    }
}
catch (Exception $e) {
    echo "Erro de Banco de Dados: " . $e->getMessage();
}
?>
