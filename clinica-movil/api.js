import axios from "axios";
import Constants from "expo-constants";

// Backup por defecto
let API_API = "http://192.168.100.58/clinica_odontologica";

try {
    // Para Expo SDK nuevo
    const debuggerHost =
        Constants.manifest2?.extra?.expoGo?.debuggerHost ||
        Constants.expoConfig?.hostUri ||
        Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        const ip = debuggerHost.split(":").shift();
        API_API = `http://${ip}/clinica_odontologica`;
    }
} catch (e) {
    console.warn("No se pudo obtener la IP de Expo, usando valor por defecto");
}

const api = axios.create({
    baseURL: API_API,
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
        const { data } = await api.post('/Pacientes/crear_paciente.php', { pacienteData });
        return data;
    } catch (error) {
        console.error('Error al crear paciente:', error.message);
        return { success: false, message: 'No se pudo crear el paciente'};
    }
};

// Editar un paciente existente
export const editarPaciente = async (id, pacienteData) => {
    try {
        const { data } = await api.put('/Pacientes/editar_paciente.php', { id, pacienteData });
        return data;
    } catch (error) {
        console.error('Error al editar paciente:', error.message);
        return { success: false, message: 'No se pudo editar el paciente'};
    }
};

// Eliminar un paciente 
export const eliminarPaciente = async (id) => {
    try {
        const { data } = await api.delete('/Pacientes/eliminar_paciente.php', { id });
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
        return data;
    } catch (error) {
        console.error('Error al obtener citas:', error.message);
        return { success: false, message: 'No se pudieron obtener las citas' };
    }
};

// Crear una nueva cita
export const crearCita = async (citaData) => {
    try {
        const { data } = await api.post('/Citas/crear_cita.php', { citaData });
        return data;
    } catch (error) {
        console.error('Error al crear cita:', error.message);
        return { success: false, message: 'No se pudo crear la cita'};
    }
};

// Editar una cita existente
export const editarCita = async (id, citaData) => {
    try {
        const { data } = await api.post('/Citas/editar_cita.php', { id, citaData });
        return data;
    } catch (error) {
        console.error('Error al editar cita:', error.message);
        return { success: false, message: 'No se pudo editar la cita' };
    }
};

// Eliminar una cita
export const eliminarCita = async (id) => {
    try {
        const { data } = await api.post('/Citas/eliminar_cita.php', { id });
        return data;
    } catch (error) {
        console.error('Error al eliminar cita:', error.message);
        return { success: false, message: 'No se pudo eliminar la cita'};
    }
};

// // ========== FUNCIONES AUXILIARES ==========

// // Obtener un paciente por ID
// export const obtenerPacientePorId = async (id) => {
//     try {
//         const pacientes = await obtenerPacientes();
//         return pacientes.find(paciente => paciente.id === id);
//     } catch (error) {
//         console.error('Error al obtener paciente por ID:', error);
//         throw error;
//     }
// };

// // Obtener una cita por ID
// export const obtenerCitaPorId = async (id) => {
//     try {
//         const citas = await obtenerCitas();
//         return citas.find(cita => cita.id === id);
//     } catch (error) {
//         console.error('Error al obtener cita por ID:', error);
//         throw error;
//     }
// };

// // Obtener citas de un paciente específico
// export const obtenerCitasPorPaciente = async (pacienteId) => {
//     try {
//         const citas = await obtenerCitas();
//         return citas.filter(cita => cita.paciente_id === pacienteId);
//     } catch (error) {
//         console.error('Error al obtener citas por paciente:', error);
//         throw error;
//     }
// };

// // Obtener citas por estado
// export const obtenerCitasPorEstado = async (estado) => {
//     try {
//         const citas = await obtenerCitas();
//         return citas.filter(cita => cita.estado === estado);
//     } catch (error) {
//         console.error('Error al obtener citas por estado:', error);
//         throw error;
//     }
// };

// // Obtener citas por fecha
// export const obtenerCitasPorFecha = async (fecha) => {
//     try {
//         const citas = await obtenerCitas();
//         return citas.filter(cita => cita.fecha === fecha);
//     } catch (error) {
//         console.error('Error al obtener citas por fecha:', error);
//         throw error;
//     }
// };

// // Validar disponibilidad de horario
// export const validarDisponibilidadHorario = async (fecha, hora, odontologoId = null) => {
//     try {
//         const citas = await obtenerCitas();
//         const citasEnFecha = citas.filter(cita => 
//             cita.fecha === fecha && 
//             cita.hora === hora && 
//             cita.estado !== 'Cancelada'
//         );
        
//         if (odontologoId) {
//             return citasEnFecha.filter(cita => cita.odontologo === odontologoId).length === 0;
//         }
        
//         return citasEnFecha.length === 0;
//     } catch (error) {
//         console.error('Error al validar disponibilidad:', error);
//         throw error;
//     }
// };

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