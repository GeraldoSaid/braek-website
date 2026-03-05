<?php
// api/upload.php — POST (multipart/form-data, auth required)
// Field: "image" (file)
require_once __DIR__ . '/helpers.php';
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

if (empty($_FILES['image'])) {
    json_response(['error' => 'Nenhuma imagem enviada.'], 422);
}

$file = $_FILES['image'];
$maxSize = 5 * 1024 * 1024; // 5MB
$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$uploadDir = __DIR__ . '/../assets/projetos/uploads/';

// Validate
if ($file['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'Erro no upload do arquivo.'], 422);
}

if ($file['size'] > $maxSize) {
    json_response(['error' => 'Arquivo muito grande. Máximo: 5MB.'], 422);
}

// Validate MIME type from file content (not just extension)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $allowed)) {
    json_response(['error' => 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.'], 422);
}

// Generate unique filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . strtolower($ext);
$dest = $uploadDir . $filename;

// Create directory if it doesn't exist
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    json_response(['error' => 'Falha ao salvar a imagem no servidor.'], 500);
}

$url = 'assets/projetos/uploads/' . $filename;

json_response(['success' => true, 'url' => $url], 201);
