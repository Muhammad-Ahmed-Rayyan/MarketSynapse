const sentimentMeta = {
  positive: { color: "var(--signal-positive)", word: "Positive" },
  negative: { color: "var(--signal-negative)", word: "Negative" },
  neutral: { color: "var(--text-secondary)", word: "Neutral" },
};

const alignmentMeta = {
  aligned: {
    word: "Aligned",
    detail: "Sentiment moved with price",
    color: "var(--signal-positive)",
  },
  diverged: {
    word: "Diverged",
    detail: "Sentiment ran against price",
    color: "var(--signal-mixed)",
  },
  mixed: {
    word: "Mixed",
    detail: "No clear relationship",
    color: "var(--text-secondary)",
  },
};

function SentimentGauge({ score }) {
  // score ranges -1 to +1; convert to a 0-100% position
  const pct = ((score + 1) / 2) * 100;
  const color = score > 0.15 ? "#22c55e" : score < -0.15 ? "#ef4444" : "var(--border-strong)";

  return (
    <div className="my-6">
      <div className="flex justify-between font-mono text-[10px] mb-1.5" style={{ color: "var(--text-tertiary)" }}>
        <span>-1.0</span>
        <span>0</span>
        <span>+1.0</span>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: "var(--bg-surface-raised)" }}>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
          style={{ left: `calc(${pct}% - 6px)`, background: color, borderColor: "var(--bg-surface)" }}
        />
      </div>
    </div>
  );
}

export default function SignalReadout({ sentimentLabel, sentimentScore, alignment }) {
  const sMeta = sentimentMeta[sentimentLabel] || sentimentMeta.neutral;
  const aMeta = alignmentMeta[alignment] || alignmentMeta.mixed;

  return (
    <div
      className="rounded-lg p-5 flex flex-col"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}
    >
      <p
        className="font-mono text-xs tracking-widest uppercase mb-3"
        style={{ color: "var(--text-tertiary)" }}
      >
        Signal readout
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: sMeta.color }}
        />
        <div>
          <p className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {sMeta.word} sentiment
          </p>
          <p className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
            score {sentimentScore >= 0 ? "+" : ""}
            {sentimentScore.toFixed(2)}
          </p>
        </div>
      </div>
      <SentimentGauge score={sentimentScore} />
      <div
        className="mt-auto pt-4 border-t flex items-center justify-between"
        style={{ borderColor: "var(--border-hairline)" }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: aMeta.color }}>
            {aMeta.word}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {aMeta.detail}
          </p>
        </div>
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ border: `1.5px solid ${aMeta.color}` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: aMeta.color }} />
        </span>
      </div>
    </div>
  );
}