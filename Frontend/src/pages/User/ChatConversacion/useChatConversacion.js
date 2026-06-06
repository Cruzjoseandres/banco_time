import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getConversaciones,
    getConversacionMensajes,
    getMisCitas,
    crearCita,
    responderCita,
    iniciarCita,
    terminarCita,
    cancelarCita,
} from '../../../../services/CitaService';
import { getSocket } from '../../../../services/SocketService';
import { getUserInfo } from '../../../../utils/TokenUtilities';

export const useChatConversacion = () => {
    const { conversacionId } = useParams();
    const navigate = useNavigate();
    const userInfo = getUserInfo();

    const [conversacion, setConversacion] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [citas, setCitas] = useState([]);
    const [texto, setTexto] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal de agendamiento
    const [showAgendarModal, setShowAgendarModal] = useState(false);
    const [agendarForm, setAgendarForm] = useState({
        fecha: '',
        horaInicio: '',
        horaFin: '',
        descripcion: '',
        latitud: '',
        longitud: '',
    });
    const [agendarError, setAgendarError] = useState('');
    const [agendarLoading, setAgendarLoading] = useState(false);

    // Modal de terminar cita
    const [showTerminarModal, setShowTerminarModal] = useState(false);
    const [codigoInput, setCodigoInput] = useState('');
    const [codigoError, setCodigoError] = useState('');
    const [terminarLoading, setTerminarLoading] = useState(false);

    // Modal de calificar cita
    const [showCalificarModal, setShowCalificarModal] = useState(false);

    // Modal de confirmación y alertas personalizado
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        body: '',
        confirmText: 'Aceptar',
        confirmVariant: 'primary',
        showCancel: false,
        onConfirm: null
    });

    const mostrarAlert = (title, body, variant = 'primary') => {
        setConfirmModal({
            show: true,
            title,
            body,
            confirmText: 'Aceptar',
            confirmVariant: variant,
            showCancel: false,
            onConfirm: null
        });
    };

    const mostrarConfirm = (title, body, onConfirm, confirmText = 'Confirmar', variant = 'danger') => {
        setConfirmModal({
            show: true,
            title,
            body,
            confirmText,
            confirmVariant: variant,
            showCancel: true,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                onConfirm();
            }
        });
    };

    const messagesEndRef = useRef(null);

    // Cargar metadatos, mensajes y citas
    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [todasConvs, historicoMensajes, todasCitas] = await Promise.all([
                getConversaciones(),
                getConversacionMensajes(Number(conversacionId)),
                getMisCitas(),
            ]);

            const currentConv = todasConvs.find(c => c.id === Number(conversacionId));
            if (!currentConv) {
                setError('Conversación no encontrada.');
                return;
            }

            setConversacion(currentConv);
            setMensajes(historicoMensajes);
            setCitas(todasCitas);
        } catch (err) {
            console.error(err);
            setError('Error al cargar la conversación.');
        } finally {
            setLoading(false);
        }
    }, [conversacionId]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // WebSocket - Escucha de eventos
    useEffect(() => {
        if (!conversacionId) return;

        const socket = getSocket();

        // Unirse a la sala de la conversación
        socket.emit('joinRoom', { conversacionId: Number(conversacionId) });

        const handleNewMessage = (msg) => {
            if (msg.conversacionId && Number(msg.conversacionId) !== Number(conversacionId)) return;
            setMensajes(prev => {
                // Evitar duplicados si por algún motivo se recibe el mismo
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        };

        const handleCitaNotificacion = (notif) => {
            console.log('[Socket] Cita notificación recibida:', notif);
            cargarDatos();
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('cita_notificacion', handleCitaNotificacion);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('cita_notificacion', handleCitaNotificacion);
        };
    }, [conversacionId, cargarDatos]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    const handleEnviar = (e) => {
        e?.preventDefault();
        const contenido = texto.trim();
        if (!contenido) return;

        const socket = getSocket();
        socket.emit('sendMessage', {
            emisorId: userInfo.id,
            conversacionId: Number(conversacionId),
            detalleMensaje: contenido,
        });

        setTexto('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnviar();
        }
    };

    const esMio = (msg) => msg.emisor?.id === userInfo?.id;

    const formatHora = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const getOtroUsuario = () => {
        if (!conversacion) return null;
        return conversacion.tutor.id === userInfo?.id ? conversacion.estudiante : conversacion.tutor;
    };

    const soyTutor = () => {
        return conversacion?.tutor?.id === userInfo?.id;
    };

    const soyEstudiante = () => {
        return conversacion?.estudiante?.id === userInfo?.id;
    };

    // Filtrar la cita activa vinculada a esta materia y participantes
    const getCitaActiva = () => {
        if (!conversacion) return null;
        return citas.find(c => 
            c.materia?.id === conversacion.materia?.id &&
            ((c.estudiante?.id === conversacion.estudiante.id && c.tutor?.id === conversacion.tutor.id) ||
             (c.estudiante?.id === conversacion.tutor.id && c.tutor?.id === conversacion.estudiante.id)) &&
            ['pendiente', 'aceptada', 'iniciada', 'en_curso', 'finalizada'].includes(c.estado) &&
            !(c.estado === 'finalizada' && c.calificacion) // Excluir si ya fue calificada
        );
    };

    const citaActiva = getCitaActiva();

    // Acciones de Cita
    const handleCrearCitaSubmit = async (e) => {
        e.preventDefault();
        if (!agendarForm.fecha || !agendarForm.horaInicio || !agendarForm.horaFin) {
            setAgendarError('Debes ingresar la fecha y las horas de inicio y fin.');
            return;
        }

        const fechaHoraInicio = `${agendarForm.fecha}T${agendarForm.horaInicio}`;
        const fechaHoraFin = `${agendarForm.fecha}T${agendarForm.horaFin}`;

        if (new Date(fechaHoraInicio) >= new Date(fechaHoraFin)) {
            setAgendarError('La hora de inicio debe ser anterior a la de fin.');
            return;
        }
        if (!agendarForm.latitud || !agendarForm.longitud) {
            setAgendarError('Por favor selecciona una ubicación en el mapa.');
            return;
        }

        try {
            setAgendarLoading(true);
            setAgendarError('');
            await crearCita({
                tutorId: conversacion.tutor.id,
                materiaId: conversacion.materia.id,
                fechaHoraInicio,
                fechaHoraFin,
                descripcion: agendarForm.descripcion,
                latitud: agendarForm.latitud,
                longitud: agendarForm.longitud,
            });
            setShowAgendarModal(false);
            setAgendarForm({
                fecha: '',
                horaInicio: '',
                horaFin: '',
                descripcion: '',
                latitud: '',
                longitud: '',
            });
            // Recargar citas
            const updatedCitas = await getMisCitas();
            setCitas(updatedCitas);
        } catch (err) {
            console.error(err);
            setAgendarError(err.response?.data?.message || 'Error al solicitar la tutoría.');
        } finally {
            setAgendarLoading(false);
        }
    };

    const handleResponderCita = async (estado) => {
        if (!citaActiva) return;
        try {
            await responderCita(citaActiva.id, estado);
            const updatedCitas = await getMisCitas();
            setCitas(updatedCitas);
        } catch (err) {
            console.error(err);
            mostrarAlert('Error', err.response?.data?.message || 'Error al responder a la tutoría.', 'danger');
        }
    };

    const handleIniciarCita = async () => {
        if (!citaActiva) return;
        try {
            await iniciarCita(citaActiva.id);
            const updatedCitas = await getMisCitas();
            setCitas(updatedCitas);
        } catch (err) {
            console.error(err);
            mostrarAlert('Error', err.response?.data?.message || 'Error al iniciar la tutoría.', 'danger');
        }
    };

    const handleConfirmarTerminarCita = async (e) => {
        e?.preventDefault();
        if (!codigoInput.trim()) {
            setCodigoError('Debes ingresar el código de confirmación.');
            return;
        }
        try {
            setTerminarLoading(true);
            setCodigoError('');
            await terminarCita(citaActiva.id, codigoInput.trim());
            setShowTerminarModal(false);
            setCodigoInput('');
            const updatedCitas = await getMisCitas();
            setCitas(updatedCitas);
        } catch (err) {
            console.error(err);
            setCodigoError(err.response?.data?.message || 'Error al terminar la tutoría.');
        } finally {
            setTerminarLoading(false);
        }
    };

    const handleCancelarCita = async () => {
        if (!citaActiva) return;
        mostrarConfirm(
            '¿Cancelar Tutoría?',
            '¿Estás seguro de que deseas cancelar esta tutoría? Si ya fue aceptada, se aplicará una penalización.',
            async () => {
                try {
                    await cancelarCita(citaActiva.id);
                    const updatedCitas = await getMisCitas();
                    setCitas(updatedCitas);
                } catch (err) {
                    console.error(err);
                    mostrarAlert('Error', err.response?.data?.message || 'Error al cancelar la tutoría.', 'danger');
                }
            },
            'Cancelar Tutoría',
            'danger'
        );
    };

    const handleCitaCalificada = async () => {
        setShowCalificarModal(false);
        const updatedCitas = await getMisCitas();
        setCitas(updatedCitas);
    };

    return {
        conversacion,
        mensajes,
        texto,
        setTexto,
        loading,
        error,
        messagesEndRef,
        userInfo,
        getOtroUsuario,
        esMio,
        formatHora,
        handleEnviar,
        handleKeyDown,
        soyTutor,
        soyEstudiante,
        // Cita activa
        citaActiva,
        // Agendar Modal
        showAgendarModal,
        setShowAgendarModal,
        agendarForm,
        setAgendarForm,
        agendarError,
        setAgendarError,
        agendarLoading,
        handleCrearCitaSubmit,
        // Responder/Iniciar/Cancelar
        handleResponderCita,
        handleIniciarCita,
        handleCancelarCita,
        // Terminar Modal
        showTerminarModal,
        setShowTerminarModal,
        codigoInput,
        setCodigoInput,
        codigoError,
        setCodigoError,
        terminarLoading,
        handleConfirmarTerminarCita,
        // Calificar Modal
        showCalificarModal,
        setShowCalificarModal,
        handleCitaCalificada,
        // Confirm Modal
        confirmModal,
        setConfirmModal,
        mostrarAlert,
    };
};
