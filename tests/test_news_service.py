"""
Unit tests for news_service.py's _is_relevant() filter — the exact function
that fixed a real Day 3 bug (irrelevant articles like Metallica interviews
and Unity assets skewing sentiment). No real network calls here; fetch_articles()
itself is not tested directly since it requires a live API key.
"""
from backend.services.news_service import _is_relevant, _build_query
from backend.models.schemas import Article


def make_article(title: str, description: str = "") -> Article:
    return Article(
        title=title,
        description=description,
        url="https://example.com",
        source="test-source",
    )


class TestIsRelevant:
    def test_ticker_in_title_is_relevant(self):
        article = make_article("AAPL surges on earnings beat")
        assert _is_relevant(article, "AAPL") is True

    def test_company_alias_in_title_is_relevant(self):
        article = make_article("Apple unveils new iPhone lineup")
        assert _is_relevant(article, "AAPL") is True

    def test_company_alias_in_description_is_relevant(self):
        article = make_article("Big tech news today", "Apple stock climbed 3% in trading")
        assert _is_relevant(article, "AAPL") is True

    def test_unrelated_article_is_not_relevant(self):
        # This is the actual Day 3 bug case — a completely unrelated article
        # that NewsAPI's loose query matching returned regardless.
        article = make_article("Metallica announces world tour dates")
        assert _is_relevant(article, "AAPL") is False

    def test_ticker_without_known_alias_falls_back_to_ticker_match_only(self):
        # A ticker not in TICKER_ALIASES (e.g. a smaller/less common stock)
        # should still match on the raw ticker string.
        article = make_article("XYZ Corp announces new product line")
        assert _is_relevant(article, "XYZ") is True

    def test_case_insensitive_matching(self):
        article = make_article("apple reports quarterly results")
        assert _is_relevant(article, "AAPL") is True


class TestBuildQuery:
    def test_known_ticker_includes_alias(self):
        query = _build_query("AAPL")
        assert '"AAPL"' in query
        assert '"Apple"' in query
        assert "OR" in query

    def test_unknown_ticker_has_no_alias_clause(self):
        query = _build_query("XYZ")
        assert query == '"XYZ"'
        assert "OR" not in query

    def test_lowercase_input_is_normalized(self):
        query = _build_query("aapl")
        assert '"AAPL"' in query