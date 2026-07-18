import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function PriceChart({ history }) {
  const isUp = history[history.length - 1]?.close >= history[0]?.close;

  return (
    <div className="bg-white rounded-lg border p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Price History
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(d) => d.slice(5)}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            formatter={(value) => [`$${value}`, "Close"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke={isUp ? "#16a34a" : "#dc2626"}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}