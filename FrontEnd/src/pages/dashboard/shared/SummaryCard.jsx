export function SummaryCard({ value, label }) {
  return (
    <div className="summary-card">
      <span className="summary-value">{value}</span>
      <span className="summary-label">{label}</span>
    </div>
  );
}
