import { useState } from "react";
import { useTheme } from "./hooks/useTheme";
import Logo from "./components/Logo";
import SignalReadout from "./components/SignalReadout";
import PricePanel from "./components/PricePanel";
import BriefCard from "./components/BriefCard";
import ArticleList from "./components/ArticleList";
import EmptyState from "./components/EmptyState";
import LoadingState from "./components/LoadingState";
import RecentSearches from "./components/RecentSearches";
import ThemeToggle from "./components/ThemeToggle";
import SentimentTrendChart from "./components/SentimentTrendChart";
import CompareView from "./components/CompareView";
import { fetchReport, fetchHistory } from "./services/api";
import Watchlist from "./components/Watchlist";
import MarketStatusBadge from "./components/MarketStatusBadge";
import LastUpdated from "./components/LastUpdated";
import MarketPulse from "./components/MarketPulse";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import Disclaimer from "./components/Disclaimer";

const isValidTicker = (t) => /^[A-Z]{1,5}$/.test(t);
const MAX_RECENT = 5;

function App() {
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState("single"); // "single" | "compare"
  const [page, setPage] = useState("dashboard"); // "dashboard" | "how-it-works"
  const [history, setHistory] = useState([]);
  const [ticker, setTicker] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const addRecentSearch = (t) => {
    setRecent((prev) => [t, ...prev.filter((x) => x !== t)].slice(0, MAX_RECENT));
  };

  const runSearch = async (rawTicker) => {
      const trimmed = rawTicker.trim().toUpperCase();
      if (!isValidTicker(trimmed)) {
        setError("Enter a valid ticker symbol — 1 to 5 letters, e.g. AAPL");
        return;
      }
      setTicker(trimmed);
      setLoading(true);
      setError(null);
      setReport(null);

      try {
        const data = await fetchReport(trimmed);
        setReport(data);
        setLastUpdated(new Date());
        addRecentSearch(trimmed);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setLoading(false);

      // History is supplementary — a slow/failed fetch shouldn't delay the
      // main report or make "last updated" misleading about report freshness.
      try {
        const historyData = await fetchHistory(trimmed);
        setHistory(historyData.history);
      } catch {
        setHistory([]);
      }
    };

  const handleSearch = () => runSearch(ticker);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  if (page === "how-it-works") {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
        <HowItWorks onBack={() => setPage("dashboard")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-4xl mx-auto px-5 py-10 md:py-14 min-h-screen flex flex-col">
        <header className="flex items-end justify-between flex-wrap gap-4 mb-8 pb-6 border-b" style={{ borderColor: "var(--border-hairline)" }}>
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div>
              <h1
                className="font-display text-2xl md:text-[28px] font-semibold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                MarketSynapse
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                News sentiment <span style={{ color: "var(--text-tertiary)" }}>×</span> price movement{" "}
                <span style={{ color: "var(--text-tertiary)" }}>×</span> AI-generated market brief
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MarketStatusBadge />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-5">
          <div
            className="inline-flex p-1 rounded-full"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}
          >
            <button
              onClick={() => setMode("single")}
              className="font-mono text-xs px-4 py-1.5 rounded-full transition"
              style={{
                background: mode === "single" ? "var(--signal-positive)" : "transparent",
                color: mode === "single" ? "#141a04" : "var(--text-secondary)",
              }}
            >
              Single
            </button>
            <button
              onClick={() => setMode("compare")}
              className="font-mono text-xs px-4 py-1.5 rounded-full transition"
              style={{
                background: mode === "compare" ? "var(--signal-positive)" : "transparent",
                color: mode === "compare" ? "#141a04" : "var(--text-secondary)",
              }}
            >
              Compare
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPage("how-it-works")}
            className="font-mono text-xs px-4 py-1.5 rounded-full transition"
            style={{
              border: "1px solid var(--signal-positive)",
              background: "var(--signal-positive)",
              color: "#141a04",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--signal-positive)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--signal-positive)";
              e.currentTarget.style.color = "#141a04";
            }}
          >
            How it works
          </button>
        </div>

        {mode === "compare" && <CompareView />}

        {mode === "single" && (
          <>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <span
                  className="font-mono absolute left-3.5 top-1/2 -translate-y-1/2 text-xs tracking-widest select-none"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  $
                </span>
                <input
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  className="font-mono w-full pl-8 pr-3 py-2.5 rounded-md text-sm tracking-wider outline-none transition"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-hairline)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--signal-positive)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-hairline)")}
                  placeholder="AAPL"
                  maxLength={5}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="font-display px-6 py-2.5 rounded-md text-sm font-semibold tracking-wide transition disabled:opacity-40"
                style={{
                  background: "var(--signal-positive)",
                  color: "#141a04",
                }}
              >
                {loading ? "Analyzing…" : "Analyze"}
              </button>
            </div>

            <RecentSearches recent={recent} onSelect={runSearch} />
            <div className="mb-6">
              <Watchlist currentTicker={report?.analysis?.price?.ticker || ticker} onSelect={runSearch} />
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
                    {!loading && !report && !error && (
                      <>
                        <MarketPulse onSelect={runSearch} />
                        <EmptyState />
                      </>
                    )}            

            {!loading && report && (
              <div className="space-y-5 animate-rise">
                <div className="flex justify-end">
                  <LastUpdated timestamp={lastUpdated} loading={loading} onRefresh={() => runSearch(ticker)} />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <PricePanel price={report.analysis.price} articles={report.analysis.articles} />
                  <SignalReadout
                    sentimentLabel={report.analysis.sentiment_label}
                    sentimentScore={report.analysis.avg_sentiment_score}
                    alignment={report.analysis.alignment}
                  />
                </div>

                <BriefCard brief={report.brief} ticker={report.analysis.price.ticker} />
                <ArticleList articles={report.analysis.articles} />
                <SentimentTrendChart history={history} />

                <Disclaimer />
              </div>
            )}
          </>
        )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default App;