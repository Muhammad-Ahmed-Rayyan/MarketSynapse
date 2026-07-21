"""
Unit tests for stock_service.py's fetch_price_summary() — mocks yfinance.Ticker
so the % change math is tested without hitting the real (occasionally flaky)
Yahoo Finance network.
"""
from unittest.mock import patch, MagicMock
import pandas as pd
import pytest

from backend.services.stock_service import fetch_price_summary, StockServiceError


def make_fake_history(closes: list[float]) -> pd.DataFrame:
    """Builds a minimal fake yfinance history DataFrame with just Close prices."""
    dates = pd.date_range(start="2026-07-13", periods=len(closes), freq="D")
    return pd.DataFrame({"Close": closes}, index=dates)


class TestFetchPriceSummary:
    @patch("backend.services.stock_service.yf.Ticker")
    def test_positive_change_pct(self, mock_ticker_cls):
        mock_instance = MagicMock()
        mock_instance.history.return_value = make_fake_history([100.0, 105.0, 110.0])
        mock_ticker_cls.return_value = mock_instance

        summary = fetch_price_summary("AAPL", days_back=7)

        assert summary.ticker == "AAPL"
        assert summary.current_price == 110.0
        assert summary.change_pct == 10.0  # (110-100)/100 * 100
        assert len(summary.history) == 3

    @patch("backend.services.stock_service.yf.Ticker")
    def test_negative_change_pct(self, mock_ticker_cls):
        mock_instance = MagicMock()
        mock_instance.history.return_value = make_fake_history([200.0, 190.0, 180.0])
        mock_ticker_cls.return_value = mock_instance

        summary = fetch_price_summary("TSLA", days_back=7)

        assert summary.change_pct == -10.0  # (180-200)/200 * 100

    @patch("backend.services.stock_service.yf.Ticker")
    def test_flat_price_zero_change(self, mock_ticker_cls):
        mock_instance = MagicMock()
        mock_instance.history.return_value = make_fake_history([150.0, 150.0])
        mock_ticker_cls.return_value = mock_instance

        summary = fetch_price_summary("MSFT", days_back=7)

        assert summary.change_pct == 0.0

    @patch("backend.services.stock_service.yf.Ticker")
    def test_empty_history_raises_stock_service_error(self, mock_ticker_cls):
        # This is the exact real bug from Day 3 — yfinance intermittently
        # returns an empty DataFrame ("possibly delisted") on valid tickers.
        mock_instance = MagicMock()
        mock_instance.history.return_value = pd.DataFrame()
        mock_ticker_cls.return_value = mock_instance

        with pytest.raises(StockServiceError, match="No price data found"):
            fetch_price_summary("AAPL", days_back=7)

    @patch("backend.services.stock_service.yf.Ticker")
    def test_yfinance_exception_wrapped_as_stock_service_error(self, mock_ticker_cls):
        mock_instance = MagicMock()
        mock_instance.history.side_effect = ConnectionError("network unreachable")
        mock_ticker_cls.return_value = mock_instance

        with pytest.raises(StockServiceError, match="Failed to fetch price data"):
            fetch_price_summary("AAPL", days_back=7)

    @patch("backend.services.stock_service.yf.Ticker")
    def test_ticker_is_uppercased_and_stripped(self, mock_ticker_cls):
        mock_instance = MagicMock()
        mock_instance.history.return_value = make_fake_history([100.0, 100.0])
        mock_ticker_cls.return_value = mock_instance

        summary = fetch_price_summary("  aapl  ", days_back=7)

        assert summary.ticker == "AAPL"