<?php
require_once 'config.php';

try {
    // Update ALL users (since there's only 1 admin anyway) just to be sure
    $stmt = db()->prepare("UPDATE users SET password = ?");
    // Hash "braek2024" safely
    $hash = password_hash('braek2024', PASSWORD_DEFAULT);

    if ($stmt->execute([$hash])) {
        echo "<h1>Senha atualizada com sucesso para TODOS os usuarios. Row Count: " . $stmt->rowCount() . "</h1>";
    }
    else {
        echo "<h1>Erro ao atualizar a senha! " . print_r($stmt->errorInfo(), true) . "</h1>";
    }
}
catch (Exception $e) {
    echo "Erro de Banco de Dados: " . $e->getMessage();
}
?>
