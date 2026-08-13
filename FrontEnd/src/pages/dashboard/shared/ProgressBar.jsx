export function ProgressBar({ percentage, label }) {
  return (
    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'rgba(232, 240, 236, 0.8)', fontWeight: 600 }}>
        <span>{label || 'Progreso'}</span>
        <span>{percentage ?? 0}%</span>
      </div>
      <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{
          width: `${percentage ?? 0}%`,
          height: '100%',
          background: 'var(--verde-intermedio-luz)',
          borderRadius: '10px',
          transition: 'width 0.5s ease-in-out'
        }} />
      </div>
    </div>
  );
}
