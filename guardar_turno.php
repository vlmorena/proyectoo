<?php
header('Content-Type: application/json');
$host = "localhost";
$user = "root";
$pass = "";
$db   = "tubelleza_db";

$conn = new mysqli($host, $user, $pass, $db);

$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $n = $data['nombre'];
    $a = $data['apellido'];
    $t = $data['tratamiento'];
    $f = $data['fecha'];
    $h = $data['hora'];

    $sql = "INSERT INTO turnos (nombre, apellido, tratamiento, fecha, hora) VALUES ('$n', '$a', '$t', '$f', '$h')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}
$conn->close();
?>