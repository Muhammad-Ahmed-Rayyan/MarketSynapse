"""
Unit tests for correlation_service.py's pure logic functions.
No network calls, no FinBERT/yfinance — just the math and decision rules.
"""
import pytest

from backend.services.correlation_service import _overall_sentiment, _determine_alignment
from backend.models.schemas import Article


def make_article(label: str, score: float) -> Article:
    """Helper: build a minimal Article with just the sentiment fields set."""
    return Article(
        title="test headline",
        url="https://example.com",
        source="test-source",
        sentiment_label=label,
        sentiment_score=score,
    )


class TestOverallSentiment:
    def test_empty_articles_returns_neutral(self):
        avg, label = _overall_sentiment([])
        assert avg == 0.0
        assert label == "neutral"

    def test_all_positive_articles(self):
        articles = [make_article("positive", 0.9), make_article("positive", 0.8)]
        avg, label = _overall_sentiment(articles)
        assert avg > 0.15
        assert label == "positive"

    def test_all_negative_articles(self):
        articles = [make_article("negative", 0.9), make_article("negative", 0.7)]
        avg, label = _overall_sentiment(articles)
        assert avg < -0.15
        assert label == "negative"

    def test_mixed_articles_average_to_neutral(self):
        articles = [make_article("positive", 0.5), make_article("negative", 0.5)]
        avg, label = _overall_sentiment(articles)
        assert -0.15 <= avg <= 0.15
        assert label == "neutral"

    def test_low_confidence_scores_stay_neutral(self):
        # Weakly positive/negative confidence shouldn't tip the overall label.
        articles = [make_article("positive", 0.1), make_article("negative", 0.1)]
        avg, label = _overall_sentiment(articles)
        assert label == "neutral"


class TestDetermineAlignment:
    def test_positive_sentiment_price_up_is_aligned(self):
        assert _determine_alignment("positive", 3.5) == "aligned"

    def test_negative_sentiment_price_down_is_aligned(self):
        assert _determine_alignment("negative", -3.5) == "aligned"

    def test_positive_sentiment_price_down_is_diverged(self):
        assert _determine_alignment("positive", -3.5) == "diverged"

    def test_negative_sentiment_price_up_is_diverged(self):
        assert _determine_alignment("negative", 3.5) == "diverged"

    def test_neutral_sentiment_is_always_mixed(self):
        assert _determine_alignment("neutral", 5.0) == "mixed"
        assert _determine_alignment("neutral", -5.0) == "mixed"

    def test_flat_price_is_always_mixed(self):
        assert _determine_alignment("positive", 0.2) == "mixed"
        assert _determine_alignment("negative", -0.2) == "mixed"

    def test_boundary_price_change_exactly_at_threshold(self):
        # 0.5 is the exact cutoff — direction should be "flat" at exactly 0.5,
        # not "up", based on the strict > comparison in the source.
        assert _determine_alignment("positive", 0.5) == "mixed"