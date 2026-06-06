import { Container, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCrearCita } from './useCrearCita';
import './CrearCita.css';

// Fix leaflet marker icons en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Componente para capturar clicks en el mapa
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({ click: (e) => onMapClick(e.latlng) });
    return null;
};

const CrearCita = () => {
    const {
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
    } = useCrearCita();

    if (success) {
        return (
            <Container className="crear-cita-container">
                <div className="success-overlay">
                    <div className="success-icon">✅</div>
                    <h2 className="mt-3">¡Cita enviada!</h2>
                    <p className="text-muted">Tu solicitud fue enviada al tutor. Redirigiendo...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="crear-cita-container">
            <h1>Nueva Cita</h1>

            {/* Tutor seleccionado */}
            {loadingTutor && <div className="text-center mb-3"><Spinner size="sm" /></div>}
            {tutor && (
                <div className="tutor-seleccionado-card">
                    <div className="tutor-avatar-placeholder">
                        {tutor.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div className="tutor-nombre">{tutor.fullName}</div>
                        <div className="tutor-especialidades">
                            {tutor.especialidades?.map(e => e.nombre).join(', ') || 'Sin especialidades'}
                        </div>
                    </div>
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                {/* ID del tutor (si no vino por URL) */}
                {!form.tutorId && (
                    <Form.Group className="mb-3">
                        <Form.Label>ID del Tutor</Form.Label>
                        <Form.Control
                            type="number"
                            name="tutorId"
                            value={form.tutorId}
                            onChange={handleChange}
                            placeholder="Ingresa el ID del tutor"
                            required
                        />
                        <Form.Text className="text-muted">
                            Ve a <a href="/user/buscar-tutores">Buscar Tutores</a> para encontrar uno.
                        </Form.Text>
                    </Form.Group>
                )}

                <Form.Group className="mb-3">
                    <Form.Label>Fecha y hora de inicio</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        name="fechaHoraInicio"
                        value={form.fechaHoraInicio}
                        onChange={handleChange}
                        min={minDateTime}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Fecha y hora de fin</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        name="fechaHoraFin"
                        value={form.fechaHoraFin}
                        onChange={handleChange}
                        min={form.fechaHoraInicio || minDateTime}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Descripción / Tema a tratar</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        placeholder="¿Qué necesitas aprender o repasar?"
                        required
                        maxLength={500}
                    />
                </Form.Group>

                {/* Mapa para ubicación */}
                <Form.Group className="mb-3">
                    <Form.Label>Ubicación del encuentro</Form.Label>
                    <p className="map-instruccion">
                        📍 Toca en el mapa para marcar el punto de encuentro
                    </p>
                    <div className="map-wrapper">
                        <MapContainer
                            center={[4.6097, -74.0817]} // Bogotá por defecto
                            zoom={12}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapClickHandler onMapClick={handleMapClick} />
                            {mapPos && <Marker position={[mapPos.lat, mapPos.lng]} />}
                        </MapContainer>
                    </div>
                    {mapPos && (
                        <div className="coords-display">
                            📍 {Number(form.latitud).toFixed(4)}, {Number(form.longitud).toFixed(4)}
                        </div>
                    )}
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        type="button"
                        onClick={handleGeolocate}
                        className="w-100 mt-1"
                    >
                        🎯 Usar mi ubicación actual
                    </Button>
                </Form.Group>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-100 mt-2"
                    disabled={loading}
                    style={{ padding: '0.75rem' }}
                >
                    {loading ? <Spinner size="sm" /> : '📅 Enviar Solicitud de Cita'}
                </Button>
            </Form>
        </Container>
    );
};

export default CrearCita;
