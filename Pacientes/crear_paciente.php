<?php

include "../db.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Crear paciente
$crearDatosP = json_decode(file_get_contents("php://input"), true);
$crearPaciente = $crearDatosP['paciente'] ?? null;

if (empty($crearPaciente['nombre']) || empty($crearPaciente['documento']) || empty($crearPaciente['telefono']) || empty($crearPaciente['correo'])) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios."
    ]);
    exit;
}

$stmt = $conexion->prepare("INSERT INTO pacientes (nombre, documento, telefono, correo) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $crearPaciente['nombre'], $crearPaciente['documento'], $crearPaciente['telefono'], $crearPaciente['correo']);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Paciente creado correctamente.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al crear el paciente: ' . $stmt->error
    ]);
}

$stmt->close();
$conexion->close();

?>
