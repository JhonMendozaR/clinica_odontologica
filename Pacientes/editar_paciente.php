<?php

include "../db.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Actualizar paciente
$actualizarDatos = json_decode(file_get_contents('php://input'), true);
$id = intval($actualizarDatos['id']);
$nombre = trim($actualizarDatos['nombre'] ?? '');
$documento = trim($actualizarDatos['documento'] ?? '');
$telefono = trim($actualizarDatos['telefono'] ?? '');
$correo = trim($actualizarDatos['correo'] ?? '');

if ($id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'ID inválido.'
    ]);
    exit;
}

if (empty($nombre) || empty($documento) || empty($telefono) || empty($correo)) {
    echo json_encode([
        'success' => false,
        'message' => 'Todos los campos son obligatorios.'
    ]);
    exit;
}

$stmt = $conexion->prepare("UPDATE pacientes SET nombre = ?, documento = ?, telefono = ?, correo = ? WHERE id = ?");
$stmt->bind_param("ssssi", $nombre, $documento, $telefono, $correo, $id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Paciente actualizado exitosamente.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar el paciente: ' . $stmt->error
    ]);
}

$stmt->close();
$conexion->close();

?>
