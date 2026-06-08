import { Spinner, Alert, Card, Form, Button } from 'react-bootstrap';
import { useMiPerfil } from './useMiPerfil';
import ConfirmModal from '../../../components/ConfirmModal';
import './MiPerfil.css';

const MiPerfil = () => {
    const {
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
    } = useMiPerfil();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
            </div>
        );
    }

    if (error) {
        return <div className="mi-perfil-container"><Alert variant="danger">{error}</Alert></div>;
    }

    return (
        <div className="mi-perfil-container">
            {/* Hero */}
            <div className="perfil-hero">
                <div className="perfil-avatar">
                    {perfil?.fullName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="perfil-nombre">{perfil?.fullName}</div>
                <div className="perfil-username">@{perfil?.username}</div>

                <div className="perfil-stats">
                    <div className="perfil-stat">
                        <div className="perfil-stat-valor">
                            {perfil?.totalTutoriasRealizadas ?? 0}
                        </div>
                        <div className="perfil-stat-label">Tutorías</div>
                    </div>
                    <div className="perfil-stat">
                        <div className="perfil-stat-valor">
                            {perfil?.promedioCalificacion
                                ? Number(perfil.promedioCalificacion).toFixed(1)
                                : '—'}
                        </div>
                        <div className="perfil-stat-label">Calificación</div>
                    </div>
                </div>
            </div>

            {/* Saldo de horas */}
            <div className="saldo-card">
                <div className="saldo-info">
                    <h3>Saldo de Horas</h3>
                    <div className="saldo-valor">{perfil?.saldoHoras ?? 0}h</div>
                </div>
                <div className="saldo-icon">⏱️</div>
            </div>

            {/* Calificación en estrellas */}
            {perfil?.promedioCalificacion > 0 && (
                <Card className="mb-3">
                    <Card.Body className="text-center py-3">
                        <div className="calificacion-stars">
                            {renderEstrellas(perfil.promedioCalificacion)}
                        </div>
                        <p className="mb-0 mt-1" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {Number(perfil.promedioCalificacion).toFixed(2)} / 5.00 promedio
                        </p>
                    </Card.Body>
                </Card>
            )}

            {/* Especialidades del perfil */}
            {perfil?.especialidades?.length > 0 && (
                <Card className="mb-3">
                    <Card.Body>
                        <h6 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                            Mis Especialidades
                        </h6>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {perfil.especialidades.map(esp => (
                                <span
                                    key={esp.id}
                                    style={{
                                        background: '#ede9fe',
                                        color: '#4f46e5',
                                        borderRadius: '20px',
                                        padding: '0.25em 0.75em',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    {esp.detalleEspecialidad}
                                </span>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Materias del perfil */}
            {perfil?.materias?.length > 0 && (
                <Card className="mb-3">
                    <Card.Body>
                        <h6 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                            Mis Materias
                        </h6>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {perfil.materias.map(mat => (
                                <span
                                    key={mat.id}
                                    style={{
                                        background: '#e0f2fe',
                                        color: '#0369a1',
                                        borderRadius: '20px',
                                        padding: '0.25em 0.75em',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    {mat.detalleMateria}
                                </span>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Tabs */}
            <div className="perfil-tabs">
                <button
                    className={`perfil-tab ${tabActiva === 'perfil' ? 'activa' : ''}`}
                    onClick={() => setTabActiva('perfil')}
                >
                    Información
                </button>
                <button
                    className={`perfil-tab ${tabActiva === 'especialidades' ? 'activa' : ''}`}
                    onClick={() => setTabActiva('especialidades')}
                >
                    Especialidades
                </button>
                <button
                    className={`perfil-tab ${tabActiva === 'transacciones' ? 'activa' : ''}`}
                    onClick={() => setTabActiva('transacciones')}
                >
                    Transacciones ({transacciones.length})
                </button>
            </div>

            {/* Tab: Información */}
            {tabActiva === 'perfil' && (
                <Card>
                    <Card.Body>
                        <InfoRow label="Nombre completo" value={perfil?.fullName} />
                        <InfoRow label="Usuario" value={`@${perfil?.username}`} />
                        <InfoRow label="Teléfono" value={perfil?.telefono || 'No registrado'} />
                        <InfoRow label="Saldo de horas" value={perfil?.saldoHoras !== undefined && perfil?.saldoHoras !== null ? `${perfil.saldoHoras}h` : '—'} />
                        <InfoRow label="Tutorías realizadas" value={perfil?.totalTutoriasRealizadas} />
                    </Card.Body>
                </Card>
            )}

            {/* Tab: Especialidades */}
            {tabActiva === 'especialidades' && (
                <Card>
                    <Card.Body>
                        <h5 className="mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>Asignar Especialidades</h5>
                        
                        {espError && <Alert variant="danger" className="py-2">{espError}</Alert>}
                        {espSuccess && <Alert variant="success" className="py-2">{espSuccess}</Alert>}
                        
                        <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>
                            Toca las especialidades para agregarlas o quitarlas de tu perfil de tutor.
                        </p>

                        <div className="esp-grid mb-4">
                            {todasEspecialidades.map(esp => {
                                const tieneAsignada = misEspIds.includes(esp.id);
                                return (
                                    <span
                                        key={esp.id}
                                        onClick={() => handleToggleEspecialidad(esp)}
                                        className={`esp-chip ${tieneAsignada ? 'asignada' : 'no-asignada'}`}
                                    >
                                        {esp.detalleEspecialidad} {tieneAsignada ? '✓' : '+'}
                                    </span>
                                );
                            })}
                            {todasEspecialidades.length === 0 && !loadingEsp && (
                                <p className="text-muted italic" style={{ fontSize: '0.875rem' }}>No hay especialidades registradas en el sistema.</p>
                            )}
                        </div>

                        {/* Configuración de Materias Específicas por Especialidad Asignada */}
                        {misEspIds.length > 0 && (
                            <div className="mt-4 pt-3 border-top">
                                <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                                    Configurar mis Materias
                                </h6>
                                <p className="text-muted mb-3" style={{ fontSize: '0.78rem' }}>
                                    Selecciona qué materias específicas enseñas en cada una de tus especialidades activas.
                                </p>
                                
                                {perfil.especialidades.map(esp => {
                                    const rawEsp = todasEspecialidades.find(e => e.id === esp.id);
                                    return (
                                        <Card key={esp.id} className="mb-3 border-0 bg-light shadow-none" style={{ borderRadius: '10px' }}>
                                            <Card.Body className="p-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-bold text-primary" style={{ fontSize: '0.85rem' }}>
                                                        {esp.detalleEspecialidad}
                                                    </span>
                                                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                                                        Activa
                                                    </span>
                                                </div>

                                                {/* Checklist de Materias de la Especialidad */}
                                                <div className="mb-3">
                                                    <div className="d-flex flex-wrap gap-3 mt-2">
                                                        {rawEsp?.materias?.map(mat => {
                                                            const tieneMateria = misMateriaIds.includes(mat.id);
                                                            return (
                                                                <Form.Check 
                                                                    key={mat.id}
                                                                    type="checkbox"
                                                                    id={`materia-check-${esp.id}-${mat.id}`}
                                                                    label={mat.detalleMateria}
                                                                    checked={tieneMateria}
                                                                    onChange={() => handleToggleMateria(mat.id)}
                                                                    disabled={loadingEsp}
                                                                    style={{ fontSize: '0.82rem', fontWeight: 500 }}
                                                                />
                                                            );
                                                        })}
                                                        {(!rawEsp?.materias || rawEsp.materias.length === 0) && (
                                                            <span className="text-muted italic" style={{ fontSize: '0.78rem' }}>
                                                                No hay materias asignadas a esta especialidad.
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Solicitar Materia */}
                                                <Form onSubmit={(e) => handleSolicitarMateria(e, esp.id)} className="d-flex gap-2 mt-2">
                                                    <Form.Control
                                                        type="text"
                                                        size="sm"
                                                        placeholder="¿Solicitar agregar una materia a esta especialidad?"
                                                        value={materiaSolicitando[esp.id] || ''}
                                                        onChange={(e) => setMateriaSolicitando({
                                                            ...materiaSolicitando,
                                                            [esp.id]: e.target.value
                                                        })}
                                                        disabled={loadingEsp}
                                                    />
                                                    <Button 
                                                        size="sm" 
                                                        type="submit" 
                                                        variant="outline-primary" 
                                                        style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }} 
                                                        disabled={loadingEsp || !(materiaSolicitando[esp.id] || '').trim()}
                                                    >
                                                        Solicitar
                                                    </Button>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        <hr />

                        <h5 className="mb-2 mt-4" style={{ fontSize: '0.95rem', fontWeight: 600 }}>¿No encuentras tu especialidad?</h5>
                        <p className="text-muted mb-3" style={{ fontSize: '0.82rem' }}>
                            Crea una nueva especialidad para que tú y otros tutores puedan asignársela.
                        </p>
                        
                        <form onSubmit={handleCrearEspecialidad} className="esp-nueva-form">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Ej: Programación en Python, Cálculo II..."
                                value={nuevaEsp}
                                onChange={(e) => setNuevaEsp(e.target.value)}
                                disabled={loadingEsp}
                                required
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                disabled={loadingEsp || !nuevaEsp.trim()}
                                style={{ background: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                            >
                                {loadingEsp ? 'Creando...' : 'Crear'}
                            </button>
                        </form>
                    </Card.Body>
                </Card>
            )}

            {/* Tab: Transacciones */}
            {tabActiva === 'transacciones' && (
                <Card>
                    <Card.Body style={{ padding: '0.75rem 1rem' }}>
                        {transacciones.length === 0 ? (
                            <div className="text-center py-3">
                                <div style={{ fontSize: '2rem' }}>💳</div>
                                <p className="text-muted mt-2 mb-0">No hay transacciones aún.</p>
                            </div>
                        ) : (
                            transacciones.map((t, i) => (
                                <div key={i} className="transaccion-item">
                                    <div className="transaccion-icon">{getTipoIcon(t.tipo)}</div>
                                    <div className="transaccion-info">
                                        <div className="transaccion-descripcion">{t.motivo || t.descripcion}</div>
                                        <div className="transaccion-fecha">{formatFecha(t.fecha)}</div>
                                    </div>
                                    <div
                                        className="transaccion-monto"
                                        style={{ color: getTipoColor(t.tipo) }}
                                    >
                                        {t.tipo === 'credito' ? '+' : '-'}{t.monto || t.cantidad}h
                                    </div>
                                </div>
                            ))
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* Modal de confirmación personalizado */}
            <ConfirmModal 
                show={confirmData.show}
                onHide={() => setConfirmData(prev => ({ ...prev, show: false }))}
                onConfirm={confirmData.onConfirm}
                title={confirmData.title}
                body={confirmData.body}
                confirmText={confirmData.confirmText}
                confirmVariant={confirmData.confirmVariant}
            />
        </div>
    );
};

// Componente auxiliar para filas de info
const InfoRow = ({ label, value }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.6rem 0',
        borderBottom: '1px solid #f1f5f9',
        fontSize: '0.875rem',
    }}>
        <span style={{ color: '#6b7280' }}>{label}</span>
        <span style={{ fontWeight: 500, color: '#1f2937' }}>{value !== undefined && value !== null ? value : '—'}</span>
    </div>
);

export default MiPerfil;
