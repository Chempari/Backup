import { Link } from 'react-router-dom';
import { ProgressBar } from '../../shared/ProgressBar';
import { imageUrl } from '../../../../utils';

function Placeholder() {
  return (
    <div className="estudiante-card-img-placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
     </svg>
   </div>
  );
}

export function CursosLista({ inscripciones }) {
  if (inscripciones.length === 0) {
    return (
      <p style={{ color: 'rgba(232, 240, 236, 0.7)', fontSize: '16px' }}>
        No estas inscrito en ningun curso. <Link to="/explorar" style={{ color: 'var(--verde-intermedio-luz)', textDecoration: 'none', fontWeight: 600 }}>Explora cursos aqui</Link>
     </p>
    );
  }

  return (
    <div className="estudiante-grid">
      {inscripciones.map((insc) => {
        const curso = insc.curso_id || {};
        const imgSrc = imageUrl(curso.imagen);
        return (
          <Link
            key={insc._id}
            to={`/cursos/${curso._id}/aprender`}
            className="estudiante-card"
            style={{ textDecoration: 'none' }}
          >
            <div className="estudiante-card-img">
              {imgSrc ? (
                <img src={imgSrc} alt={curso.titulo || 'Curso'} />
              ) : (
                <Placeholder />
              )}
           </div>
            <div className="estudiante-card-info">
              <h3 className="estudiante-card-title">{curso.titulo || 'Curso sin titulo'}</h3>
              <p className="estudiante-card-desc">{curso.descripcion || ''}</p>
              <div className="estudiante-card-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                <span className="estudiante-tag">{curso.nivel || 'Sin nivel'}</span>
                <span className="estudiante-price">{curso.precio ? `${curso.precio}` : 'Gratis'}</span>
             </div>
              <ProgressBar percentage={insc.porcentaje} label="Progreso" />
           </div>
         </Link>
        );
      })}
   </div>
  );
}
