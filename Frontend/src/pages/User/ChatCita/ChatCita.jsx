import { Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useChatCita } from './useChatCita';
import './ChatCita.css';

const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
);

const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="15 18 9 12 15 6"/>
    </svg>
);

const ChatCita = () => {
    const {
        cita,
        mensajes,
        texto,
        setTexto,
        loading,
        error,
        messagesEndRef,
        userInfo,
        handleEnviar,
        handleKeyDown,
        esMio,
        formatHora,
    } = useChatCita();

    const navigate = useNavigate();

    const otroUsuario = cita
        ? (cita.tutor?.id === userInfo?.id ? cita.estudiante : cita.tutor)
        : null;

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger" className="m-3">{error}</Alert>;
    }

    return (
        <div className="chat-cita-wrapper">
            {/* Header */}
            <div className="chat-header">
                <button className="chat-header-back" onClick={() => navigate('/user/mis-citas')}>
                    <BackIcon />
                </button>
                <div className="chat-header-avatar">
                    {otroUsuario?.fullName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="chat-header-info">
                    <div className="chat-header-nombre">{otroUsuario?.fullName || 'Usuario'}</div>
                    <div className="chat-header-sub">
                        {cita?.estado === 'en_curso' ? '🟢 Tutoría en curso' : `Estado: ${cita?.estado}`}
                    </div>
                </div>
            </div>

            {/* Mensajes */}
            <div className="chat-messages">
                {mensajes.length === 0 && (
                    <div className="text-center" style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '2rem' }}>
                        <div style={{ fontSize: '2rem' }}>💬</div>
                        <p>Sin mensajes aún. ¡Saluda!</p>
                    </div>
                )}

                {mensajes.map((msg, i) => {
                    const mio = esMio(msg);
                    const emisorLetra = msg.emisor?.fullName?.[0]?.toUpperCase() || '?';
                    return (
                        <div key={i} className={`mensaje-burbuja-wrapper ${mio ? 'mio' : ''}`}>
                            <div className="burbuja-avatar">{emisorLetra}</div>
                            <div>
                                <div className={`burbuja ${mio ? 'yo' : 'ellos'}`}>
                                    {msg.contenido}
                                </div>
                                <div className="burbuja-hora" style={{ color: mio ? '#6366f1' : '#9ca3af' }}>
                                    {formatHora(msg.fechaEnvio || msg.createdAt)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
                <textarea
                    className="chat-input"
                    rows={1}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    maxLength={1000}
                />
                <button
                    className="chat-send-btn"
                    onClick={handleEnviar}
                    disabled={!texto.trim()}
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};

export default ChatCita;
