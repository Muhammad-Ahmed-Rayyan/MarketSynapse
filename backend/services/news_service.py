"""
NewsAPI integration.

Free tier = 100 requests/day, so:
- default page_size is kept small (see config.news_default_page_size)
- we use /v2/everything with a ticker/company query rather than polling
  broad endpoints
- caching gets added later (Phase 2) once the pipeline is stable
"""
from datetime import datetime, timedelta
from typing import Optional

import requests

from backend.config import settings
from backend.models.schemas import Article

NEWSAPI_BASE_URL = "https://newsapi.org/v2/everything"

# Common ticker -> company name aliases so a search for "AAPL" also
# catches articles that only mention "Apple". Extend as needed.
TICKER_ALIASES = {
    "AAPL": "Apple",
    "TSLA": "Tesla",
    "MSFT": "Microsoft",
    "GOOGL": "Google",
    "AMZN": "Amazon",
    "META": "Meta",
    "NVDA": "Nvidia",
}


class NewsServiceError(Exception):
    """Raised when NewsAPI returns an error or an unexpected response shape."""


def _build_query(ticker: str) -> str:
    ticker = ticker.upper().strip()
    alias = TICKER_ALIASES.get(ticker)
    return f'"{ticker}" OR "{alias}"' if alias else f'"{ticker}"'


def fetch_articles(
    ticker: str,
    page_size: Optional[int] = None,
    days_back: int = 7,
) -> list[Article]:
    """
    Fetch recent articles mentioning the given ticker.
    Raises NewsServiceError on API/network failure.
    """
    if not settings.news_api_key:
        raise NewsServiceError(
            "NEWS_API_KEY is not set. Add it to your .env file."
        )

    params = {
        "q": _build_query(ticker),
        "from": (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%d"),
        "sortBy": "publishedAt",
        "language": "en",
        "pageSize": page_size or settings.news_default_page_size,
        "apiKey": settings.news_api_key,
    }

    try:
        response = requests.get(NEWSAPI_BASE_URL, params=params, timeout=10)
    except requests.RequestException as exc:
        raise NewsServiceError(f"Failed to reach NewsAPI: {exc}") from exc

    if response.status_code != 200:
        raise NewsServiceError(
            f"NewsAPI returned {response.status_code}: {response.text[:200]}"
        )

    data = response.json()
    if data.get("status") != "ok":
        raise NewsServiceError(f"NewsAPI error: {data.get('message', 'unknown error')}")

    return [_to_article(raw) for raw in data.get("articles", [])]


def _to_article(raw: dict) -> Article:
    published_at = None
    if raw.get("publishedAt"):
        try:
            published_at = datetime.fromisoformat(raw["publishedAt"].replace("Z", "+00:00"))
        except ValueError:
            published_at = None

    return Article(
        title=raw.get("title") or "",
        description=raw.get("description"),
        content=raw.get("content"),
        url=raw.get("url") or "",
        source=(raw.get("source") or {}).get("name", "unknown"),
        published_at=published_at,
    )


if __name__ == "__main__":
    # Smoke test: python -m backend.services.news_service AAPL
    import sys

    ticker_arg = sys.argv[1] if len(sys.argv) > 1 else "AAPL"
    try:
        articles = fetch_articles(ticker_arg)
        print(f"Fetched {len(articles)} articles for {ticker_arg}:\n")
        for a in articles:
            print(f"- {a.title}  [{a.source}]")
    except NewsServiceError as e:
        print(f"Error: {e}")