import { useState, useEffect } from "react";
import { isMarketOpen } from "../utils/marketStatus";

export default function MarketStatusBadge() {
  const [open, setOpen] = useState(isMarketOpen());

  useEffect(() => {
    const interval = setInterval(() => setOpen(isMarketOpen()), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 font-mono text-[11px]" style={{ color: "var(--text-tertiary)" }}>
      <span
        aria-hidden="true"
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: open ? "var(--signal-positive)" : "var(--text-tertiary)",
          boxShadow: open ? "0 0 6px var(--signal-positive)" : "none",
        }}
      />
      {open ? "Market Open" : "Market Closed"}
    </div>
  );
}