<?php

include "../db.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Eliminar citas
$eliminarDatos = json_decode(file_get_contents('php://input'), true);
$id = intval($eliminarDatos['id']);

if ($id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'ID inválido.'
    ]);
    exit;
}

$stmt = $conexion->prepare("DELETE FROM citas WHERE id = ?");
$stmt->bind_param("i", $id);
if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Cita eliminada correctamente.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al eliminar la cita: ' . $conexion->error
    ]);
}

$stmt->close();
$conexion->close();

?>
