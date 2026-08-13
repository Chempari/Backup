import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Switch } from '../../shared/Switch';
import { imageUrl } from '../../../../utils';
import api from '../../../../Api/axios';

export function CursoCard({ curso, onTogglePublicado, onDelete, onVisualizar }) {
  const [showInscritos, setShowInscritos] = useState(false);
  const [inscritos, setInscritos] = useState([]);
  const [inscritosLoading, setInscritosLoading] = useState(false);
  const [inscritosError, setInscritosError] = useState('');

  const abrirInscritos = () => {
    setShowInscritos(true);
    setInscritosLoading(true);
    setInscritosError('');
    setInscritos([]);
    api.get(`/Cursos/${curso._id}/inscritos-detalle`)
      .then((res) => setInscritos(res.data?.inscritos || []))
      .catch((err) => setInscritosError(err.response?.data?.message || 'Error al cargar los inscritos'))
      .finally(() => setInscritosLoading(false));
  };

  const cerrarInscritos = () => setShowInscritos(false);

  useEffect(() => {
    if (!showInscritos) return;
    const onKey = (e) => { if (e.key === 'Escape') cerrarInscritos(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [showInscritos]);

  const formatoFecha = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const modal = showInscritos && (
    <div className="instructor-course-inscritos-modal-overlay" onClick={cerrarInscritos}>
      <div className="instructor-course-inscritos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="instructor-course-inscritos-modal-header">
          <h4>Alumnos inscritos en "{curso.titulo}"</h4>
          <button type="button" className="modal-close-btn" onClick={cerrarInscritos} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="instructor-course-inscritos-modal-body">
          {inscritosLoading && <p className="inscritos-loading">Cargando inscritos...</p>}
          {!inscritosLoading && inscritosError && <p className="inscritos-empty">{inscritosError}</p>}
          {!inscritosLoading && !inscritosError && inscritos.length === 0 && (
            <p className="inscritos-empty">Aun no hay alumnos inscritos en este curso.</p>
          )}
          {!inscritosLoading && !inscritosError && inscritos.map((insc) => (
            <div key={insc._id} className="inscrito-item">
              {insc.estudiante?.foto ? (
                <img src={imageUrl(insc.estudiante.foto)} alt="" className="inscrito-avatar" />
              ) : (
                <div className="inscrito-avatar-placeholder">
                  {(insc.estudiante?.nombre && insc.estudiante.nombre.charAt(0).toUpperCase()) || '?'}
                </div>
              )}
              <div className="inscrito-info">
                <p className="inscrito-name">{insc.estudiante?.nombre || 'Sin nombre'}</p>
                {insc.estudiante?.correo && <p className="inscrito-email">{insc.estudiante.correo}</p>}
                <div className="inscrito-meta">
                  <span>{insc.porcentaje || 0}% completado</span>
                  <span>Inscrito {formatoFecha(insc.fecha_inscripcion)}</span>
                  <span>{insc.comentarios_count || 0} comentario(s)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
        <button type="button" className="instructor-course-btn instructor-course-btn--view" onClick={() => onVisualizar?.(curso._id)}>Ver curso</button>
        <button type="button" className="instructor-course-btn instructor-course-btn--inscritos" onClick={abrirInscritos}>Ver inscritos</button>
        <button type="button" className="instructor-course-btn instructor-course-btn--delete" onClick={() => onDelete(curso._id)}>Eliminar</button>
      </div>
    </div>

    {createPortal(modal, document.body)}
    </article>
  );
}