import { useState } from 'react';
import { StarPicker, ResenaCard } from '../Preview/components';
import { StarIcon } from '../../../components/Icons';
import { HiloRespuestas } from './HiloRespuestas';
import './resenas.css';

export function ComentariosCurso({
  resenas,
  loading,
  user,
  enrolled,
  promedio,
  modoInstructor = false,
  onComentar,
  onCalificar,
  onActualizar,
  onEliminar,
  onResponder,
}) {
  const currentUserId = user?._id;
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState('');

  const totalReviewers = new Set(resenas.map((r) => r.estudiante_id?._id).filter(Boolean)).size;
  const miCalificacion = resenas.find(
    (r) => r.estudiante_id?._id === currentUserId && typeof r.calificacion === 'number' && r.calificacion !== null
  )?.calificacion || 0;

  const puedeParticipar = user?.rol === 'estudiante' && enrolled;
  const puedeResponder = onResponder && (puedeParticipar || (user?.rol === 'instructor' && modoInstructor));

  const raices = resenas.filter((r) => !r.respuesta_a);
  const totalComentarios = raices.length;

  const handleComentar = async () => {
    if (!nuevoComentario.trim()) return;
    setEnviando(true);
    setMsg('');
    try {
      await onComentar(nuevoComentario);
      setNuevoComentario('');
      setMsg('Comentario publicado.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error al publicar el comentario');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="resenas-section">
      <h2>Comentarios ({totalComentarios})</h2>
      {promedio > 0 && (
        <div className="calificacion-display">
          <span className="estrellas"><StarIcon size={28} /></span>
          <span>{promedio}</span>
          <span style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 400 }}>
            ({totalReviewers} {totalReviewers === 1 ? 'resena' : 'resenas'})
          </span>
        </div>
      )}
      {loading ? (
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Cargando comentarios...</p>
      ) : totalComentarios === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>No hay comentarios aun.</p>
      ) : (
        raices.map((r) => {
          const respuestas = resenas.filter((x) => x.respuesta_a === r._id);
          return (
            <div key={r._id} className="comentario-hilo">
              <ResenaCard
                resena={r}
                currentUserId={currentUserId}
                onUpdate={onActualizar}
                onDelete={onEliminar}
                puedeResponder={puedeResponder}
                onResponder={onResponder}
              />
              <HiloRespuestas
                respuestas={respuestas}
                currentUserId={currentUserId}
                puedeResponder={puedeResponder}
                onResponder={onResponder}
                onEditar={onActualizar}
                onEliminar={onEliminar}
              />
            </div>
          );
        })
      )}

      {puedeParticipar && (
        <div className="resena-form">
          <div className="comentario-form">
            <h3>Deja un comentario</h3>
            <div className="preview-form-group">
              <textarea
                rows={3}
                placeholder="Escribe tu comentario..."
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
              />
            </div>
            <button
              className="preview-btn-enviar"
              onClick={handleComentar}
              disabled={enviando || !nuevoComentario.trim()}
            >
              {enviando ? 'Publicando...' : 'Comentar'}
            </button>
            {msg && (
              <p style={{ marginTop: 8, fontSize: 13, color: msg.includes('Error') ? 'var(--error)' : '#059669' }}>
                {msg}
              </p>
            )}
          </div>

          <div className="calificacion-form">
            <h3>Tu calificacion</h3>
            <StarPicker value={miCalificacion} onChange={onCalificar} />
            <p className="calificacion-form-hint">
              Haz clic en las estrellas para calificar. Solo se guarda una calificacion por curso y puedes cambiarla cuando quieras.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}