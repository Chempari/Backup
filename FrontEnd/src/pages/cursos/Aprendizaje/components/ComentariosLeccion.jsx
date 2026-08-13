import { useState } from 'react';
import { useAuth } from '../../../../context/useAuth';
import { UserLink } from '../../../../components/UserLink';
import '../../shared/resenas.css';

export function ComentariosLeccion({ cursoId, resenas, loading, onComentar, onEliminar, onEditar }) {
  const { user } = useAuth();
  const [nuevo, setNuevo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editTexto, setEditTexto] = useState('');

  const puedeParticipar = user?.rol === 'estudiante';

  const handleComentar = async () => {
    if (!nuevo.trim()) return;
    setEnviando(true);
    setMsg('');
    try {
      await onComentar(cursoId, nuevo);
      setNuevo('');
      setMsg('Comentario publicado');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error al publicar');
    } finally {
      setEnviando(false);
    }
  };

  const iniciarEdicion = (resena) => {
    setEditandoId(resena._id);
    setEditTexto(resena.comentario);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditTexto('');
  };

  const guardarEdicion = async (resenaId) => {
    if (!editTexto.trim()) return;
    setEnviando(true);
    setMsg('');
    try {
      await onEditar(resenaId, editTexto);
      setEditandoId(null);
      setEditTexto('');
      setMsg('Comentario actualizado');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setEnviando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="resenas-section">
      <h2>Comentarios de esta leccion ({resenas.length})</h2>

      {loading ? (
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Cargando comentarios</p>
      ) : resenas.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>No hay comentarios en esta leccion aun</p>
      ) : (
        <div className="resenas-list">
          {resenas.map((r) => (
            <div key={r._id} className="resena-card">
              <div className="resena-header">
                <UserLink user={r.estudiante_id} size="sm" />
                <span className="resena-fecha">{formatearFecha(r.createdAt)}</span>
                {user?._id === r.estudiante_id?._id && (
                  <div className="resena-acciones">
                {editandoId === r._id ? (
                  <>
                    <button
                      type="button"
                      className="preview-btn-outline"
                      style={{ fontSize: 12, padding: '4px 10px', marginRight: '4px' }}
                      onClick={() => guardarEdicion(r._id)}
                      disabled={enviando}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="preview-btn-outline"
                      style={{ fontSize: 12, padding: '4px 10px' }}
                      onClick={cancelarEdicion}
                    >
                      Cancelar
                    </button>
                  </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="preview-btn-outline"
                          style={{ fontSize: 12, padding: '4px 10px', marginRight: '4px' }}
                          onClick={() => iniciarEdicion(r)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="preview-btn-outline"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() => onEliminar(r._id)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {editandoId === r._id ? (
                <div className="resena-edit-form">
                  <textarea
                    rows={3}
                    value={editTexto}
                    onChange={(e) => setEditTexto(e.target.value)}
                    disabled={enviando}
                    className="resena-edit-textarea"
                  />
                </div>
              ) : (
                <p className="resena-comentario">{r.comentario}</p>
              )}
            </div>
          ))}
      </div>
      )}

      {puedeParticipar && (
        <div className="resena-form" style={{ marginTop: 16 }}>
          <h3>Deja un comentario sobre esta leccion</h3>
          <div className="preview-form-group">
            <textarea
              rows={3}
              placeholder="Escribe tu comentario sobre esta leccion..."
              value={nuevo}
              onChange={(e) => setNuevo(e.target.value)}
            />
          </div>
          <button
            className="preview-btn-enviar"
            onClick={handleComentar}
            disabled={enviando || !nuevo.trim()}
          >
            {enviando ? 'Publicando...' : 'Comentar'}
          </button>
          {msg && (
            <p style={{ marginTop: 8, fontSize: 13, color: msg.includes('Error') ? 'var(--error)' : '#059669' }}>
              {msg}
          </p>
          )}
      </div>
      )}
  </div>
  );
}
