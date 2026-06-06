import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import axios from 'axios'
import { removeAccessToken } from '../utils/TokenUtilities'
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css'

// Configurar interceptor global de Axios para redirigir al login en caso de 401 (Sesión Expirada)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesión no autorizada o token expirado. Redirigiendo al login...');
      removeAccessToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
