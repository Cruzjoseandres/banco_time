import { Button, Card, Spinner, Alert } from 'react-bootstrap';
import { usePerfilTutor } from './usePerfilTutor';
import ConfirmModal from '../../../components/ConfirmModal';
import './PerfilTutor.css';

const PerfilTutor = () => {
    const { 
        tutor, 
        loading, 
        error, 
        handleIniciarConversacion, 
        handleVolver, 
        renderEstrellas, 
        esMiPerfil,
        confirmModal,
        setConfirmModal,
    } = usePerfilTutor();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
            </div>
        );
    }

    if (error || !tutor) {
        return <div className="perfil-tutor-container"><Alert variant="danger">{error || 'Tutor no encontrado'}</Alert></div>;
    }

    return (
        <div className="perfil-tutor-container">
            {/* Back */}
            <button
                onClick={handleVolver}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 500, cursor: 'pointer', marginBottom: '0.75rem', fontSize: '0.875rem' }}
            >
                ← Volver a buscar
            </button>

            {/* Hero */}
            <div className="tutor-hero">
                <div className="tutor-hero-avatar">
                    {tutor.fullName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="tutor-hero-nombre">{tutor.fullName}</div>

                {/* Especialidades */}
                {tutor.especialidades?.length > 0 && (
                    <div style={{ marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center' }}>
                        {tutor.especialidades.map(e => (
                            <span key={e.id} className="especialidad-chip" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.2em 0.75em', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                                {e.detalleEspecialidad}
                            </span>
                        ))}
                    </div>
                )}

                {/* Materias */}
                {tutor.materias?.length > 0 && (
                    <div style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center' }}>
                        {tutor.materias.map(m => (
                            <span key={m.id} className="materia-chip" style={{ background: 'rgba(255,255,255,0.15)', color: '#bae6fd', border: '1px solid rgba(255,255,255,0.2)', padding: '0.2em 0.75em', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                                {m.detalleMateria}
                            </span>
                        ))}
                    </div>
                )}

                <div className="tutor-hero-rating">
                    {renderEstrellas(tutor.promedioCalificacion)}
                </div>

                <div className="tutor-hero-stats">
                    <div className="tutor-stat">
                        <div className="tutor-stat-valor">
                            {tutor.promedioCalificacion ? Number(tutor.promedioCalificacion).toFixed(1) : '—'}
                        </div>
                        <div className="tutor-stat-label">Calificación</div>
                    </div>
                    <div className="tutor-stat">
                        <div className="tutor-stat-valor">{tutor.totalTutoriasRealizadas}</div>
                        <div className="tutor-stat-label">Tutorías</div>
                    </div>
                </div>
            </div>

            {/* CTA principal */}
            {esMiPerfil ? (
                <div className="text-center py-2 text-muted small border rounded bg-light mb-3" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    ℹ️ Estás viendo tu propio perfil de tutor.
                </div>
            ) : (
                <Button variant="primary" className="solicitar-btn" onClick={handleIniciarConversacion}>
                    💬 Iniciar Conversación con {tutor.fullName?.split(' ')[0]}
                </Button>
            )}

            {/* Info adicional */}
            <Card>
                <Card.Body>
                    <div style={{ fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#6b7280' }}>Tutorías realizadas</span>
                            <strong>{tutor.totalTutoriasRealizadas}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#6b7280' }}>Calificación promedio</span>
                            <strong>
                                {tutor.promedioCalificacion
                                    ? `${Number(tutor.promedioCalificacion).toFixed(2)} / 5`
                                    : 'Sin calificaciones'}
                            </strong>
                        </div>
                        {tutor.especialidades?.length > 0 && (
                            <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#6b7280' }}>Especialidades: </span>
                                <strong>{tutor.especialidades.map(e => e.detalleEspecialidad).join(', ')}</strong>
                            </div>
                        )}
                        {tutor.materias?.length > 0 && (
                            <div style={{ padding: '0.5rem 0' }}>
                                <span style={{ color: '#6b7280' }}>Materias que imparte: </span>
                                <strong>{tutor.materias.map(m => m.detalleMateria).join(', ')}</strong>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Modal de confirmación personalizado */}
            <ConfirmModal
                show={confirmModal.show}
                onHide={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                body={confirmModal.body}
                confirmText={confirmModal.confirmText}
                confirmVariant={confirmModal.confirmVariant}
                showCancel={confirmModal.showCancel}
            />
        </div>
    );
};

export default PerfilTutor;
