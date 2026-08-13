import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/useAuth';
import { AuthBackground, SocialButtons, SignupRedirect } from '../shared';
import { LoginForm } from './components/LoginForm';
import '../shared/auth-shared.css';

export function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(correo, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.request ? 'No se pudo conectar con el servidor. Verifica que el backend este corriendo.' : 'Error al iniciar sesion');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const pageClass = 'auth-page auth-page--slide-in-left';

  return (
    <div className={pageClass}>
      <AuthBackground active={false} shakePulse={0} />

      <main className="auth-wrapper">
        <div className="auth-card">
          <h1 className="auth-title">Iniciar sesión</h1>

          {error && <div className="auth-error-msg">{error}</div>}

          <LoginForm
            onSubmit={handleSubmit}
            loading={loading}
            correo={correo}
            setCorreo={setCorreo}
            password={password}
            setPassword={setPassword}
          />

          <SocialButtons title="Iniciar sesión con" />

          <SignupRedirect
            text="¿No tienes cuenta?"
            linkText="Regístrate aquí"
            to="/register"
          />
        </div>
      </main>
    </div>
  );
}