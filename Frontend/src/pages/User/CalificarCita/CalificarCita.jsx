import { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { calificarCita } from '../../../../services/CitaService';

const CalificarCita = ({ cita, onClose, onCalificada }) => {
    const [calificacion, setCalificacion] = useState(0);
    const [hover, setHover] = useState(0);
    const [comentario, setComentario] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (calificacion === 0) {
            setError('Por favor selecciona una calificación');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await calificarCita(cita.id, calificacion, comentario);
            onCalificada();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al calificar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>⭐ Calificar Tutoría</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted text-center mb-1">
                    Califica la tutoría con <strong>{cita.tutor?.fullName}</strong>
                </p>

                {/* Estrellas */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '1rem 0' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setCalificacion(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '2.2rem',
                                color: star <= (hover || calificacion) ? '#f59e0b' : '#d1d5db',
                                transition: 'color 0.15s, transform 0.15s',
                                transform: star <= (hover || calificacion) ? 'scale(1.15)' : 'scale(1)',
                                lineHeight: 1,
                            }}
                        >
                            ★
                        </button>
                    ))}
                </div>

                {calificacion > 0 && (
                    <p className="text-center text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                        {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'][calificacion]}
                    </p>
                )}

                <Form.Group>
                    <Form.Label>Comentario (opcional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="¿Cómo fue tu experiencia?"
                        maxLength={300}
                    />
                    <Form.Text className="text-muted">{comentario.length}/300</Form.Text>
                </Form.Group>

                {error && <p className="text-danger mt-2 mb-0">{error}</p>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    variant="warning"
                    onClick={handleSubmit}
                    disabled={loading || calificacion === 0}
                    style={{ color: '#1f2937' }}
                >
                    {loading ? <Spinner size="sm" /> : 'Enviar Calificación'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CalificarCita;
