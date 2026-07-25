import { useState, useEffect } from "react";
import { timeAgo } from "../utils/marketStatus";

export default function LastUpdated({ timestamp, onRefresh, loading }) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timestamp) return null;

  return (
    <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: "var(--text-tertiary)" }}>
      <span>Updated {timeAgo(timestamp)}</span>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="hover:opacity-70 transition disabled:opacity-30"
        style={{ color: "var(--signal-positive)" }}
        title="Refresh"
      >
        ↻
      </button>
    </div>
  );
}