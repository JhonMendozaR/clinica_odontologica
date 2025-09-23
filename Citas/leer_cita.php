<?php

include "../db.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Listar citas
$resultado = $conexion->query("SELECT * FROM citas ORDER BY id DESC");
$listarcitas = [];
if($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $listarcitas [] = $fila;
    }
    echo json_encode($listarcitas, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al listar las citas: ' . $conexion->error
    ]);
}

$stmt->close();
$conexion->close();

?>
