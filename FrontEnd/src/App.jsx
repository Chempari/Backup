import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { DashboardEstudiante } from './pages/dashboard/Estudiante';
import { DashboardInstructor } from './pages/dashboard/Instructor';
import { Perfil } from './pages/perfil';
import { CursosLista } from './pages/cursos/Lista';
import { CursoPreview } from './pages/cursos/Preview';
import { CursoForm } from './pages/cursos/Form';
import { CursoAprendizaje } from './pages/cursos/Aprendizaje';
import { PerfilPublico } from './pages/usuarios/PerfilPublico';
import { Landing } from './pages/landing';
import { Certificados, CertificadoDetalle } from './pages/certificados';
import { Layout } from './components/Layout';

function PublicLayoutRoute({ children, title }) {
  const { user } = useAuth();

  if (user) {
    return <Layout title={title}>{children}</Layout>;
  }

  return (
    <div>
      <nav className="layout-navbar-public" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="layout-navbar-public-brand">
          <a href="/" style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: 700, fontSize: 20 }}>Mentora</a>
        </div>
        <div className="layout-navbar-public-links">
          <a href="/login" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>Login</a>
          <a href="/register" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>Register</a>
        </div>
      </nav>
      <div className="layout-main-content">
        {title && <h1 className="layout-page-title">{title}</h1>}
        {children}
      </div>
    </div>
  );
}

function ProtectedRoute({ children, title }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-loading">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Layout title={title}>{children}</Layout>;
}

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.rol === 'instructor') return <DashboardInstructor />;
  return <DashboardEstudiante />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-loading">Cargando...</div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute title="Dashboard"><DashboardRouter /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute title="Mi Perfil"><Perfil /></ProtectedRoute>} />
      <Route path="/explorar" element={<PublicLayoutRoute title="Explorar cursos"><CursosLista /></PublicLayoutRoute>} />
      <Route path="/cursos/:id" element={<PublicLayoutRoute><CursoPreview /></PublicLayoutRoute>} />
      <Route path="/usuarios/:id" element={<PublicLayoutRoute><PerfilPublico /></PublicLayoutRoute>} />
      <Route path="/cursos/nuevo" element={<ProtectedRoute title="Crear curso"><CursoForm /></ProtectedRoute>} />
      <Route path="/cursos/:id/editar" element={<ProtectedRoute title="Editar curso"><CursoForm /></ProtectedRoute>} />
      <Route path="/cursos/:id/aprender" element={<ProtectedRoute><CursoAprendizaje /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute title="Mis Certificados"><Certificados /></ProtectedRoute>} />
      <Route path="/certificates/:id" element={<ProtectedRoute><CertificadoDetalle /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}