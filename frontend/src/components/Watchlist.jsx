import { useState, useEffect } from "react";
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from "../services/api";

export default function Watchlist({ currentTicker, onSelect }) {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchWatchlist();
      setTickers(data.tickers.map((t) => t.ticker));
    } catch (err) {
      // Silent — watchlist is a nice-to-have, shouldn't break the page if it fails
      console.error("Failed to load watchlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isWatched = currentTicker && tickers.includes(currentTicker.toUpperCase());

  const handleToggle = async () => {
    if (!currentTicker) return;
    const t = currentTicker.toUpperCase();
    try {
      if (isWatched) {
        await removeFromWatchlist(t);
      } else {
        await addToWatchlist(t);
      }
      await load();
    } catch (err) {
      console.error("Failed to update watchlist:", err);
    }
  };

  const handleRemove = async (ticker) => {
    try {
      await removeFromWatchlist(ticker);
      await load();
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
    }
  };

  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="font-mono text-xs tracking-widest uppercase"
          style={{ color: "var(--text-tertiary)" }}
        >
          Watchlist
        </p>
        {currentTicker && (
          <button
            onClick={handleToggle}
            className="font-mono text-xs px-2.5 py-1 rounded transition"
            style={{
              background: isWatched ? "var(--signal-positive)" : "var(--bg-surface-raised)",
              color: isWatched ? "#04342c" : "var(--text-secondary)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            {isWatched ? "− Remove" : "+ Watch"} {currentTicker}
          </button>
        )}
      </div>

      {loading && (
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Loading…</p>
      )}

      {!loading && tickers.length === 0 && (
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          No saved tickers yet.
        </p>
      )}

      {!loading && tickers.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {tickers.map((t) => (
            <li key={t} className="flex items-center gap-1">
              <button
                onClick={() => onSelect(t)}
                className="font-mono text-xs px-2.5 py-1 rounded-l transition"
                style={{
                  background: "var(--bg-surface-raised)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-hairline)",
                  borderRight: "none",
                }}
              >
                {t}
              </button>
              <button
                onClick={() => handleRemove(t)}
                aria-label={`Remove ${t} from watchlist`}
                className="font-mono text-xs px-2 py-1 rounded-r transition"
                style={{
                  background: "var(--bg-surface-raised)",
                  color: "var(--signal-negative)",
                  border: "1px solid var(--border-hairline)",
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}