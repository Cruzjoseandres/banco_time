import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarTutores, getSugerenciasTutores } from '../../../../services/CitaService';

export const useBuscarTutores = () => {
    const [tutores, setTutores] = useState([]);
    const [sugerencias, setSugerencias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    const [filtros, setFiltros] = useState({
        q: '',
        materia: '',
        especialidad: '',
        rating: '',
    });

    const navigate = useNavigate();

    // Cargar sugerencias al iniciar
    useEffect(() => {
        getSugerenciasTutores(8)
            .then(data => setSugerencias(data))
            .catch(() => setSugerencias([]));
    }, []);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const handleBuscar = useCallback(async (e) => {
        e?.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSearched(true);
            const params = {};
            if (filtros.q) params.q = filtros.q;
            if (filtros.materia) params.materia = filtros.materia;
            if (filtros.especialidad) params.especialidad = filtros.especialidad;
            if (filtros.rating) params.rating = filtros.rating;
            const data = await buscarTutores(params);
            setTutores(data);
        } catch (err) {
            setError('Error al buscar tutores');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    const handleVerPerfil = (tutorId, materiaId) => {
        if (materiaId) {
            navigate(`/user/tutor/${tutorId}?materiaId=${materiaId}`);
        } else {
            navigate(`/user/tutor/${tutorId}`);
        }
    };

    const renderEstrellas = (promedio) => {
        if (!promedio) return '☆☆☆☆☆';
        const full = Math.round(promedio);
        return '★'.repeat(full) + '☆'.repeat(5 - full);
    };

    const tutoresAMostrar = searched ? tutores : sugerencias;

    // Mapear cada tutor por cada una de sus materias o especialidades para ofrecer contacto directo por materia
    const ofertas = [];
    tutoresAMostrar.forEach(t => {
        if (t.role === 'admin') return; // No mostrar administradores en la búsqueda de tutores

        if (t.materias && t.materias.length > 0) {
            t.materias.forEach(m => {
                // Encontrar a qué especialidad del tutor pertenece esta materia
                const esp = t.especialidades?.find(e => 
                    e.materias?.some(em => em.id === m.id)
                ) || (t.especialidades && t.especialidades[0]);

                ofertas.push({
                    id: `${t.id}-materia-${m.id}`,
                    tutorId: t.id,
                    materiaId: m.id,
                    fullName: t.fullName,
                    username: t.username,
                    promedioCalificacion: t.promedioCalificacion,
                    totalTutoriasRealizadas: t.totalTutoriasRealizadas,
                    nombreMateria: m.detalleMateria,
                    nombreEspecialidad: esp?.detalleEspecialidad || 'Especialidad General',
                });
            });
        } else if (t.especialidades && t.especialidades.length > 0) {
            t.especialidades.forEach(esp => {
                ofertas.push({
                    id: `${t.id}-esp-${esp.id}`,
                    tutorId: t.id,
                    materiaId: null,
                    fullName: t.fullName,
                    username: t.username,
                    promedioCalificacion: t.promedioCalificacion,
                    totalTutoriasRealizadas: t.totalTutoriasRealizadas,
                    nombreMateria: null,
                    nombreEspecialidad: esp.detalleEspecialidad,
                });
            });
        } else {
            ofertas.push({
                id: `${t.id}-general`,
                tutorId: t.id,
                materiaId: null,
                fullName: t.fullName,
                username: t.username,
                promedioCalificacion: t.promedioCalificacion,
                totalTutoriasRealizadas: t.totalTutoriasRealizadas,
                nombreMateria: null,
                nombreEspecialidad: 'Sin especialidades',
            });
        }
    });

    return {
        tutores: ofertas, // Devolvemos ofertas mapeadas como "tutores" para acoplar con la UI de forma limpia
        loading,
        error,
        searched,
        filtros,
        handleFiltroChange,
        handleBuscar,
        handleVerPerfil,
        renderEstrellas,
    };
};
