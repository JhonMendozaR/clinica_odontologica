<?php

include "../db.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Actualizar citas
$actualizarDatos = json_decode(file_get_contents('php://input'), true);
$id = intval($actualizarDatos['id']);
$pacienteId = trim($actualizarDatos['paciente_id'] ?? '');
$fecha = trim($actualizarDatos['fecha'] ?? '');
$hora = trim($actualizarDatos['hora'] ?? '');
$odontologo = trim($actualizarDatos['odontologo'] ?? '');
$estado = trim($actualizarDatos['estado'] ?? '');

if ($id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'ID inválido.'
    ]);
    exit;
}

if (empty($pacienteId) || empty($fecha) || empty($hora) || empty($odontologo) || empty($estado)) {
    echo json_encode([
        'success' => false,
        'message' => 'Todos los campos son obligatorios.'
    ]);
    exit;
}

$stmt = $conexion->prepare("UPDATE citas SET paciente_id = ?, fecha = ?, hora = ?, odontologo = ?, estado = ? WHERE id = ?");
$stmt->bind_param("issssi", $pacienteId, $fecha, $hora, $odontologo, $estado, $id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Cita actualizada exitosamente.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar la cita: ' . $stmt->error
    ]);
}

$stmt->close();
$conexion->close();

?>
