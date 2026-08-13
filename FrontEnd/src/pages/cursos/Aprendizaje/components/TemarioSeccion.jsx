const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export function TemarioSeccion({
  seccion,
  abierta,
  onToggle,
  onMarcarLeccion,
  onSelectLeccion,
  inscripcionId,
  progresoMap,
  leccionActualId,
}) {
  return (
    <div className="aprendizaje-seccion">
      <div className="aprendizaje-seccion-header" onClick={onToggle}>
        <span>{seccion.titulo}</span>
        <ChevronIcon open={abierta} />
      </div>
      {abierta && seccion.lecciones?.map((leccion) => {
        const estaCompletada = progresoMap[leccion._id];
        const esActiva = leccion._id === leccionActualId;
        return (
          <div
            key={leccion._id}
            className={`aprendizaje-leccion ${estaCompletada ? 'completada' : ''} ${esActiva ? 'activa' : ''}`}
          >
            <input
              type="checkbox"
              checked={!!estaCompletada}
              onChange={() => onMarcarLeccion(inscripcionId, leccion._id)}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              className="aprendizaje-leccion-btn"
              onClick={() => onSelectLeccion(leccion)}
            >
              {leccion.titulo}
            </button>
          </div>
        );
      })}
    </div>
  );
}
