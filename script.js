// Variables globales
let pacientes = [];
let citas = [];
let editandoPaciente = false;
let editandoCita = false;

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo}`;
    alert.innerHTML = mensaje;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Función para mostrar secciones
function showSection(section) {
    document.getElementById('pacientes-section').style.display = 'none';
    document.getElementById('citas-section').style.display = 'none';
    
    document.getElementById(section + '-section').style.display = 'block';
    
    if (section === 'pacientes') {
        cargarPacientes();
    } else if (section === 'citas') {
        cargarCitas();
        cargarPacientesParaSelect();
    }
}

// FUNCIONES PARA PACIENTES
async function cargarPacientes() {
    const tabla = document.getElementById('tablaPacientes');
    
    try {
        const response = await fetch('Pacientes/leer_paciente.php');
        const data = await response.json();
        
        if (Array.isArray(data)) {
            pacientes = data;
            tabla.innerHTML = '';
            
            data.forEach(paciente => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${paciente.id}</td>
                    <td>${paciente.nombre}</td>
                    <td>${paciente.documento}</td>
                    <td>${paciente.telefono}</td>
                    <td>${paciente.correo}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editarPaciente(${paciente.id})">
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarPaciente(${paciente.id})">
                            Eliminar
                        </button>
                    </td>
                `;
                tabla.appendChild(fila);
            });
        } else {
            mostrarAlerta('Error al cargar pacientes', 'danger');
        }
    } catch (error) {
        mostrarAlerta('Error de conexión al cargar pacientes', 'danger');
        console.error('Error:', error);
    }
}

async function cargarPacientesParaSelect() {
    const select = document.getElementById('pacienteIdCita');
    
    try {
        const response = await fetch('Pacientes/leer_paciente.php');
        const data = await response.json();
        
        if (Array.isArray(data)) {
            select.innerHTML = '<option value="">Seleccionar paciente...</option>';
            data.forEach(paciente => {
                select.innerHTML += `<option value="${paciente.id}">${paciente.nombre} (${paciente.documento})</option>`;
            });
        }
    } catch (error) {
        console.error('Error al cargar pacientes para select:', error);
    }
}

document.getElementById('formPaciente').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const pacienteData = {
        nombre: formData.get('nombre'),
        documento: formData.get('documento'),
        telefono: formData.get('telefono'),
        correo: formData.get('correo')
    };
    
    try {
        let url, method, bodyData;
        
        if (editandoPaciente) {
            url = 'Pacientes/editar_paciente.php';
            bodyData = {
                id: parseInt(formData.get('id')),
                ...pacienteData
            };
        } else {
            url = 'Pacientes/crear_paciente.php';
            bodyData = {
                paciente: pacienteData
            };
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarAlerta(result.message, 'success');
            document.getElementById('formPaciente').reset();
            document.getElementById('pacienteId').value = '';
            document.getElementById('btnPaciente').innerHTML = 'Guardar Paciente';
            editandoPaciente = false;
            cargarPacientes();
            if (document.getElementById('citas-section').style.display !== 'none') {
                cargarPacientesParaSelect();
            }
        } else {
            mostrarAlerta(result.message, 'danger');
        }
    } catch (error) {
        mostrarAlerta('Error de conexión', 'danger');
        console.error('Error:', error);
    }
});

function editarPaciente(id) {
    const paciente = pacientes.find(p => p.id == id);
    if (paciente) {
        document.getElementById('pacienteId').value = paciente.id;
        document.getElementById('nombrePaciente').value = paciente.nombre;
        document.getElementById('documentoPaciente').value = paciente.documento;
        document.getElementById('telefonoPaciente').value = paciente.telefono;
        document.getElementById('correoPaciente').value = paciente.correo;
        document.getElementById('btnPaciente').innerHTML = 'Actualizar Paciente';
        editandoPaciente = true;
    }
}

// Función para verificar si un paciente tiene citas
async function verificarCitasPaciente(pacienteId) {
    try {
        const response = await fetch('Citas/leer_cita.php');
        const data = await response.json();
        
        if (Array.isArray(data)) {
            // Verificar si existe alguna cita con el ID del paciente
            return data.some(cita => cita.paciente_id == pacienteId);
        }
        return false;
    } catch (error) {
        console.error('Error al verificar citas:', error);
        // En caso de error, mejor prevenir la eliminación
        return true;
    }
}

