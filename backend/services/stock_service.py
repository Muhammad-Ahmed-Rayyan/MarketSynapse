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
    next_earnings_date: Optional[str] = None  # ISO date string, None if unavailable

class StockServiceError(Exception):
    pass
def _get_next_earnings_date(stock: yf.Ticker) -> Optional[str]:
    """
    Best-effort lookup of the next earnings date via yfinance's calendar.
    Returns None (not an error) if unavailable — earnings data is often
    missing/inconsistent on yfinance depending on the ticker and timing,
    and this feature should degrade gracefully rather than break the
    whole price fetch over a missing calendar.
    """
    try:
        calendar = stock.calendar
        if not calendar:
            return None
        # yfinance's calendar shape has varied across versions — handle
        # both a dict-like and DataFrame-like return defensively.
        earnings_dates = calendar.get("Earnings Date") if hasattr(calendar, "get") else None
        if not earnings_dates:
            return None
        first_date = earnings_dates[0] if isinstance(earnings_dates, list) else earnings_dates
        return str(first_date)
    except Exception:
        # Any failure here (missing data, format change, etc.) should not
        # break price fetching — earnings info is a nice-to-have, not core.
        return None

def fetch_price_summary(ticker: str, days_back: int = 7) -> PriceSummary:
    ticker = ticker.upper().strip()
    end = datetime.now()
    start = end - timedelta(days=days_back + 1)

    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"))
    except Exception as exc:
        raise StockServiceError(f"Failed to fetch price data for {ticker}: {exc}") from exc

    if hist.empty:
        raise StockServiceError(
            f"No price data found for ticker '{ticker}' — this can be a transient "
            f"Yahoo Finance issue, try again in a moment"
        )

    history = [
        PricePoint(date=idx.strftime("%Y-%m-%d"), close=round(float(row["Close"]), 2))
        for idx, row in hist.iterrows()
    ]

    first_close = history[0].close
    last_close = history[-1].close
    change_pct = round(((last_close - first_close) / first_close) * 100, 2) if first_close else None

    next_earnings_date = _get_next_earnings_date(stock)

    return PriceSummary(
        ticker=ticker,
        current_price=last_close,
        change_pct=change_pct,
        period_days=days_back,
        history=history,
        next_earnings_date=next_earnings_date,
    )


if __name__ == "__main__":
    # Smoke test: python -m backend.services.stock_service AAPL
    import sys
    ticker_arg = sys.argv[1] if len(sys.argv) > 1 else "AAPL"
    try:
        summary = fetch_price_summary(ticker_arg)
        print(f"{summary.ticker}: ${summary.current_price} ({summary.change_pct:+.2f}% over {summary.period_days}d)")
        print(f"Next earnings date: {summary.next_earnings_date or 'unavailable'}")
        for p in summary.history:
            print(f"  {p.date}: ${p.close}")
    except StockServiceError as e:
        print(f"Error: {e}")