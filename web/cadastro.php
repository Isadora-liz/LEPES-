<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");
include "conexao.php";

if ($conn->connect_error) {
    echo json_encode(["ok" => false, "mensagem" => "Erro interno no servidor."]);
    exit;
}

$json_data = file_get_contents("php://input");
$dados = json_decode($json_data, true);

if (!isset($dados["nome"]) || !isset($dados["email"]) || !isset($dados["senha"])) {
    echo json_encode(["ok" => false, "mensagem" => "Dados incompletos."]);
    exit;
}

$nome = trim($dados["nome"]);
$email = trim($dados["email"]);
$senha = trim($dados["senha"]);

if (empty($nome) || empty($email) || empty($senha)) {
    echo json_encode(["ok" => false, "mensagem" => "Preencha todos os campos."]);
    exit;
}


$senha_hash = password_hash($senha, PASSWORD_DEFAULT);
$sql_check = $conn->prepare("SELECT id_usuario FROM usuario WHERE email = ?");
$sql_check->bind_param("s", $email);
$sql_check->execute();
$sql_check->store_result();

if ($sql_check->num_rows > 0) {
    $sql_check->close();
    echo json_encode(["ok" => false, "mensagem" => "Este email já está cadastrado."]);
    exit;
}
$sql_check->close();


$sql_insert = $conn->prepare("INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)");
$sql_insert->bind_param("sss", $nome, $email, $senha_hash);

if ($sql_insert->execute()) {
    echo json_encode(["ok" => true, "mensagem" => "Cadastro realizado com sucesso!"]);
} else {
    echo json_encode(["ok" => false, "mensagem" => "Erro ao cadastrar usuário: " . $conn->error]);
}

$sql_insert->close();
$conn->close();
?>