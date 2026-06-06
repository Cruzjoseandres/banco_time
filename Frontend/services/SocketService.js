import { io } from 'socket.io-client';
import { getAccessToken, getUserInfo } from '../utils/TokenUtilities';
import { API_URL } from './config';

let socket = null;

/**
 * Inicializa y retorna la conexión de Socket.io.
 * Si ya existe una conexión activa, la retorna directamente.
 */
export const getSocket = () => {
    const token = getAccessToken();
    const userInfo = getUserInfo();
    const targetUserId = userInfo?.id;

    // Detectar cambio de usuario o token para recrear la conexión
    if (socket) {
        const queryUserId = socket.io?.opts?.query?.userId;
        const currentToken = socket.auth?.token;
        if (Number(queryUserId) !== Number(targetUserId) || currentToken !== token) {
            console.log('[Socket] Cerrando conexión antigua por cambio de usuario o token');
            socket.disconnect();
            socket = null;
        }
    }

    if (!socket) {
        socket = io(API_URL, {
            auth: { token },
            query: targetUserId ? { userId: targetUserId } : {},
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('[Socket] Conectado:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Desconectado:', reason);
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket] Error de conexión:', err.message);
        });
    } else if (!socket.connected) {
        socket.connect();
    }
    return socket;
};

/**
 * Desconecta el socket y limpia la instancia.
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Suscribirse a las notificaciones de citas del usuario.
 * @param {function} callback - Función que recibe la notificación
 */
export const subscribeCitaNotificaciones = (callback) => {
    const s = getSocket();
    s.on('cita_notificacion', callback);
    return () => s.off('cita_notificacion', callback);
};

/**
 * Unirse a una sala de chat de una cita específica.
 */
export const unirseACita = (citaId) => {
    const s = getSocket();
    s.emit('unirse_cita', { citaId });
};

/**
 * Enviar mensaje en el chat de una cita.
 */
export const enviarMensaje = (citaId, contenido) => {
    const s = getSocket();
    s.emit('mensaje_cita', { citaId, contenido });
};

/**
 * Suscribirse a mensajes de una sala de cita.
 */
export const subscribeMensajes = (callback) => {
    const s = getSocket();
    s.on('nuevo_mensaje', callback);
    return () => s.off('nuevo_mensaje', callback);
};
