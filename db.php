<?php

$servidor = "localhost";
$usuario = "root";
$password = "";
$base_datos = "clinica_db";

$conexion = new mysqli($servidor, $usuario, $password, $base_datos);

if ($conexion->connect_error) {
    die("La conexion ha fallado: " . $conexion->connect_error);
}

?>