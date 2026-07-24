export default function EmptyState() {
  return (
    <div
      className="text-center py-20 rounded-lg"
      style={{ border: "1px dashed var(--border-hairline)" }}
    >
      <p className="font-display text-lg font-medium" style={{ color: "var(--text-primary)" }}>
        Enter a ticker to get started
      </p>
      <p className="text-sm mt-1.5" style={{ color: "var(--text-tertiary)" }}>
        Try <span className="font-mono">AAPL</span>, <span className="font-mono">TSLA</span>, or{" "}
        <span className="font-mono">MSFT</span>
      </p>
    </div>
  );
}