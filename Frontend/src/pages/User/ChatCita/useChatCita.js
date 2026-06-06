import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getCitaById } from '../../../../services/CitaService';
import { getUserInfo } from '../../../../utils/TokenUtilities';
import {
    getSocket,
    unirseACita,
    enviarMensaje,
    subscribeMensajes,
} from '../../../../services/SocketService';
import axios from 'axios';
import { API_URL } from '../../../../services/config';
import { getAccessToken } from '../../../../utils/TokenUtilities';

export const useChatCita = () => {
    const { citaId } = useParams();
    const [cita, setCita] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [texto, setTexto] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const userInfo = getUserInfo();

    // Cargar cita y mensajes históricos
    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            const citaData = await getCitaById(citaId);
            setCita(citaData);

            // Cargar mensajes históricos del chat
            const token = getAccessToken();
            const { data } = await axios.get(`${API_URL}/mensajes/cita/${citaId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensajes(data);
        } catch (err) {
            setError('No se pudo cargar el chat.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [citaId]);

    useEffect(() => {
        cargarDatos();

        // Unirse a la sala de socket
        getSocket();
        unirseACita(citaId);

        // Escuchar mensajes nuevos
        const unsub = subscribeMensajes((nuevoMensaje) => {
            if (nuevoMensaje.citaId == citaId) {
                setMensajes(prev => [...prev, nuevoMensaje]);
            }
        });

        return () => unsub();
    }, [citaId, cargarDatos]);

    // Auto-scroll al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    const handleEnviar = (e) => {
        e?.preventDefault();
        const contenido = texto.trim();
        if (!contenido) return;
        enviarMensaje(citaId, contenido);
        setTexto('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnviar();
        }
    };

    const esMio = (mensaje) => mensaje.emisor?.id === userInfo?.id;

    const formatHora = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    return {
        cita,
        mensajes,
        texto,
        setTexto,
        loading,
        error,
        messagesEndRef,
        userInfo,
        handleEnviar,
        handleKeyDown,
        esMio,
        formatHora,
    };
};
