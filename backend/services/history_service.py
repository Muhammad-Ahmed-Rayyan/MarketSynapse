"""
Persists sentiment_history rows and reads them back for the trend chart.
Phase 2, Workstream A.

Design decision: save_snapshot() is called only on a fresh (non-cached)
CorrelationSummary computation, not on cache hits. The correlation cache
key has no timestamp component, so a cache hit means identical sentiment
data to a recent fetch — logging it again would just duplicate rows and
add noise to the trend chart without adding any real signal.
"""
from datetime import date

from sqlalchemy.orm import Session

from backend.database.db import SessionLocal
from backend.database.models import SentimentHistory
from backend.services.correlation_service import CorrelationSummary


def save_snapshot(summary: CorrelationSummary, db: Session = None) -> None:
    """Writes one row per fresh correlation computation. Owns its own
    session if one isn't passed in, so callers in services (not just
    FastAPI routes) can use this without needing a request-scoped db."""
    owns_session = db is None
    if owns_session:
        db = SessionLocal()
    try:
        row = SentimentHistory(
            ticker=summary.ticker,
            date=date.today(),
            avg_sentiment_score=summary.avg_sentiment_score,
            sentiment_label=summary.sentiment_label,
            price_change_pct=summary.price_change_pct,
            alignment=summary.alignment,
            article_count=summary.article_count,
        )
        db.add(row)
        db.commit()
    finally:
        if owns_session:
            db.close()


def get_history(ticker: str, days_back: int = 30, db: Session = None) -> list[SentimentHistory]:
    """Returns past snapshots for a ticker, most recent first."""
    owns_session = db is None
    if owns_session:
        db = SessionLocal()
    try:
        return (
            db.query(SentimentHistory)
            .filter(SentimentHistory.ticker == ticker.upper())
            .order_by(SentimentHistory.date.desc())
            .limit(days_back)
            .all()
        )
    finally:
        if owns_session:
            db.close()


if __name__ == "__main__":
    # Smoke test: python -m backend.services.history_service AAPL
    import sys
    ticker_arg = sys.argv[1] if len(sys.argv) > 1 else "AAPL"
    rows = get_history(ticker_arg)
    print(f"{len(rows)} rows for {ticker_arg}:")
    for r in rows:
        print(f"  {r.date} — {r.sentiment_label} ({r.avg_sentiment_score:+.2f}), "
              f"price {r.price_change_pct:+.2f}%, {r.alignment}")