"""
GET /compare?tickers=AAPL,MSFT — comparative sentiment/price brief for two tickers.
Phase 2, Workstream B1.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from backend.services.comparison_service import generate_comparison
from backend.services.correlation_service import CorrelationSummary
from backend.services.news_service import NewsServiceError
from backend.services.stock_service import StockServiceError

router = APIRouter(prefix="/compare", tags=["compare"])


class ComparisonResponse(BaseModel):
    ticker_a: CorrelationSummary
    ticker_b: CorrelationSummary
    comparison_brief: str


@router.get("", response_model=ComparisonResponse)
def compare_tickers(tickers: str = Query(..., description="Two comma-separated tickers, e.g. AAPL,MSFT")):
    parts = [t.strip().upper() for t in tickers.split(",") if t.strip()]

    if len(parts) != 2:
        raise HTTPException(
            status_code=400,
            detail=f"Expected exactly 2 comma-separated tickers, got {len(parts)}: {tickers}",
        )

    ticker_a, ticker_b = parts

    try:
        result = generate_comparison(ticker_a, ticker_b)
    except (NewsServiceError, StockServiceError) as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    return ComparisonResponse(
        ticker_a=result["ticker_a"],
        ticker_b=result["ticker_b"],
        comparison_brief=result["comparison_brief"],
    )