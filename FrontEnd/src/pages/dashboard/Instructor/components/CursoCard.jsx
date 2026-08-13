import { Link } from 'react-router-dom';
import { Switch } from '../../shared/Switch';
import { imageUrl } from '../../../../utils';
import { useState } from 'react';

export function CursoCard({ curso, onTogglePublicado, onDelete, onVisualizar }) {
  const [showInscritos, setShowInscritos] = useState(false);

  return (
    <article className="instructor-course-card">
      <div className="instructor-course-media">
        {curso.imagen ? (
          <img src={imageUrl(curso.imagen)} alt={curso.titulo} />
        ) : (
          <div className="instructor-course-placeholder">{(curso.titulo && curso.titulo.charAt(0).toUpperCase()) || '?'}</div>
        )}
        <div className={`instructor-course-status ${curso.publicado ? 'is-published' : 'is-draft'}`}>
          {curso.publicado ? 'Publicado' : 'Borrador'}
      </div>
    </div>

      <div className="instructor-course-body">
        <h3 className="instructor-course-title">{curso.titulo}</h3>
        <div className="instructor-course-tags">
          {curso.categoria && <span className="instructor-course-tag">{curso.categoria}</span>}
          {curso.nivel && <span className="instructor-course-tag instructor-course-tag--nivel">{curso.nivel}</span>}
      </div>

      <div className="instructor-course-stats">
        <div className="instructor-course-stat">
          <span className="instructor-course-stat-value">{curso.total_inscritos || 0}</span>
          <span className="instructor-course-stat-label">Alumnos</span>
        </div>
        <div className="instructor-course-stat">
          <span className="instructor-course-stat-value">{(typeof curso.calificacion_promedio === 'number' ? curso.calificacion_promedio.toFixed(1) : '0.0') + ' / 5'}</span>
          <span className="instructor-course-stat-label">Calificacion</span>
        </div>
        <div className="instructor-course-stat">
          <span className="instructor-course-stat-value">{curso.precio > 0 ? '$' + curso.precio : 'Gratis'}</span>
          <span className="instructor-course-stat-label">Precio</span>
        </div>
      </div>
    </div>

    <div className="instructor-course-footer">
      <div className="instructor-course-toggle">
        <span className="instructor-course-toggle-label">{curso.publicado ? 'Despublicar' : 'Publicar'}</span>
        <Switch isOn={curso.publicado} onToggle={() => onTogglePublicado(curso)} title={curso.publicado ? 'Despublicar' : 'Publicar'} />
      </div>
      <div className="instructor-course-actions">
        <Link to={'/cursos/' + curso._id + '/editar'} className="instructor-course-btn instructor-course-btn--edit">Editar</Link>
        <button type="button" className="instructor-course-btn instructor-course-btn--view" onClick={() => onVisualizar?.(curso._id)}>Visualizar</button>
        <button type="button" className="instructor-course-btn instructor-course-btn--inscritos" onClick={() => setShowInscritos(true)}>Ver inscritos</button>
        <button type="button" className="instructor-course-btn instructor-course-btn--delete" onClick={() => onDelete(curso._id)}>Eliminar</button>
      </div>
    </div>
    
    {showInscritos && (
      <div className="instructor-course-inscritos-modal-overlay" onClick={() => setShowInscritos(false)}>
        <div className="instructor-course-inscritos-modal" onClick={(e) => e.stopPropagation()}>
          <div className="instructor-course-inscritos-modal-header">
            <h4>Alumnos inscritos en "{curso.titulo}"</h4>
            <button type="button" className="modal-close-btn" onClick={() => setShowInscritos(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="instructor-course-inscritos-modal-body">
            <p className="inscritos-loading">Cargando inscritos...</p>
          </div>
        </div>
      </div>
    )}
    </article>
  );
}
