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