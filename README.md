# ⏳ Banco de Tiempo - Plataforma de Aprendizaje Recíproco

Este proyecto es una plataforma web completa de **Banco de Tiempo**, donde los miembros de la comunidad intercambian conocimientos y tutorías utilizando el tiempo como única moneda. Los estudiantes ganan horas enseñando sus especialidades y las gastan recibiendo tutorías de otros.

---

## 🚀 Funcionalidades y Detalles de Implementación

### 1. Autenticación y Gestión de Perfiles
* **Qué hace:** Registro de usuarios, inicio de sesión seguro y personalización del perfil (foto, contacto, saldo de horas, asignación de especialidades/materias).
* **Implementación:**
  * **Backend:** JSON Web Tokens (JWT) para sesiones seguras, bcrypt para contraseñas, controladores de usuarios y autorización en NestJS.
  * **Frontend:** Formularios interactivos, gestión de pestañas (Perfil, Especialidades, Transacciones) en React, almacenamiento local del token.

### 2. Buscador Profesional de Tutorías
* **Qué hace:** Motor de búsqueda de tutores por nombre, materia y especialidad.
* **Implementación:**
  * **Fuzzy Search (Búsqueda Difusa):** Lógica avanzada en el backend ([user.service.ts](file:///c:/Users/Jose/Desktop/Banco%20de%20Tiempo%20App/Backend/src/user/user.service.ts)) usando distancia Levenshtein con tolerancia a errores ortográficos, eliminación de acentos, minúsculas y espacios.
  * **Filtros Avanzados:** Checklist interactivo tipo Bootstrap Dropdown multi-selección para especialidades en la interfaz de React.

### 3. Chats en Tiempo Real
* **Qué hace:** Mensajería directa e instantánea entre tutores y estudiantes para coordinar sesiones de tutoría.
* **Implementación:**
  * **Backend:** NestJS WebSockets (`@nestjs/websockets` con `socket.io-client`), persistencia de conversaciones y mensajes en la base de datos relacional.
  * **Frontend:** Interfaz de chat interactiva con burbujas de diálogo y sincronización inmediata de mensajes recibidos.

### 4. Gestión de Citas y Ubicaciones
* **Qué hace:** Agendamiento, aceptación, cancelación y finalización de tutorías. Permite definir la ubicación exacta de la cita en un mapa.
* **Implementación:**
  * **Backend:** Workflow completo de estados en [cita.service.ts](file:///c:/Users/Jose/Desktop/Banco%20de%20Tiempo%20App/Backend/src/cita/cita.service.ts) (`pendiente`, `aceptada`, `finalizada`, `cancelada`).
  * **Mapas:** Integración de Mapas Interactivos mediante **Leaflet** y **React-Leaflet** para geolocalización de citas en tiempo real.

### 5. Sistema de Transacciones de Tiempo
* **Qué hace:** Cobros y abonos automáticos de saldo de horas tras la finalización de citas.
* **Implementación:**
  * **Transacciones:** Débitos y créditos automáticos de horas en el saldo del usuario con registro histórico en la entidad `Transaccion` del backend.
  * **Visualización:** Historial estilizado de transacciones en el perfil con íconos vectoriales dinámicos y colores semánticos (verde para ingresos, rojo para egresos).

### 6. Panel de Administración e Impacto Social
* **Qué hace:** Control administrativo de usuarios, especialidades y solicitudes de materias. Panel de analíticas e impacto social para directores del proyecto.
* **Implementación:**
  * **Administración:** Guards de rol administrativo (`AdminGuard`) y CRUD de datos maestros.
  * **Reportes Sociales:** Algoritmo en NestJS para cálculo del **Índice de Reciprocidad Comunitaria** (porcentaje de usuarios que actúan tanto en rol de tutor como de estudiante).
  * **Visualizaciones:** Gráficos SVG interactivos hechos a medida (líneas de tendencia temporal de horas compartidas, barras horizontales de materias más demandadas, barras apiladas de citas) con tooltips reactivos flotantes.
  * **Filtro Temporal:** Los reportes del panel administrativo se calculan dinámicamente filtrando todos los registros **desde el 15 de mayo de 2026** en adelante.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React 19, Vite, React-Bootstrap, React Router DOM, Leaflet, Axios, Socket.io-client.
* **Backend:** NestJS 11, TypeORM, PostgreSQL (producción) / SQLite (desarrollo local), WebSockets, bcrypt.
* **Despliegue:** Render (Static Sites para Frontend y Web Services para Backend).
