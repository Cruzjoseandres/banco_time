import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversaciones } from '../../../../services/CitaService';
import { getUserInfo } from '../../../../utils/TokenUtilities';
import { getSocket } from '../../../../services/SocketService';

export const useChats = () => {
    const [conversaciones, setConversaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const userInfo = getUserInfo();

    const cargarChats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getConversaciones();
            setConversaciones(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar la lista de chats.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarChats();

        const socket = getSocket();

        const handleChatListaUpdate = (payload) => {
            setConversaciones(prev => {
                const convId = payload.conversacion.id;
                const index = prev.findIndex(c => c.id === convId);

                const updatedConv = {
                    ...(prev[index] || payload.conversacion),
                    ultimoMensaje: payload.mensaje,
                };

                let newList = [...prev];
                if (index !== -1) {
                    newList.splice(index, 1);
                }
                return [updatedConv, ...newList];
            });
        };

        socket.on('chat_lista_update', handleChatListaUpdate);

        return () => {
            socket.off('chat_lista_update', handleChatListaUpdate);
        };
    }, [cargarChats]);

    const handleSelectConversacion = (id) => {
        navigate(`/user/conversacion/${id}`);
    };

    const getOtroUsuario = (conv) => {
        if (!conv) return null;
        return conv.tutor.id === userInfo?.id ? conv.estudiante : conv.tutor;
    };

    const getRolEtiqueta = (conv) => {
        if (!conv) return '';
        return conv.tutor.id === userInfo?.id ? 'Estudiante' : 'Tutor';
    };

    const formatFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const d = new Date(fechaStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    return {
        conversaciones,
        loading,
        error,
        handleSelectConversacion,
        getOtroUsuario,
        getRolEtiqueta,
        formatFecha,
        cargarChats,
        userInfo,
    };
};
