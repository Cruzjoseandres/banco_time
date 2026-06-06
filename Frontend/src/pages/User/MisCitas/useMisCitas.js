import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisCitas, responderCita, iniciarCita, terminarCita, cancelarCita, getConversaciones, iniciarConversacion } from '../../../../services/CitaService';
import { getUserInfo } from '../../../../utils/TokenUtilities';
import { subscribeCitaNotificaciones, getSocket } from '../../../../services/SocketService';

const formatNotificacionMensaje = (notif, currentUserId) => {
    if (!notif) return '';
    if (typeof notif === 'string') return notif;
    if (notif.mensaje) return notif.mensaje;
    
    const { type, data } = notif;
    if (!type || !data) return 'Actualización de cita recibida';
    
    const isTutor = Number(data.tutor?.id) === Number(currentUserId);
    const materiaNombre = data.materia?.detalleMateria || 'Tutoría';
    const contraparteNombre = isTutor 
        ? (data.estudiante?.fullName || 'un estudiante')
        : (data.tutor?.fullName || 'un tutor');

    switch (type) {
        case 'creada':
            return isTutor
                ? `Nueva solicitud de tutoría para "${materiaNombre}" recibida de ${contraparteNombre}`
                : `Solicitud de tutoría para "${materiaNombre}" enviada a ${contraparteNombre}`;
        case 'aceptada':
            return isTutor
                ? `Has aceptado la tutoría para "${materiaNombre}" con ${contraparteNombre}`
                : `Tu solicitud de tutoría para "${materiaNombre}" ha sido aceptada por ${contraparteNombre}`;
        case 'rechazada':
            return isTutor
                ? `Has rechazado la tutoría para "${materiaNombre}" con ${contraparteNombre}`
                : `Tu solicitud de tutoría para "${materiaNombre}" ha sido rechazada por ${contraparteNombre}`;
        case 'iniciada':
            return isTutor
                ? `Has iniciado la tutoría para "${materiaNombre}" con ${contraparteNombre}`
                : `La tutoría para "${materiaNombre}" con ${contraparteNombre} ha iniciado`;
        case 'finalizada':
            return isTutor
                ? `Has finalizado la tutoría para "${materiaNombre}" con ${contraparteNombre}`
                : `La tutoría para "${materiaNombre}" con ${contraparteNombre} ha finalizado. ¡No olvides calificar!`;
        case 'cancelada':
            return `La tutoría para "${materiaNombre}" ha sido cancelada`;
        case 'expirada':
            return `La solicitud de tutoría para "${materiaNombre}" ha expirado`;
        default:
            return `Actualización en tutoría de "${materiaNombre}"`;
    }
};

