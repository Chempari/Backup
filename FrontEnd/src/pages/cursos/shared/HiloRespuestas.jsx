import { useState } from 'react';
import { UserLink } from '../../../components/UserLink';

const MAX_VISIBLES = 3;

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function FormularioRespuesta({ onEnviar, onCancelar, placeholder = 'Escribe una respuesta...' }) {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const enviar = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    setError('');
    try {
      await onEnviar(texto.trim());
      setTexto('');
      if (onCancelar) onCancelar();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al responder');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="respuesta-form">
      <textarea
        rows={2}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={placeholder}
        disabled={enviando}
      />
      {error && <p className="respuesta-form-error">{error}</p>}
      <div className="respuesta-form-actions">
        <button
          type="button"
          className="respuesta-btn respuesta-btn--primary"
          onClick={enviar}
          disabled={enviando || !texto.trim()}
        >
          {enviando ? 'Enviando...' : 'Responder'}
        </button>
        {onCancelar && (
          <button type="button" className="respuesta-btn" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

function RespuestaCard({ resena, currentUserId, puedeResponder, onResponder, onEditar, onEliminar }) {
  const esAutor = currentUserId && resena.estudiante_id?._id === currentUserId;
  const [editando, setEditando] = useState(false);
  const [editTexto, setEditTexto] = useState(resena.comentario || '');
  const [respondiendo, setRespondiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const iniciarEdicion = () => {
    setEditTexto(resena.comentario || '');
    setError('');
    setEditando(true);
  };

  const cancelar = () => {
    setEditando(false);
    setRespondiendo(false);
  };

  const guardar = async () => {
    if (!editTexto.trim()) {
      setError('El comentario no puede estar vacio.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await onEditar(resena._id, editTexto);
      setEditando(false);
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
      await onEliminar(resena._id);
    } catch (err) {
      window.alert(err.response?.data?.message || 'Error al eliminar.');
    }
  };

  return (
    <div className="respuesta-card">
      <div className="respuesta-header">
        <UserLink user={resena.estudiante_id} size="sm" />
        <span className="resena-fecha">{formatearFecha(resena.createdAt)}</span>
        <div className="respuesta-acciones">
          {puedeResponder && (
            <button
              type="button"
              className="respuesta-action-btn"
              onClick={() => setRespondiendo((v) => !v)}
            >
              Responder
            </button>
          )}
          {esAutor && (
            <button type="button" className="respuesta-action-btn" onClick={iniciarEdicion}>
              Editar
            </button>
          )}
          {esAutor && (
            <button type="button" className="respuesta-action-btn respuesta-action-btn--delete" onClick={eliminar}>
              Eliminar
            </button>
          )}
        </div>
      </div>

      {editando ? (
        <div className="respuesta-edit">
          <textarea rows={2} value={editTexto} onChange={(e) => setEditTexto(e.target.value)} disabled={guardando} />
          {error && <p className="respuesta-form-error">{error}</p>}
          <div className="respuesta-form-actions">
            <button type="button" className="respuesta-btn respuesta-btn--primary" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="respuesta-btn" onClick={cancelar} disabled={guardando}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        resena.comentario && <p className="respuesta-comentario">{resena.comentario}</p>
      )}

      {respondiendo && (
        <FormularioRespuesta onEnviar={(t) => onResponder(resena._id, t)} onCancelar={() => setRespondiendo(false)} />
      )}
    </div>
  );
}

export function HiloRespuestas({ respuestas, currentUserId, puedeResponder, onResponder, onEditar, onEliminar }) {
  const [verTodas, setVerTodas] = useState(false);

  if (!respuestas || respuestas.length === 0) return null;

  const hayMas = respuestas.length > MAX_VISIBLES;
  const visibles = verTodas ? respuestas : respuestas.slice(0, MAX_VISIBLES);

  return (
    <div className="respuestas-col">
      {visibles.map((r) => (
        <RespuestaCard
          key={r._id}
          resena={r}
          currentUserId={currentUserId}
          puedeResponder={puedeResponder}
          onResponder={onResponder}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
      {hayMas && (
        <button type="button" className="respuesta-ver-todas" onClick={() => setVerTodas((v) => !v)}>
          {verTodas ? 'Ocultar' : `Ver todo (${respuestas.length})`}
        </button>
      )}
    </div>
  );
}
