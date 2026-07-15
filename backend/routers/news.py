from fastapi import APIRouter, HTTPException, Query

from backend.models.schemas import NewsResponse
from backend.services.news_service import NewsServiceError, fetch_articles

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/{ticker}", response_model=NewsResponse)
def get_news(
    ticker: str,
    page_size: int = Query(default=20, ge=1, le=100),
    days_back: int = Query(default=7, ge=1, le=30),
):
    """Fetch recent news articles for a given ticker symbol."""
    try:
        articles = fetch_articles(ticker, page_size=page_size, days_back=days_back)
    except NewsServiceError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    return NewsResponse(ticker=ticker.upper(), count=len(articles), articles=articles)