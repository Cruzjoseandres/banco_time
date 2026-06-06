import { useState } from 'react';
import { Spinner, Alert, Card, Table, Form, Button } from 'react-bootstrap';
import { useAdminDashboard } from './useAdminDashboard';
import ConfirmModal from '../../../components/ConfirmModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const {
        usuarios,
        materias,
        especialidades,
        solicitudesMaterias,
        reportesData,
        loading,
        error,
        tabActiva,
        setTabActiva,
        // Modal states
        userEditando,
        setUserEditando,
        materiaEditando,
        setMateriaEditando,
        espEditando,
        setEspEditando,
        espAsignando,
        setEspAsignando,
        // Inputs
        nuevaMateria,
        setNuevaMateria,
        filtroUsuario,
        setFiltroUsuario,
        // Loading and notifications
        actionLoading,
        successMsg,
        actionError,
        // Confirm modal
        confirmData,
        // Actions
        handleUpdateUser,
        handleDeleteUser,
        handleCrearMateria,
        handleUpdateMateria,
        handleDeleteMateria,
        handleUpdateEspecialidad,
        handleDeleteEspecialidad,
        handleToggleMateriaEspecialidad,
        handleResponderSolicitud,
    } = useAdminDashboard();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard-container">
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    const pendingRequestsCount = solicitudesMaterias.filter(s => s.estado === 'pendiente').length;

    return (
        <div className="admin-dashboard-container">
            {/* Header */}
            <div className="admin-header">
                <h2>Panel de Control</h2>
                <p className="mb-0 text-muted-white" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    Administra usuarios, materias y especialidades del Banco de Tiempo.
                </p>
                <div className="admin-badge">Admin</div>
            </div>

            {/* Notifications */}
            {successMsg && <Alert variant="success" className="py-2 mb-3">{successMsg}</Alert>}
            {actionError && <Alert variant="danger" className="py-2 mb-3">{actionError}</Alert>}

            {/* Navigation Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab-btn ${tabActiva === 'usuarios' ? 'activa' : ''}`}
                    onClick={() => {
                        setTabActiva('usuarios');
                        setEspAsignando(null);
                    }}
                >
                    Usuarios ({usuarios.length})
                </button>
                <button
                    className={`admin-tab-btn ${tabActiva === 'materias' ? 'activa' : ''}`}
                    onClick={() => {
                        setTabActiva('materias');
                        setEspAsignando(null);
                    }}
                >
                    Materias ({materias.length})
                </button>
                <button
                    className={`admin-tab-btn ${tabActiva === 'especialidades' ? 'activa' : ''}`}
                    onClick={() => {
                        setTabActiva('especialidades');
                    }}
                >
                    Especialidades ({especialidades.length})
                </button>
                <button
                    className={`admin-tab-btn ${tabActiva === 'solicitudes' ? 'activa' : ''}`}
                    onClick={() => {
                        setTabActiva('solicitudes');
                        setEspAsignando(null);
                    }}
                    style={{ position: 'relative' }}
                >
                    Solicitudes
                    {pendingRequestsCount > 0 && (
                        <span className="badge bg-danger ms-1 rounded-pill" style={{ fontSize: '0.68rem', padding: '0.2rem 0.4rem' }}>
                            {pendingRequestsCount}
                        </span>
                    )}
                </button>
                <button
                    className={`admin-tab-btn ${tabActiva === 'reportes' ? 'activa' : ''}`}
                    onClick={() => {
                        setTabActiva('reportes');
                        setEspAsignando(null);
                    }}
                >
                    Reportes
                </button>
            </div>

            {/* TAB: USUARIOS */}
            {tabActiva === 'usuarios' && (
                <>
                    {/* User Edit Panel */}
                    {userEditando && (
                        <div className="edit-panel">
                            <div className="edit-panel-title">Modificar Usuario: @{userEditando.username}</div>
                            <Form onSubmit={handleUpdateUser}>
                                <div className="row g-3">
                                    <div className="col-md-5">
                                        <Form.Group controlId="editUserFullName">
                                            <Form.Label className="small mb-1">Nombre Completo</Form.Label>
                                            <Form.Control
                                                type="text"
                                                size="sm"
                                                value={userEditando.fullName}
                                                onChange={(e) => setUserEditando({ ...userEditando, fullName: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-3">
                                        <Form.Group controlId="editUserRole">
                                            <Form.Label className="small mb-1">Rol</Form.Label>
                                            <Form.Select
                                                size="sm"
                                                value={userEditando.role}
                                                onChange={(e) => setUserEditando({ ...userEditando, role: e.target.value })}
                                            >
                                                <option value="user">User (Tutor/Alumno)</option>
                                                <option value="admin">Admin (Control total)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Group controlId="editUserSaldo">
                                            <Form.Label className="small mb-1">Saldo de Horas</Form.Label>
                                            <Form.Control
                                                type="number"
                                                size="sm"
                                                min="0"
                                                value={userEditando.saldoHoras}
                                                onChange={(e) => setUserEditando({ ...userEditando, saldoHoras: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="mt-3 d-flex justify-content-end gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => setUserEditando(null)}>
                                        Cancelar
                                    </Button>
                                    <Button size="sm" variant="primary" type="submit" disabled={actionLoading}>
                                        {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    )}

                    {/* Buscador */}
                    <div className="search-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar usuario por nombre o username..."
                            value={filtroUsuario}
                            onChange={(e) => setFiltroUsuario(e.target.value)}
                        />
                    </div>

                    {/* Tabla de Usuarios */}
                    <Card className="admin-table-card">
                        <div className="table-responsive">
                            <Table hover className="admin-table align-middle">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Teléfono</th>
                                        <th>Saldo</th>
                                        <th>Rol</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="admin-user-cell">
                                                    <div className="admin-user-avatar">
                                                        {u.fullName[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{u.fullName}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>@{u.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{u.telefono || 'No registrado'}</td>
                                            <td className="fw-bold">{u.saldoHoras}h</td>
                                            <td>
                                                <span className={`role-badge ${u.role}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    className="btn-action"
                                                    onClick={() => {
                                                        setUserEditando({
                                                            id: u.id,
                                                            username: u.username,
                                                            fullName: u.fullName,
                                                            role: u.role,
                                                            saldoHoras: u.saldoHoras,
                                                        });
                                                    }}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    className="btn-action"
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    disabled={u.username === 'admin'}
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {usuarios.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">
                                                No se encontraron usuarios
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </>
            )}

            {/* TAB: MATERIAS */}
            {tabActiva === 'materias' && (
                <>
                    {/* Materia Edit Panel */}
                    {materiaEditando && (
                        <div className="edit-panel">
                            <div className="edit-panel-title">Modificar Materia</div>
                            <Form onSubmit={handleUpdateMateria} className="d-flex gap-2 align-items-end">
                                <Form.Group controlId="editMateriaName" className="flex-grow-1">
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        value={materiaEditando.detalleMateria}
                                        onChange={(e) => setMateriaEditando({ ...materiaEditando, detalleMateria: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Button size="sm" variant="secondary" onClick={() => setMateriaEditando(null)}>
                                    Cancelar
                                </Button>
                                <Button size="sm" variant="primary" type="submit" disabled={actionLoading}>
                                    {actionLoading ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </Form>
                        </div>
                    )}

                    {/* Formulario de creación */}
                    <Card className="p-3 mb-4 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                        <h6 className="mb-2 fw-bold" style={{ fontSize: '0.85rem' }}>Agregar nueva materia</h6>
                        <Form onSubmit={handleCrearMateria} className="d-flex gap-2">
                            <Form.Control
                                type="text"
                                size="sm"
                                placeholder="Ej: Álgebra Lineal, Base de Datos..."
                                value={nuevaMateria}
                                onChange={(e) => setNuevaMateria(e.target.value)}
                                required
                            />
                            <Button size="sm" type="submit" variant="primary" style={{ background: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                                Agregar
                            </Button>
                        </Form>
                    </Card>

                    {/* Tabla de Materias */}
                    <Card className="admin-table-card">
                        <div className="table-responsive">
                            <Table hover className="admin-table align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Detalle Materia</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materias.map(m => (
                                        <tr key={m.id}>
                                            <td className="text-muted fw-bold">#{m.id}</td>
                                            <td className="fw-bold">{m.detalleMateria}</td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    className="btn-action"
                                                    onClick={() => setMateriaEditando(m)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    className="btn-action"
                                                    onClick={() => handleDeleteMateria(m.id)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {materias.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-muted">
                                                No hay materias registradas en el sistema.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </>
            )}

            {/* TAB: ESPECIALIDADES */}
            {tabActiva === 'especialidades' && (
                <>
                    {/* Especialidad Edit Panel */}
                    {espEditando && (
                        <div className="edit-panel">
                            <div className="edit-panel-title">Modificar Nombre Especialidad</div>
                            <Form onSubmit={handleUpdateEspecialidad} className="d-flex gap-2 align-items-end">
                                <Form.Group controlId="editEspName" className="flex-grow-1">
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        value={espEditando.detalleEspecialidad}
                                        onChange={(e) => setEspEditando({ ...espEditando, detalleEspecialidad: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Button size="sm" variant="secondary" onClick={() => setEspEditando(null)}>
                                    Cancelar
                                </Button>
                                <Button size="sm" variant="primary" type="submit" disabled={actionLoading}>
                                    {actionLoading ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </Form>
                        </div>
                    )}

                    {/* Especialidad Asignar Materias Panel */}
                    {espAsignando && (
                        <div className="edit-panel">
                            <div className="edit-panel-title">Asignar materias a: {espAsignando.detalleEspecialidad}</div>
                            <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                                Toca las materias para agregarlas o quitarlas de la especialidad.
                            </p>
                            
                            <div className="materias-list-assign">
                                {materias.map(mat => {
                                    const tieneAsignada = espAsignando.materias?.some(m => m.id === mat.id);
                                    return (
                                        <span
                                            key={mat.id}
                                            onClick={() => handleToggleMateriaEspecialidad(espAsignando.id, mat.id, tieneAsignada)}
                                            className={`materia-check-badge ${tieneAsignada ? 'assigned' : 'unassigned'}`}
                                        >
                                            {mat.detalleMateria} {tieneAsignada ? '✓' : '+'}
                                        </span>
                                    );
                                })}
                            </div>
                            <div className="mt-3 d-flex justify-content-end">
                                <Button size="sm" variant="secondary" onClick={() => setEspAsignando(null)}>
                                    Cerrar Panel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Tabla de Especialidades */}
                    <Card className="admin-table-card">
                        <div className="table-responsive">
                            <Table hover className="admin-table align-middle">
                                <thead>
                                    <tr>
                                        <th>Especialidad</th>
                                        <th>Materias Vinculadas</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {especialidades.map(esp => (
                                        <tr key={esp.id}>
                                            <td>
                                                <div className="fw-bold">{esp.detalleEspecialidad}</div>
                                                <small className="text-muted">ID: #{esp.id}</small>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                    {esp.materias?.map(m => (
                                                        <span
                                                            key={m.id}
                                                            style={{
                                                                fontSize: '0.72rem',
                                                                background: '#f1f5f9',
                                                                color: '#475569',
                                                                padding: '0.15em 0.5em',
                                                                borderRadius: '4px',
                                                            }}
                                                        >
                                                            {m.detalleMateria}
                                                        </span>
                                                    ))}
                                                    {(!esp.materias || esp.materias.length === 0) && (
                                                        <small className="text-muted italic">Ninguna materia vinculada</small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-info"
                                                    className="btn-action"
                                                    onClick={() => {
                                                        setEspAsignando(esp);
                                                        setEspEditando(null);
                                                    }}
                                                >
                                                    Materias
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    className="btn-action"
                                                    onClick={() => {
                                                        setEspEditando(esp);
                                                        setEspAsignando(null);
                                                    }}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    className="btn-action"
                                                    onClick={() => handleDeleteEspecialidad(esp.id)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {especialidades.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-muted">
                                                No hay especialidades registradas en el sistema.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </>
            )}

            {/* TAB: SOLICITUDES DE MATERIAS */}
            {tabActiva === 'solicitudes' && (
                <Card className="admin-table-card">
                    <div className="table-responsive">
                        <Table hover className="admin-table align-middle">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Especialidad</th>
                                    <th>Materia Solicitada</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudesMaterias.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <div className="fw-bold">{s.usuario?.fullName}</div>
                                            <small className="text-muted">@{s.usuario?.username}</small>
                                        </td>
                                        <td>{s.especialidad?.detalleEspecialidad}</td>
                                        <td className="fw-semibold text-primary">{s.detalleMateria}</td>
                                        <td>{new Date(s.fechaCreacion).toLocaleDateString('es-ES')}</td>
                                        <td>
                                            <span className={`role-badge ${
                                                s.estado === 'pendiente' ? 'admin' :
                                                s.estado === 'aprobada' ? 'user' : 'bg-danger text-white'
                                            }`} style={{ textTransform: 'capitalize' }}>
                                                {s.estado}
                                            </span>
                                        </td>
                                        <td>
                                            {s.estado === 'pendiente' ? (
                                                <div className="d-flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        className="btn-action px-2 py-1"
                                                        onClick={() => handleResponderSolicitud(s.id, 'aprobada')}
                                                    >
                                                        Aprobar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        className="btn-action px-2 py-1"
                                                        onClick={() => handleResponderSolicitud(s.id, 'rechazada')}
                                                    >
                                                        Rechazar
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Procesada</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {solicitudesMaterias.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">
                                            No hay solicitudes registradas en el sistema.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card>
            )}

            {/* TAB: REPORTES */}
            {tabActiva === 'reportes' && (
                <div className="reports-section">
                    {!reportesData ? (
                        <Alert variant="warning" className="text-center">
                            No se pudieron cargar los datos de reportes. Intente recargar.
                        </Alert>
                    ) : (
                        <>
                            {/* Tarjetas de Métricas de Impacto */}
                            <div className="reports-grid">
                                <div className="report-card">
                                    <div className="report-card-icon shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    </div>
                                    <div className="report-card-content">
                                        <span className="report-card-label">Horas Intercambiadas</span>
                                        <h3 className="report-card-value text-primary">{reportesData.impacto.totalHorasIntercambiadas}h</h3>
                                        <p className="report-card-desc">Tiempo de apoyo y aprendizaje mutuo ahorrado por los miembros.</p>
                                    </div>
                                </div>

                                <div className="report-card">
                                    <div className="report-card-icon shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <div className="report-card-content">
                                        <span className="report-card-label">Comunidad Activa</span>
                                        <h3 className="report-card-value text-success">{reportesData.comunidad.totalActivos}</h3>
                                        <p className="report-card-desc">Miembros participando activamente (como tutor o estudiante).</p>
                                    </div>
                                </div>

                                <div className="report-card">
                                    <div className="report-card-icon shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning"><path d="m12 3-1.912 5.886H3.878l4.98 3.62-1.908 5.885 4.962-3.6 4.962 3.6-1.91-5.886 4.982-3.62h-6.208L12 3Z"/></svg>
                                    </div>
                                    <div className="report-card-content">
                                        <span className="report-card-label">Índice Reciprocidad</span>
                                        <h3 className="report-card-value text-warning">{reportesData.impacto.indiceReciprocidad}%</h3>
                                        <p className="report-card-desc">Proporción de miembros que actúan como tutores y alumnos.</p>
                                    </div>
                                </div>

                                <div className="report-card">
                                    <div className="report-card-icon shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                    </div>
                                    <div className="report-card-content">
                                        <span className="report-card-label">Confianza Promedio</span>
                                        <h3 className="report-card-value text-info">{reportesData.impacto.calificacionPromedio} / 5</h3>
                                        <p className="report-card-desc">Nivel de satisfacción promedio en las tutorías finalizadas.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fila de Gráficos */}
                            <div className="row g-4 mb-4">
                                {/* Evolución Temporal SVG */}
                                <div className="col-md-6">
                                    <Card className="report-graph-card p-3 h-100 shadow-sm border-0">
                                        <h5 className="graph-title mb-1">Evolución de Horas Intercambiadas</h5>
                                        <p className="text-muted small mb-3">Historial mensual de tiempo compartido en la comunidad</p>
                                        
                                        <div className="svg-container" style={{ position: 'relative' }}>
                                            {/* Interactive SVG Area Chart */}
                                            {(() => {
                                                const evo = reportesData.evolucionMensual || [];
                                                const maxHoras = Math.max(...evo.map(d => d.horas), 5);
                                                
                                                const svgWidth = 500;
                                                const svgHeight = 220;
                                                const paddingLeft = 45;
                                                const paddingRight = 20;
                                                const paddingTop = 25;
                                                const paddingBottom = 35;
                                                
                                                const chartWidth = svgWidth - paddingLeft - paddingRight;
                                                const chartHeight = svgHeight - paddingTop - paddingBottom;
                                                
                                                const getX = (idx) => paddingLeft + (idx / (evo.length - 1 || 1)) * chartWidth;
                                                const getY = (val) => svgHeight - paddingBottom - (val / maxHoras) * chartHeight;
                                                
                                                let linePath = "";
                                                let areaPath = "";
                                                if (evo.length > 0) {
                                                    linePath = `M ${getX(0)} ${getY(evo[0].horas)} ` + 
                                                        evo.map((d, idx) => `L ${getX(idx)} ${getY(d.horas)}`).join(' ');
                                                    areaPath = `${linePath} L ${getX(evo.length - 1)} ${svgHeight - paddingBottom} L ${getX(0)} ${svgHeight - paddingBottom} Z`;
                                                }
                                                
                                                const gridTicks = [0, 0.25, 0.5, 0.75, 1];
                                                
                                                return (
                                                    <>
                                                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="interactive-chart" width="100%">
                                                            <defs>
                                                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                                                                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                                                                </linearGradient>
                                                            </defs>
                                                            
                                                            {/* Grid Lines */}
                                                            {gridTicks.map((t, i) => {
                                                                const val = t * maxHoras;
                                                                const y = svgHeight - paddingBottom - t * chartHeight;
                                                                return (
                                                                    <g key={i} opacity="0.35">
                                                                        <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#cbd5e1" strokeDasharray="4,4" />
                                                                        <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{val.toFixed(1)}h</text>
                                                                    </g>
                                                                );
                                                            })}
                                                            
                                                            {/* Shaded Area */}
                                                            {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}
                                                            
                                                            {/* Line */}
                                                            {linePath && <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                                                            
                                                            {/* X Axis labels */}
                                                            {evo.map((d, idx) => (
                                                                <text key={idx} x={getX(idx)} y={svgHeight - 12} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500">
                                                                    {d.mes}
                                                                </text>
                                                            ))}
                                                            
                                                            {/* Data Points */}
                                                            {evo.map((d, idx) => {
                                                                const x = getX(idx);
                                                                const y = getY(d.horas);
                                                                const isHovered = hoveredPoint === idx;
                                                                return (
                                                                    <g key={idx}>
                                                                        <circle 
                                                                            cx={x} 
                                                                            cy={y} 
                                                                            r={isHovered ? 7 : 4} 
                                                                            fill={isHovered ? "#4f46e5" : "#ffffff"} 
                                                                            stroke="#4f46e5" 
                                                                            strokeWidth={isHovered ? 3.5 : 2} 
                                                                            style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                                                            onMouseEnter={() => setHoveredPoint(idx)}
                                                                            onMouseLeave={() => setHoveredPoint(null)}
                                                                        />
                                                                    </g>
                                                                );
                                                            })}
                                                        </svg>
                                                        
                                                        {/* Tooltip */}
                                                        {hoveredPoint !== null && (
                                                            <div className="chart-tooltip shadow" style={{
                                                                position: 'absolute',
                                                                left: `${(getX(hoveredPoint) / svgWidth) * 100}%`,
                                                                top: `${(getY(evo[hoveredPoint].horas) / svgHeight) * 100 - 8}%`,
                                                                transform: 'translate(-50%, -100%)',
                                                                background: '#1e293b',
                                                                color: '#ffffff',
                                                                padding: '6px 12px',
                                                                borderRadius: '8px',
                                                                fontSize: '0.72rem',
                                                                pointerEvents: 'none',
                                                                zIndex: 10,
                                                                whiteSpace: 'nowrap',
                                                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
                                                            }}>
                                                                <span className="d-block fw-bold border-bottom pb-1 mb-1 text-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>{evo[hoveredPoint].mes}</span>
                                                                <span>Horas: <strong>{evo[hoveredPoint].horas}h</strong></span><br/>
                                                                <span>Tutorías: <strong>{evo[hoveredPoint].tutorias}</strong></span>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </Card>
                                </div>

                                {/* Demanda de Materias (Top Temáticas) */}
                                <div className="col-md-6">
                                    <Card className="report-graph-card p-3 h-100 shadow-sm border-0">
                                        <h5 className="graph-title mb-1">Materias con Mayor Demanda</h5>
                                        <p className="text-muted small mb-3">Top temáticas con más intercambios finalizados</p>
                                        
                                        <div className="materias-bar-container">
                                            {(() => {
                                                const topMats = reportesData.topMaterias || [];
                                                const maxCount = topMats.length > 0 ? Math.max(...topMats.map(m => m.count), 1) : 1;
                                                return topMats.map((m, idx) => {
                                                    const percentage = (m.count / maxCount) * 100;
                                                    return (
                                                        <div key={m.id || idx} className="materia-progress-row mb-3">
                                                            <div className="d-flex justify-content-between text-secondary mb-1" style={{ fontSize: '0.78rem' }}>
                                                                <span className="fw-semibold text-slate-800">{m.name}</span>
                                                                <span className="fw-bold text-slate-600">{m.count} tutorías</span>
                                                            </div>
                                                            <div className="progress" style={{ height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0' }}>
                                                                <div 
                                                                    className="progress-bar" 
                                                                    style={{ 
                                                                        width: `${percentage}%`,
                                                                        background: 'linear-gradient(90deg, #6366f1, #a855f7)', 
                                                                        borderRadius: '4px',
                                                                        transition: 'width 0.8s ease'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                            {(!reportesData.topMaterias || reportesData.topMaterias.length === 0) && (
                                                <div className="text-center text-muted py-5 small">No hay materias finalizadas aún.</div>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* Tercera Sección: Distribución de Citas y Roles */}
                            <div className="row g-4 mb-4">
                                <div className="col-md-5">
                                    <Card className="report-graph-card p-3 h-100 shadow-sm border-0">
                                        <h5 className="graph-title mb-1">Distribución de Citas por Estado</h5>
                                        <p className="text-muted small mb-3">Salud y completitud de las tutorías comunitarias</p>
                                        
                                        <div className="appointment-stacked-bar mb-4">
                                            {(() => {
                                                const estados = reportesData.citasPorEstado || {};
                                                const total = Object.values(estados).reduce((a, b) => a + b, 0) || 1;
                                                
                                                const finalizadasPct = ((estados.finalizada || 0) / total) * 100;
                                                const canceladasPct = ((estados.cancelada || 0) / total) * 100;
                                                const rechazadasPct = ((estados.rechazada || 0) / total) * 100;
                                                const aceptadasPct = ((estados.aceptada || 0) / total) * 100;
                                                const pendientesPct = ((estados.pendiente || 0) / total) * 100;
                                                
                                                return (
                                                    <div>
                                                        <div className="d-flex" style={{ height: '20px', borderRadius: '6px', overflow: 'hidden' }}>
                                                            {finalizadasPct > 0 && <div className="bg-success text-white" style={{ width: `${finalizadasPct}%` }} title={`Finalizadas: ${estados.finalizada}`} />}
                                                            {aceptadasPct > 0 && <div className="bg-primary text-white" style={{ width: `${aceptadasPct}%` }} title={`Aceptadas: ${estados.aceptada}`} />}
                                                            {pendientesPct > 0 && <div className="bg-warning text-white" style={{ width: `${pendientesPct}%` }} title={`Pendientes: ${estados.pendiente}`} />}
                                                            {canceladasPct > 0 && <div className="bg-danger text-white" style={{ width: `${canceladasPct}%` }} title={`Canceladas: ${estados.cancelada}`} />}
                                                            {rechazadasPct > 0 && <div className="bg-secondary text-white" style={{ width: `${rechazadasPct}%` }} title={`Rechazadas: ${estados.rechazada}`} />}
                                                        </div>
                                                        <div className="mt-3 grid-states-labels d-flex flex-wrap gap-3" style={{ fontSize: '0.75rem' }}>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span className="d-inline-block rounded-circle bg-success" style={{ width: '10px', height: '10px' }} />
                                                                <span>Finalizadas: <strong>{estados.finalizada || 0}</strong></span>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span className="d-inline-block rounded-circle bg-primary" style={{ width: '10px', height: '10px' }} />
                                                                <span>Aceptadas: <strong>{estados.aceptada || 0}</strong></span>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span className="d-inline-block rounded-circle bg-warning" style={{ width: '10px', height: '10px' }} />
                                                                <span>Pendientes: <strong>{estados.pendiente || 0}</strong></span>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span className="d-inline-block rounded-circle bg-danger" style={{ width: '10px', height: '10px' }} />
                                                                <span>Canceladas: <strong>{estados.cancelada || 0}</strong></span>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span className="d-inline-block rounded-circle bg-secondary" style={{ width: '10px', height: '10px' }} />
                                                                <span>Rechazadas: <strong>{estados.rechazada || 0}</strong></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </Card>
                                </div>
                                <div className="col-md-7">
                                    <Card className="report-graph-card p-3 h-100 shadow-sm border-0">
                                        <h5 className="graph-title mb-1">Participación de la Comunidad</h5>
                                        <p className="text-muted small mb-3">Comportamiento y perfilación de los usuarios</p>
                                        
                                        <div className="d-flex align-items-center justify-content-around h-100 py-2">
                                            <div className="community-stat-item text-center">
                                                <div className="stat-circle text-success font-bold" style={{ fontSize: '1.5rem', width: '80px', height: '80px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                                    {reportesData.comunidad.totalUsuarios}
                                                </div>
                                                <span className="small text-muted fw-semibold d-block">Registrados</span>
                                            </div>

                                            <div className="community-stat-item text-center">
                                                <div className="stat-circle text-primary font-bold" style={{ fontSize: '1.5rem', width: '80px', height: '80px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                                    {reportesData.comunidad.totalTutors}
                                                </div>
                                                <span className="small text-muted fw-semibold d-block">Tutores</span>
                                            </div>

                                            <div className="community-stat-item text-center">
                                                <div className="stat-circle text-warning font-bold" style={{ fontSize: '1.5rem', width: '80px', height: '80px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                                    {reportesData.comunidad.totalEstudiantes}
                                                </div>
                                                <span className="small text-muted fw-semibold d-block">Estudiantes</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* Cuarta Sección: Voces de la Comunidad (Impacto Humano) */}
                            <Card className="report-graph-card p-3 shadow-sm border-0 mb-4">
                                <h5 className="graph-title mb-1">Voces de la Comunidad</h5>
                                <p className="text-muted small mb-3">Últimas experiencias y testimonios que demuestran el valor del intercambio de conocimientos</p>
                                
                                <div className="testimonials-feed mt-2">
                                    {reportesData.comentariosRecientes.map((comment, index) => (
                                        <div key={comment.id || index} className="testimonial-bubble p-3 mb-3 border-start border-4 border-primary bg-light" style={{ borderRadius: '0 12px 12px 0' }}>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <span className="fw-bold text-slate-800" style={{ fontSize: '0.85rem' }}>{comment.estudiante}</span>
                                                    <span className="text-muted mx-2" style={{ fontSize: '0.72rem' }}>recibió tutoría de</span>
                                                    <span className="fw-semibold text-primary" style={{ fontSize: '0.85rem' }}>{comment.tutor}</span>
                                                    <span className="text-muted ms-2" style={{ fontSize: '0.72rem' }}>en <strong>{comment.materia}</strong></span>
                                                </div>
                                                <div className="text-warning d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <svg 
                                                            key={i} 
                                                            xmlns="http://www.w3.org/2000/svg" 
                                                            width="12" 
                                                            height="12" 
                                                            fill={i < Math.floor(comment.calificacion) ? "currentColor" : "none"} 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.97-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.42c-.772-.56-.372-1.81.587-1.81H8.3a1 1 0 00.95-.69l1.519-4.674z"/>
                                                        </svg>
                                                    ))}
                                                    <span className="text-muted ms-1 small">({comment.calificacion})</span>
                                                </div>
                                            </div>
                                            <p className="mb-1 italic text-slate-700" style={{ fontSize: '0.82rem', fontStyle: 'italic' }}>
                                                "{comment.comentario}"
                                            </p>
                                            <div className="text-end text-muted" style={{ fontSize: '0.68rem' }}>
                                                {comment.fecha}
                                            </div>
                                        </div>
                                    ))}
                                    {(!reportesData.comentariosRecientes || reportesData.comentariosRecientes.length === 0) && (
                                        <div className="text-center text-muted py-4 small">No hay testimonios ni valoraciones recientes.</div>
                                    )}
                                </div>
                            </Card>
                        </>
                    )}
                </div>
            )}

            {/* Modal de confirmación personalizado */}
            <ConfirmModal 
                show={confirmData.show}
                onHide={() => setConfirmData(prev => ({ ...prev, show: false }))}
                onConfirm={confirmData.onConfirm}
                title={confirmData.title}
                body={confirmData.body}
                confirmText={confirmData.confirmText}
                confirmVariant={confirmData.confirmVariant}
            />
        </div>
    );
};

export default AdminDashboard;
