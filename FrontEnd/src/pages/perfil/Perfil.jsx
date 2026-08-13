import { useState, useEffect, useRef } from 'react';
import api from '../../Api/axios';
import { imageUrl } from '../../utils';
import { PLATFORMS, validateSocialUrl, normalizeRedes } from '../../utils/social';
import './Perfil.css';

const RED_FIELDS = ['facebook', 'instagram', 'linkedin', 'github', 'whatsapp'];

export function Perfil() {
  const [nombre, setNombre] = useState('');
  const [biografia, setBiografia] = useState('');
  const [redes, setRedes] = useState({ facebook: '', instagram: '', linkedin: '', github: '', whatsapp: '' });
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [redesErrors, setRedesErrors] = useState({});
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        const u = res.data.data;
        setNombre(u.nombre || '');
        setBiografia(u.biografia || '');
        setRedes(normalizeRedes(u.redes_sociales));
        setFotoUrl(u.foto || '');
      })
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar perfil'));
  }, []);

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no permitido. Usa JPG, PNG, WEBP o GIF.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen excede 2MB.');
      return;
    }
    setSubiendoFoto(true);
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('foto', file);
    try {
      const res = await api.post('/uploads/profile-photo', formData);
      setFotoUrl(res.data.url);
      setMessage('Foto actualizada correctamente.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir foto.');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleRedChange = (platform, value) => {
    setRedes((prev) => ({ ...prev, [platform]: value }));
    setRedesErrors((prev) => ({ ...prev, [platform]: undefined }));
  };

  const validateRed = (platform, value) => {
    const err = validateSocialUrl(platform, value);
    setRedesErrors((prev) => ({ ...prev, [platform]: err || undefined }));
    return !err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const allValid = RED_FIELDS.every((p) => validateRed(p, redes[p]));
    if (!allValid) {
      setError('Revisa las URL de redes sociales antes de guardar.');
      return;
    }

    setLoading(true);
    try {
      const redesLimpias = normalizeRedes(redes);
      await api.put('/auth/profile', {
        nombre,
        biografia,
        foto: fotoUrl,
        redes_sociales: redesLimpias
      });
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.nombre = nombre;
      user.foto = fotoUrl;
      user.biografia = biografia;
      user.redes_sociales = redesLimpias;
      localStorage.setItem('user', JSON.stringify(user));
      setMessage('Perfil actualizado correctamente.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <div className="perfil-photo-section">
          <div className="perfil-photo-wrapper">
            {fotoUrl ? (
              <img src={imageUrl(fotoUrl)} alt="Perfil" className="perfil-photo" />
            ) : (
              <div className="perfil-photo-placeholder">
                {nombre ? nombre.charAt(0).toUpperCase() : '?'}
            </div>
            )}
        </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFotoUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="perfil-btn-secondary"
            onClick={() => fileRef.current?.click()}
            disabled={subiendoFoto}
          >
            {subiendoFoto ? 'Subiendo...' : 'Cambiar foto'}
         </button>
       </div>

        {message && <div className="perfil-success">{message}</div>}
        {error && <div className="perfil-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="perfil-form-group">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
         </div>

          <div className="perfil-form-group">
            <label htmlFor="biografia">Biografia</label>
            <textarea id="biografia" rows={4} value={biografia} onChange={(e) => setBiografia(e.target.value)} />
         </div>

          <div className="perfil-form-group">
            <label>Redes sociales</label>
            <p className="perfil-form-hint">
              Pega la URL completa de tu perfil en cada red. Solo se aceptan enlaces validos del dominio correspondiente.
           </p>
            {RED_FIELDS.map((platform) => (
              <div key={platform} className="perfil-red-field">
                <label htmlFor={'red-' + platform}>
                  <strong>{PLATFORMS[platform].label}</strong>
                  <span className="perfil-red-domain">{' (' + PLATFORMS[platform].domain + ')'}</span>
               </label>
                <input
                  id={'red-' + platform}
                  type="url"
                  placeholder={'https://' + PLATFORMS[platform].domain + '/tu-usuario'}
                  value={redes[platform]}
                  onChange={(e) => handleRedChange(platform, e.target.value)}
                  onBlur={(e) => validateRed(platform, e.target.value)}
                  className={redesErrors[platform] ? 'input-error' : ''}
                />
                {redesErrors[platform] && (
                  <span className="perfil-red-error">{redesErrors[platform]}</span>
                )}
             </div>
            ))}
         </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
         </button>
       </form>
     </div>
   </div>
  );
}
