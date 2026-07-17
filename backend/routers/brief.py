from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from backend.services.agent_service import generate_brief
from backend.services.correlation_service import get_correlation_summary
from backend.services.news_service import NewsServiceError
from backend.services.stock_service import StockServiceError

router = APIRouter(prefix="/brief", tags=["brief"])


class BriefResponse(BaseModel):
    ticker: str
    brief: str


@router.get("/{ticker}", response_model=BriefResponse)
def get_brief(ticker: str, days_back: int = Query(default=7, ge=1, le=30)):
    try:
        summary = get_correlation_summary(ticker, days_back=days_back)
        brief_text = generate_brief(summary)
    except (NewsServiceError, StockServiceError) as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    return BriefResponse(ticker=ticker.upper(), brief=brief_text)