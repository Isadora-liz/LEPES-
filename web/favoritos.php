<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");
include "conexao.php";

$id_usuario = $_GET['id_usuario'] ?? null;
if(!$id_usuario){
    echo json_encode([]);
    exit;
}

$sql = "SELECT e.id_espaco, e.nome, e.endereco, e.descricao, e.imagem
        FROM espaco e
        INNER JOIN favorita f ON e.id_espaco = f.id_espaco
        WHERE f.id_usuario = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

$lugares = [];
while($row = $result->fetch_assoc()){
    $lugares[] = $row;
}

echo json_encode($lugares);
$conn->close();
?>
