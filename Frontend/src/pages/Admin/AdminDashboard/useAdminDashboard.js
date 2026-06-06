import { useState, useEffect, useCallback } from 'react';
import {
    getUsers,
    updateUser,
    deleteUser,
    getEspecialidades,
    updateEspecialidad,
    deleteEspecialidad,
    crearMateria,
    updateMateria,
    deleteMateria,
    asignarMateriasEspecialidad,
    desasignarMateriasEspecialidad,
    getSolicitudesMaterias,
    responderSolicitudMateria,
    getReportesSociales,
} from '../../../../services/CitaService';

export const useAdminDashboard = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [solicitudesMaterias, setSolicitudesMaterias] = useState([]);
    const [reportesData, setReportesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabActiva, setTabActiva] = useState('usuarios');

    // Estado para modales / edición
    const [userEditando, setUserEditando] = useState(null); // { id, fullName, role, saldoHoras }
    const [materiaEditando, setMateriaEditando] = useState(null); // { id, detalleMateria }
    const [espEditando, setEspEditando] = useState(null); // { id, detalleEspecialidad }
    const [espAsignando, setEspAsignando] = useState(null); // Especialidad a la que se le asignan materias

    // Inputs de creación
    const [nuevaMateria, setNuevaMateria] = useState('');
    const [filtroUsuario, setFiltroUsuario] = useState('');

    // Estado de acciones
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [actionError, setActionError] = useState('');

    // Custom Confirmation Modal state
    const [confirmData, setConfirmData] = useState({
        show: false,
        title: '',
        body: '',
        onConfirm: null,
        confirmVariant: 'danger',
        confirmText: 'Confirmar'
    });

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            const [usersData, materiasData, espData, solicitudesData, reportes] = await Promise.all([
                getUsers(),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/materia`).then(r => r.json()),
                getEspecialidades(),
                getSolicitudesMaterias(),
                getReportesSociales().catch(err => {
                    console.error("Error al cargar reportes:", err);
                    return null;
                })
            ]);
            setUsuarios(usersData);
            setMaterias(materiasData);
            setEspecialidades(espData);
            setSolicitudesMaterias(solicitudesData);
            setReportesData(reportes);
        } catch (err) {
            setError('Error al cargar datos administrativos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const showMessage = (msg, isError = false) => {
        if (isError) {
            setActionError(msg);
            setTimeout(() => setActionError(''), 4000);
        } else {
            setSuccessMsg(msg);
            setTimeout(() => setSuccessMsg(''), 4000);
        }
    };

    // --- CRUD USUARIOS ---
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!userEditando) return;
        try {
            setActionLoading(true);
            await updateUser(userEditando.id, {
                fullName: userEditando.fullName,
                role: userEditando.role,
                saldoHoras: Number(userEditando.saldoHoras),
            });
            showMessage('Usuario actualizado con éxito');
            setUserEditando(null);
            await cargarDatos();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Error al actualizar usuario', true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = (userId) => {
        setConfirmData({
            show: true,
            title: 'Eliminar Usuario',
            body: '¿Estás seguro de que deseas eliminar este usuario? Esta acción es irreversible y borrará sus registros de citas y transacciones.',
            confirmVariant: 'danger',
            confirmText: 'Eliminar',
            onConfirm: async () => {
                setConfirmData(prev => ({ ...prev, show: false }));
                try {
                    setActionLoading(true);
                    await deleteUser(userId);
                    showMessage('Usuario eliminado con éxito');
                    await cargarDatos();
                } catch (err) {
                    showMessage(err.response?.data?.message || 'Error al eliminar usuario', true);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    // --- CRUD MATERIAS ---
    const handleCrearMateria = async (e) => {
        e.preventDefault();
        if (!nuevaMateria.trim()) return;
        try {
            setActionLoading(true);
            await crearMateria(nuevaMateria.trim());
            showMessage(`Materia "${nuevaMateria}" creada`);
            setNuevaMateria('');
            await cargarDatos();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Error al crear materia', true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateMateria = async (e) => {
        e.preventDefault();
        if (!materiaEditando) return;
        try {
            setActionLoading(true);
            await updateMateria(materiaEditando.id, materiaEditando.detalleMateria);
            showMessage('Materia actualizada con éxito');
            setMateriaEditando(null);
            await cargarDatos();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Error al actualizar materia', true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteMateria = (materiaId) => {
        setConfirmData({
            show: true,
            title: 'Eliminar Materia',
            body: '¿Estás seguro de eliminar esta materia? Podría estar asociada a múltiples especialidades y perfiles de tutores.',
            confirmVariant: 'danger',
            confirmText: 'Eliminar',
            onConfirm: async () => {
                setConfirmData(prev => ({ ...prev, show: false }));
                try {
                    setActionLoading(true);
                    await deleteMateria(materiaId);
                    showMessage('Materia eliminada con éxito');
                    await cargarDatos();
                } catch (err) {
                    showMessage(err.response?.data?.message || 'Error al eliminar materia', true);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    // --- CRUD ESPECIALIDADES ---
    const handleUpdateEspecialidad = async (e) => {
        e.preventDefault();
        if (!espEditando) return;
        try {
            setActionLoading(true);
            await updateEspecialidad(espEditando.id, espEditando.detalleEspecialidad);
            showMessage('Especialidad actualizada con éxito');
            setEspEditando(null);
            await cargarDatos();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Error al actualizar especialidad', true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteEspecialidad = (espId) => {
        setConfirmData({
            show: true,
            title: 'Eliminar Especialidad',
            body: '¿Estás seguro de que deseas eliminar esta especialidad? Esto quitará la especialidad de todos los perfiles de tutores que la posean.',
            confirmVariant: 'danger',
            confirmText: 'Eliminar',
            onConfirm: async () => {
                setConfirmData(prev => ({ ...prev, show: false }));
                try {
                    setActionLoading(true);
                    await deleteEspecialidad(espId);
                    showMessage('Especialidad eliminada con éxito');
                    await cargarDatos();
                } catch (err) {
                    showMessage(err.response?.data?.message || 'Error al eliminar especialidad', true);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    // --- ASIGNAR MATERIAS A ESPECIALIDAD ---
    const handleToggleMateriaEspecialidad = async (espId, materiaId, tieneAsignada) => {
        try {
            setActionLoading(true);
            if (tieneAsignada) {
                await desasignarMateriasEspecialidad(espId, [materiaId]);
            } else {
                await asignarMateriasEspecialidad(espId, [materiaId]);
            }
            // Refrescar especialidad en foco
            const updatedEsp = await getEspecialidades();
            setEspecialidades(updatedEsp);
            const found = updatedEsp.find(e => e.id === espId);
            if (found) setEspAsignando(found);
        } catch (err) {
            showMessage(err.response?.data?.message || 'Error al modificar materias', true);
        } finally {
            setActionLoading(false);
        }
    };

    // --- RESPONDER SOLICITUD DE MATERIA ---
    const handleResponderSolicitud = async (id, estado) => {
        const desc = estado === 'aprobada' ? 'aprobar' : 'rechazar';
        setConfirmData({
            show: true,
            title: `${estado === 'aprobada' ? 'Aprobar' : 'Rechazar'} Solicitud`,
            body: `¿Estás seguro de que deseas ${desc} esta solicitud de materia?`,
            confirmVariant: estado === 'aprobada' ? 'success' : 'danger',
            confirmText: estado === 'aprobada' ? 'Aprobar' : 'Rechazar',
            onConfirm: async () => {
                setConfirmData(prev => ({ ...prev, show: false }));
                try {
                    setActionLoading(true);
                    await responderSolicitudMateria(id, estado);
                    showMessage(`Solicitud ${estado} con éxito`);
                    await cargarDatos();
                } catch (err) {
                    showMessage(err.response?.data?.message || 'Error al responder la solicitud', true);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const filteredUsers = usuarios.filter(u =>
        u.fullName.toLowerCase().includes(filtroUsuario.toLowerCase()) ||
        u.username.toLowerCase().includes(filtroUsuario.toLowerCase())
    );

    return {
        usuarios: filteredUsers,
        materias,
        especialidades,
        solicitudesMaterias,
        reportesData,
        loading,
        error,
        tabActiva,
        setTabActiva,
        // Modal states
        userEditando,
        setUserEditando,
        materiaEditando,
        setMateriaEditando,
        espEditando,
        setEspEditando,
        espAsignando,
        setEspAsignando,
        // Inputs
        nuevaMateria,
        setNuevaMateria,
        filtroUsuario,
        setFiltroUsuario,
        // Loading and notifications
        actionLoading,
        successMsg,
        actionError,
        // Modal confirmación
        confirmData,
        setConfirmData,
        // Actions
        handleUpdateUser,
        handleDeleteUser,
        handleCrearMateria,
        handleUpdateMateria,
        handleDeleteMateria,
        handleUpdateEspecialidad,
        handleDeleteEspecialidad,
        handleToggleMateriaEspecialidad,
        handleResponderSolicitud,
        cargarDatos,
    };
};
