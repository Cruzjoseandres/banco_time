import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useBuscarTutores } from './useBuscarTutores';
import './BuscarTutores.css';

const BuscarTutores = () => {
    const {
        tutores, // Lista de ofertas mapeadas (Materia + Tutor)
        loading,
        error,
        searched,
        filtros,
        handleFiltroChange,
        handleBuscar,
        handleVerPerfil,
        renderEstrellas,
    } = useBuscarTutores();

    return (
        <div className="buscar-tutores-container">
            <h1>Buscar Tutorías</h1>
            <p className="buscar-subtitulo">
                {searched ? `${tutores.length} servicio(s) de tutoría encontrado(s)` : 'Descubre materias y tutores disponibles'}
            </p>

            {/* Formulario de búsqueda */}
            <div className="buscar-form">
                <Form onSubmit={handleBuscar}>
                    <Form.Group className="mb-2">
                        <Form.Control
                            type="text"
                            name="q"
                            value={filtros.q}
                            onChange={handleFiltroChange}
                            placeholder="🔍 Buscar por materia o tutor..."
                        />
                    </Form.Group>
                    <div className="buscar-form-row mb-2">
                        <Form.Control
                            type="text"
                            name="especialidad"
                            value={filtros.especialidad}
                            onChange={handleFiltroChange}
                            placeholder="Especialidad"
                        />
                        <Form.Select
                            name="rating"
                            value={filtros.rating}
                            onChange={handleFiltroChange}
                        >
                            <option value="">⭐ Calificación</option>
                            <option value="4">4+ estrellas</option>
                            <option value="3">3+ estrellas</option>
                            <option value="2">2+ estrellas</option>
                        </Form.Select>
                    </div>
                    <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Buscar'}
                    </Button>
                </Form>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && (
                <>
                    <p className="section-label">
                        {searched ? 'Resultados' : 'Tutorías destacadas'}
                    </p>

                    {tutores.length === 0 ? (
                        <div className="text-center py-4">
                            <div style={{ fontSize: '2.5rem' }}>🔍</div>
                            <p className="text-muted mt-2">
                                {searched ? 'No se encontraron materias con esos filtros.' : 'No hay materias disponibles aún.'}
                            </p>
                        </div>
                    ) : (
                        <div className="tutor-grid">
                            {tutores.map((oferta) => (
                                <div key={oferta.id} className="tutor-card card">
                                    <div className="tutor-card-avatar">
                                        {oferta.fullName?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="tutor-card-info">
                                        {/* Título de la materia ofrecida */}
                                        <div className="tutor-card-nombre text-primary" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                            {oferta.nombreMateria || 'Tutoría General'}
                                        </div>
                                        
                                        {/* Nombre del tutor que imparte la materia */}
                                        <div className="text-muted small mb-1" style={{ fontWeight: 500 }}>
                                            Tutor: {oferta.fullName}
                                        </div>

                                        <div className="tutor-card-especialidades" style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                            {oferta.nombreEspecialidad}
                                        </div>
                                        
                                        <div className="tutor-card-rating">
                                            <span style={{ color: '#f59e0b' }}>
                                                {renderEstrellas(oferta.promedioCalificacion)}
                                            </span>
                                            <span className="ms-1" style={{ fontSize: '0.8rem' }}>
                                                {oferta.promedioCalificacion
                                                    ? `${Number(oferta.promedioCalificacion).toFixed(1)} / 5`
                                                    : 'Sin calificaciones'}
                                            </span>
                                        </div>
                                        
                                        <div className="tutor-card-stats">
                                            <span>📚 {oferta.totalTutoriasRealizadas} tutorías</span>
                                        </div>
                                    </div>
                                    <div className="tutor-card-actions">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleVerPerfil(oferta.tutorId, oferta.materiaId)}
                                            style={{ width: '100%', borderRadius: '12px', fontWeight: 600 }}
                                        >
                                            Ver perfil
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BuscarTutores;
