// Configuración de la URL base de la API
import axios from "axios";
import Constants from "expo-constants";

// let API_URL = "http://192.168.100.58/clinica_odontologica";
let API_URL = "http://10.143.37.157/clinica_odontologica";


// Intenta obtener la IP del host de desarrollo de Expo automáticamente
try {
    // Para Expo SDK nuevo y versiones anteriores
    const debuggerHost =
        Constants.manifest2?.extra?.expoGo?.debuggerHost ||
        Constants.expoConfig?.hostUri ||
        Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        // Extrae solo la IP (sin puerto)
        const ip = debuggerHost.split(":").shift();
        API_URL = `http://${ip}/clinica_odontologica`;
    }
} catch (e) {
    console.warn("No se pudo obtener la IP de Expo, usando valor por defecto");
}


// Instancia de axios configurada para la API
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});


// FUNCIONES PARA PACIENTES


// Obtener todos los pacientes
// Retorna un array de pacientes o array vacío en caso de error
export const obtenerPacientes = async () => {
    try {
        const { data } = await api.get('/Pacientes/leer_paciente.php');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error al obtener pacientes:', error.message);
        return [];
    }
};


// Crear un nuevo paciente
// pacienteData: objeto con los datos del paciente
export const crearPaciente = async (pacienteData) => {
    try {
        const { data } = await api.post('/Pacientes/crear_paciente.php', { paciente: pacienteData });
        return data;
    } catch (error) {
        console.error('Error al crear paciente:', error.message);
        return { success: false, message: 'No se pudo crear el paciente'};
    }
};


// Editar un paciente existente
// id: ID del paciente, pacienteData: nuevos datos
export const editarPaciente = async (id, pacienteData) => {
    try {
        const actualizarPaciente = { id, ...pacienteData };
        const { data } = await api.put('/Pacientes/editar_paciente.php', actualizarPaciente);
        return data;
    } catch (error) {
        console.error('Error al editar paciente:', error.message);
        return { success: false, message: 'No se pudo editar el paciente'};
    }
};


// Eliminar un paciente por ID
export const eliminarPaciente = async (id) => {
    try {
        const { data } = await api.delete('/Pacientes/eliminar_paciente.php', { data: { id } });
        return data;
    } catch (error) {
        console.error('Error al eliminar paciente:', error.message);
        return { success: false, message: 'No se pudo eliminar el paciente' };
    }
};


// FUNCIONES PARA CITAS


// Obtener todas las citas
// Retorna un array de citas o array vacío en caso de error
export const obtenerCitas = async () => {
    try {
        const { data } = await api.get('/Citas/leer_cita.php');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error al obtener citas:', error.message);
        return [];
    }
};


// Crear una nueva cita
// citaData: objeto con los datos de la cita
export const crearCita = async (citaData) => {
    try {
        const { data } = await api.post('/Citas/crear_cita.php', { cita: citaData });
        return data;
    } catch (error) {
        console.error('Error al crear cita:', error.message);
        return { success: false, message: 'No se pudo crear la cita'};
    }
};


// Editar una cita existente
// id: ID de la cita, citaData: nuevos datos
export const editarCita = async (id, citaData) => {
    try {
        const datosParaEnviar = { id, ...citaData };
        const { data } = await api.put('/Citas/editar_cita.php', datosParaEnviar);
        return data;
    } catch (error) {
        console.error('Error al editar cita:', error.message);
        return { success: false, message: 'No se pudo editar la cita' };
    }
};


// Eliminar una cita por ID
export const eliminarCita = async (id) => {
    try {
        const { data } = await api.delete('/Citas/eliminar_cita.php', { data: { id } });
        return data;
    } catch (error) {
        console.error('Error al eliminar cita:', error.message);
        return { success: false, message: 'No se pudo eliminar la cita'};
    }
};


// Cambiar estado de una cita (cíclico: pendiente → confirmada → cancelada → pendiente)
// id: ID de la cita
export const cambiarEstadoCita = async (id) => {
    try {
        const { data } = await api.put('/Citas/cambiar_estado_cita.php', { id });
        return data;
    } catch (error) {
        console.error('Error al cambiar estado de la cita:', error.message);
        return { success: false, message: 'No se pudo cambiar el estado de la cita' };
    }
};


// Exportar todas las funciones de la API
export default {
    obtenerPacientes,
    crearPaciente,
    editarPaciente,
    eliminarPaciente,
    obtenerCitas,
    crearCita,
    editarCita,
    eliminarCita,
    cambiarEstadoCita,
};
