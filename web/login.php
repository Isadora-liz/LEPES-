<?php error_reporting(E_ALL); 
ini_set('display_errors', 1); 

session_start(); 
header("Content-Type: application/json"); 
include "conexao.php"; 

if ($conn->connect_error) { echo json_encode(["ok" => false, "erro" => "falha_conexao"]); 
exit; 
} 

$dados = json_decode(file_get_contents("php://input"), true); 
$email = trim($dados["email"]); 
$senha = trim($dados["senha"]); 

$sql = $conn->prepare("SELECT id_usuario, senha FROM usuario WHERE email = ?"); 
$sql->bind_param("s", $email); $sql->execute(); $result = $sql->get_result(); 
if ($result->num_rows === 1) { $user = $result->fetch_assoc(); 
if (password_verify($senha, $user["senha"])) { $_SESSION["id"] = $user["id_usuario"]; 

    $_SESSION["email"] = $email; echo json_encode(["ok" => true]); 
exit; 
} 
} 

echo json_encode(["ok" => false]); 
?>