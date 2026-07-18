import { useState } from "react";
import { fetchReport } from "./services/api";
import SentimentBadge from "./components/SentimentBadge";
import PriceSummaryCard from "./components/PriceSummaryCard";
import AlignmentBadge from "./components/AlignmentBadge";
import BriefCard from "./components/BriefCard";
import ArticleList from "./components/ArticleList";
import PriceChart from "./components/PriceChart";
import EmptyState from "./components/EmptyState";
import LoadingState from "./components/LoadingState";

function App() {
  const [ticker, setTicker] = useState("AAPL");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await fetchReport(ticker.trim());
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">MarketSynapse</h1>
        <p className="text-gray-500 mb-6 text-sm">
          News sentiment × price movement × AI-generated market brief
        </p>

        <div className="flex gap-2 mb-8">
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            className="border rounded px-3 py-2 flex-1"
            placeholder="AAPL"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded font-medium disabled:opacity-50 hover:bg-blue-700 transition"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 mb-6">
            {error}
          </div>
        )}

        {loading && <LoadingState />}

        {!loading && !report && !error && <EmptyState />}

        {!loading && report && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <SentimentBadge
                label={report.analysis.sentiment_label}
                score={report.analysis.avg_sentiment_score}
              />
              <AlignmentBadge alignment={report.analysis.alignment} />
            </div>

            <PriceSummaryCard price={report.analysis.price} />
            <PriceChart history={report.analysis.price.history} />
            <BriefCard brief={report.brief} />
            <ArticleList articles={report.analysis.articles} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;