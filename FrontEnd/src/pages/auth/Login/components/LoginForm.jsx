import { FormInput } from '../../shared';

const emailIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const passwordIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export function LoginForm({ onSubmit, loading, correo, setCorreo, password, setPassword }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
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
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={passwordIcon}
        autoComplete="current-password"
      />

      <div className="auth-options">
        <label className="auth-remember">
          <input type="checkbox" />
          <span>Recordarme</span>
        </label>
        <a href="#" className="auth-forgot">¿Olvidaste tu contraseña?</a>
      </div>

      <button type="submit" className="auth-btn-primary" disabled={loading}>
        {loading ? 'Ingresando...' : 'Login'}
      </button>
    </form>
  );
}
