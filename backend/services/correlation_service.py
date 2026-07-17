"""
Combines news sentiment with price movement into one summary.

Keeps this intentionally simple for now: average sentiment score
(positive=+1, negative=-1, neutral=0, weighted by confidence) vs.
price change_pct over the same window. The LangGraph agent (Day 5)
is where the real reasoning happens — this just gives it clean
pre-aggregated numbers to work with instead of raw article lists.
"""
from pydantic import BaseModel
from backend.services import cache_service
from backend.models.schemas import Article
from backend.services.news_service import fetch_articles
from backend.services.sentiment_service import analyze_articles
from backend.services.stock_service import PriceSummary, fetch_price_summary

SENTIMENT_WEIGHTS = {"positive": 1, "negative": -1, "neutral": 0}


class CorrelationSummary(BaseModel):
    ticker: str
    period_days: int
    avg_sentiment_score: float       # -1 to +1, weighted average
    sentiment_label: str             # overall bucket: positive/negative/neutral
    price_change_pct: float
    alignment: str                   # "aligned", "diverged", or "mixed"
    article_count: int
    articles: list[Article]
    price: PriceSummary


def _overall_sentiment(articles: list[Article]) -> tuple[float, str]:
    if not articles:
        return 0.0, "neutral"

    weighted_sum = sum(
        SENTIMENT_WEIGHTS.get(a.sentiment_label, 0) * (a.sentiment_score or 0)
        for a in articles
    )
    avg = round(weighted_sum / len(articles), 4)

    if avg > 0.15:
        label = "positive"
    elif avg < -0.15:
        label = "negative"
    else:
        label = "neutral"

    return avg, label


def _determine_alignment(sentiment_label: str, price_change_pct: float) -> str:
    price_direction = "up" if price_change_pct > 0.5 else "down" if price_change_pct < -0.5 else "flat"

    if sentiment_label == "positive" and price_direction == "up":
        return "aligned"
    if sentiment_label == "negative" and price_direction == "down":
        return "aligned"
    if sentiment_label == "neutral" or price_direction == "flat":
        return "mixed"
    return "diverged"  # e.g. positive sentiment but price fell

def get_correlation_summary(ticker: str, days_back: int = 7) -> CorrelationSummary:
    cache_key = f"correlation:{ticker.upper()}:{days_back}"
    cached = cache_service.get(cache_key)
    if cached is not None:
        return cached

    articles = fetch_articles(ticker, days_back=days_back)
    articles = analyze_articles(articles)
    price = fetch_price_summary(ticker, days_back=days_back)

    avg_score, sentiment_label = _overall_sentiment(articles)
    alignment = _determine_alignment(sentiment_label, price.change_pct or 0.0)

    summary = CorrelationSummary(
        ticker=ticker.upper(),
        period_days=days_back,
        avg_sentiment_score=avg_score,
        sentiment_label=sentiment_label,
        price_change_pct=price.change_pct or 0.0,
        alignment=alignment,
        article_count=len(articles),
        articles=articles,
        price=price,
    )
    cache_service.set(cache_key, summary)
    return summary


if __name__ == "__main__":
    # Smoke test: python -m backend.services.correlation_service AAPL
    import sys
    ticker_arg = sys.argv[1] if len(sys.argv) > 1 else "AAPL"
    summary = get_correlation_summary(ticker_arg)
    print(f"{summary.ticker}: sentiment={summary.sentiment_label} ({summary.avg_sentiment_score:+.2f}), "
          f"price={summary.price_change_pct:+.2f}% -> {summary.alignment}")