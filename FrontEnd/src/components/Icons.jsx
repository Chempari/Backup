export function StarIcon({ size = 20, filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function Stars({ value = 0, size = 18 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: '#fbbf24', verticalAlign: 'middle' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon key={s} size={size} filled={s <= value} />
      ))}
    </span>
  );
}

export function PlayIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function ChevronIcon({ up = false, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: up ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}