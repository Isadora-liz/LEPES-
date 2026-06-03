<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");
include "conexao.php";

$data = json_decode(file_get_contents("php://input"), true);

$id_usuario = $data['id_usuario'] ?? null;
$id_espaco  = $data['id_espaco'] ?? null;

if (!$id_usuario || !$id_espaco) {
    echo json_encode(["ok" => false, "erro" => "Dados inválidos"]);
    exit;
}

$sql_check = "SELECT * FROM favorita WHERE id_usuario=? AND id_espaco=?";
$stmt = $conn->prepare($sql_check);
$stmt->bind_param("ii", $id_usuario, $id_espaco);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $sql_delete = "DELETE FROM favorita WHERE id_usuario=? AND id_espaco=?";
    $stmt2 = $conn->prepare($sql_delete);
    $stmt2->bind_param("ii", $id_usuario, $id_espaco);
    $stmt2->execute();

    echo json_encode(["ok" => true, "favoritou" => false]);
} else {
    $sql_insert = "INSERT INTO favorita (id_usuario, id_espaco) VALUES (?, ?)";
    $stmt2 = $conn->prepare($sql_insert);
    $stmt2->bind_param("ii", $id_usuario, $id_espaco);
    $stmt2->execute();

    echo json_encode(["ok" => true, "favoritou" => true]);
}

$conn->close();
?>
