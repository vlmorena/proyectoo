<?php
header('Content-Type: application/json');
$conn = new mysqli("localhost", "root", "", "tubelleza_db");
$result = $conn->query("SELECT * FROM turnos ORDER BY fecha ASC, hora ASC");
$turnos = [];
while($row = $result->fetch_assoc()) {
    $turnos[] = $row;
}
echo json_encode($turnos);
$conn->close();
?>