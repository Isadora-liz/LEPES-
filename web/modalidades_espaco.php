<?php
header("Content-Type: application/json");
include "conexao.php";

$sql = "SELECT id_espaco, GROUP_CONCAT(id_modalidade) AS modalidades_ids
        FROM espaco_modalidade
        GROUP BY id_espaco";
$result = $conn->query($sql);

$map = [];
while($row = $result->fetch_assoc()){
    $map[$row['id_espaco']] = array_map('intval', explode(',', $row['modalidades_ids']));
}

echo json_encode($map);
$conn->close();
?>
