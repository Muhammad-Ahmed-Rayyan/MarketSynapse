import { useState, useEffect } from "react";
import { fetchStock } from "../services/api";

const PULSE_TICKERS = ["AAPL", "MSFT", "GOOGL", "TSLA"];

export default function MarketPulse({ onSelect }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPulse() {
      const results = await Promise.allSettled(PULSE_TICKERS.map((t) => fetchStock(t)));
      if (cancelled) return;
      setStocks(
        results
          .map((r, i) => (r.status === "fulfilled" ? r.value : null))
          .filter(Boolean)
      );
      setLoading(false);
    }

    loadPulse();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-pulse">
        {PULSE_TICKERS.map((t) => (
          <div key={t} className="h-20 rounded-2xl" style={{ background: "var(--bg-surface)" }} />
        ))}
      </div>
    );
  }

  if (stocks.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="font-mono text-[11px] tracking-widest uppercase mb-2.5" style={{ color: "var(--text-tertiary)" }}>
        Market Pulse
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stocks.map((s) => {
          const isUp = s.change_pct >= 0;
          return (
            <button
              key={s.ticker}
              type="button"
              onClick={() => onSelect(s.ticker)}
              className="text-left rounded-2xl p-4 transition hover:scale-[1.02]"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}
            >
              <p className="font-mono text-[11px] tracking-widest uppercase mb-1" style={{ color: "var(--text-tertiary)" }}>
                {s.ticker}
              </p>
              <p className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                ${s.current_price}
              </p>
              <p
                className="font-mono text-xs mt-0.5"
                style={{ color: isUp ? "var(--signal-positive)" : "var(--signal-negative)" }}
              >
                {isUp ? "▲" : "▼"} {Math.abs(s.change_pct)}%
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}