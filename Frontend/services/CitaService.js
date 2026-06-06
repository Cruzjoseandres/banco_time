import axios from "axios";
import { getAccessToken } from "../utils/TokenUtilities";
import { API_URL } from "./config";

const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Obtener todas las citas del usuario autenticado
const getMisCitas = () => {
    return axios.get(`${API_URL}/cita`, getAuthHeaders()).then(r => r.data);
};

// Obtener una cita por ID
const getCitaById = (id) => {
    return axios.get(`${API_URL}/cita/${id}`, getAuthHeaders()).then(r => r.data);
};

// Crear nueva cita (estudiante solicita al tutor)
const crearCita = (data) => {
    return axios.post(`${API_URL}/cita`, data, getAuthHeaders()).then(r => r.data);
};

// Tutor responde la cita (aceptar o rechazar)
const responderCita = (id, estado) => {
    return axios.patch(`${API_URL}/cita/${id}/responder`, { estado }, getAuthHeaders()).then(r => r.data);
};

// Tutor inicia la cita
const iniciarCita = (id) => {
    return axios.patch(`${API_URL}/cita/${id}/iniciar`, {}, getAuthHeaders()).then(r => r.data);
};

// Tutor termina la cita (requiere código del estudiante)
const terminarCita = (id, codigo) => {
    return axios.patch(`${API_URL}/cita/${id}/terminar`, { codigo }, getAuthHeaders()).then(r => r.data);
};

// Cancelar la cita (tutor o estudiante)
const cancelarCita = (id) => {
    return axios.patch(`${API_URL}/cita/${id}/cancelar`, {}, getAuthHeaders()).then(r => r.data);
};

// Estudiante califica al tutor
const calificarCita = (id, calificacion, comentario) => {
    return axios.patch(`${API_URL}/cita/${id}/calificar`, { calificacion, comentario }, getAuthHeaders()).then(r => r.data);
};

// Buscar tutores
const buscarTutores = (params = {}) => {
    return axios.get(`${API_URL}/user/search`, { ...getAuthHeaders(), params }).then(r => r.data);
};

// Sugerencias de tutores
const getSugerenciasTutores = (limit = 10) => {
    return axios.get(`${API_URL}/user/suggestions`, { ...getAuthHeaders(), params: { limit } }).then(r => r.data);
};

// Obtener perfil de un tutor
const getTutorPerfil = (id) => {
    return axios.get(`${API_URL}/user/${id}`, getAuthHeaders()).then(r => r.data);
};

// Obtener transacciones del usuario autenticado
const getMisTransacciones = () => {
    return axios.get(`${API_URL}/user/transacciones`, getAuthHeaders()).then(r => r.data);
};

// Obtener perfil del usuario autenticado
const getMiPerfil = () => {
    return axios.get(`${API_URL}/auth/me`, getAuthHeaders()).then(r => r.data);
};

// ——— Especialidades ———

// Obtener todas las especialidades
const getEspecialidades = () => {
    return axios.get(`${API_URL}/especialidad`, getAuthHeaders()).then(r => r.data);
};

// Crear una nueva especialidad
const crearEspecialidad = (detalleEspecialidad) => {
    return axios.post(`${API_URL}/especialidad`, { detalleEspecialidad }, getAuthHeaders()).then(r => r.data);
};

// El usuario se asigna a especialidades
const asignarMisEspecialidades = (especialidadesIds) => {
    return axios.post(`${API_URL}/user/me/especialidades`, { especialidadesIds }, getAuthHeaders()).then(r => r.data);
};

// El usuario se desasigna de especialidades
const desasignarMisEspecialidades = (especialidadesIds) => {
    return axios.delete(`${API_URL}/user/me/especialidades`, {
        ...getAuthHeaders(),
        data: { especialidadesIds },
    }).then(r => r.data);
};

// ——— Endpoints Administrativos ———

// Obtener todos los usuarios
const getUsers = () => {
    return axios.get(`${API_URL}/user`, getAuthHeaders()).then(r => r.data);
};

// Actualizar usuario (admin o dueño)
const updateUser = (id, data) => {
    return axios.patch(`${API_URL}/user/${id}`, data, getAuthHeaders()).then(r => r.data);
};

// Eliminar usuario
const deleteUser = (id) => {
    return axios.delete(`${API_URL}/user/${id}`, getAuthHeaders()).then(r => r.data);
};

// Crear materia
const crearMateria = (detalleMateria) => {
    return axios.post(`${API_URL}/materia`, { detalleMateria }, getAuthHeaders()).then(r => r.data);
};

