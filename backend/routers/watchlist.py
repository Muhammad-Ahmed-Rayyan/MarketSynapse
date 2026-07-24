"""
GET/POST/DELETE /watchlist — Phase 2, Workstream D1.
No auth — single implicit user for this phase.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

from backend.services.watchlist_service import add_ticker, remove_ticker, get_watchlist

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


class WatchlistItem(BaseModel):
    ticker: str
    added_at: datetime


class WatchlistResponse(BaseModel):
    count: int
    tickers: list[WatchlistItem]


class TickerRequest(BaseModel):
    ticker: str


@router.get("", response_model=WatchlistResponse)
def list_watchlist():
    items = get_watchlist()
    return WatchlistResponse(
        count=len(items),
        tickers=[WatchlistItem(ticker=w.ticker, added_at=w.added_at) for w in items],
    )


@router.post("", response_model=WatchlistResponse, status_code=201)
def add_to_watchlist(body: TickerRequest):
    ticker = body.ticker.strip().upper()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker cannot be empty")

    add_ticker(ticker)  # idempotent — already-present tickers are a no-op, not an error
    items = get_watchlist()
    return WatchlistResponse(
        count=len(items),
        tickers=[WatchlistItem(ticker=w.ticker, added_at=w.added_at) for w in items],
    )


@router.delete("/{ticker}", response_model=WatchlistResponse)
def remove_from_watchlist(ticker: str):
    removed = remove_ticker(ticker)
    if not removed:
        raise HTTPException(status_code=404, detail=f"{ticker.upper()} is not on the watchlist")

    items = get_watchlist()
    return WatchlistResponse(
        count=len(items),
        tickers=[WatchlistItem(ticker=w.ticker, added_at=w.added_at) for w in items],
    )