export function StarPicker({ value, onChange }) {
  return (
    <div className="preview-star-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={s <= value ? 'filled' : ''}
          onClick={() => onChange(s)}
        >
          {'\u2605'}
        </button>
      ))}
    </div>
  );
}
