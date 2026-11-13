export default function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="progress" aria-label={`${pct}% complete`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
