import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { crearCita, getTutorPerfil } from '../../../../services/CitaService';

export const useCrearCita = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tutorIdParam = searchParams.get('tutorId');

    const [tutor, setTutor] = useState(null);
    const [loadingTutor, setLoadingTutor] = useState(false);

    const [form, setForm] = useState({
        tutorId: tutorIdParam || '',
        fechaHoraInicio: '',
        fechaHoraFin: '',
        descripcion: '',
        latitud: '',
        longitud: '',
    });
    const [mapPos, setMapPos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (tutorIdParam) {
            setLoadingTutor(true);
            getTutorPerfil(tutorIdParam)
                .then(data => setTutor(data))
                .catch(() => setTutor(null))
                .finally(() => setLoadingTutor(false));
        }
    }, [tutorIdParam]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleMapClick = (latlng) => {
        setMapPos(latlng);
        setForm(prev => ({
            ...prev,
            latitud: latlng.lat.toFixed(6),
            longitud: latlng.lng.toFixed(6),
        }));
    };

    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            setError('La geolocalización no está disponible en este dispositivo.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                handleMapClick(latlng);
            },
            () => setError('No se pudo obtener tu ubicación.')
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.tutorId) { setError('Debes seleccionar un tutor'); return; }
        if (!form.latitud || !form.longitud) { setError('Debes seleccionar una ubicación en el mapa'); return; }
        if (new Date(form.fechaHoraInicio) >= new Date(form.fechaHoraFin)) {
            setError('La hora de inicio debe ser antes de la hora de fin');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await crearCita({
                tutorId: Number(form.tutorId),
                fechaHoraInicio: form.fechaHoraInicio,
                fechaHoraFin: form.fechaHoraFin,
                descripcion: form.descripcion,
                latitud: form.latitud,
                longitud: form.longitud,
            });
            setSuccess(true);
            setTimeout(() => navigate('/user/mis-citas'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear la cita');
        } finally {
            setLoading(false);
        }
    };

    // Mínimo de fecha = ahora
    const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

    return {
        tutor,
        loadingTutor,
        form,
        mapPos,
        loading,
        error,
        success,
        minDateTime,
        handleChange,
        handleMapClick,
        handleGeolocate,
        handleSubmit,
    };
};
