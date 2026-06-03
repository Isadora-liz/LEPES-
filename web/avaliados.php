<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();
header("Content-Type: application/json");

include "conexao.php";

$id_usuario = $_GET['id_usuario'] ?? 0;

if (!$id_usuario) {
    echo json_encode([]);
    exit;
}


$sql = "SELECT e.id_espaco, e.nome, e.endereco, e.descricao, e.imagem, a.nota
        FROM avalia a
        INNER JOIN espaco e ON a.id_espaco = e.id_espaco
        WHERE a.id_usuario = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["erro" => "Falha ao preparar query"]);
    exit;
}

$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

$avaliados = [];
while ($row = $result->fetch_assoc()) {
    $avaliados[] = $row;
}

echo json_encode($avaliados);

$conn->close();
exit;
?>
