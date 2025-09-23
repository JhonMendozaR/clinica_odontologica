<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include ("db.php");

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
