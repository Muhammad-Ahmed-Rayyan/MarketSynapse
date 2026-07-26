function GitHubIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="#1a1a1a" />
      <circle cx="9" cy="22" r="3" fill="var(--signal-positive)" />
      <circle cx="23" cy="22" r="3" fill="var(--signal-positive)" />
      <circle cx="16" cy="9" r="3.5" fill="var(--signal-positive)" />
      <path d="M11.5 20 L14.3 11.5" stroke="var(--signal-positive)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M20.5 20 L17.7 11.5" stroke="var(--signal-positive)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M12 22 L20 22" stroke="var(--signal-positive)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-12 pt-6 border-t flex items-center justify-between flex-wrap gap-4"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 hover:opacity-70 transition"
        title="Reload MarketSynapse"
      >
        <Logo />
        <span className="font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          MarketSynapse
        </span>
      </button>

      <p className="font-mono text-xs" style={{ color: "var(--text-tertiary)" }}>
        MarketSynapse &copy; {year}
      </p>

      <a
        href="https://github.com/Muhammad-Ahmed-Rayyan/marketsynapse"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-70 transition"
        style={{ color: "var(--text-secondary)" }}
        aria-label="View source on GitHub"
        title="View source on GitHub"
      >
        <GitHubIcon />
      </a>
    </footer>
  );
}