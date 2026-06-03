<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");
include "conexao.php";

$sql = "SELECT id_espaco, nome, endereco, imagem, latitude, longitude
        FROM espaco
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL";

$result = $conn->query($sql);

$lugares = [];
while($row = $result->fetch_assoc()){
    $lugares[] = $row;
}

echo json_encode($lugares);
$conn->close();
?>
