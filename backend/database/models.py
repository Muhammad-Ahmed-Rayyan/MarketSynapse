"""
SQLAlchemy models. Phase 2, Workstream A: sentiment_history persists every
/report/{ticker} call so a sentiment-over-time trend becomes possible.
Phase 2, Workstream D1: watchlist stores saved tickers, no auth — single
implicit user for this phase.
"""
from datetime import datetime, date

from sqlalchemy import Column, Integer, String, Float, Date, DateTime

from backend.database.db import Base


class SentimentHistory(Base):
    __tablename__ = "sentiment_history"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True, nullable=False)
    date = Column(Date, default=date.today, nullable=False)
    avg_sentiment_score = Column(Float, nullable=False)
    sentiment_label = Column(String, nullable=False)
    price_change_pct = Column(Float, nullable=False)
    alignment = Column(String, nullable=False)
    article_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)