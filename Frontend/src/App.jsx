import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Autenticación
import FormLogin from './pages/auth/Login/FormLogin.jsx';
import FormRegister from './pages/auth/Register/FormRegister.jsx';

// Banco de Tiempo — Vistas de Usuario
import BuscarTutores from './pages/User/BuscarTutores/BuscarTutores.jsx';
import MisCitas from './pages/User/MisCitas/MisCitas.jsx';
import CrearCita from './pages/User/CrearCita/CrearCita.jsx';
import MiPerfil from './pages/User/MiPerfil/MiPerfil.jsx';
import ChatCita from './pages/User/ChatCita/ChatCita.jsx';
import PerfilTutor from './pages/User/PerfilTutor/PerfilTutor.jsx';
import Chats from './pages/User/Chats/Chats.jsx';
import ChatConversacion from './pages/User/ChatConversacion/ChatConversacion.jsx';

// Banco de Tiempo — Vista de Administrador
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<BuscarTutores />} />
        <Route path="/login" element={<FormLogin />} />
        <Route path="/register" element={<FormRegister />} />

        {/* Rutas de Administrador */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Usuario — Banco de Tiempo */}
        <Route path="/user" element={<Navigate to="/user/buscar-tutores" replace />} />
        <Route path="/user/" element={<Navigate to="/user/buscar-tutores" replace />} />
        <Route
          path="/user/buscar-tutores"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <BuscarTutores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/mis-citas"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <MisCitas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/crear-cita"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <CrearCita />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/mi-perfil"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <MiPerfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/chats"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Chats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/conversacion/:conversacionId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ChatConversacion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/chat/:citaId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ChatCita />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/tutor/:tutorId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <PerfilTutor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
