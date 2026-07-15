"""
Pydantic request/response schemas.
Day 1: just the news article shape. Sentiment fields get added on Day 2
once FinBERT is wired in (kept optional here so the schema doesn't churn).
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Article(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    url: str
    source: str
    published_at: Optional[datetime] = None

    # Populated starting Day 2 (FinBERT). Left optional so the frontend
    # can render the news feed before sentiment is wired in.
    sentiment_label: Optional[str] = None
    sentiment_score: Optional[float] = None


class NewsResponse(BaseModel):
    ticker: str
    count: int
    articles: list[Article]


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Human-readable error message")