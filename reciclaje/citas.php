<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include ("db.php");

// Crear cita
$crearDatosC = json_decode(file_get_contents("php://input"), true);
$crearCita = $crearDatosC['cita'] ?? null;

if (empty($crearCita['paciente_id']) || empty($crearCita['fecha']) || empty($crearCita['hora']) || empty($crearCita['odontologo']) || empty($crearCita['estado'])) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios."
    ]);
    exit;
}

$stmt = $conexion->prepare("INSERT INTO citas (paciente_id, fecha, hora, odontologo, estado) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $crearCita['paciente_id'], $crearCita['fecha'], $crearCita['hora'], $crearCita['odontologo'], $crearCita['estado']);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Cita agendada correctamente.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al agendar la cita: ' . $stmt->error
    ]);
}

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

$stmt = $conexion->prepare("UPDATE citas SET pacienteId = ?, fecha = ?, hora = ?, odontologo = ?, estado = ? WHERE id = ?");
$stmt->bind_param("ssssi", $pacienteId, $fecha, $hora, $odontologo, $estado, $id);

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
