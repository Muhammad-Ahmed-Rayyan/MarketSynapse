const API_URL = import.meta.env.VITE_API_URL;

export async function fetchReport(ticker, daysBack = 7) {
  const response = await fetch(
    `${API_URL}/report/${ticker}?days_back=${daysBack}`
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}
export async function fetchHistory(ticker, daysBack = 30) {
  const response = await fetch(
    `${API_URL}/history/${ticker}?days_back=${daysBack}`
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}
export async function fetchComparison(tickerA, tickerB) {
  const response = await fetch(
    `${API_URL}/compare?tickers=${tickerA},${tickerB}`
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}
export async function fetchWatchlist() {
  const response = await fetch(`${API_URL}/watchlist`);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

export async function addToWatchlist(ticker) {
  const response = await fetch(`${API_URL}/watchlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker }),
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

export async function removeFromWatchlist(ticker) {
  const response = await fetch(`${API_URL}/watchlist/${ticker}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}