export const useMisCitas = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notificacion, setNotificacion] = useState(null);
    const [accionLoading, setAccionLoading] = useState(null);

    // Modal para terminar cita (requiere código)
    const [modalTerminar, setModalTerminar] = useState({ show: false, citaId: null });
    const [codigoInput, setCodigoInput] = useState('');
    const [codigoError, setCodigoError] = useState('');

    // Modal para calificar
    const [modalCalificar, setModalCalificar] = useState({ show: false, cita: null });

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

    const navigate = useNavigate();
    const userInfo = getUserInfo();

    const cargarCitas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getMisCitas();
            setCitas(data);
        } catch (err) {
            console.error('Error cargando citas:', err);
            setError('No se pudieron cargar las citas. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarCitas();
        getSocket(); // Asegurar conexión

        // Escuchar notificaciones en tiempo real
        const unsub = subscribeCitaNotificaciones((notif) => {
            const currentUserId = getUserInfo()?.id;
            const msg = formatNotificacionMensaje(notif, currentUserId);
            setNotificacion({ ...notif, mensaje: msg });
            cargarCitas(); // Recargar lista
            setTimeout(() => setNotificacion(null), 5000);
        });

        return () => unsub();
    }, [cargarCitas]);

    const handleResponder = (citaId, estado) => {
        const accion = estado === 'aceptada' ? 'aceptar' : 'rechazar';
        mostrarConfirm(
            `¿${accion.toUpperCase()} TUTORÍA?`,
            `¿Confirmas que deseas ${accion} esta solicitud de tutoría?`,
            async () => {
                try {
                    setAccionLoading(`responder-${citaId}`);
                    await responderCita(citaId, estado);
                    await cargarCitas();
                } catch (err) {
                    mostrarAlert('Error', err.response?.data?.message || 'Error al responder la cita', 'danger');
                } finally {
                    setAccionLoading(null);
                }
            },
            estado === 'aceptada' ? 'Aceptar Tutoría' : 'Rechazar',
            estado === 'aceptada' ? 'success' : 'danger'
        );
    };

    const handleIniciar = async (citaId) => {
        try {
            setAccionLoading(`iniciar-${citaId}`);
            await iniciarCita(citaId);
            await cargarCitas();
        } catch (err) {
            mostrarAlert('Error', err.response?.data?.message || 'Error al iniciar la cita', 'danger');
        } finally {
            setAccionLoading(null);
        }
    };

    const handleAbrirTerminar = (citaId) => {
        setCodigoInput('');
        setCodigoError('');
        setModalTerminar({ show: true, citaId });
    };

    const handleConfirmarTerminar = async () => {
        if (!codigoInput.trim()) {
            setCodigoError('El código es obligatorio');
            return;
        }
        try {
            setAccionLoading(`terminar-${modalTerminar.citaId}`);
            await terminarCita(modalTerminar.citaId, codigoInput.trim());
            setModalTerminar({ show: false, citaId: null });
            await cargarCitas();
        } catch (err) {
            setCodigoError(err.response?.data?.message || 'Código incorrecto');
        } finally {
            setAccionLoading(null);
        }
    };

    const handleCancelar = (citaId) => {
        mostrarConfirm(
            '¿Cancelar Tutoría?',
            '¿Estás seguro de que deseas cancelar esta tutoría? Se aplicará una penalización a tu promedio de calificación si ya estaba aceptada.',
            async () => {
                try {
                    setAccionLoading(`cancelar-${citaId}`);
                    await cancelarCita(citaId);
                    await cargarCitas();
                } catch (err) {
                    mostrarAlert('Error', err.response?.data?.message || 'Error al cancelar la cita', 'danger');
                } finally {
                    setAccionLoading(null);
                }
            },
            'Cancelar Tutoría',
            'danger'
        );
    };

    const handleVerChat = async (cita) => {
        try {
            if (!cita.materia) {
                mostrarAlert('Materia requerida', 'Esta tutoría no tiene una materia asignada.', 'warning');
                return;
            }
            const convs = await getConversaciones();
            const conv = convs.find(c => 
                c.materia?.id === cita.materia?.id &&
                ((c.estudiante?.id === cita.estudiante?.id && c.tutor?.id === cita.tutor?.id) ||
                 (c.estudiante?.id === cita.tutor?.id && c.tutor?.id === cita.estudiante?.id))
            );
            if (conv) {
                navigate(`/user/conversacion/${conv.id}`);
            } else {
                if (cita.estudiante?.id === userInfo?.id) {
                    const nuevaConv = await iniciarConversacion(cita.tutor.id, cita.materia.id);
                    navigate(`/user/conversacion/${nuevaConv.id}`);
                } else {
                    mostrarAlert('Chat no disponible', 'No se encontró una conversación activa para esta tutoría.', 'warning');
                }
            }
        } catch (err) {
            console.error('Error al abrir el chat:', err);
            mostrarAlert('Error', 'Error al abrir el chat.', 'danger');
        }
    };
    const handleCalificar = (cita) => setModalCalificar({ show: true, cita });
    const handleCloseCalificar = () => setModalCalificar({ show: false, cita: null });
    const handleCitaCalificada = () => {
        setModalCalificar({ show: false, cita: null });
        cargarCitas();
    };

    const estutor = (cita) => cita.tutor?.id === userInfo?.id;
    const esEstudiante = (cita) => cita.estudiante?.id === userInfo?.id;

    const getEstadoVariant = (estado) => {
        const map = {
            pendiente: 'warning',
            aceptada: 'success',
            rechazada: 'danger',
            en_curso: 'primary',
            terminada: 'secondary',
            cancelada: 'dark',
            expirada: 'light',
        };
        return map[estado] || 'secondary';
    };

    const getEstadoLabel = (estado) => {
        const map = {
            pendiente: 'Pendiente',
            aceptada: 'Aceptada',
            rechazada: 'Rechazada',
            en_curso: 'En Curso',
            terminada: 'Terminada',
            cancelada: 'Cancelada',
            expirada: 'Expirada',
        };
        return map[estado] || estado;
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return {
        citas,
        loading,
        error,
        notificacion,
        accionLoading,
        modalTerminar,
        codigoInput,
        setCodigoInput,
        codigoError,
        modalCalificar,
        userInfo,
        handleResponder,
        handleIniciar,
        handleAbrirTerminar,
        handleConfirmarTerminar,
        handleCancelar,
        handleVerChat,
        handleCalificar,
        handleCloseCalificar,
        handleCitaCalificada,
        // Confirm Modal
        confirmModal,
        setConfirmModal,
        mostrarAlert,
        estutor,
        esEstudiante,
        getEstadoVariant,
        getEstadoLabel,
        formatFecha,
        setModalTerminar,
        cargarCitas,
    };
};
