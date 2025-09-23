console.log("JS pacientes cargado correctamente");

function listarPacientes() {
    fetch('listar_pacientes.php')
    .then(res => res.json())
    .then(pacientes => {
        const contenedor = document.getElementById('lista-pacientes');
        contenedor.innerHTML = '';

        pacientes.forEach(paciente => {
            const li = document.createElement('li');
            li.classList.add('paciente-item');

            li.innerHTML = `
                <span class="paciente-texto">
                    ${paciente.nombre} - ${paciente.documento} - ${paciente.telefono} - ${paciente.correo}
                </span>
                <div class="botones">
                    <button class="btn-editar" onclick="editarPaciente(${paciente.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarPaciente(${paciente.id})">Eliminar</button>
                </div>
            `;
            contenedor.appendChild(li);
        });
    })
    .catch(() => alert('Error al cargar la lista de pacientes.'));
}

document.getElementById('btn-agregar').addEventListener('click', () => {
    const nombre = document.getElementById('nombre').value.trim();
    const documento = document.getElementById('documento').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const correo = document.getElementById('correo').value.trim();

    if (nombre && documento && telefono && correo) {
        fetch('crear_paciente.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paciente: { nombre, documento, telefono, correo } })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                listarPacientes();
                limpiarFormulario();
            } else {
                alert(data.message);
            }
        });
    } else {
        alert('Todos los campos son obligatorios.');
    }
});

function eliminarPaciente(id) {
    if (confirm('¿Seguro que quieres eliminar este paciente?')) {
        fetch('eliminar_paciente.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                listarPacientes();
            } else {
                alert(data.message);
            }
        });
    }
}

function editarPaciente(id) {
    // Aquí puedes cargar los datos del paciente en el formulario para editar
    // Por simplicidad, obtendremos los datos desde la lista ya cargada
    fetch('listar_pacientes.php')
    .then(res => res.json())
    .then(pacientes => {
        const paciente = pacientes.find(p => p.id === id);
        if (!paciente) return alert('Paciente no encontrado');

        document.getElementById('nombre').value = paciente.nombre;
        document.getElementById('documento').value = paciente.documento;
        document.getElementById('telefono').value = paciente.telefono;
        document.getElementById('correo').value = paciente.correo;
        document.getElementById('btn-agregar').style.display = 'none';
        document.getElementById('btn-actualizar').style.display = 'inline-block';
        document.getElementById('paciente-id').value = paciente.id; // input hidden para almacenar el ID
    });
}

document.getElementById('btn-actualizar').addEventListener('click', () => {
    const id = parseInt(document.getElementById('paciente-id').value);
    const nombre = document.getElementById('nombre').value.trim();
    const documento = document.getElementById('documento').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const correo = document.getElementById('correo').value.trim();

    if (id > 0 && nombre && documento && telefono && correo) {
        fetch('actualizar_paciente.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, nombre, documento, telefono, correo })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                listarPacientes();
                limpiarFormulario();
                document.getElementById('btn-agregar').style.display = 'inline-block';
                document.getElementById('btn-actualizar').style.display = 'none';
            } else {
                alert(data.message);
            }
        });
    } else {
        alert('Todos los campos son obligatorios.');
    }
});

function limpiarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('documento').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('correo').value = '';
    document.getElementById('paciente-id').value = '';
}

listarPacientes();