// Actualizar materia
const updateMateria = (id, detalleMateria) => {
    return axios.patch(`${API_URL}/materia/${id}`, { detalleMateria }, getAuthHeaders()).then(r => r.data);
};

// Eliminar materia
const deleteMateria = (id) => {
    return axios.delete(`${API_URL}/materia/${id}`, getAuthHeaders()).then(r => r.data);
};

// Actualizar especialidad
const updateEspecialidad = (id, detalleEspecialidad) => {
    return axios.patch(`${API_URL}/especialidad/${id}`, { detalleEspecialidad }, getAuthHeaders()).then(r => r.data);
};

// Eliminar especialidad
const deleteEspecialidad = (id) => {
    return axios.delete(`${API_URL}/especialidad/${id}`, getAuthHeaders()).then(r => r.data);
};

// Asignar materias a especialidad
const asignarMateriasEspecialidad = (idEspecialidad, materiasIds) => {
    return axios.post(`${API_URL}/especialidad/asignar-materias/${idEspecialidad}`, { materiasIds }, getAuthHeaders()).then(r => r.data);
};

// Desasignar materias de especialidad
const desasignarMateriasEspecialidad = (idEspecialidad, materiasIds) => {
    return axios.delete(`${API_URL}/especialidad/desasignar-materias/${idEspecialidad}`, {
        ...getAuthHeaders(),
        data: { materiasIds },
    }).then(r => r.data);
};

// Guardar materias que enseña el usuario logueado
const updateMisMaterias = (materiaIds) => {
    return axios.patch(`${API_URL}/user/me/materias`, { materiaIds }, getAuthHeaders()).then(r => r.data);
};

// Solicitar nueva materia
const solicitarMateria = (detalleMateria, especialidadId) => {
    return axios.post(`${API_URL}/materia/solicitar`, { detalleMateria, especialidadId }, getAuthHeaders()).then(r => r.data);
};

// Obtener todas las solicitudes de materias
const getSolicitudesMaterias = () => {
    return axios.get(`${API_URL}/materia/solicitudes`, getAuthHeaders()).then(r => r.data);
};

// Responder solicitud de materia (aprobar/rechazar)
const responderSolicitudMateria = (id, estado) => {
    return axios.patch(`${API_URL}/materia/solicitudes/${id}/responder`, { estado }, getAuthHeaders()).then(r => r.data);
};

// Obtener reportes sociales consolidados (sólo admin)
const getReportesSociales = () => {
    return axios.get(`${API_URL}/cita/admin/reportes`, getAuthHeaders()).then(r => r.data);
};

// ——— Chats y Mensajes ———
const getConversaciones = () => {
    return axios.get(`${API_URL}/mensajes/conversaciones`, getAuthHeaders()).then(r => r.data);
};

const getConversacionMensajes = (conversacionId) => {
    return axios.get(`${API_URL}/mensajes/conversacion/${conversacionId}`, getAuthHeaders()).then(r => r.data);
};

const iniciarConversacion = (tutorId, materiaId) => {
    return axios.post(`${API_URL}/mensajes/conversacion`, { tutorId, materiaId }, getAuthHeaders()).then(r => r.data);
};

const enviarMensajeHTTP = (conversacionId, detalleMensaje) => {
    return axios.post(`${API_URL}/mensajes`, { conversacionId, detalleMensaje }, getAuthHeaders()).then(r => r.data);
};

export {
    getMisCitas,
    getCitaById,
    crearCita,
    responderCita,
    iniciarCita,
    terminarCita,
    cancelarCita,
    calificarCita,
    buscarTutores,
    getSugerenciasTutores,
    getTutorPerfil,
    getMisTransacciones,
    getMiPerfil,
    getEspecialidades,
    crearEspecialidad,
    asignarMisEspecialidades,
    desasignarMisEspecialidades,
    // Admin API
    getUsers,
    updateUser,
    deleteUser,
    crearMateria,
    updateMateria,
    deleteMateria,
    updateEspecialidad,
    deleteEspecialidad,
    asignarMateriasEspecialidad,
    desasignarMateriasEspecialidad,
    // Nuevos
    updateMisMaterias,
    solicitarMateria,
    getSolicitudesMaterias,
    responderSolicitudMateria,
    getReportesSociales,
    // Chats
    getConversaciones,
    getConversacionMensajes,
    iniciarConversacion,
    enviarMensajeHTTP,
};

