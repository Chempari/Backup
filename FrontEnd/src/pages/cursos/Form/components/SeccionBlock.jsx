import { useState } from 'react';

export function SeccionBlock({ seccion, lecciones, onDelete, onAddLeccion, onDeleteLeccion }) {
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddLeccion = () => {
    onAddLeccion(titulo, url, desc);
    setTitulo('');
    setUrl('');
    setDesc('');
    setShowForm(false);
  };

  return (
    <div className="seccion-group">
      <h3>
        {seccion.titulo}
        <button className="btn-sm danger" type="button" onClick={onDelete}>X</button>
      </h3>
      {(lecciones || []).map((lec) => (
        <div key={lec._id} className="curso-form-leccion-item" style={{ padding: '6px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{lec.titulo}</span>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{lec.url}</span>
          <button className="btn-sm danger" type="button" onClick={() => onDeleteLeccion(lec._id)}>X</button>
        </div>
      ))}
      {showForm ? (
        <div style={{ marginTop: 8 }}>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Titulo leccion" style={{ width: '100%', marginBottom: 4, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14 }} />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL YouTube/Vimeo" style={{ width: '100%', marginBottom: 4, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14 }} />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripcion (opcional)" style={{ width: '100%', marginBottom: 8, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14 }} />
          <button className="btn-sm" type="button" onClick={handleAddLeccion}>Guardar</button>
          <button className="btn-sm" type="button" onClick={() => setShowForm(false)} style={{ marginLeft: 4 }}>Cancelar</button>
        </div>
      ) : (
        <button className="dash-btn-outline" type="button" onClick={() => setShowForm(true)} style={{ marginTop: 8 }}>+ Agregar leccion</button>
      )}
    </div>
  );
}
