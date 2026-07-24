import { useState } from "react";
import { fetchComparison } from "../services/api";
import PricePanel from "./PricePanel";
import SignalReadout from "./SignalReadout";
import LoadingState from "./LoadingState";

const isValidTicker = (t) => /^[A-Z]{1,5}$/.test(t);

export default function CompareView() {
  const [tickerA, setTickerA] = useState("AAPL");
  const [tickerB, setTickerB] = useState("MSFT");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    const a = tickerA.trim().toUpperCase();
    const b = tickerB.trim().toUpperCase();

    if (!isValidTicker(a) || !isValidTicker(b)) {
      setError("Enter two valid ticker symbols — 1 to 5 letters each");
      return;
    }
    if (a === b) {
      setError("Enter two different tickers to compare");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchComparison(a, b);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap">
        <input
          value={tickerA}
          onChange={(e) => setTickerA(e.target.value.toUpperCase())}
          className="font-mono flex-1 min-w-[100px] px-3 py-2.5 rounded-md text-sm tracking-wider outline-none"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            color: "var(--text-primary)",
          }}
          placeholder="AAPL"
          maxLength={5}
          spellCheck={false}
          autoComplete="off"
        />
        <span className="self-center text-sm" style={{ color: "var(--text-tertiary)" }}>vs</span>
        <input
          value={tickerB}
          onChange={(e) => setTickerB(e.target.value.toUpperCase())}
          className="font-mono flex-1 min-w-[100px] px-3 py-2.5 rounded-md text-sm tracking-wider outline-none"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            color: "var(--text-primary)",
          }}
          placeholder="MSFT"
          maxLength={5}
          spellCheck={false}
          autoComplete="off"
        />
        <button
          onClick={handleCompare}
          disabled={loading}
          className="font-display px-6 py-2.5 rounded-md text-sm font-semibold tracking-wide transition disabled:opacity-40"
          style={{ background: "var(--signal-positive)", color: "#04342c" }}
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>

      {error && (
        <div
          className="rounded-md p-4 mb-6 text-sm"
          style={{
            background: "rgba(255,92,92,0.08)",
            border: "1px solid rgba(255,92,92,0.3)",
            color: "var(--signal-negative)",
          }}
        >
          {error}
        </div>
      )}

      {loading && <LoadingState />}

      {!loading && result && (
        <div className="space-y-5 animate-rise">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <PricePanel price={result.ticker_a.price} articles={result.ticker_a.articles} />
              <SignalReadout
                sentimentLabel={result.ticker_a.sentiment_label}
                sentimentScore={result.ticker_a.avg_sentiment_score}
                alignment={result.ticker_a.alignment}
              />
            </div>
            <div className="space-y-3">
              <PricePanel price={result.ticker_b.price} articles={result.ticker_b.articles} />
              <SignalReadout
                sentimentLabel={result.ticker_b.sentiment_label}
                sentimentScore={result.ticker_b.avg_sentiment_score}
                alignment={result.ticker_b.alignment}
              />
            </div>
          </div>

          <div
            className="rounded-lg p-5 md:p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-4 rounded-full" style={{ background: "var(--signal-positive)" }} />
              <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--text-tertiary)" }}>
                Comparison brief
              </p>
            </div>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {result.comparison_brief}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}