async function eliminarPaciente(id) {
    // Verificar si el paciente tiene citas
    const pacienteTieneCitas = await verificarCitasPaciente(id);
    
    if (pacienteTieneCitas) {
        mostrarAlerta('No se puede eliminar el paciente porque tiene citas asociadas', 'danger');
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
        try {
            const response = await fetch('Pacientes/eliminar_paciente.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            
            const result = await response.json();
            
            if (result.success) {
                mostrarAlerta(result.message, 'success');
                cargarPacientes();
            } else {
                mostrarAlerta(result.message, 'danger');
            }
        } catch (error) {
            mostrarAlerta('Error de conexión', 'danger');
            console.error('Error:', error);
        }
    }
}

// FUNCIONES PARA CITAS
async function cargarCitas() {
    const tabla = document.getElementById('tablaCitas');
    
    try {
        const response = await fetch('Citas/leer_cita.php');
        const data = await response.json();
        
        if (Array.isArray(data)) {
            citas = data;
            tabla.innerHTML = '';
            
            data.forEach(cita => {
                const paciente = pacientes.find(p => p.id == cita.paciente_id);
                const nombrePaciente = paciente ? paciente.nombre : `ID: ${cita.paciente_id}`;
                
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${cita.id}</td>
                    <td>${nombrePaciente}</td>
                    <td>${cita.fecha}</td>
                    <td>${cita.hora}</td>
                    <td>${cita.odontologo}</td>
                    <td>${cita.estado}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editarCita(${cita.id})">
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarCita(${cita.id})">
                            Eliminar
                        </button>
                    </td>
                `;
                tabla.appendChild(fila);
            });
        } else {
            mostrarAlerta('Error al cargar citas', 'danger');
        }
    } catch (error) {
        mostrarAlerta('Error de conexión al cargar citas', 'danger');
        console.error('Error:', error);
    }
}

document.getElementById('formCita').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const citaData = {
        paciente_id: formData.get('paciente_id'),
        fecha: formData.get('fecha'),
        hora: formData.get('hora'),
        odontologo: formData.get('odontologo'),
        estado: formData.get('estado')
    };
    
    try {
        let url, bodyData;
        
        if (editandoCita) {
            url = 'Citas/editar_cita.php';
            bodyData = {
                id: parseInt(formData.get('id')),
                ...citaData
            };
        } else {
            url = 'Citas/crear_cita.php';
            bodyData = {
                cita: citaData
            };
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarAlerta(result.message, 'success');
            document.getElementById('formCita').reset();
            document.getElementById('citaId').value = '';
            document.getElementById('btnCita').innerHTML = 'Guardar Cita';
            editandoCita = false;
            cargarCitas();
        } else {
            mostrarAlerta(result.message, 'danger');
        }
    } catch (error) {
        mostrarAlerta('Error de conexión', 'danger');
        console.error('Error:', error);
    }
});

function editarCita(id) {
    const cita = citas.find(c => c.id == id);
    if (cita) {
        document.getElementById('citaId').value = cita.id;
        document.getElementById('pacienteIdCita').value = cita.paciente_id;
        document.getElementById('fechaCita').value = cita.fecha;
        document.getElementById('horaCita').value = cita.hora;
        document.getElementById('odontologoCita').value = cita.odontologo;
        document.getElementById('estadoCita').value = cita.estado;
        document.getElementById('btnCita').innerHTML = 'Actualizar Cita';
        editandoCita = true;
    }
}

async function eliminarCita(id) {
    if (confirm('¿Está seguro de que desea eliminar esta cita?')) {
        try {
            const response = await fetch('Citas/eliminar_cita.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            
            const result = await response.json();
            
            if (result.success) {
                mostrarAlerta(result.message, 'success');
                cargarCitas();
            } else {
                mostrarAlerta(result.message, 'danger');
            }
        } catch (error) {
            mostrarAlerta('Error de conexión', 'danger');
            console.error('Error:', error);
        }
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    cargarPacientes();
    
    // Establecer fecha mínima para citas (hoy)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fechaCita').setAttribute('min', today);
});