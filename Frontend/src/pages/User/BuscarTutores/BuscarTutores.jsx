import { Form, Button, Spinner, Alert, Dropdown } from 'react-bootstrap';
import { useBuscarTutores } from './useBuscarTutores';
import './BuscarTutores.css';

const BuscarTutores = () => {
    const {
        tutores, // Lista de ofertas mapeadas (Materia + Tutor)
        especialidadesList,
        loading,
        error,
        searched,
        filtros,
        handleFiltroChange,
        handleToggleEspecialidad,
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
                        <Dropdown className="flex-grow-1">
                            <Dropdown.Toggle 
                                variant="light" 
                                id="dropdown-especialidad" 
                                className="w-100 text-start d-flex justify-content-between align-items-center"
                                style={{
                                    border: '1px solid #dee2e6',
                                    borderRadius: '12px',
                                    padding: '10px 15px',
                                    backgroundColor: '#fff',
                                    color: '#495057'
                                }}
                            >
                                <span className="text-truncate">
                                    {filtros.especialidadesIds?.length === 0 
                                        ? 'Seleccionar Especialidades' 
                                        : `Especialidades (${filtros.especialidadesIds.length})`}
                                </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="w-100 px-3 py-2" style={{ maxHeight: '250px', overflowY: 'auto', borderRadius: '12px' }}>
                                {especialidadesList.map(esp => (
                                    <Form.Check 
                                        key={esp.id}
                                        type="checkbox"
                                        id={`esp-${esp.id}`}
                                        label={esp.detalleEspecialidad}
                                        checked={filtros.especialidadesIds?.includes(esp.id)}
                                        onChange={() => handleToggleEspecialidad(esp.id)}
                                        className="mb-2"
                                        style={{ fontSize: '0.9rem' }}
                                    />
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
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
