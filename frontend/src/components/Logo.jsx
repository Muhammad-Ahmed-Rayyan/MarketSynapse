export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className="flex-shrink-0">
      <rect width="32" height="32" rx="8" fill="var(--bg-surface-raised)" />
      <circle cx="9" cy="22" r="3" fill="var(--signal-positive)" />
      <circle cx="23" cy="22" r="3" fill="var(--signal-positive)" />
      <circle cx="16" cy="9" r="3.5" fill="var(--signal-positive)" />
      <path d="M11.5 20 L14.3 11.5" stroke="var(--signal-positive)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M20.5 20 L17.7 11.5" stroke="var(--signal-positive)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M12 22 L20 22" stroke="var(--signal-positive)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}