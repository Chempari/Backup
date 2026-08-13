import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/useAuth';
import { AuthBackground, SocialButtons, SignupRedirect } from '../shared';
import { RegisterForm } from './components/RegisterForm';
import '../shared/auth-shared.css';

export function Register() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    if (!correo.toLowerCase().endsWith('@gmail.com')) {
      setError('Solo se permiten correos de Gmail (@gmail.com)');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register({ nombre, apellido, correo, password, rol });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrarse';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const pageClass = 'auth-page auth-page--slide-in-right';

  return (
    <div className={pageClass}>
      <AuthBackground active={false} shakePulse={0} />

      <main className="auth-wrapper">
        <div className="auth-card">
          <h1 className="auth-title">Registrarse</h1>

          {error && <div className="auth-error-msg">{error}</div>}

          <RegisterForm
            onSubmit={handleSubmit}
            loading={loading}
            nombre={nombre}
            setNombre={setNombre}
            apellido={apellido}
            setApellido={setApellido}
            correo={correo}
            setCorreo={setCorreo}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            rol={rol}
            setRol={setRol}
          />

          <SocialButtons title="Registrarse con" />

          <SignupRedirect
            text="¿Ya tienes cuenta?"
            linkText="Inicia sesión"
            to="/login"
          />
        </div>
      </main>
    </div>
  );
}