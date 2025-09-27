import axios from "axios";
import Constants from "expo-constants";

// Backup por defecto
// let API_URL = "http://192.168.100.58/clinica_odontologica";
let API_URL = "http://10.143.37.157/clinica_odontologica";

try {
    // Para Expo SDK nuevo
    const debuggerHost =
        Constants.manifest2?.extra?.expoGo?.debuggerHost ||
        Constants.expoConfig?.hostUri ||
        Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        const ip = debuggerHost.split(":").shift();
        API_URL = `http://${ip}/clinica_odontologica`;
    }
} catch (e) {
    console.warn("No se pudo obtener la IP de Expo, usando valor por defecto");
}

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

// FUNCIONES PARA PACIENTES

// Obtener todos los pacientes
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

// Eliminar un paciente 
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

// Eliminar una cita
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
export const cambiarEstadoCita = async (id) => {
    try {
        const { data } = await api.put('/Citas/cambiar_estado_cita.php', { id });
        return data;
    } catch (error) {
        console.error('Error al cambiar estado de la cita:', error.message);
        return { success: false, message: 'No se pudo cambiar el estado de la cita' };
    }
};

// Exportar la instancia de axios por defecto
export default {
    obtenerPacientes,
    crearPaciente,
    editarPaciente,
    eliminarPaciente,
    obtenerCitas,
    crearCita,
    editarCita,
    eliminarCita,
};