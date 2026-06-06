import { useState } from 'react';
import { Container, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { useChats } from './useChats';
import './Chats.css';

const Chats = () => {
    const [activeTab, setActiveTab] = useState('estudiante'); // 'estudiante' | 'tutor'
    const {
        conversaciones,
        loading,
        error,
        handleSelectConversacion,
        getOtroUsuario,
        getRolEtiqueta,
        formatFecha,
        userInfo,
    } = useChats();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
            </div>
        );
    }

    const filteredConversaciones = conversaciones.filter((conv) => {
        if (activeTab === 'estudiante') {
            return conv.estudiante?.id === userInfo?.id;
        } else {
            return conv.tutor?.id === userInfo?.id;
        }
    });

    return (
        <div className="chats-container">
            <div className="chats-header">
                <h1>Mis Mensajes</h1>
                <p className="chats-subtitulo">Conversa con tus tutores y estudiantes sobre las materias</p>
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

            {filteredConversaciones.length === 0 ? (
                <div className="text-center py-5 shadow-sm card" style={{ borderRadius: '16px', background: 'white' }}>
                    <div style={{ fontSize: '3rem' }}>💬</div>
                    <h5 className="mt-3" style={{ fontWeight: 600 }}>Sin chats activos</h5>
                    <p className="text-muted" style={{ fontSize: '0.875rem', padding: '0 1.5rem' }}>
                        {activeTab === 'estudiante'
                            ? 'No tienes chats activos como estudiante. Ve al buscador de tutores para iniciar un chat.'
                            : 'No tienes chats activos como tutor. Los estudiantes iniciarán conversaciones contigo cuando soliciten tus servicios.'}
                    </p>
                    {activeTab === 'estudiante' && (
                        <div className="mt-2">
                            <a href="/user/buscar-tutores" className="btn btn-primary btn-sm">
                                Buscar Tutorías
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <div className="chats-list">
                    {filteredConversaciones.map((conv) => {
                        const otro = getOtroUsuario(conv);
                        const rolLabel = getRolEtiqueta(conv);
                        const inicial = otro?.fullName?.[0]?.toUpperCase() || '?';

                        return (
                            <div
                                key={conv.id}
                                className="chat-row-card card"
                                onClick={() => handleSelectConversacion(conv.id)}
                            >
                                <div className="chat-row-avatar">
                                    {inicial}
                                </div>
                                <div className="chat-row-body">
                                    <div className="chat-row-top">
                                        <span className="chat-row-name">{otro?.fullName || 'Usuario'}</span>
                                        <Badge bg={rolLabel === 'Tutor' ? 'primary' : 'success'} className="chat-row-role-badge">
                                            {rolLabel}
                                        </Badge>
                                        <span className="chat-row-time">
                                            {conv.ultimoMensaje ? formatFecha(conv.ultimoMensaje.fechaEnvio) : formatFecha(conv.createdAt)}
                                        </span>
                                    </div>
                                    <div className="chat-row-materia">
                                        📚 Materia: <strong>{conv.materia?.detalleMateria}</strong>
                                    </div>
                                    <div className="chat-row-message-preview">
                                        {conv.ultimoMensaje ? (
                                            <>
                                                <span className="fw-semibold">
                                                    {conv.ultimoMensaje.emisor?.fullName?.split(' ')[0]}:
                                                </span>{' '}
                                                {conv.ultimoMensaje.detalleMensaje}
                                            </>
                                        ) : (
                                            <span className="text-muted italic">Conversación iniciada. ¡Saluda!</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Chats;
