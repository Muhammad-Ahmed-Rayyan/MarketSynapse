"""
Price data via yfinance.

No API key needed — yfinance scrapes Yahoo Finance's public endpoints.
Trade-off: no formal rate-limit guarantee, so don't hammer it in a loop.
"""
from datetime import datetime, timedelta
from typing import Optional

import yfinance as yf
from pydantic import BaseModel


class PricePoint(BaseModel):
    date: str
    close: float


class PriceSummary(BaseModel):
    ticker: str
    current_price: Optional[float] = None
    change_pct: Optional[float] = None       # over the requested window
    period_days: int
    history: list[PricePoint]


class StockServiceError(Exception):
    pass


def fetch_price_summary(ticker: str, days_back: int = 7) -> PriceSummary:
    ticker = ticker.upper().strip()
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=f"{days_back + 1}d")
    except Exception as exc:
        raise StockServiceError(f"Failed to fetch price data for {ticker}: {exc}") from exc

    if hist.empty:
        raise StockServiceError(f"No price data found for ticker '{ticker}'")

    history = [
        PricePoint(date=idx.strftime("%Y-%m-%d"), close=round(float(row["Close"]), 2))
        for idx, row in hist.iterrows()
    ]

    first_close = history[0].close
    last_close = history[-1].close
    change_pct = round(((last_close - first_close) / first_close) * 100, 2) if first_close else None

    return PriceSummary(
        ticker=ticker,
        current_price=last_close,
        change_pct=change_pct,
        period_days=days_back,
        history=history,
    )


if __name__ == "__main__":
    # Smoke test: python -m backend.services.stock_service AAPL
    import sys
    ticker_arg = sys.argv[1] if len(sys.argv) > 1 else "AAPL"
    try:
        summary = fetch_price_summary(ticker_arg)
        print(f"{summary.ticker}: ${summary.current_price} ({summary.change_pct:+.2f}% over {summary.period_days}d)")
        for p in summary.history:
            print(f"  {p.date}: ${p.close}")
    except StockServiceError as e:
        print(f"Error: {e}")