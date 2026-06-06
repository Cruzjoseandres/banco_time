import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getTutorPerfil, iniciarConversacion } from '../../../../services/CitaService';
import { getUserInfo } from '../../../../utils/TokenUtilities';

export const usePerfilTutor = () => {
    const { tutorId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const materiaId = searchParams.get('materiaId');

    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const userInfo = getUserInfo();
    const esMiPerfil = userInfo && Number(userInfo.id) === Number(tutorId);

    useEffect(() => {
        getTutorPerfil(tutorId)
            .then(data => setTutor(data))
            .catch(() => setError('No se pudo cargar el perfil del tutor'))
            .finally(() => setLoading(false));
    }, [tutorId]);

    const handleIniciarConversacion = async () => {
        try {
            const selectedMateriaId = materiaId || tutor?.materias?.[0]?.id;
            if (!selectedMateriaId) {
                mostrarAlert('Materia requerida', 'Este tutor no tiene materias asignadas.', 'warning');
                return;
            }
            const conv = await iniciarConversacion(Number(tutorId), Number(selectedMateriaId));
            navigate(`/user/conversacion/${conv.id}`);
        } catch (err) {
            console.error(err);
            mostrarAlert('Error', err.response?.data?.message || 'Error al iniciar la conversación', 'danger');
        }
    };

    const handleVolver = () => navigate('/user/buscar-tutores');

    const renderEstrellas = (promedio) => {
        if (!promedio) return '☆☆☆☆☆';
        const full = Math.round(promedio);
        return '★'.repeat(full) + '☆'.repeat(5 - full);
    };

    return { 
        tutor, 
        loading, 
        error, 
        handleIniciarConversacion, 
        handleVolver, 
        renderEstrellas, 
        esMiPerfil,
        // Confirm Modal
        confirmModal,
        setConfirmModal,
    };
};
