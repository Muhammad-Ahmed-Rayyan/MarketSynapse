export default function RecentSearches({ recent, onSelect }) {
  if (recent.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--text-tertiary)" }}>
        Recent
      </span>
      {recent.map((t) => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className="font-mono text-xs px-2.5 py-1 rounded transition"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--signal-positive)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-hairline)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}