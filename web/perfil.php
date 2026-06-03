<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header("Content-Type: application/json");

include "conexao.php";

if ($conn->connect_error) {
    echo json_encode(["ok" => false, "erro" => "falha_conexao"]);
    exit;
}

$id_usuario = null;

if(isset($_GET['id_usuario'])) {
    $id_usuario = intval($_GET['id_usuario']);
} elseif(isset($_SESSION['id'])) {
    $id_usuario = intval($_SESSION['id']);
}

if(!$id_usuario){
    echo json_encode(["ok" => false, "erro" => "usuario_nao_logado"]);
    exit;
}

$sql = $conn->prepare("SELECT id_usuario, nome, email, avatar FROM usuario WHERE id_usuario = ?");
$sql->bind_param("i", $id_usuario);
$sql->execute();
$result = $sql->get_result();

if($result->num_rows === 1){
    $user = $result->fetch_assoc();


    echo json_encode([
        "ok" => true,
        "id_usuario" => $user["id_usuario"],
        "nome" => $user["nome"],
        "email" => $user["email"],
        "avatar" => $user["avatar"]
    ]);
    exit;
}

echo json_encode(["ok" => false, "erro" => "usuario_nao_encontrado"]);
?>
