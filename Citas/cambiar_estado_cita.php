<?php
include ("../db.php");

// Encabezados CORS (Cross-Origin Resource Sharing) y tipo de contenido
// permiten a un servidor indicar qué orígenes (dominios, protocolos o puertos) tienen permiso para acceder a sus recursos desde el navegador.
header("Access-Control-Allow-Origin: *"); // Permite a cualquier dominio.
header("Access-Control-Allow-Headers: Content-Type"); // Permite el encabezado Content-Type en la solicitud
header("Access-Control-Allow-Methods: PUT, OPTIONS"); // Permite los métodos PUT y OPTIONS
header("Content-Type: application/json; charset=UTF-8"); // Indica que la respuesta será en formato JSON

// Obtener datos JSON del cuerpo de la petición
$datos = json_decode(file_get_contents('php://input'), true); // Leer el cuerpo de la solicitud y decodificar el JSON
$id = $datos['id'] ?? null;

// Validación básica del parámetro 'id'
if (!$id) {
    echo json_encode([ // Conversión a JSON de la respuesta
        'success' => false,
        'message' => 'ID de la cita requerido'
    ]);
    exit;
}

// 1. Consultar el estado actual de la cita
$stmtSelect = $conexion->prepare("SELECT estado FROM citas WHERE id = ?");
$stmtSelect->bind_param("i", $id);
$stmtSelect->execute();
$result = $stmtSelect->get_result();

// Si no existe la cita con el ID proporcionado
if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Cita no encontrada'
    ]);
    exit;
}

$fila = $result->fetch_assoc(); // Obtener la fila del resultado
$estado_actual = $fila['estado']; // Estado actual de la cita

// 2. Calcular el nuevo estado (cíclico)
// Orden de rotación: pendiente -> confirmada -> cancelada -> pendiente
$estados = ['pendiente', 'confirmada', 'cancelada'];
$index = array_search($estado_actual, $estados);
$nuevo_estado = $estados[($index + 1) % count($estados)];

// 3. Actualizar el estado en la base de datos
$stmtUpdate = $conexion->prepare("UPDATE citas SET estado = ? WHERE id = ?");
$stmtUpdate->bind_param("si", $nuevo_estado, $id); // evita inyeccion sql

if ($stmtUpdate->execute()) {
    // Respuesta exitosa con el nuevo estado
    echo json_encode([
        'success' => true,
        'message' => 'Estado de la cita actualizado correctamente.',
        'nuevo_estado' => $nuevo_estado
    ]);
} else {
    // Error durante la actualización en BD
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar: ' . $stmtUpdate->error
    ]);
}

// Liberar recursos y cerrar conexión
$stmtSelect->close();
$stmtUpdate->close();
$conexion->close();

?>