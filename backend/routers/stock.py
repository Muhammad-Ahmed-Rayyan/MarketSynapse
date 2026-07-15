from fastapi import APIRouter, HTTPException, Query

from backend.services.stock_service import PriceSummary, StockServiceError, fetch_price_summary

router = APIRouter(prefix="/stock", tags=["stock"])


@router.get("/{ticker}", response_model=PriceSummary)
def get_price_summary(ticker: str, days_back: int = Query(default=7, ge=1, le=90)):
    try:
        return fetch_price_summary(ticker, days_back=days_back)
    except StockServiceError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e