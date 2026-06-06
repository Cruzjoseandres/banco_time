import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useLoginForm } from "./useLoginForm";

const FormLogin = () => {
    const {
        username,
        setUsername,
        password,
        setPassword,
        error,
        handleSubmit
    } = useLoginForm();

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card style={{ width: '500px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Iniciar Sesión</h2>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingresa tu username"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Iniciar Sesión
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default FormLogin;

