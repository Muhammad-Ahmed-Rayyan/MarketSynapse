from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from backend.services.agent_service import generate_brief
from backend.services.correlation_service import CorrelationSummary, get_correlation_summary
from backend.services.news_service import NewsServiceError
from backend.services.stock_service import StockServiceError

router = APIRouter(prefix="/report", tags=["report"])


class FullReport(BaseModel):
    analysis: CorrelationSummary
    brief: str


@router.get("/{ticker}", response_model=FullReport)
def get_full_report(ticker: str, days_back: int = Query(default=7, ge=1, le=30)):
    """Single endpoint the frontend calls: sentiment + price + written brief, together."""
    try:
        summary = get_correlation_summary(ticker, days_back=days_back)
        brief_text = generate_brief(summary)
    except (NewsServiceError, StockServiceError) as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    return FullReport(analysis=summary, brief=brief_text)