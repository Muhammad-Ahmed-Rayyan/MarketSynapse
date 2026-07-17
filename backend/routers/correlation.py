from fastapi import APIRouter, HTTPException, Query

from backend.services.correlation_service import CorrelationSummary, get_correlation_summary
from backend.services.news_service import NewsServiceError
from backend.services.stock_service import StockServiceError

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.get("/{ticker}", response_model=CorrelationSummary)
def analyze_ticker(ticker: str, days_back: int = Query(default=7, ge=1, le=30)):
    try:
        return get_correlation_summary(ticker, days_back=days_back)
    except (NewsServiceError, StockServiceError) as e:
        raise HTTPException(status_code=502, detail=str(e)) from e