import ExportControls from "./ExportControls";

export default function BriefCard({ brief, ticker }) {
  return (
    <div
      className="rounded-lg p-5 md:p-6"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-1 h-4 rounded-full"
            style={{ background: "var(--signal-positive)" }}
          />
          <p
            className="font-mono text-xs tracking-widest uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            Market brief · {ticker}
          </p>
        </div>
        <ExportControls brief={brief} ticker={ticker} />
      </div>
      <p
        className="text-[15px] leading-relaxed"
        style={{ color: "var(--text-primary)" }}
      >
        {brief}
      </p>
    </div>
  );
}