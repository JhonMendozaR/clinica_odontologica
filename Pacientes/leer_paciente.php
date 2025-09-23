<?php

include "../db.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Listar pacientes
$resultado = $conexion->query("SELECT * FROM pacientes ORDER BY id DESC");
$listarPacientes = [];
if($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $listarPacientes [] = $fila;
    }
    echo json_encode($listarPacientes, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al listar los pacientes: ' . $conexion->error
    ]);
}

$conexion->close();

?>
