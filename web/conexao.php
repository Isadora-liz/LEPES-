<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "lepes";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["ok" => false, "mensagem" => "Conexão falhou: " . $conn->connect_error]));
}
?>
