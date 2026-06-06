import { Navigate } from "react-router-dom";
import { getAccessToken, getUserInfo, isTokenExpired, removeAccessToken } from "../../utils/TokenUtilities";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = getAccessToken();
    const userInfo = getUserInfo();
    const expired = isTokenExpired(token);

    // Sin sesión o expirado → al login
    if (!token || expired) {
        if (expired && token) {
            console.warn("La sesión ha expirado, limpiando token.");
            removeAccessToken();
        }
        return <Navigate to="/login" replace />;
    }

    // Rol no permitido → al dashboard correspondiente
    if (allowedRoles && userInfo && !allowedRoles.includes(userInfo.role)) {
        if (userInfo.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/user/buscar-tutores" replace />;
    }

    return children;
};

export default ProtectedRoute;
