<?php
include ("../db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Obtener datos JSON
$datos = json_decode(file_get_contents('php://input'), true);
$id = $datos['id'] ?? null;

if (!$id) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de la cita requerido'
    ]);
    exit;
}

// 1. Consultar el estado actual
$stmtSelect = $conexion->prepare("SELECT estado FROM citas WHERE id = ?");
$stmtSelect->bind_param("i", $id);
$stmtSelect->execute();
$result = $stmtSelect->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Cita no encontrada'
    ]);
    exit;
}

$fila = $result->fetch_assoc();
$estado_actual = $fila['estado'];

// 2. Calcular el nuevo estado (cíclico)
$estados = ['pendiente', 'confirmada', 'cancelada'];
$index = array_search($estado_actual, $estados);
$nuevo_estado = $estados[($index + 1) % count($estados)];

// 3. Actualizar en la base de datos
$stmtUpdate = $conexion->prepare("UPDATE citas SET estado = ? WHERE id = ?");
$stmtUpdate->bind_param("si", $nuevo_estado, $id);

if ($stmtUpdate->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Estado de la cita actualizado correctamente.',
        'nuevo_estado' => $nuevo_estado
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar: ' . $stmtUpdate->error
    ]);
}

$stmtSelect->close();
$stmtUpdate->close();
$conexion->close();
?>