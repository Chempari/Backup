import { Link } from 'react-router-dom';
import { imageUrl } from '../../../../utils';

export function CursoCard({ curso }) {
  return (
    <Link to={`/cursos/${curso._id}`} className="lista-card">
      {curso.imagen ? (
        <img src={imageUrl(curso.imagen)} alt={curso.titulo} className="lista-card-img" />
      ) : (
        <div className="lista-card-img-placeholder">{'?'}</div>
      )}
      <div className="lista-card-body">
        <h3>{curso.titulo}</h3>
        <div className="lista-card-meta">
          <span>{curso.categoria || 'Sin categoria'}</span>
          <span>{curso.nivel || 'Sin nivel'}</span>
        </div>
        <span className={`lista-card-precio ${curso.precio === 0 ? 'gratis' : ''}`}>
          {curso.precio === 0 ? 'Gratis' : `$${curso.precio ?? 0}`}
        </span>
        {curso.calificacion_promedio > 0 && (
          <span style={{ fontSize: 13, color: '#f59e0b', display: 'block', marginTop: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {curso.calificacion_promedio}
          </span>
        )}
      </div>
    </Link>
  );
}
