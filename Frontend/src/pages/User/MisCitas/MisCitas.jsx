import { useState } from 'react';
import { Container, Card, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useMisCitas } from './useMisCitas';
import CalificarModal from '../CalificarCita/CalificarCita';
import ConfirmModal from '../../../components/ConfirmModal';
import './MisCitas.css';

// Iconos SVG inline simples
const IconCalendar = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);
const IconPin = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
);
const IconChat = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
);
const IconMateria = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
);

const MisCitas = () => {
    const [activeTab, setActiveTab] = useState('estudiante'); // 'estudiante' | 'tutor'
    const {
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
        handleResponder,
        handleIniciar,
        handleAbrirTerminar,
        handleConfirmarTerminar,
        handleCancelar,
        handleVerChat,
        handleCalificar,
        handleCloseCalificar,
        handleCitaCalificada,
        estutor,
        esEstudiante,
        getEstadoVariant,
        getEstadoLabel,
        formatFecha,
        setModalTerminar,
        userInfo,
        // Confirm Modal
        confirmModal,
        setConfirmModal,
    } = useMisCitas();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
            </div>
        );
    }

    const filteredCitas = citas.filter((cita) => {
        if (activeTab === 'estudiante') {
            return esEstudiante(cita);
        } else {
            return estutor(cita);
        }
    });

    return (
        <div className="mis-citas-container">
            {/* Toast de notificación en tiempo real */}
            {notificacion && (
                <div className="notificacion-toast">
                    <Alert variant="info" className="mb-0 shadow">
                        🔔 <strong>{notificacion.mensaje}</strong>
                    </Alert>
                </div>
            )}

            <div className="mis-citas-header">
                <h1>Mis Citas</h1>
                <Button
                    size="sm"
                    variant="primary"
                    onClick={() => window.location.href = '/user/buscar-tutores'}
                >
                    + Nueva Cita
                </Button>
            </div>

            {/* Selector de pestañas */}
            <div className="custom-tabs-container">
                <button
                    className={`custom-tab-btn ${activeTab === 'estudiante' ? 'active' : ''}`}
                    onClick={() => setActiveTab('estudiante')}
                >
                    🎓 Como Estudiante
                </button>
                <button
                    className={`custom-tab-btn ${activeTab === 'tutor' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tutor')}
                >
                    💼 Como Tutor
                </button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {filteredCitas.length === 0 ? (
                <div className="text-center py-5">
                    <div style={{ fontSize: '3rem' }}>📅</div>
                    <p className="text-muted mt-2">
                        {activeTab === 'estudiante'
                            ? 'No tienes citas programadas como estudiante aún.'
                            : 'No tienes citas programadas como tutor aún.'}
                    </p>
                    {activeTab === 'estudiante' && (
                        <Button variant="primary" href="/user/buscar-tutores">Buscar un tutor</Button>
                    )}
                </div>
            ) : (
                filteredCitas.map((cita) => {
                    const soyTutor = estutor(cita);
                    const soyEstudiante = esEstudiante(cita);
                    const otroUsuario = soyTutor ? cita.estudiante : cita.tutor;
                    const isLoading = (key) => accionLoading === `${key}-${cita.id}`;

                    return (
                        <Card key={cita.id} className="cita-card">
                            <div className="cita-card-header">
                                <div className="cita-otro-usuario">
                                    {otroUsuario?.fullName || 'Usuario'}
                                    <span className="cita-rol-badge">
                                        {soyTutor ? 'Estudiante' : 'Tutor'}
                                    </span>
                                </div>
                                <Badge bg={getEstadoVariant(cita.estado)}>
                                    {getEstadoLabel(cita.estado)}
                                </Badge>
                            </div>

                            <Card.Body className="pt-2">
                                {cita.materia && (
                                    <div className="cita-info-row text-dark" style={{ fontWeight: 500 }}>
                                        <IconMateria />
                                        <span><strong>Materia:</strong> {cita.materia.detalleMateria}</span>
                                    </div>
                                )}
                                <div className="cita-info-row">
                                    <IconCalendar />
                                    <span><strong>Inicio:</strong> {formatFecha(cita.fechaHoraInicio)}</span>
                                </div>
                                <div className="cita-info-row">
                                    <IconCalendar />
                                    <span><strong>Fin:</strong> {formatFecha(cita.fechaHoraFin)}</span>
                                </div>
                                <div className="cita-info-row text-primary" style={{ fontWeight: 600 }}>
                                    <span>🪙 <strong>Horas {soyTutor ? 'a recibir' : 'a descontar'}:</strong> {(() => {
                                        const start = new Date(cita.fechaHoraInicio);
                                        const end = new Date(cita.fechaHoraFin);
                                        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '0';
                                        const diffMs = end.getTime() - start.getTime();
                                        const horas = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
                                        return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
                                    })()}</span>
                                </div>
                                {cita.latitud && cita.longitud && (
                                    <div className="cita-info-row">
                                        <IconPin />
                                        <a
                                            href={`https://maps.google.com/?q=${cita.latitud},${cita.longitud}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: '0.875rem' }}
                                        >
                                            Ver ubicación
                                        </a>
                                    </div>
                                )}
                                {cita.descripcion && (
                                    <p className="cita-descripcion mt-2">{cita.descripcion}</p>
                                )}

                                {/* Código de confirmación para el estudiante (en curso) */}
                                {soyEstudiante && cita.estado === 'en_curso' && cita.codigoConfirmacion && (
                                    <div className="codigo-confirmacion-box">
                                        <p>🔑 Código para confirmar al tutor</p>
                                        <div className="codigo-valor">{cita.codigoConfirmacion}</div>
                                    </div>
                                )}

                                {/* Calificación si ya está terminada */}
                                {cita.estado === 'terminada' && cita.calificacion && (
                                    <div className="mt-2 text-center">
                                        <span style={{ fontSize: '1.1rem' }}>
                                            {'⭐'.repeat(Math.round(cita.calificacion))}
                                        </span>
                                        <span className="text-muted ms-1" style={{ fontSize: '0.8rem' }}>
                                            ({cita.calificacion}/5)
                                        </span>
                                        {cita.comentarioCalificacion && (
                                            <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                                                "{cita.comentarioCalificacion}"
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="cita-acciones">
                                    {/* Botón de chat (siempre si aceptada, en curso o terminada) */}
                                    {['aceptada', 'en_curso', 'terminada'].includes(cita.estado) && (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleVerChat(cita)}
                                        >
                                            <IconChat /> Chat
                                        </Button>
                                    )}

                                    {/* Tutor: aceptar/rechazar si pendiente */}
                                    {soyTutor && cita.estado === 'pendiente' && (
                                        <>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                disabled={isLoading('responder')}
                                                onClick={() => handleResponder(cita.id, 'aceptada')}
                                            >
                                                {isLoading('responder') ? <Spinner size="sm" /> : '✓ Aceptar'}
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                disabled={isLoading('responder')}
                                                onClick={() => handleResponder(cita.id, 'rechazada')}
                                            >
                                                ✕ Rechazar
                                            </Button>
                                        </>
                                    )}

                                    {/* Tutor: iniciar si aceptada */}
                                    {soyTutor && cita.estado === 'aceptada' && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="btn-full"
                                            disabled={isLoading('iniciar')}
                                            onClick={() => handleIniciar(cita.id)}
                                        >
                                            {isLoading('iniciar') ? <Spinner size="sm" /> : '▶ Iniciar Tutoría'}
                                        </Button>
                                    )}

                                    {/* Tutor: terminar si en_curso */}
                                    {soyTutor && cita.estado === 'en_curso' && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="btn-full"
                                            disabled={isLoading('terminar')}
                                            onClick={() => handleAbrirTerminar(cita.id)}
                                        >
                                            {isLoading('terminar') ? <Spinner size="sm" /> : '⏹ Terminar Tutoría'}
                                        </Button>
                                    )}

                                    {/* Estudiante: calificar si terminada y no calificada */}
                                    {soyEstudiante && cita.estado === 'terminada' && !cita.calificacion && (
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="btn-full"
                                            onClick={() => handleCalificar(cita)}
                                        >
                                            ⭐ Calificar al tutor
                                        </Button>
                                    )}

                                    {/* Cancelar si pendiente (solo estudiante) o aceptada (ambos) */}
                                    {((cita.estado === 'pendiente' && soyEstudiante) || cita.estado === 'aceptada') && (
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="btn-full"
                                            disabled={isLoading('cancelar')}
                                            onClick={() => handleCancelar(cita.id)}
                                        >
                                            {isLoading('cancelar') ? <Spinner size="sm" /> : 'Cancelar'}
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    );
                })
            )}

            {/* Modal: terminar cita con código */}
            <Modal show={modalTerminar.show} onHide={() => setModalTerminar({ show: false, citaId: null })} centered>
                <Modal.Header closeButton>
                    <Modal.Title>⏹ Terminar Tutoría</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-3">
                        Ingresa el código de confirmación que el estudiante tiene en su pantalla.
                    </p>
                    <Form.Group>
                        <Form.Label>Código de confirmación</Form.Label>
                        <Form.Control
                            type="text"
                            value={codigoInput}
                            onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                            placeholder="Ej: AB12CD"
                            isInvalid={!!codigoError}
                            style={{ letterSpacing: '0.2em', fontWeight: 700, fontSize: '1.2rem', textAlign: 'center' }}
                        />
                        {codigoError && <Form.Control.Feedback type="invalid">{codigoError}</Form.Control.Feedback>}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalTerminar({ show: false, citaId: null })}>
                        Cancelar
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleConfirmarTerminar}
                        disabled={accionLoading?.startsWith('terminar')}
                    >
                        {accionLoading?.startsWith('terminar') ? <Spinner size="sm" /> : 'Confirmar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal: calificar */}
            {modalCalificar.show && (
                <CalificarModal
                    cita={modalCalificar.cita}
                    onClose={handleCloseCalificar}
                    onCalificada={handleCitaCalificada}
                />
            )}

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

export default MisCitas;
