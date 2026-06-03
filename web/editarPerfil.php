<?php
session_start();
header("Content-Type: application/json");
include "conexao.php";

if(!isset($_SESSION['id'])){
    echo json_encode(["ok" => false, "erro" => "Usuário não logado"]);
    exit;
}

$id = $_SESSION['id'];

$nome = trim($_POST['nome'] ?? '');

$campos = [];
$params = [];
$types = "";

if($nome !== ''){
    $campos[] = "nome = ?";
    $params[] = $nome;
    $types .= "s";
}

if(isset($_FILES['avatar']) && $_FILES['avatar']['error'] === 0){
    $file = $_FILES['avatar'];

    $extensoesPermitidas = ['jpg','jpeg','png','gif'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if(!in_array($ext, $extensoesPermitidas)){
        echo json_encode(["ok" => false, "erro" => "Tipo de arquivo não permitido"]);
        exit;
    }

    $pasta = "uploads/avatars/";
    if(!is_dir($pasta)) mkdir($pasta, 0777, true);

    $nomeArquivo = "avatar_".$id."_".time().".".$ext;
    $caminho = $pasta.$nomeArquivo;

    if(move_uploaded_file($file['tmp_name'], $caminho)){
        $campos[] = "avatar = ?";
        $params[] = $caminho;
        $types .= "s";
    } else {
        echo json_encode(["ok" => false, "erro" => "Falha ao enviar a imagem"]);
        exit;
    }
}

if(count($campos) > 0){
    $sql = "UPDATE usuario SET ".implode(", ", $campos)." WHERE id_usuario = ?";
    $params[] = $id;
    $types .= "i";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if($stmt->execute()){
        echo json_encode(["ok" => true]);
    } else {
        echo json_encode(["ok" => false, "erro" => "Falha ao atualizar perfil"]);
    }
} else {
    echo json_encode(["ok" => false, "erro" => "Nenhum dado para atualizar"]);
}
?>
