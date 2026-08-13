import { Link } from 'react-router-dom';
import { UserLink } from '../../../../components/UserLink';
import './InstructorComentariosRecientes.css';

function formatoFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function InstructorComentariosRecientes({ comentarios }) {
  if (!comentarios || comentarios.length === 0) {
    return (
      <div className="instructor-comentarios-vacio">Aun no hay comentarios en tus cursos. Comparte tus cursos para empezar a recibir feedback.</div>
    );
  }

  return (
    <div className="instructor-comentarios">
      {comentarios.map((c) => (
        <article key={c._id} className="instructor-comentario">
          <div className="instructor-comentario-head">
            <UserLink user={c.estudiante_id} size="sm" />
            <span className="instructor-comentario-fecha">{formatoFecha(c.createdAt)}</span>
          </div>
          {typeof c.calificacion === 'number' && c.calificacion !== null && (
            <div className="instructor-comentario-stars">
              {'\u2605'.repeat(c.calificacion)}
              {'\u2606'.repeat(5 - c.calificacion)}
            </div>
          )}
          {c.comentario && (
            <p className="instructor-comentario-texto">{c.comentario}</p>
          )}
          {c.curso && c.curso._id && (
            <div className="instructor-comentario-curso">En 
              <Link to={'/cursos/' + c.curso._id}>{c.curso.titulo}</Link>
              {c.leccion_id && <span className="instructor-comentario-leccion"> (comentario de leccion)</span>}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
