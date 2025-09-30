# Clínica Odontológica – Web + API PHP + App móvil (Expo)

Sistema simple para gestionar pacientes y citas de una clínica odontológica con:

- Backend/API: PHP (mysqli) sobre Apache + MySQL/MariaDB
- Frontend Web: HTML, CSS y JS vanilla
- App móvil: React Native con Expo (en `clinica-movil/`)

---

## Requisitos

- XAMPP o stack equivalente con:
  - PHP 8+ (probado con 8.2)
  - MySQL/MariaDB (probado con MariaDB 10.4)
  - Apache (habilitar PHP y permitir solicitudes desde la red local si usarás la app móvil)
- Node.js 18+ para la app móvil
- (Opcional) Android Studio/Emulador o dispositivo físico con Expo Go

---

## Estructura del proyecto

```
clinica_odontologica/
├─ clinica_db.sql               # Script de base de datos (tablas: pacientes, citas)
├─ db.php                       # Conexión a MySQL
├─ index.html                   # Frontend web (UI básica)
├─ script.js                    # Lógica del frontend web (consume la API PHP)
├─ styles.css                   # Estilos del frontend web
├─ Pacientes/                   # Endpoints CRUD de pacientes
│  ├─ crear_paciente.php
│  ├─ editar_paciente.php
│  ├─ eliminar_paciente.php
│  └─ leer_paciente.php
├─ Citas/                       # Endpoints CRUD de citas
│  ├─ crear_cita.php
│  ├─ editar_cita.php
│  ├─ eliminar_cita.php
│  ├─ leer_cita.php
│  └─ cambiar_estado_cita.php   # Alterna estado: pendiente → confirmada → cancelada
└─ clinica-movil/               # App móvil con Expo/React Native (tabs: Pacientes y Citas)
```

---

## 1) Backend/API (PHP + MySQL)

### a. Crear la base de datos

- Importa `clinica_db.sql` en tu servidor MySQL (phpMyAdmin o CLI). El script crea la BD `clinica_db`, tablas e inserta algunos datos de ejemplo.

### b. Configurar conexión a BD

Edita `db.php` si tus credenciales difieren:

```php
$servidor = "localhost";
$usuario = "root";
$password = "";
$base_datos = "clinica_db";
```

### c. Ubicación del proyecto y servidor

- Copia la carpeta del proyecto dentro de `htdocs` de XAMPP (ya está ubicado así en este repo de ejemplo).
- Inicia Apache y MySQL desde XAMPP.
- Prueba el backend y la web:
  - Web: http://localhost/clinica_odontologica/
  - API (ejemplos):
    - http://localhost/clinica_odontologica/Pacientes/leer_paciente.php
    - http://localhost/clinica_odontologica/Citas/leer_cita.php

Si quieres usar la app móvil desde otro dispositivo, asegúrate de que:
- Apache esté accesible en la red local (autoriza Apache en el Firewall de Windows).
- Usarás la IP local del PC (por ejemplo, http://192.168.1.50/clinica_odontologica).

---

## 2) Frontend Web (HTML/JS/CSS)

- Página principal: `index.html` (UI para CRUD de pacientes y citas).
- La lógica en `script.js` consume la API PHP vía fetch.
- Abrir en el navegador:
  - http://localhost/clinica_odontologica/

---

## 3) App móvil (Expo React Native)

Carpeta: `clinica-movil/`

### a. Instalación y arranque

- Desde una terminal PowerShell en Windows:

```powershell
cd clinica-movil
npm install
npx expo start
```

- Para abrir:
  - Android: tecla a (emulador) o Expo Go en tu dispositivo (escanea QR)
  - Web: tecla w

### b. Configurar URL de la API

El archivo `clinica-movil/api.js` intenta detectar automáticamente la IP de tu PC cuando usas Expo, y construye una URL como:

```
http://<IP_LOCAL>/clinica_odontologica
```

Si la detección falla o usas otra ruta, edita manualmente `API_URL` al inicio del archivo:

```js
// let API_URL = "http://192.168.1.50/clinica_odontologica";
```

Requisitos de red para dispositivo físico:
- El teléfono y el PC deben estar en la misma Wi‑Fi.
- El servidor Apache debe ser accesible desde la red (prueba en el móvil: abre la IP del PC en el navegador).

Nota sobre métodos HTTP: la app usa PUT/DELETE para editar/eliminar; Apache generalmente los permite, pero si tu hosting bloquea estos métodos, puedes ajustar temporalmente las llamadas a POST en `api.js` y los endpoints PHP seguirán leyendo `php://input`.

---

## 4) Documentación de la API (resumen)

Todas las respuestas exitosas usan JSON con la forma:

```json
{ "success": true, "message": "..." }
```

Los listados devuelven arreglos JSON.

Base URL típica (local):
- `http://localhost/clinica_odontologica`

### Pacientes

- GET `/Pacientes/leer_paciente.php`
  - Respuesta: `[{ id, nombre, documento, telefono, correo }, ...]`

- POST `/Pacientes/crear_paciente.php`
  - Body JSON:
    ```json
    {
      "paciente": { "nombre": "...", "documento": "...", "telefono": "...", "correo": "..." }
    }
    ```

- PUT `/Pacientes/editar_paciente.php`
  - Body JSON:
    ```json
    { "id": 1, "nombre": "...", "documento": "...", "telefono": "...", "correo": "..." }
    ```

- DELETE `/Pacientes/eliminar_paciente.php`
  - Body JSON:
    ```json
    { "id": 1 }
    ```

### Citas

- GET `/Citas/leer_cita.php`
  - Respuesta: `[{ id, paciente_id, fecha, hora, odontologo, estado }, ...]`

- POST `/Citas/crear_cita.php`
  - Body JSON:
    ```json
    {
      "cita": { "paciente_id": 1, "fecha": "YYYY-MM-DD", "hora": "HH:MM", "odontologo": "...", "estado": "pendiente|confirmada|cancelada" }
    }
    ```

- PUT `/Citas/editar_cita.php`
  - Body JSON:
    ```json
    { "id": 1, "paciente_id": 1, "fecha": "YYYY-MM-DD", "hora": "HH:MM", "odontologo": "...", "estado": "pendiente|confirmada|cancelada" }
    ```

- DELETE `/Citas/eliminar_cita.php`
  - Body JSON:
    ```json
    { "id": 1 }
    ```

- PUT `/Citas/cambiar_estado_cita.php`
  - Body JSON:
    ```json
    { "id": 1 }
    ```
  - Comportamiento: rota el estado en orden `pendiente → confirmada → cancelada → pendiente` y devuelve `nuevo_estado`.

Notas:
- Los endpoints incluyen encabezados CORS abiertos para facilitar desarrollo.
- Validaciones mínimas: todos los campos son obligatorios en creación/edición.

---

## 5) Flujo de uso

1) Registra pacientes (web o app móvil).
2) Crea citas vinculadas a pacientes (selecciona fecha, hora y odontólogo).
3) Edita/elimina pacientes y citas desde cualquiera de las interfaces.
4) Cambia el estado de una cita desde la app móvil (botón "Cambiar Estado").

