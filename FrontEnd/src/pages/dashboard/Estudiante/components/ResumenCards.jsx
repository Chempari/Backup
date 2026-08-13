const ResumenCard = ({ value, label }) => (
  <div className="glass-dropdown" style={{ flex: 1, padding: '20px', flexDirection: 'column', alignItems: 'flex-start', cursor: 'default' }}>
    <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--blanco-puro)' }}>
      {value}
    </span>
    <span style={{ fontSize: '14px', color: 'rgba(232, 240, 236, 0.7)' }}>{label}</span>
  </div>
);

export function ResumenCards({ resumen, loading }) {
  return (
    <div style={{ marginBottom: '40px', display: 'flex', gap: '24px' }}>
      <ResumenCard
        value={loading ? '...' : resumen.total_cursos ?? 0}
        label="Cursos inscritos"
      />
      <ResumenCard
        value={loading ? '...' : resumen.cursos_completados ?? 0}
        label="Completados"
      />
      <ResumenCard
        value={loading ? '...' : `${resumen.progreso_promedio ?? 0}%`}
        label="Progreso promedio"
      />
    </div>
  );
}
