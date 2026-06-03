<?php
session_start();
include "conexao.php";

header("Content-Type: application/json");

if (!isset($_SESSION['id'])) {
    echo json_encode(["erro" => "Usuário não logado"]);
    exit;
}

$id = $_SESSION['id'];

if (!isset($_FILES['avatar'])) {
    echo json_encode(["erro" => "Nenhum arquivo enviado"]);
    exit;
}

$arquivo = $_FILES['avatar'];
if ($arquivo['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["erro" => "Erro no upload"]);
    exit;
}

$extensoes = ['jpg', 'jpeg', 'png', 'gif'];
$ext = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $extensoes)) {
    echo json_encode(["erro" => "Formato de arquivo não permitido"]);
    exit;
}

$pasta = 'uploads/avatars/';
if (!is_dir($pasta)) mkdir($pasta, 0755, true);

$nomeArquivo = 'avatar_'.$id.'_'.time().'.'.$ext;
$caminho = $pasta.$nomeArquivo;

if (move_uploaded_file($arquivo['tmp_name'], $caminho)) {

    $sql = $conn->prepare("UPDATE usuario SET avatar = ? WHERE id_usuario = ?");
    $sql->bind_param("si", $caminho, $id);
    $sql->execute();

    echo json_encode(["ok" => true, "avatar" => $caminho]);
} else {
    echo json_encode(["erro" => "Falha ao salvar arquivo"]);
}
?>
