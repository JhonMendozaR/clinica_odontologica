import { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, Platform, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [pestañaActiva, setPestañaActiva] = useState<'pacientes' | 'citas'>('pacientes');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(false);

  // Estados para edición
  const [editandoPaciente, setEditandoPaciente] = useState<Paciente | null>(null);
  const [editandoCita, setEditandoCita] = useState<Cita | null>(null);

  // Estados para mostrar formularios
  const [mostrarFormularioPaciente, setMostrarFormularioPaciente] = useState(false);
  const [mostrarFormularioCita, setMostrarFormularioCita] = useState(false);

  // Estados para el selector de fecha
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [modoDatePicker, setModoDatePicker] = useState<'nueva' | 'editar'>('nueva');

  // Estados para el selector de odontólogos
  const [mostrarSelectorOdontologo, setMostrarSelectorOdontologo] = useState(false);
  const [modoSelectorOdontologo, setModoSelectorOdontologo] = useState<'nueva' | 'editar'>('nueva');

  // Estados para el selector de pacientes
  const [mostrarSelectorPaciente, setMostrarSelectorPaciente] = useState(false);
  const [modoSelectorPaciente, setModoSelectorPaciente] = useState<'nueva' | 'editar'>('nueva');

  // Lista de odontólogos disponibles
  const odontologos = [
    'Carlos Mendoza',
    'María González',
    'Juan Pérez',
    'Ana Rodríguez',
    'Luis Martínez'
  ];

  // Estados para formularios
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    correo: ''
  });

  const [nuevaCita, setNuevaCita] = useState({
    paciente_id: 0,
    fecha: '',
    hora: '',
    odontologo: '',
    estado: 'Pendiente'
  });

  // Función para validar email
  const validarEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Funciones para limpiar formularios
  const limpiarFormularioPaciente = () => {
    setNuevoPaciente({ nombre: '', documento: '', telefono: '', correo: '' });
    setEditandoPaciente(null);
  };

  const limpiarFormularioCita = () => {
    setNuevaCita({ paciente_id: 0, fecha: '', hora: '', odontologo: '', estado: 'Pendiente' });
    setEditandoCita(null);
  };

  // Funciones para el selector de fecha
  const formatearFecha = (fecha: Date) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  const formatearHora = (fecha: Date) => {
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  const manejarCambioFecha = (event: any, fechaSeleccionada?: Date) => {
    const fechaActual = fechaSeleccionada || new Date();
    setMostrarDatePicker(false);
    
    if (event.type === 'set') {
      setFechaSeleccionada(fechaActual);
      const fechaFormateada = formatearFecha(fechaActual);
      
      if (modoDatePicker === 'nueva') {
        setNuevaCita({ ...nuevaCita, fecha: fechaFormateada });
      } else if (editandoCita) {
        setEditandoCita({ ...editandoCita, fecha: fechaFormateada });
      }
    }
  };

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

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

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

  // Funciones para pacientes
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

  // Funciones para citas
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

  const handleEditarCita = async () => {
    if (!editandoCita || !editandoCita.paciente_id || editandoCita.paciente_id <= 0 || !editandoCita.fecha || !editandoCita.hora || !editandoCita.odontologo) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    const resultado = await editarCita(editandoCita.id, {
      paciente_id: editandoCita.paciente_id,
      fecha: editandoCita.fecha,
      hora: editandoCita.hora,
      odontologo: editandoCita.odontologo
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

  const handleCambiarEstadoCita = async (id: number) => {
    const resultado = await cambiarEstadoCita(id);
    if (resultado.success) {
      cargarDatos();
    } else {
      Alert.alert('Error', resultado.message || 'No se pudo cambiar el estado');
    }
  };

  // Obtener nombre del paciente por ID
  const obtenerNombrePaciente = (id: number) => {
    const paciente = pacientes.find(p => p.id === id);
    return paciente ? paciente.nombre : 'Paciente no encontrado';
  };



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
            <TouchableOpacity
              style={styles.botonNuevo}
              onPress={() => {
                if (mostrarFormularioPaciente && !editandoPaciente) {
                  limpiarFormularioPaciente();
                  setMostrarFormularioPaciente(false);
                } else {
                  limpiarFormularioPaciente();
                  setMostrarFormularioPaciente(true);
                }
              }}
            >
              <Text style={styles.textoBotonNuevo}>
                {mostrarFormularioPaciente && !editandoPaciente ? '- Cancelar' : '+ Nuevo Paciente'}
              </Text>
            </TouchableOpacity>

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
                      <Text style={styles.detalle}>Documento: {item.documento}</Text>
                      <Text style={styles.detalle}>Teléfono: {item.telefono}</Text>
                      <Text style={styles.detalle}>Correo: {item.correo}</Text>
                      <View style={styles.botonesContainer}>
                        <TouchableOpacity
                          style={styles.botonEditar}
                          onPress={() => {
                            if (editandoPaciente && editandoPaciente.id === item.id) {
                              limpiarFormularioPaciente();
                              setMostrarFormularioPaciente(false);
                            } else {
                              limpiarFormularioPaciente();
                              setEditandoPaciente(item);
                              setMostrarFormularioPaciente(false);
                            }
                          }}
                        >
                          <Text style={styles.textoBotonEditar}>
                            {editandoPaciente && editandoPaciente.id === item.id ? 'Cancelar' : 'Editar'}
                          </Text>
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
            <TouchableOpacity
              style={styles.botonNuevo}
              onPress={() => {
                if (mostrarFormularioCita && !editandoCita) {
                  limpiarFormularioCita();
                  setMostrarFormularioCita(false);
                } else {
                  limpiarFormularioCita();
                  setMostrarFormularioCita(true);
                }
              }}
            >
              <Text style={styles.textoBotonNuevo}>
                {mostrarFormularioCita && !editandoCita ? '- Cancelar' : '+ Nueva Cita'}
              </Text>
            </TouchableOpacity>

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
                      <Text style={styles.detalle}>Fecha: {item.fecha}</Text>
                      <Text style={styles.detalle}>Hora: {item.hora}</Text>
                      <Text style={styles.detalle}>Odontólogo: {item.odontologo}</Text>
                      <Text style={[styles.detalle, { fontWeight: 'bold' }]}>
                        Estado: {item.estado}
                      </Text>
                      <View style={styles.botonesContainer}>
                        <TouchableOpacity
                          style={styles.botonEditar}
                          onPress={() => {
                            if (editandoCita && editandoCita.id === item.id) {
                              limpiarFormularioCita();
                              setMostrarFormularioCita(false);
                            } else {
                              limpiarFormularioCita();
                              setEditandoCita(item);
                              setMostrarFormularioCita(false);
                            }
                          }}
                        >
                          <Text style={styles.textoBotonEditar}>
                            {editandoCita && editandoCita.id === item.id ? 'Cancelar' : 'Editar'}
                          </Text>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tituloHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  pestañas: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pestaña: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  pestañaActiva: {
    backgroundColor: '#007bff',
  },
  textoPestaña: {
    fontSize: 16,
    color: '#666',
  },
  textoPestañaActiva: {
    color: 'white',
    fontWeight: 'bold',
  },
  contenido: {
    flex: 1,
    padding: 15,
  },
  section: {
    flex: 1,
  },

  cardHeader: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cardBody: {
    padding: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },

  picker: {
    justifyContent: 'center',
  },
  pickerText: {
    color: '#333',
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#999',
    fontSize: 16,
  },

  buttonContainerVertical: {
    marginTop: 10,
  },
  botonPrimario: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  textoBotonPrimario: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botonSecundario: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  textoBotonSecundario: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  tarjeta: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tarjetaId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  detalle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 15,
    gap: 8,
    flexWrap: 'wrap',
  },
  botonEditar: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  textoBotonEditar: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  botonEliminar: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  textoBotonEliminar: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  botonEstado: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  textoBotonEstado: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  botonNuevo: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoBotonNuevo: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  formCardInline: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  listCardFull: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    paddingVertical: 10,
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionPaciente: {
    paddingVertical: 5,
  },
  modalOptionSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});