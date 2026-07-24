import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";

export default function SentimentTrendChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <div
        className="rounded-lg p-5 md:p-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}
      >
        <p
          className="font-mono text-xs tracking-widest uppercase mb-3"
          style={{ color: "var(--text-tertiary)" }}
        >
          Sentiment trend
        </p>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Not enough history yet — check back after a few more searches for this ticker to see sentiment trend over time.
        </p>
      </div>
    );
  }

  // Oldest first, so the chart reads left-to-right chronologically.
  const chronological = [...history].reverse();

  return (
    <div
      className="rounded-lg p-5 md:p-6"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}
    >
      <p
        className="font-mono text-xs tracking-widest uppercase mb-3"
        style={{ color: "var(--text-tertiary)" }}
      >
        Sentiment trend · {chronological.length} snapshots
      </p>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chronological}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              tickFormatter={(d) => d.slice(5)}
              axisLine={{ stroke: "var(--border-hairline)" }}
              tickLine={false}
            />
            <YAxis
              domain={[-1, 1]}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={{ stroke: "var(--border-hairline)" }}
              tickLine={false}
              width={40}
            />
            <ReferenceLine y={0} stroke="var(--border-strong)" strokeDasharray="2 2" />
            <Tooltip
              formatter={(value) => [value.toFixed(2), "Sentiment score"]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                background: "var(--bg-surface-raised)",
                border: "1px solid var(--border-hairline)",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--text-primary)",
              }}
            />
            <Line
              type="monotone"
              dataKey="avg_sentiment_score"
              stroke="#00d9a3"
              strokeWidth={2}
              dot={{ r: 3, fill: "#00d9a3" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}