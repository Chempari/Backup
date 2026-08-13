import { useState } from 'react';
import { UserLink } from '../../../../components/UserLink';
import { Stars } from '../../../../components/Icons';
import { FormularioRespuesta } from '../../shared/HiloRespuestas';

export function ResenaCard({ resena, currentUserId, onUpdate, onDelete, puedeResponder, onResponder }) {
  const isOwner = currentUserId && resena.estudiante_id?._id === currentUserId;
  const [editing, setEditing] = useState(false);
  const [texto, setTexto] = useState(resena.comentario || '');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [respondiendo, setRespondiendo] = useState(false);

  const iniciarEdicion = () => {
    setTexto(resena.comentario || '');
    setError('');
    setEditing(true);
  };

  const cancelarEdicion = () => {
    setTexto(resena.comentario || '');
    setError('');
    setEditing(false);
  };

  const guardar = async () => {
    if (!texto.trim()) {
      setError('El comentario no puede estar vacio.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await onUpdate(resena._id, { comentario: texto });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    const ok = window.confirm('Estas seguro de que quieres eliminar este comentario?');
    if (!ok) return;
    try {
      await onDelete(resena._id);
    } catch (err) {
      window.alert(err.response?.data?.message || 'Error al eliminar.');
    }
  };

  const mostrarEstrellas = typeof resena.calificacion === 'number' && resena.calificacion !== null;

  return (
    <div className="resena-card">
      {isOwner && !editing && (
        <div className="resena-actions">
          <button
            type="button"
            className="resena-action-btn resena-action-edit"
            onClick={iniciarEdicion}
            aria-label="Editar comentario"
          >
            Editar
          </button>
          <button
            type="button"
            className="resena-action-btn resena-action-delete"
            onClick={eliminar}
            aria-label="Eliminar comentario"
          >
            Eliminar
          </button>
        </div>
      )}

      <div className="resena-header">
        <UserLink user={resena.estudiante_id} size="sm" />
        {mostrarEstrellas && (
          <span className="resena-stars">
            <Stars value={resena.calificacion} size={16} />
          </span>
        )}
      </div>

      {editing ? (
        <div className="resena-edit">
          <textarea
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={guardando}
          />
          {error && <p className="resena-edit-error">{error}</p>}
          <div className="resena-edit-actions">
            <button type="button" className="preview-btn-enviar" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              className="resena-btn-cancel"
              onClick={cancelarEdicion}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        resena.comentario && <p className="resena-comentario">{resena.comentario}</p>
      )}

      {puedeResponder && (
        <div className="respuesta-parent-actions">
          <button
            type="button"
            className="respuesta-action-btn"
            onClick={() => setRespondiendo((v) => !v)}
          >
            Responder
          </button>
        </div>
      )}
      {puedeResponder && respondiendo && (
        <FormularioRespuesta
          onEnviar={(t) => onResponder(resena._id, t)}
          onCancelar={() => setRespondiendo(false)}
        />
      )}
    </div>
  );
}
