"""
GET /history/{ticker} — past sentiment/price snapshots for the trend chart.
Phase 2, Workstream A.
"""
from fastapi import APIRouter, Query
from pydantic import BaseModel
from datetime import date

from backend.services.history_service import get_history

router = APIRouter(prefix="/history", tags=["history"])


class HistoryPoint(BaseModel):
    date: date
    avg_sentiment_score: float
    sentiment_label: str
    price_change_pct: float
    alignment: str
    article_count: int


class HistoryResponse(BaseModel):
    ticker: str
    count: int
    history: list[HistoryPoint]


@router.get("/{ticker}", response_model=HistoryResponse)
def get_ticker_history(ticker: str, days_back: int = Query(default=30, ge=1, le=90)):
    rows = get_history(ticker, days_back=days_back)
    points = [
        HistoryPoint(
            date=r.date,
            avg_sentiment_score=r.avg_sentiment_score,
            sentiment_label=r.sentiment_label,
            price_change_pct=r.price_change_pct,
            alignment=r.alignment,
            article_count=r.article_count,
        )
        for r in rows
    ]
    return HistoryResponse(ticker=ticker.upper(), count=len(points), history=points)