const NIVELES = ['Todos', 'principiante', 'intermedio', 'avanzado'];
const PRECIOS = ['Todos', 'Gratis', 'Pagado'];

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="estudiante-filter">
      <span className="estudiante-filter-label">{label}</span>
      <select
        className="estudiante-filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt === 'Todos' ? 'Todos' : opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
        ))}
    </select>
  </label>
  );
}

export function EstudianteHeader({ filtros, onChange, categorias }) {
  const catOptions = ['Todos', ...categorias];
  return (
    <div className="estudiante-header">
      <div className="estudiante-title-block">
        <h1 className="estudiante-title" style={{ marginBottom: '8px', textAlign: 'left' }}>Panel Estudiante</h1>
        <p className="estudiante-subtitle">Resumen de tu progreso y cursos inscritos</p>
    </div>
      <div className="estudiante-filters">
        <FilterSelect
          label="Categoria"
          value={filtros.categoria}
          onChange={(v) => onChange({ ...filtros, categoria: v })}
          options={catOptions}
        />
        <FilterSelect
          label="Nivel"
          value={filtros.nivel}
          onChange={(v) => onChange({ ...filtros, nivel: v })}
          options={NIVELES}
        />
        <FilterSelect
          label="Precio"
          value={filtros.precio}
          onChange={(v) => onChange({ ...filtros, precio: v })}
          options={PRECIOS}
        />
    </div>
  </div>
  );
}
