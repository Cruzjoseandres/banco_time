import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({
    show,
    onHide,
    onConfirm,
    title = '¿Estás seguro?',
    body = 'Esta acción no se puede deshacer.',
    confirmText = 'Confirmar',
    confirmVariant = 'danger',
    showCancel = true
}) => {
    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            centered
            backdrop="static"
            style={{ zIndex: 1060 }}
        >
            <Modal.Header closeButton style={{ borderBottom: '1px solid #f1f5f9' }}>
                <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ fontSize: '0.9rem', color: '#475569', padding: '1.5rem 1rem' }}>
                {body}
            </Modal.Body>
            <Modal.Footer style={{ borderTop: '1px solid #f1f5f9', padding: '0.75rem 1rem' }}>
                {showCancel && (
                    <Button size="sm" variant="light" onClick={onHide} style={{ fontWeight: 500 }}>
                        Cancelar
                    </Button>
                )}
                <Button size="sm" variant={confirmVariant} onClick={onConfirm || onHide} style={{ fontWeight: 600 }}>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
