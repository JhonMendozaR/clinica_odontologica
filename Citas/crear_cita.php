<?php

include "../db.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

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

$stmt->close();
$conexion->close();

?>
