<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");
include "conexao.php";

$data = json_decode(file_get_contents("php://input"), true);

$id_usuario = $data['id_usuario'] ?? null;
$id_espaco  = $data['id_espaco'] ?? null;
$nota       = $data['nota'] ?? null;

if (!$id_usuario || !$id_espaco || !$nota) {
    echo json_encode(["ok" => false, "erro" => "Dados inválidos"]);
    exit;
}

$sql_check = "SELECT * FROM avalia WHERE id_usuario=? AND id_espaco=?";
$stmt = $conn->prepare($sql_check);
$stmt->bind_param("ii", $id_usuario, $id_espaco);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $sql_update = "UPDATE avalia SET nota=? WHERE id_usuario=? AND id_espaco=?";
    $stmt2 = $conn->prepare($sql_update);
    $stmt2->bind_param("iii", $nota, $id_usuario, $id_espaco);
    $stmt2->execute();
    echo json_encode(["ok" => true, "mensagem" => "Nota atualizada"]);
} else {
    $sql_insert = "INSERT INTO avalia (id_usuario, id_espaco, nota) VALUES (?, ?, ?)";
    $stmt2 = $conn->prepare($sql_insert);
    $stmt2->bind_param("iii", $id_usuario, $id_espaco, $nota);
    $stmt2->execute();
    echo json_encode(["ok" => true, "mensagem" => "Nota registrada"]);
}

$conn->close();
?>
