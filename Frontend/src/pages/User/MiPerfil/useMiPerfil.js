import { useState, useEffect, useCallback } from 'react';
import {
    getMiPerfil,
    getMisTransacciones,
    getEspecialidades,
    crearEspecialidad,
    asignarMisEspecialidades,
    desasignarMisEspecialidades,
    updateMisMaterias,
    solicitarMateria,
} from '../../../../services/CitaService';

export const useMiPerfil = () => {
    const [perfil, setPerfil] = useState(null);
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabActiva, setTabActiva] = useState('perfil');

    // Especialidades
    const [todasEspecialidades, setTodasEspecialidades] = useState([]);
    const [loadingEsp, setLoadingEsp] = useState(false);
    const [nuevaEsp, setNuevaEsp] = useState('');
    const [espError, setEspError] = useState('');
    const [espSuccess, setEspSuccess] = useState('');

    // Materias solicitadas
    const [materiaSolicitando, setMateriaSolicitando] = useState({}); // { [espId]: '' }
    
    // Custom Confirmation Modal state
    const [confirmData, setConfirmData] = useState({
        show: false,
        title: '',
        body: '',
        onConfirm: null
    });

    const cargarPerfil = useCallback(async () => {
        try {
            setLoading(true);
            const [perfilData, transData] = await Promise.all([
                getMiPerfil(),
                getMisTransacciones(),
            ]);
            setPerfil(perfilData);
            setTransacciones(transData);
        } catch (err) {
            setError('Error al cargar el perfil');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const cargarEspecialidades = useCallback(async () => {
        try {
            const data = await getEspecialidades();
            setTodasEspecialidades(data);
        } catch {
            // silencioso
        }
    }, []);

    useEffect(() => {
        cargarPerfil();
    }, [cargarPerfil]);

    // Cargar todas las especialidades cuando abre la pestaña
    useEffect(() => {
        if (tabActiva === 'especialidades') {
            cargarEspecialidades();
        }
    }, [tabActiva, cargarEspecialidades]);

    const misEspIds = perfil?.especialidades?.map(e => e.id) || [];
    const misMateriaIds = perfil?.materias?.map(m => m.id) || [];

    // Toggle de Especialidad (con confirmación al remover)
    const handleToggleEspecialidad = async (esp) => {
        setEspError('');
        setEspSuccess('');
        const tieneAsignada = misEspIds.includes(esp.id);
        
        if (tieneAsignada) {
            // Confirmación antes de eliminar especialidad
            setConfirmData({
                show: true,
                title: 'Desasignar Especialidad',
                body: `¿Estás seguro de que deseas quitar la especialidad "${esp.detalleEspecialidad}"? También se desasignarán las materias asociadas.`,
                confirmVariant: 'danger',
                confirmText: 'Desasignar',
                onConfirm: async () => {
                    setConfirmData(prev => ({ ...prev, show: false }));
                    try {
                        setLoadingEsp(true);
                        // Desasignamos la especialidad
                        await desasignarMisEspecialidades([esp.id]);
                        
                        // Opcionalmente remover materias vinculadas a esta especialidad
                        const materiasAEliminar = perfil.materias?.filter(m => 
                            esp.materias?.some(em => em.id === m.id)
                        ).map(m => m.id) || [];
                        
                        if (materiasAEliminar.length > 0) {
                            const nuevasMaterias = misMateriaIds.filter(id => !materiasAEliminar.includes(id));
                            await updateMisMaterias(nuevasMaterias);
                        }

                        setEspSuccess(`Especialidad "${esp.detalleEspecialidad}" eliminada.`);
                        await cargarPerfil();
                        setTimeout(() => setEspSuccess(''), 3000);
                    } catch (err) {
                        setEspError(err.response?.data?.message || 'Error al desasignar especialidad');
                    } finally {
                        setLoadingEsp(false);
                    }
                }
            });
        } else {
            // Asignación directa (sin confirmación)
            try {
                setLoadingEsp(true);
                await asignarMisEspecialidades([esp.id]);
                setEspSuccess(`Especialidad "${esp.detalleEspecialidad}" agregada.`);
                await cargarPerfil();
                setTimeout(() => setEspSuccess(''), 3000);
            } catch (err) {
                setEspError(err.response?.data?.message || 'Error al asignar especialidad');
            } finally {
                setLoadingEsp(false);
            }
        }
    };

    const handleCrearEspecialidad = async (e) => {
        e.preventDefault();
        if (!nuevaEsp.trim()) return;
        setEspError('');
        setEspSuccess('');
        try {
            setLoadingEsp(true);
            const created = await crearEspecialidad(nuevaEsp.trim());
            // Asignarla inmediatamente
            await asignarMisEspecialidades([created.id]);
            setNuevaEsp('');
            setEspSuccess(`Especialidad "${created.detalleEspecialidad}" creada y agregada a tu perfil.`);
            await Promise.all([cargarPerfil(), cargarEspecialidades()]);
            setTimeout(() => setEspSuccess(''), 4000);
        } catch (err) {
            setEspError(err.response?.data?.message || 'Error al crear la especialidad');
        } finally {
            setLoadingEsp(false);
        }
    };

    // --- AUTOGESTIÓN DE MATERIAS ---
    const handleToggleMateria = async (materiaId) => {
        setEspError('');
        setEspSuccess('');
        const tieneAsignada = misMateriaIds.includes(materiaId);
        const nuevasMaterias = tieneAsignada
            ? misMateriaIds.filter(id => id !== materiaId)
            : [...misMateriaIds, materiaId];

        try {
            setLoadingEsp(true);
            await updateMisMaterias(nuevasMaterias);
            setEspSuccess(tieneAsignada ? 'Materia quitada de tu perfil.' : 'Materia agregada a tu perfil.');
            await cargarPerfil();
            setTimeout(() => setEspSuccess(''), 3000);
        } catch (err) {
            setEspError(err.response?.data?.message || 'Error al actualizar materias');
        } finally {
            setLoadingEsp(false);
        }
    };

    // --- SOLICITAR MATERIA PARA ESPECIALIDAD ---
    const handleSolicitarMateria = async (e, especialidadId) => {
        e.preventDefault();
        const text = materiaSolicitando[especialidadId] || '';
        if (!text.trim()) return;
        setEspError('');
        setEspSuccess('');
        try {
            setLoadingEsp(true);
            await solicitarMateria(text.trim(), especialidadId);
            setMateriaSolicitando(prev => ({ ...prev, [especialidadId]: '' }));
            setEspSuccess(`Solicitud para agregar "${text.trim()}" enviada al administrador.`);
            setTimeout(() => setEspSuccess(''), 4000);
        } catch (err) {
            setEspError(err.response?.data?.message || 'Error al enviar solicitud de materia');
        } finally {
            setLoadingEsp(false);
        }
    };

    // Utilidades de visualización
    const getTipoIcon = (tipo) => {
        const map = {
            debito: '💸',
            credito: '💰',
            cobro: '💸', pago: '💰', reembolso: '↩️',
            bonificacion: '🎁', penalizacion: '⚠️',
        };
        return map[tipo] || '💳';
    };

    const getTipoColor = (tipo) => {
        if (['credito', 'pago', 'reembolso', 'bonificacion'].includes(tipo)) return '#10b981';
        if (['debito', 'cobro', 'penalizacion'].includes(tipo)) return '#ef4444';
        return '#6b7280';
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const renderEstrellas = (promedio) => {
        if (!promedio) return 'Sin calificaciones';
        const full = Math.round(promedio);
        return '★'.repeat(full) + '☆'.repeat(5 - full);
    };

    return {
        perfil,
        transacciones,
        loading,
        error,
        tabActiva,
        setTabActiva,
        // Especialidades
        todasEspecialidades,
        misEspIds,
        loadingEsp,
        nuevaEsp,
        setNuevaEsp,
        espError,
        espSuccess,
        handleToggleEspecialidad,
        handleCrearEspecialidad,
        // Materias
        misMateriaIds,
        handleToggleMateria,
        materiaSolicitando,
        setMateriaSolicitando,
        handleSolicitarMateria,
        // Modal confirmación
        confirmData,
        setConfirmData,
        // Utilidades
        getTipoIcon,
        getTipoColor,
        formatFecha,
        renderEstrellas,
    };
};
