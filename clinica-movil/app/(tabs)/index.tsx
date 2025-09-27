// Importaciones principales de React y componentes de React Native
import { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, Platform, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

// Importación de funciones de la API para pacientes y citas
import {
  obtenerPacientes,
  crearPaciente,
  editarPaciente,
  eliminarPaciente,
  obtenerCitas,
  crearCita,
  editarCita,
  eliminarCita,
  cambiarEstadoCita
} from "../../api";

// Tipos para los datos de pacientes y citas
interface Paciente {
  id: number;
  nombre: string;
  documento: number;
  telefono: string;
  correo: string;
}

interface Cita {
  id: number;
  paciente_id: number;
  fecha: string;
  hora: string;
  odontologo: string;
  estado: string;
}

export default function HomeScreen() {
  // ===============================
  // Estados principales de la pantalla
  // ===============================

  // Estado para manejar la pestaña activa ("pacientes" o "citas")
  const [pestañaActiva, setPestañaActiva] = useState<'pacientes' | 'citas'>('pacientes');

  // Listas de pacientes y citas
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(false); // Indica si se están cargando datos

  // Estados para edición de registros
  const [editandoPaciente, setEditandoPaciente] = useState<Paciente | null>(null);
  const [editandoCita, setEditandoCita] = useState<Cita | null>(null);

  // Estados para mostrar/ocultar formularios
  const [mostrarFormularioPaciente, setMostrarFormularioPaciente] = useState(false);
  const [mostrarFormularioCita, setMostrarFormularioCita] = useState(false);

  // ===============================
  // Estados para selección de fecha y hora
  // ===============================
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  // modoDatePicker indica si el selector es para nueva cita o edición
  const [modoDatePicker, setModoDatePicker] = useState<'nueva' | 'editar'>('nueva');

  // ===============================
  // Estados para selectores de odontólogo y paciente
  // ===============================
  const [mostrarSelectorOdontologo, setMostrarSelectorOdontologo] = useState(false);
  const [modoSelectorOdontologo, setModoSelectorOdontologo] = useState<'nueva' | 'editar'>('nueva');
  const [mostrarSelectorPaciente, setMostrarSelectorPaciente] = useState(false);
  const [modoSelectorPaciente, setModoSelectorPaciente] = useState<'nueva' | 'editar'>('nueva');

  // Lista de odontólogos disponibles (puede ser reemplazada por una consulta a la API en el futuro)
  const odontologos = [
    'Carlos Mendoza',
    'María González',
    'Juan Pérez',
    'Ana Rodríguez',
    'Luis Martínez'
  ];

  // ===============================
  // Estados para formularios
  // ===============================
  // Estado para el formulario de nuevo paciente
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    correo: ''
  });

  // Estado para el formulario de nueva cita
  const [nuevaCita, setNuevaCita] = useState({
    paciente_id: 0,
    fecha: '',
    hora: '',
    odontologo: '',
    estado: 'Pendiente'
  });

  // ===============================
  // Funciones utilitarias
  // ===============================

  // Valida si un email tiene formato correcto
  const validarEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Limpia el formulario de paciente y resetea el estado de edición
  const limpiarFormularioPaciente = () => {
    setNuevoPaciente({ nombre: '', documento: '', telefono: '', correo: '' });
    setEditandoPaciente(null);
  };

  // Limpia el formulario de cita y resetea el estado de edición
  const limpiarFormularioCita = () => {
    setNuevaCita({ paciente_id: 0, fecha: '', hora: '', odontologo: '', estado: 'Pendiente' });
    setEditandoCita(null);
  };

  // Formatea un objeto Date a string YYYY-MM-DD
  const formatearFecha = (fecha: Date) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  // Formatea un objeto Date a string HH:mm
  const formatearHora = (fecha: Date) => {
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  // ===============================
  // Manejo de selección de fecha y hora
  // ===============================

  // Maneja el cambio de fecha en el DatePicker
  const manejarCambioFecha = (event: any, fechaSeleccionada?: Date) => {
    const fechaActual = fechaSeleccionada || new Date();
    setMostrarDatePicker(false); // Oculta el selector
    if (event.type === 'set') { // Solo si el usuario confirma
      setFechaSeleccionada(fechaActual);
      const fechaFormateada = formatearFecha(fechaActual);
      if (modoDatePicker === 'nueva') {
        setNuevaCita({ ...nuevaCita, fecha: fechaFormateada });
      } else if (editandoCita) {
        setEditandoCita({ ...editandoCita, fecha: fechaFormateada });
      }
    }
  };

  // Maneja el cambio de hora en el TimePicker
  const manejarCambioHora = (event: any, fechaSeleccionada?: Date) => {
    const fechaActual = fechaSeleccionada || new Date();
    setMostrarTimePicker(false);
    if (event.type === 'set') {
      const horaFormateada = formatearHora(fechaActual);
      if (modoDatePicker === 'nueva') {
        setNuevaCita({ ...nuevaCita, hora: horaFormateada });
      } else if (editandoCita) {
        setEditandoCita({ ...editandoCita, hora: horaFormateada });
      }
    }
  };

  // ===============================
  // Carga inicial de datos
  // ===============================
  useEffect(() => {
    cargarDatos();
  }, []);

  // Carga pacientes y citas desde la API
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [pacientesData, citasData] = await Promise.all([
        obtenerPacientes(),
        obtenerCitas()
      ]);
      setPacientes(pacientesData);
      setCitas(citasData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  // ===============================
  // Funciones CRUD para pacientes
  // ===============================

  // Crea un nuevo paciente
  const handleCrearPaciente = async () => {
    if (!nuevoPaciente.nombre || !nuevoPaciente.documento || !nuevoPaciente.telefono || !nuevoPaciente.correo) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (!validarEmail(nuevoPaciente.correo)) {
      Alert.alert('Error', 'Por favor ingrese un correo electrónico válido');
      return;
    }
    const resultado = await crearPaciente(nuevoPaciente);
    if (resultado.success) {
      Alert.alert('Éxito', 'Paciente creado correctamente');
      limpiarFormularioPaciente();
      setMostrarFormularioPaciente(false);
      cargarDatos();
    } else {
      Alert.alert('Error', resultado.message || 'No se pudo crear el paciente');
    }
  };

  // Edita un paciente existente
  const handleEditarPaciente = async () => {
    if (!editandoPaciente || !editandoPaciente.nombre || !editandoPaciente.documento || !editandoPaciente.telefono || !editandoPaciente.correo) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (!validarEmail(editandoPaciente.correo)) {
      Alert.alert('Error', 'Por favor ingrese un correo electrónico válido');
      return;
    }
    const resultado = await editarPaciente(editandoPaciente.id, {
      nombre: editandoPaciente.nombre,
      documento: editandoPaciente.documento,
      telefono: editandoPaciente.telefono,
      correo: editandoPaciente.correo
    });
    if (resultado.success) {
      Alert.alert('Éxito', 'Paciente editado correctamente');
      limpiarFormularioPaciente();
      setMostrarFormularioPaciente(false);
      cargarDatos();
    } else {
      Alert.alert('Error', resultado.message || 'No se pudo editar el paciente');
    }
  };

  // Elimina un paciente (con confirmación)
  const handleEliminarPaciente = (id: number, nombre: string) => {
    Alert.alert(
      'Confirmar',
      `¿Está seguro de eliminar al paciente ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const resultado = await eliminarPaciente(id);
            if (resultado.success) {
              Alert.alert('Éxito', 'Paciente eliminado correctamente');
              cargarDatos();
            } else {
              Alert.alert('Error', resultado.message || 'No se puede eliminar el paciente porque tiene citas asociadas.');
            }
          }
        }
      ]
    );
  };

  // ===============================
  // Funciones CRUD para citas
  // ===============================

  // Crea una nueva cita
  const handleCrearCita = async () => {
    if (!nuevaCita.paciente_id || nuevaCita.paciente_id <= 0 || !nuevaCita.fecha || !nuevaCita.hora || !nuevaCita.odontologo) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    const resultado = await crearCita(nuevaCita);
    if (resultado.success) {
      Alert.alert('Éxito', 'Cita creada correctamente');
      limpiarFormularioCita();
      setMostrarFormularioCita(false);
      cargarDatos();
    } else {
      Alert.alert('Error', resultado.message || 'No se pudo crear la cita');
    }
  };

  // Edita una cita existente
  const handleEditarCita = async () => {
    if (!editandoCita || !editandoCita.paciente_id || editandoCita.paciente_id <= 0 || !editandoCita.fecha || !editandoCita.hora || !editandoCita.odontologo) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    const resultado = await editarCita(editandoCita.id, {
      paciente_id: editandoCita.paciente_id,
      fecha: editandoCita.fecha,
      hora: editandoCita.hora,
      odontologo: editandoCita.odontologo,
      estado: editandoCita.estado
    });
    if (resultado.success) {
      Alert.alert('Éxito', 'Cita editada correctamente');
      limpiarFormularioCita();
      setMostrarFormularioCita(false);
      cargarDatos();
    } else {
      Alert.alert('Error', resultado.message || 'No se pudo editar la cita');
    }
  };

  // Elimina una cita (con confirmación)
  const handleEliminarCita = (id: number) => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro de eliminar esta cita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const resultado = await eliminarCita(id);
            if (resultado.success) {
              Alert.alert('Éxito', 'Cita eliminada correctamente');
              cargarDatos();
            } else {
              Alert.alert('Error', resultado.message || 'No se pudo eliminar la cita');
            }
          }
        }
      ]
    );
  };

  // Cambia el estado de una cita (pendiente, completada, cancelada)
  const handleCambiarEstadoCita = async (id: number) => {
    const resultado = await cambiarEstadoCita(id);
    if (resultado.success) {
      cargarDatos();
    } else {
      Alert.alert('Error', resultado.message || 'No se pudo cambiar el estado');
    }
  };

  // Devuelve el nombre del paciente dado su ID
  const obtenerNombrePaciente = (id: number) => {
    const paciente = pacientes.find(p => p.id === id);
    return paciente ? paciente.nombre : 'Paciente no encontrado';
  };

  // ===============================
  // Renderizado principal
  // ===============================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.tituloHeader}>🦷 Clínica Odontológica</Text>
      </View>

      {/* Navegación por pestañas */}
      <View style={styles.pestañas}>
        <TouchableOpacity
          style={[styles.pestaña, pestañaActiva === 'pacientes' && styles.pestañaActiva]}
          onPress={() => setPestañaActiva('pacientes')}
        >
          <Text style={[styles.textoPestaña, pestañaActiva === 'pacientes' && styles.textoPestañaActiva]}>
            Pacientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pestaña, pestañaActiva === 'citas' && styles.pestañaActiva]}
          onPress={() => setPestañaActiva('citas')}
        >
          <Text style={[styles.textoPestaña, pestañaActiva === 'citas' && styles.textoPestañaActiva]}>
            Citas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contenido}>
        {pestañaActiva === 'pacientes' ? (
          <View style={styles.section}>
            {/* Botón Nuevo Paciente */}
            {!mostrarFormularioPaciente && !editandoPaciente && (
              <TouchableOpacity
                style={styles.botonNuevo}
                onPress={() => {
                  limpiarFormularioPaciente();
                  setMostrarFormularioPaciente(true);
                }}
              >
                <Text style={styles.textoBotonNuevo}>+ Nuevo Paciente</Text>
              </TouchableOpacity>
            )}

            {/* Formulario Nuevo Paciente */}
            {mostrarFormularioPaciente && !editandoPaciente && (
              <View style={styles.formCardInline}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Nuevo Paciente</Text>
                </View>
                <View style={styles.cardBody}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre Completo *"
                    value={nuevoPaciente.nombre}
                    onChangeText={(text) => setNuevoPaciente({ ...nuevoPaciente, nombre: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Documento *"
                    value={nuevoPaciente.documento}
                    onChangeText={(text) => setNuevoPaciente({ ...nuevoPaciente, documento: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Teléfono *"
                    value={nuevoPaciente.telefono}
                    onChangeText={(text) => setNuevoPaciente({ ...nuevoPaciente, telefono: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Correo Electrónico *"
                    value={nuevoPaciente.correo}
                    onChangeText={(text) => setNuevoPaciente({ ...nuevoPaciente, correo: text })}
                    keyboardType="email-address"
                  />
                  <View style={styles.buttonContainerVertical}>
                    <TouchableOpacity style={styles.botonPrimario} onPress={handleCrearPaciente}>
                      <Text style={styles.textoBotonPrimario}>Guardar Paciente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botonSecundario} onPress={() => {
                      limpiarFormularioPaciente();
                      setMostrarFormularioPaciente(false);
                    }}>
                      <Text style={styles.textoBotonSecundario}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Lista de Pacientes */}
            <View style={styles.listCardFull}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Lista de Pacientes</Text>
              </View>
              <FlatList
                data={pacientes}
                renderItem={({ item }) => (
                  <View>
                    <View style={styles.tarjeta}>
                      <View style={styles.tarjetaHeader}>
                        <Text style={styles.tarjetaId}>ID: {item.id}</Text>
                      </View>
                      <Text style={styles.titulo}>{item.nombre}</Text>
                      <View style={styles.detalleContainer}>
                        <Text style={styles.detalleLabel}>Documento:</Text>
                        <Text style={styles.detalle}>{item.documento}</Text>
                      </View>
                      <View style={styles.detalleContainer}>
                        <Text style={styles.detalleLabel}>Teléfono:</Text>
                        <Text style={styles.detalle}>{item.telefono}</Text>
                      </View>
                      <View style={styles.detalleContainer}>
                        <Text style={styles.detalleLabel}>Correo:</Text>
                        <Text style={styles.detalle}>{item.correo}</Text>
                      </View>
                      <View style={styles.botonesContainer}>
                        <TouchableOpacity
                          style={styles.botonEditar}
                          onPress={() => {
                            limpiarFormularioPaciente();
                            setEditandoPaciente(item);
                            setMostrarFormularioPaciente(false);
                          }}
                        >
                          <Text style={styles.textoBotonEditar}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.botonEliminar}
                          onPress={() => handleEliminarPaciente(item.id, item.nombre)}
                        >
                          <Text style={styles.textoBotonEliminar}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Formulario de Edición debajo de la fila */}
                    {editandoPaciente && editandoPaciente.id === item.id && (
                      <View style={styles.formCardInline}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>Editar Paciente</Text>
                        </View>
                        <View style={styles.cardBody}>
                          <TextInput
                            style={styles.input}
                            placeholder="Nombre Completo *"
                            value={editandoPaciente.nombre}
                            onChangeText={(text) => setEditandoPaciente({ ...editandoPaciente, nombre: text })}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Documento *"
                            value={editandoPaciente.documento.toString()}
                            onChangeText={(text) => setEditandoPaciente({ ...editandoPaciente, documento: parseInt(text) || 0 })}
                            keyboardType="numeric"
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Teléfono *"
                            value={editandoPaciente.telefono}
                            onChangeText={(text) => setEditandoPaciente({ ...editandoPaciente, telefono: text })}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Correo Electrónico *"
                            value={editandoPaciente.correo}
                            onChangeText={(text) => setEditandoPaciente({ ...editandoPaciente, correo: text })}
                            keyboardType="email-address"
                          />
                          <View style={styles.buttonContainerVertical}>
                            <TouchableOpacity style={styles.botonPrimario} onPress={handleEditarPaciente}>
                              <Text style={styles.textoBotonPrimario}>Guardar Cambios</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.botonSecundario} onPress={() => {
                              limpiarFormularioPaciente();
                              setMostrarFormularioPaciente(false);
                            }}>
                              <Text style={styles.textoBotonSecundario}>Cancelar</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                refreshing={cargando}
                onRefresh={cargarDatos}
                showsVerticalScrollIndicator={false}
                style={styles.listContainer}
              />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            {/* Botón Nueva Cita */}
            {!mostrarFormularioCita && !editandoCita && (
              <TouchableOpacity
                style={styles.botonNuevo}
                onPress={() => {
                  limpiarFormularioCita();
                  setMostrarFormularioCita(true);
                }}
              >
                <Text style={styles.textoBotonNuevo}>+ Nueva Cita</Text>
              </TouchableOpacity>
            )}

            {/* Formulario Nueva Cita */}
            {mostrarFormularioCita && !editandoCita && (
              <View style={styles.formCardInline}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Nueva Cita</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.inputLabel}>Paciente *</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.picker]}
                    onPress={() => {
                      if (pacientes.length === 0) {
                        Alert.alert('Sin pacientes', 'No hay pacientes registrados. Por favor, registre un paciente primero.');
                        return;
                      }
                      setModoSelectorPaciente('nueva');
                      setMostrarSelectorPaciente(true);
                    }}
                  >
                    <Text style={nuevaCita.paciente_id > 0 ? styles.pickerText : styles.pickerPlaceholder}>
                      {nuevaCita.paciente_id > 0 ? 
                        `${obtenerNombrePaciente(nuevaCita.paciente_id)} (ID: ${nuevaCita.paciente_id})` : 
                        'Seleccionar paciente *'
                      }
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.inputLabel}>Fecha *</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.picker]}
                    onPress={() => {
                      setModoDatePicker('nueva');
                      setMostrarDatePicker(true);
                    }}
                  >
                    <Text style={nuevaCita.fecha ? styles.pickerText : styles.pickerPlaceholder}>
                      {nuevaCita.fecha || 'Seleccionar fecha *'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.inputLabel}>Hora *</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.picker]}
                    onPress={() => {
                      setModoDatePicker('nueva');
                      setMostrarTimePicker(true);
                    }}
                  >
                    <Text style={nuevaCita.hora ? styles.pickerText : styles.pickerPlaceholder}>
                      {nuevaCita.hora || 'Seleccionar hora *'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.inputLabel}>Odontólogo *</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.picker]}
                    onPress={() => {
                      setModoSelectorOdontologo('nueva');
                      setMostrarSelectorOdontologo(true);
                    }}
                  >
                    <Text style={nuevaCita.odontologo ? styles.pickerText : styles.pickerPlaceholder}>
                      {nuevaCita.odontologo || 'Seleccionar odontólogo *'}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.buttonContainerVertical}>
                    <TouchableOpacity style={styles.botonPrimario} onPress={handleCrearCita}>
                      <Text style={styles.textoBotonPrimario}>Guardar Cita</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botonSecundario} onPress={() => {
                      limpiarFormularioCita();
                      setMostrarFormularioCita(false);
                    }}>
                      <Text style={styles.textoBotonSecundario}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Lista de Citas */}
            <View style={styles.listCardFull}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Lista de Citas</Text>
              </View>
              <FlatList
                data={citas}
                renderItem={({ item }) => (
                  <View>
                    <View style={styles.tarjeta}>
                      <View style={styles.tarjetaHeader}>
                        <Text style={styles.tarjetaId}>ID: {item.id}</Text>
                      </View>
                      <Text style={styles.titulo}>{obtenerNombrePaciente(item.paciente_id)}</Text>
                      <View style={styles.detalleContainer}>
                        <Text style={styles.detalleLabel}>Fecha:</Text>
                        <Text style={styles.detalle}>{item.fecha}</Text>
                      </View>
                      <View style={styles.detalleContainer}>
                        <Text style={styles.detalleLabel}>Hora:</Text>
                        <Text style={styles.detalle}>{item.hora}</Text>
                      </View>
                      <View style={styles.detalleContainer}>
                        <Text style={styles.detalleLabel}>Odontólogo:</Text>
                        <Text style={styles.detalle}>{item.odontologo}</Text>
                      </View>
                      <View style={styles.detalleContainer}>
                        <Text style={styles.detalleLabel}>Estado:</Text>
                        <Text style={[styles.detalle, styles.estadoCita, { 
                          color: item.estado === 'Completada' ? '#34a853' : 
                                 item.estado === 'Cancelada' ? '#ea4335' : '#1a73e8' 
                        }]}>
                          {item.estado}
                        </Text>
                      </View>
                      <View style={styles.botonesContainer}>
                        <TouchableOpacity
                          style={styles.botonEditar}
                          onPress={() => {
                            limpiarFormularioCita();
                            setEditandoCita(item);
                            setMostrarFormularioCita(false);
                          }}
                        >
                          <Text style={styles.textoBotonEditar}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.botonEstado}
                          onPress={() => handleCambiarEstadoCita(item.id)}
                        >
                          <Text style={styles.textoBotonEstado}>Cambiar Estado</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.botonEliminar}
                          onPress={() => handleEliminarCita(item.id)}
                        >
                          <Text style={styles.textoBotonEliminar}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Formulario de Edición debajo de la fila */}
                    {editandoCita && editandoCita.id === item.id && (
                      <View style={styles.formCardInline}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>Editar Cita</Text>
                        </View>
                        <View style={styles.cardBody}>
                          <Text style={styles.inputLabel}>Paciente *</Text>
                          <TouchableOpacity
                            style={[styles.input, styles.picker]}
                            onPress={() => {
                              if (pacientes.length === 0) {
                                Alert.alert('Sin pacientes', 'No hay pacientes registrados. Por favor, registre un paciente primero.');
                                return;
                              }
                              setModoSelectorPaciente('editar');
                              setMostrarSelectorPaciente(true);
                            }}
                          >
                            <Text style={editandoCita.paciente_id ? styles.pickerText : styles.pickerPlaceholder}>
                              {editandoCita.paciente_id ? 
                                `${obtenerNombrePaciente(editandoCita.paciente_id)} (ID: ${editandoCita.paciente_id})` : 
                                'Seleccionar paciente *'
                              }
                            </Text>
                          </TouchableOpacity>
                          <Text style={styles.inputLabel}>Fecha *</Text>
                          <TouchableOpacity
                            style={[styles.input, styles.picker]}
                            onPress={() => {
                              setModoDatePicker('editar');
                              setMostrarDatePicker(true);
                            }}
                          >
                            <Text style={editandoCita.fecha ? styles.pickerText : styles.pickerPlaceholder}>
                              {editandoCita.fecha || 'Seleccionar fecha *'}
                            </Text>
                          </TouchableOpacity>
                          <Text style={styles.inputLabel}>Hora *</Text>
                          <TouchableOpacity
                            style={[styles.input, styles.picker]}
                            onPress={() => {
                              setModoDatePicker('editar');
                              setMostrarTimePicker(true);
                            }}
                          >
                            <Text style={editandoCita.hora ? styles.pickerText : styles.pickerPlaceholder}>
                              {editandoCita.hora || 'Seleccionar hora *'}
                            </Text>
                          </TouchableOpacity>
                          <Text style={styles.inputLabel}>Odontólogo *</Text>
                          <TouchableOpacity
                            style={[styles.input, styles.picker]}
                            onPress={() => {
                              setModoSelectorOdontologo('editar');
                              setMostrarSelectorOdontologo(true);
                            }}
                          >
                            <Text style={editandoCita.odontologo ? styles.pickerText : styles.pickerPlaceholder}>
                              {editandoCita.odontologo || 'Seleccionar odontólogo *'}
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.buttonContainerVertical}>
                            <TouchableOpacity style={styles.botonPrimario} onPress={handleEditarCita}>
                              <Text style={styles.textoBotonPrimario}>Guardar Cambios</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.botonSecundario} onPress={() => {
                              limpiarFormularioCita();
                              setMostrarFormularioCita(false);
                            }}>
                              <Text style={styles.textoBotonSecundario}>Cancelar</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                refreshing={cargando}
                onRefresh={cargarDatos}
                showsVerticalScrollIndicator={false}
                style={styles.listContainer}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* DateTimePicker para fecha */}
      {mostrarDatePicker && (
        <DateTimePicker
          value={fechaSeleccionada}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={manejarCambioFecha}
          minimumDate={new Date()}
        />
      )}

      {/* TimePicker para hora */}
      {mostrarTimePicker && (
        <DateTimePicker
          value={fechaSeleccionada}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={manejarCambioHora}
        />
      )}

      {/* Modal Selector de Odontólogos */}
      <Modal
        visible={mostrarSelectorOdontologo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMostrarSelectorOdontologo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Odontólogo</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setMostrarSelectorOdontologo(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {odontologos.map((odontologo, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalOption}
                  onPress={() => {
                    if (modoSelectorOdontologo === 'nueva') {
                      setNuevaCita({ ...nuevaCita, odontologo: odontologo });
                    } else if (editandoCita) {
                      setEditandoCita({ ...editandoCita, odontologo: odontologo });
                    }
                    setMostrarSelectorOdontologo(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{odontologo}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Selector de Pacientes */}
      <Modal
        visible={mostrarSelectorPaciente}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMostrarSelectorPaciente(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Paciente</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setMostrarSelectorPaciente(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {pacientes.map((paciente) => (
                <TouchableOpacity
                  key={paciente.id}
                  style={styles.modalOption}
                  onPress={() => {
                    if (modoSelectorPaciente === 'nueva') {
                      setNuevaCita({ ...nuevaCita, paciente_id: paciente.id });
                    } else if (editandoCita) {
                      setEditandoCita({ ...editandoCita, paciente_id: paciente.id });
                    }
                    setMostrarSelectorPaciente(false);
                  }}
                >
                  <View style={styles.modalOptionPaciente}>
                    <Text style={styles.modalOptionText}>{paciente.nombre}</Text>
                    <Text style={styles.modalOptionSubText}>
                      Documento: {paciente.documento} | ID: {paciente.id}
                    </Text>
                    <Text style={styles.modalOptionSubText}>
                      Teléfono: {paciente.telefono}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {pacientes.length === 0 && (
                <View style={styles.modalOption}>
                  <Text style={[styles.modalOptionText, { textAlign: 'center', color: '#666' }]}>
                    No hay pacientes registrados
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  tituloHeader: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a73e8',
    textAlign: 'center',
  },
  pestañas: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  pestaña: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  pestañaActiva: {
    backgroundColor: '#e8f0fe',
    borderColor: '#1a73e8',
  },
  textoPestaña: {
    fontSize: 15,
    color: '#5f6368',
    fontWeight: '500',
  },
  textoPestañaActiva: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  contenido: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  section: {
    flex: 1,
  },

  cardHeader: {
    backgroundColor: '#1a73e8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  cardBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5f6368',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#202124',
    minHeight: 50,
  },

  picker: {
    justifyContent: 'center',
  },
  pickerText: {
    color: '#202124',
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#9aa0a6',
    fontSize: 16,
  },

  buttonContainerVertical: {
    marginTop: 20,
    gap: 12,
  },
  botonPrimario: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  textoBotonPrimario: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  botonSecundario: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  textoBotonSecundario: {
    color: '#5f6368',
    fontWeight: '500',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  tarjeta: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tarjetaId: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9aa0a6',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#202124',
  },
  detalle: {
    fontSize: 14,
    color: '#202124',
    marginBottom: 6,
    lineHeight: 20,
    flex: 1,
  },
  detalleContainer: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  detalleLabel: {
    fontSize: 14,
    color: '#5f6368',
    fontWeight: '500',
    width: 80,
    marginRight: 8,
  },
  estadoCita: {
    fontWeight: '600',
    fontSize: 14,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  botonEditar: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoBotonEditar: {
    color: 'white',
    fontWeight: '500',
    fontSize: 13,
  },
  botonEliminar: {
    backgroundColor: '#ea4335',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#ea4335',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoBotonEliminar: {
    color: 'white',
    fontWeight: '500',
    fontSize: 13,
  },
  botonEstado: {
    backgroundColor: '#34a853',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#34a853',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoBotonEstado: {
    color: 'white',
    fontWeight: '500',
    fontSize: 13,
  },
  botonNuevo: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  textoBotonNuevo: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },

  formCardInline: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  listCardFull: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    flex: 1,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a73e8',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalCloseText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  modalContent: {
    paddingVertical: 8,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#202124',
    fontWeight: '500',
  },
  modalOptionPaciente: {
    paddingVertical: 4,
  },
  modalOptionSubText: {
    fontSize: 13,
    color: '#5f6368',
    marginTop: 4,
  },
});
