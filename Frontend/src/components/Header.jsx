import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAccessToken, getUserInfo } from "../../utils/TokenUtilities";
import useAuthentication from "../../hooks/useAuthentication";

const Header = () => {
    const { doLogout } = useAuthentication();
    const token = getAccessToken();
    const userInfo = getUserInfo();

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Link className="navbar-brand" to="/">
                    ⏱️ Banco de Tiempo
                </Link>
                <Navbar.Toggle aria-controls="nav-banco-tiempo" />
                <Navbar.Collapse id="nav-banco-tiempo">
                    <Nav className="me-auto">
                        {/* Sin sesión */}
                        {!token && (
                            <>
                                <Link className="nav-link" to="/">Buscar Tutores</Link>
                                <Link className="nav-link" to="/login">Iniciar sesión</Link>
                                <Link className="nav-link" to="/register">Registrarse</Link>
                            </>
                        )}

                        {/* Usuario autenticado */}
                        {token && userInfo?.role === 'user' && (
                            <>
                                <Link className="nav-link" to="/user/buscar-tutores">Buscar Tutores</Link>
                                <Link className="nav-link" to="/user/mis-citas">Mis Citas</Link>
                                <Link className="nav-link" to="/user/chats">Chats</Link>
                                <Link className="nav-link" to="/user/mi-perfil">Mi Perfil</Link>
                            </>
                        )}

                        {token && userInfo?.role === 'admin' && (
                            <>
                                <Link className="nav-link" to="/admin/dashboard">Dashboard Admin</Link>
                            </>
                        )}
                    </Nav>

                    {token && (
                        <Nav>
                            <button 
                                className="nav-link border-0 bg-transparent text-start" 
                                onClick={doLogout}
                                style={{ cursor: 'pointer' }}
                            >
                                Cerrar sesión
                            </button>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
