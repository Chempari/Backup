import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../Api/axios';
import { imageUrl } from '../../utils';
import { SocialIcon } from '../../components/SocialIcons';
import { PlayIcon } from '../../components/Icons';
import './PerfilPublico.css';

export function PerfilPublico() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/Usuarios-publico/' + id)
      .then((res) => {
        const data = res.data;
        setUsuario(data.usuario);
        setCursos(data.cursos || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar perfil'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="dash-loading">Cargando perfil</div>;
  if (error) return <div className="dash-error">{error}</div>;
  if (!usuario) return <div className="dash-error">Usuario no encontrado</div>;

  const redes = usuario.redes_sociales || {};
  const redesEntries = Object.entries(redes).filter(([, url]) => url && url.trim());

  return (
    <div className="perfil-publico-page">
      <div className="perfil-publico-card">
        <div className="perfil-publico-header">
          {usuario.foto ? (
            <img src={imageUrl(usuario.foto)} alt={usuario.nombre} className="perfil-publico-foto" />
          ) : (
            <div className="perfil-publico-placeholder">
              {(usuario.nombre && usuario.nombre.charAt(0).toUpperCase()) || '?'}
           </div>
          )}
          <div className="perfil-publico-nombre">
            <h1>{usuario.nombre} {usuario.apellido || ''}</h1>
            <span className={'perfil-publico-rol perfil-publico-rol--' + usuario.rol}>
              {usuario.rol}
           </span>
         </div>
       </div>

        {usuario.biografia && <p className="perfil-publico-bio">{usuario.biografia}</p>}

        {redesEntries.length > 0 && (
          <div className="perfil-publico-redes">
            {redesEntries.map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={'perfil-publico-red perfil-publico-red--' + platform}
                aria-label={platform}
              >
                <SocialIcon platform={platform} size={22} />
                <span>{platform}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="perfil-publico-cursos">
        <h2>
          {usuario.rol === 'instructor' ? 'Sus cursos' : 'Cursos inscritos'} ({cursos.length})
       </h2>
        {cursos.length === 0 ? (
          <p className="perfil-publico-empty">
            {usuario.rol === 'instructor'
              ? 'Este instructor no tiene cursos publicados.'
              : 'Aun no hay cursos para mostrar.'}
         </p>
        ) : (
          <div className="perfil-publico-lista">
            {cursos.map((curso) => (
              <Link key={curso._id} to={'/cursos/' + curso._id} className="perfil-publico-curso">
                {curso.imagen ? (
                  <img src={imageUrl(curso.imagen)} alt="" />
                ) : (
                  <div className="perfil-publico-curso-placeholder"><PlayIcon size={22} /></div>
                )}
                <div className="perfil-publico-curso-info">
                  <h3>{curso.titulo}</h3>
                  <span>{(curso.categoria || 'Sin categoria') + ' - ' + (curso.nivel || '')}</span>
               </div>
             </Link>
            ))}
         </div>
        )}
     </div>
   </div>
  );
}
