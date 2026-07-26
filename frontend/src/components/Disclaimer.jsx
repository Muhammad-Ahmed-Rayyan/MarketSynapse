function InfoIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="11" x2="12" y2="16" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Disclaimer() {
  return (
    <div
      className="flex items-center justify-center gap-2 text-xs font-mono mx-auto mt-4 px-4 py-2 rounded-full w-fit"
      style={{
        color: "var(--text-tertiary)",
        border: "1px solid var(--border-hairline)",
        background: "var(--bg-surface)",
      }}
    >
      <InfoIcon />
      <span>Educational and informational only — not financial advice.</span>
    </div>
  );
}