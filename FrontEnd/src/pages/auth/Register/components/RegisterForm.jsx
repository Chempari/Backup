import { FormInput } from '../../shared';

const userIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const emailIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const passwordIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const rolIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export function RegisterForm({
  onSubmit,
  loading,
  nombre,
  setNombre,
  apellido,
  setApellido,
  correo,
  setCorreo,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  rol,
  setRol,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <FormInput
        id="nombre"
        type="text"
        placeholder="Nombre"
        required
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        icon={userIcon}
        autoComplete="given-name"
      />

      <FormInput
        id="apellido"
        type="text"
        placeholder="Apellido"
        required
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
        icon={userIcon}
        autoComplete="family-name"
      />

      <FormInput
        id="email"
        type="email"
        placeholder="Correo"
        required
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        icon={emailIcon}
        autoComplete="email"
      />

      <FormInput
        id="password"
        type="password"
        placeholder="Contraseña"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={passwordIcon}
        autoComplete="new-password"
      />

      <FormInput
        id="confirm-password"
        type="password"
        placeholder="Confirmar contraseña"
        required
        minLength={6}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        icon={passwordIcon}
        autoComplete="new-password"
      />

      <div className="auth-input-container">
        <select
          id="rol"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="auth-input"
        >
          <option value="estudiante">Estudiante</option>
          <option value="instructor">Instructor</option>
        </select>
        <span className="auth-input-icon">{rolIcon}</span>
      </div>

      <button type="submit" className="auth-btn-primary" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
}
