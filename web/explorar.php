//<?php
//error_reporting(E_ALL);
//ini_set('display_errors', 1);
//header("Content-Type: application/json");

//include "conexao.php";

//$id_usuario = isset($_GET['id_usuario']) ? intval($_GET['id_usuario']) : 0;

//$sql = "
//SELECT e.id_espaco, e.nome, e.endereco, e.descricao, e.imagem,
//       GROUP_CONCAT(em.id_modalidade) AS modalidades_ids
//FROM espaco e

//LEFT JOIN espaco_modalidade em ON e.id_espaco = em.id_espaco
//GROUP BY e.id_espaco";


//$stmt = $conn->prepare($sql);
//if (!$stmt) {
//    echo json_encode(["ok" => false, "erro" => $conn->error]);
//    exit;
//}

//  $stmt->bind_param("i", $id_usuario);
//$stmt->execute();
//$result = $stmt->get_result();

//$lugares = [];
//while ($row = $result->fetch_assoc()) {
//    $lugares[] = $row;
//}

//echo json_encode($lugares);
//$conn->close();
?>
