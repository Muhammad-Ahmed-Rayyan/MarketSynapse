import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const sentimentColor = {
  positive: "var(--signal-positive)",
  negative: "var(--signal-negative)",
  neutral: "var(--border-strong)",
};

export default function PricePanel({ price, articles }) {
  const isUp = price.change_pct >= 0;
  const trendColor = isUp ? "var(--signal-positive)" : "var(--signal-negative)";
  const trendColorHex = isUp ? "#00d9a3" : "#ff5c5c";
  const gradientId = `priceGradient-${price.ticker}`;

  // Group counts for a proportional allocation-style bar, instead of one
  // tick per headline — reads cleaner at a glance, like a portfolio split.
  const counts = { positive: 0, negative: 0, neutral: 0 };
  articles.forEach((a) => {
    counts[a.sentiment_label] = (counts[a.sentiment_label] || 0) + 1;
  });
  const total = articles.length || 1;
  const segments = [
    { key: "positive", pct: (counts.positive / total) * 100, color: "var(--signal-positive)" },
    { key: "neutral", pct: (counts.neutral / total) * 100, color: "var(--border-strong)" },
    { key: "negative", pct: (counts.negative / total) * 100, color: "var(--signal-negative)" },
  ].filter((s) => s.pct > 0);

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}
    >
      <div className="flex items-baseline justify-between mb-1">
        <p
          className="font-mono text-xs tracking-widest uppercase"
          style={{ color: "var(--text-tertiary)" }}
        >
          {price.ticker}
        </p>
        <p className="text-xs font-medium" style={{ color: trendColor }}>
          {isUp ? "▲" : "▼"} {Math.abs(price.change_pct)}% / {price.period_days}d
        </p>
      </div>

      <p
        className="font-display text-4xl font-semibold tracking-tight mb-5"
        style={{ color: "var(--text-primary)" }}
      >
        ${price.current_price}
      </p>

      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={price.history}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={trendColorHex} stopOpacity={0.35} />
                <stop offset="100%" stopColor={trendColorHex} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              tickFormatter={(d) => d.slice(5)}
              axisLine={{ stroke: "var(--border-hairline)" }}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              tickFormatter={(v) => `$${v}`}
              axisLine={{ stroke: "var(--border-hairline)" }}
              tickLine={false}
              width={55}
            />
            <Tooltip
              formatter={(value) => [`$${value}`, "Close"]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                background: "var(--bg-surface-raised)",
                border: "1px solid var(--border-hairline)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--text-primary)",
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={trendColorHex}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={{ r: 3, fill: trendColorHex, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5">
        <p
          className="font-mono text-[10px] tracking-widest uppercase mb-2"
          style={{ color: "var(--text-tertiary)" }}
        >
          Sentiment split · {articles.length} headlines
        </p>
        <div className="flex h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-raised)" }}>
          {segments.map((s) => (
            <div
              key={s.key}
              style={{ width: `${s.pct}%`, background: s.color }}
              title={`${s.key}: ${Math.round(s.pct)}%`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-2.5 flex-wrap">
          {segments.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
              <span className="font-mono text-[10px]" style={{ color: "var(--text-secondary)" }}>
                {s.key} {Math.round(s.pct)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}