## Diagrama de flujo (paciente → cita)

Diagrama en texto (compatible con cualquier visor):

```
   ┌───────────┐        ┌───────────────────────────────┐        ┌───────────────┐        ┌───────────────────────┐
   │  Usuario  │  →→→   │ Web (index.html) / App (Expo) │  →→→   │  API PHP      │  ↔↔↔   │   MySQL (clinica_db)   │
   └───────────┘        └───────────────────────────────┘        └───────────────┘        └───────────────────────┘
                                  │                                        │                           │
                                  │  fetch / axios (JSON)                  │ mysqli                    │
                                  ▼                                        ▼                           ▼

  Endpoints Pacientes:                         Endpoints Citas:
  - GET    /Pacientes/leer_paciente.php        - GET    /Citas/leer_cita.php
  - POST   /Pacientes/crear_paciente.php       - POST   /Citas/crear_cita.php
  - PUT    /Pacientes/editar_paciente.php      - PUT    /Citas/editar_cita.php
  - DELETE /Pacientes/eliminar_paciente.php    - DELETE /Citas/eliminar_cita.php
                                               - PUT    /Citas/cambiar_estado_cita.php

Flujo típico:
1) Crear Paciente  → POST /Pacientes/crear_paciente.php
2) Crear Cita      → POST /Citas/crear_cita.php (usa paciente_id)
3) Editar/Eliminar → PUT/DELETE en Pacientes y Citas
4) Cambiar Estado  → PUT /Citas/cambiar_estado_cita.php (pendiente → confirmada → cancelada → pendiente)
```

---

## 6) Solución de problemas

- No carga desde el móvil:
  - Verifica que el móvil y el PC estén en la misma red.
  - Prueba en el móvil abrir `http://<IP_LOCAL>/clinica_odontologica` en el navegador.
  - Ajusta `API_URL` en `clinica-movil/api.js` si no se detecta la IP.
  - Permite Apache en el Firewall de Windows.

- Errores con PUT/DELETE:
  - Comprueba que tu servidor acepte esos métodos. Si no, cambia temporalmente a POST en `clinica-movil/api.js`.

- Error de conexión a BD:
  - Revisa credenciales en `db.php` y que el servicio MySQL esté activo.

---

## 7) Scripts útiles (app móvil)

- Instalar dependencias: `npm install`
- Iniciar en modo desarrollo: `npx expo start`
- Abrir Android: en la terminal de Expo, pulsa `a`
- Abrir Web: pulsa `w`

---

## 8) Próximos pasos sugeridos

- Autenticación y roles (recepción, odontólogo, admin)
- Validaciones de dominio (choque de citas, horarios laborales)
- Paginación/búsquedas en listados
- Logs y manejo de errores más detallado en backend
- Despliegue seguro (cerrar CORS, sanitizar salidas, HTTPS)

---

**Desarrollador fullstack**: Jhon Mendoza