import React from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useChatConversacion } from './useChatConversacion';
import CalificarCita from '../CalificarCita/CalificarCita';
import ConfirmModal from '../../../components/ConfirmModal';
import './ChatConversacion.css';

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to capture map clicks
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({ click: (e) => onMapClick(e.latlng) });
    return null;
};

// Component to center Leaflet map
const MapCenterUpdater = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const ChatConversacion = () => {
    const {
        conversacion,
        mensajes,
        texto,
        setTexto,
        loading,
        error,
        messagesEndRef,
        userInfo,
        getOtroUsuario,
        esMio,
        formatHora,
        handleEnviar,
        handleKeyDown,
        soyTutor,
        soyEstudiante,
        citaActiva,
        // Agendar Modal
        showAgendarModal,
        setShowAgendarModal,
        agendarForm,
        setAgendarForm,
        agendarError,
        setAgendarError,
        agendarLoading,
        handleCrearCitaSubmit,
        // Responder/Iniciar/Cancelar
        handleResponderCita,
        handleIniciarCita,
        handleCancelarCita,
        // Terminar Modal
        showTerminarModal,
        setShowTerminarModal,
        codigoInput,
        setCodigoInput,
        codigoError,
        setCodigoError,
        terminarLoading,
        handleConfirmarTerminarCita,
        // Calificar Modal
        showCalificarModal,
        setShowCalificarModal,
        handleCitaCalificada,
        // Confirm Modal
        confirmModal,
        setConfirmModal,
        mostrarAlert,
    } = useChatConversacion();

    const [mapCenter, setMapCenter] = React.useState([4.6097, -74.0817]); // Bogotá por defecto

    React.useEffect(() => {
        if (showAgendarModal) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        setMapCenter([lat, lng]);
                        setAgendarForm(prev => ({
                            ...prev,
                            latitud: lat.toString(),
                            longitud: lng.toString()
                        }));
                    },
                    (err) => {
                        console.error("Error al geolocalizar al abrir modal:", err);
                    }
                );
            }
        }
    }, [showAgendarModal, setAgendarForm]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
            </div>
        );
    }

    if (error || !conversacion) {
        return (
            <Container className="py-4">
                <Alert variant="danger">{error || 'Conversación no encontrada.'}</Alert>
                <Button variant="primary" href="/user/chats">Volver a Chats</Button>
            </Container>
        );
    }

    const otro = getOtroUsuario();
    const inicial = otro?.fullName?.[0]?.toUpperCase() || '?';
    const isTutorRole = soyTutor();

    // Map helpers
    const handleMapClick = (latlng) => {
        setAgendarForm(prev => ({
            ...prev,
            latitud: latlng.lat.toString(),
            longitud: latlng.lng.toString()
        }));
    };

    const handleGeolocate = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMapCenter([lat, lng]);
                    setAgendarForm(prev => ({
                        ...prev,
                        latitud: lat.toString(),
                        longitud: lng.toString()
                    }));
                },
                (err) => {
                    console.error(err);
                    mostrarAlert("Ubicación no disponible", "No se pudo obtener tu ubicación actual. Revisa los permisos de ubicación de tu navegador.", "warning");
                }
            );
        } else {
            mostrarAlert("No soportado", "La geolocalización no está soportada por tu navegador.", "warning");
        }
    };

    const formatFechaLegible = (fechaStr) => {
        if (!fechaStr) return '';
        const d = new Date(fechaStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const getConsumoHoras = () => {
        if (!agendarForm.fecha || !agendarForm.horaInicio || !agendarForm.horaFin) return null;
        const start = new Date(`${agendarForm.fecha}T${agendarForm.horaInicio}`);
        const end = new Date(`${agendarForm.fecha}T${agendarForm.horaFin}`);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
        const diffMs = end.getTime() - start.getTime();
        if (diffMs <= 0) return 0;
        const horas = diffMs / (1000 * 60 * 60);
        return Number(horas.toFixed(2));
    };
    const consumo = getConsumoHoras();

    return (
        <div className="conversacion-container">
            {/* Header del Chat */}
            <div className="conversacion-header">
                <Button variant="outline-secondary" className="back-btn" href="/user/chats">
                    ← Atrás
                </Button>
                <div className="conversacion-user-info">
                    <div className="conversacion-avatar">{inicial}</div>
                    <div>
                        <div className="conversacion-name">
                            {otro?.fullName}
                            <Badge bg={isTutorRole ? 'success' : 'primary'} className="ms-2 role-badge">
                                {isTutorRole ? 'Estudiante' : 'Tutor'}
                            </Badge>
                        </div>
                        <div className="conversacion-materia-label">
                            📚 Materia: <strong>{conversacion.materia?.detalleMateria}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banderola de Cita Inteligente */}
            <div className="cita-status-bar">
                {!citaActiva ? (
                    <div className="cita-bar-content empty">
                        {soyEstudiante() ? (
                            <>
                                <span className="cita-bar-text">¿Llegaron a un acuerdo? Programa la tutoría aquí:</span>
                                <Button variant="primary" size="sm" className="action-btn animate-pulse" onClick={() => setShowAgendarModal(true)}>
                                    📅 Programar Tutoría
                                </Button>
                            </>
                        ) : (
                            <span className="cita-bar-text text-muted">💡 Esperando que el estudiante programe la tutoría para esta materia.</span>
                        )}
                    </div>
                ) : (
                    <div className={`cita-bar-content active state-${citaActiva.estado}`}>
                        <div className="cita-info-grid">
                            <div>
                                <span className="label">Estado:</span>
                                <Badge bg={
                                    citaActiva.estado === 'pendiente' ? 'warning' :
                                    citaActiva.estado === 'aceptada' ? 'info' :
                                    citaActiva.estado === 'iniciada' ? 'primary' :
                                    citaActiva.estado === 'finalizada' ? 'success' : 'secondary'
                                } className="status-badge">
                                    {citaActiva.estado.toUpperCase()}
                                </Badge>
                            </div>
                            <div>
                                <span className="label">Inicio:</span>
                                <span className="value">{formatFechaLegible(citaActiva.fechaHoraInicio)}</span>
                            </div>
                            <div>
                                <span className="label">Fin:</span>
                                <span className="value">{formatFechaLegible(citaActiva.fechaHoraFin)}</span>
                            </div>
                            <div className="col-span-2 mt-1">
                                <span className="label">Descripción:</span>
                                <span className="value italic">"{citaActiva.descripcion}"</span>
                            </div>
                            <div className="col-span-2 mt-1" style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '4px' }}>
                                <span className="label">Horas {soyTutor() ? 'a recibir' : 'a descontar'}:</span>
                                <span className="value font-bold" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                    {(() => {
                                        const start = new Date(citaActiva.fechaHoraInicio);
                                        const end = new Date(citaActiva.fechaHoraFin);
                                        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '0';
                                        const diffMs = end.getTime() - start.getTime();
                                        const horas = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
                                        return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
                                    })()}
                                </span>
                            </div>
                        </div>

                        <div className="cita-actions mt-2 pt-2 border-top">
                            {/* Pendiente */}
                            {citaActiva.estado === 'pendiente' && (
                                <>
                                    {soyTutor() ? (
                                        <div className="d-flex gap-2">
                                            <Button variant="success" size="sm" onClick={() => handleResponderCita('aceptada')}>
                                                Aceptar Tutoría
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleResponderCita('rechazada')}>
                                                Rechazar
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="outline-danger" size="sm" onClick={handleCancelarCita}>
                                            Cancelar Solicitud
                                        </Button>
                                    )}
                                </>
                            )}

                            {/* Aceptada */}
                            {citaActiva.estado === 'aceptada' && (
                                <>
                                    {soyTutor() ? (
                                        <div className="d-flex align-items-center justify-content-between w-100">
                                            <Button variant="primary" size="sm" onClick={handleIniciarCita}>
                                                ▶ Iniciar Tutoría
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={handleCancelarCita}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-between w-100">
                                            <span className="text-muted small">Tutoría programada. El tutor la iniciará a la hora acordada.</span>
                                            <Button variant="outline-danger" size="sm" onClick={handleCancelarCita}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Iniciada */}
                            {citaActiva.estado === 'iniciada' && (
                                <>
                                    {soyTutor() ? (
                                        <Button variant="success" size="sm" onClick={() => setShowTerminarModal(true)}>
                                            ⏹ Terminar Tutoría
                                        </Button>
                                    ) : (
                                        <div className="student-code-banner">
                                            <span>🔑 Dale este código de confirmación a tu tutor: </span>
                                            <strong className="code-badge">{citaActiva.codigoConfirmacion}</strong>
                                            <Button variant="outline-danger" size="sm" className="ms-3" onClick={handleCancelarCita}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Finalizada */}
                            {citaActiva.estado === 'finalizada' && soyEstudiante() && (
                                <Button variant="warning" size="sm" onClick={() => setShowCalificarModal(true)}>
                                    ⭐ Calificar Tutor
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Listado de Mensajes */}
            <div className="mensajes-body">
                {mensajes.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <p style={{ fontSize: '2.5rem' }}>👋</p>
                        <p>No hay mensajes todavía. ¡Comienza la conversación!</p>
                    </div>
                ) : (
                    mensajes.map((msg) => {
                        const mio = esMio(msg);
                        return (
                            <div key={msg.id} className={`mensaje-row ${mio ? 'mio' : 'otro'}`}>
                                <div className="mensaje-bubble shadow-sm">
                                    {!mio && <span className="mensaje-autor">{msg.emisor?.fullName?.split(' ')[0]}</span>}
                                    <p className="mensaje-texto">{msg.detalleMensaje}</p>
                                    <span className="mensaje-hora">{formatHora(msg.fechaEnvio)}</span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensajes */}
            <Form onSubmit={handleEnviar} className="conversacion-footer">
                <Form.Control
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={1000}
                />
                <Button type="submit" variant="primary" disabled={!texto.trim()}>
                    Enviar
                </Button>
            </Form>

            {/* Modal de Agendamiento */}
            <Modal show={showAgendarModal} onHide={() => setShowAgendarModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>📅 Programar Tutoría — {conversacion.materia?.detalleMateria}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCrearCitaSubmit}>
                    <Modal.Body>
                        {agendarError && <Alert variant="danger">{agendarError}</Alert>}

                        <Form.Group className="mb-3">
                            <Form.Label>Fecha de la tutoría</Form.Label>
                            <Form.Control
                                type="date"
                                value={agendarForm.fecha}
                                onChange={(e) => setAgendarForm(p => ({ ...p, fecha: e.target.value }))}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </Form.Group>

                        <div className="row mb-3">
                            <div className="col">
                                <Form.Group>
                                    <Form.Label>Hora de inicio</Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={agendarForm.horaInicio}
                                        onChange={(e) => setAgendarForm(p => ({ ...p, horaInicio: e.target.value }))}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group>
                                    <Form.Label>Hora de fin</Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={agendarForm.horaFin}
                                        onChange={(e) => setAgendarForm(p => ({ ...p, horaFin: e.target.value }))}
                                        required
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {consumo !== null && (
                            <div className="alert alert-info mt-2 mb-3 py-2 px-3 small d-flex align-items-center justify-content-between" style={{ borderRadius: '10px' }}>
                                <span>💰 Costo estimado de la tutoría:</span>
                                <strong>{consumo} {consumo === 1 ? 'crédito' : 'créditos'} ({consumo} {consumo === 1 ? 'hora' : 'horas'})</strong>
                            </div>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Descripción del tema a repasar</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Escribe detalles del tema que deseas estudiar..."
                                value={agendarForm.descripcion}
                                onChange={(e) => setAgendarForm(p => ({ ...p, descripcion: e.target.value }))}
                                required
                                maxLength={500}
                            />
                        </Form.Group>

                        {/* Leaflet Map para ubicación */}
                        <Form.Group className="mb-3">
                            <Form.Label>Ubicación del encuentro</Form.Label>
                            <p className="text-muted small mb-1">📍 Toca en el mapa para marcar el punto de encuentro acordado o usa tu ubicación actual.</p>
                            <div className="chat-map-wrapper" style={{ height: '260px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                <MapContainer
                                    center={mapCenter}
                                    zoom={14}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <MapCenterUpdater center={mapCenter} />
                                    <MapClickHandler onMapClick={handleMapClick} />
                                    {agendarForm.latitud && agendarForm.longitud && (
                                        <Marker position={[Number(agendarForm.latitud), Number(agendarForm.longitud)]} />
                                    )}
                                </MapContainer>
                            </div>
                            {agendarForm.latitud && (
                                <div className="text-success small mt-1">
                                    📍 Ubicación seleccionada: {Number(agendarForm.latitud).toFixed(5)}, {Number(agendarForm.longitud).toFixed(5)}
                                </div>
                            )}
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                type="button"
                                onClick={handleGeolocate}
                                className="w-100 mt-2"
                            >
                                🎯 Usar mi ubicación actual
                            </Button>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAgendarModal(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary" disabled={agendarLoading}>
                            {agendarLoading ? <Spinner size="sm" /> : 'Confirmar y Enviar Solicitud'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal de Finalizar Tutoría (Código) */}
            <Modal show={showTerminarModal} onHide={() => setShowTerminarModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>⏹ Finalizar Tutoría</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleConfirmarTerminarCita}>
                    <Modal.Body>
                        <p className="text-muted small">
                            Pídele al estudiante el código de 4 dígitos generado en su pantalla para confirmar la culminación exitosa.
                        </p>
                        {codigoError && <Alert variant="danger">{codigoError}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label>Código de confirmación</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: 5493"
                                value={codigoInput}
                                onChange={(e) => setCodigoInput(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowTerminarModal(false)}>Volver</Button>
                        <Button type="submit" variant="success" disabled={terminarLoading}>
                            {terminarLoading ? <Spinner size="sm" /> : 'Culminar Tutoría'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal de Calificación */}
            {showCalificarModal && citaActiva && (
                <CalificarCita
                    cita={citaActiva}
                    onClose={() => setShowCalificarModal(false)}
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

export default ChatConversacion;
