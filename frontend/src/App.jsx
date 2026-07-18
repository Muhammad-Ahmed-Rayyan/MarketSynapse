import { useState } from "react";
import { fetchReport } from "./services/api";

function App() {
  const [ticker, setTicker] = useState("AAPL");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await fetchReport(ticker);
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">MarketSynapse</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          className="border rounded px-3 py-2"
          placeholder="AAPL"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Loading..." : "Analyze"}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {report && (
        <pre className="bg-white p-4 rounded border overflow-auto text-sm">
          {JSON.stringify(report, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;