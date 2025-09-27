<?php

include "../db.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Eliminar paciente
$eliminarDatos = json_decode(file_get_contents('php://input'), true);
$id = intval($eliminarDatos['id']);

if ($id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'ID inválido.'
    ]);
    exit;
}

$stmt = $conexion->prepare("DELETE FROM pacientes WHERE id = ?");
$stmt->bind_param("i", $id);
if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Paciente eliminado correctamente.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al eliminar el paciente: ' . $conexion->error
    ]);
}

$stmt->close();
$conexion->close();

?>
