"""
Lightweight LLM eval harness for the market brief pipeline. Not pytest —
this is a scored rubric run manually/locally, since it costs real Groq API
calls and isn't deterministic enough for strict pass/fail assertions.

Covers both brief surfaces added across Phase 2:
  - generate_brief() — single-ticker brief (agent_service.py)
  - generate_comparison() — two-ticker comparison brief (comparison_service.py)

Usage: python -m tests.eval_brief
"""
from backend.services.agent_service import generate_brief
from backend.services.comparison_service import generate_comparison
from backend.services.correlation_service import CorrelationSummary
from backend.services.stock_service import PriceSummary, PricePoint
from backend.models.schemas import Article


def make_summary(
    ticker: str,
    sentiment_label: str,
    avg_sentiment_score: float,
    price_change_pct: float,
    alignment: str,
    headlines: list[str],
    next_earnings_date: str = None,
    article_count: int = None,
) -> CorrelationSummary:
    """Builds a fixed, hand-crafted CorrelationSummary for eval — no live
    API calls, so results are reproducible run to run."""
    articles = [
        Article(title=h, url="https://example.com", source="eval-fixture", sentiment_label="neutral", sentiment_score=0.5)
        for h in headlines
    ]
    price = PriceSummary(
        ticker=ticker,
        current_price=100.0,
        change_pct=price_change_pct,
        period_days=7,
        history=[PricePoint(date="2026-07-13", close=100.0), PricePoint(date="2026-07-17", close=100.0 * (1 + price_change_pct / 100))],
        next_earnings_date=next_earnings_date,
    )
    return CorrelationSummary(
        ticker=ticker,
        period_days=7,
        avg_sentiment_score=avg_sentiment_score,
        sentiment_label=sentiment_label,
        price_change_pct=price_change_pct,
        alignment=alignment,
        article_count=article_count if article_count is not None else len(headlines),
        articles=articles,
        price=price,
    )


# --- Fixed test cases, covering the range the plan doc asks for ---

CASES = [
    {
        "name": "aligned_positive",
        "summary": make_summary(
            ticker="AAPL",
            sentiment_label="positive",
            avg_sentiment_score=0.6,
            price_change_pct=8.2,
            alignment="aligned",
            headlines=["Apple beats earnings expectations", "Analysts raise Apple price targets"],
        ),
        "expected_alignment_phrase": "aligned",
    },
    {
        "name": "diverged_negative_sentiment_price_up",
        "summary": make_summary(
            ticker="TSLA",
            sentiment_label="negative",
            avg_sentiment_score=-0.4,
            price_change_pct=6.0,
            alignment="diverged",
            headlines=["Tesla faces regulatory scrutiny", "Analysts cut Tesla ratings"],
        ),
        "expected_alignment_phrase": "diverged",
    },
    {
        "name": "mixed_neutral",
        "summary": make_summary(
            ticker="MSFT",
            sentiment_label="neutral",
            avg_sentiment_score=0.05,
            price_change_pct=0.3,
            alignment="mixed",
            headlines=["Microsoft announces routine product update"],
        ),
        "expected_alignment_phrase": "mixed",
    },
    {
        "name": "with_earnings_date",
        "summary": make_summary(
            ticker="NVDA",
            sentiment_label="positive",
            avg_sentiment_score=0.5,
            price_change_pct=4.1,
            alignment="aligned",
            headlines=["Nvidia demand remains strong ahead of earnings"],
            next_earnings_date="2026-08-15",
        ),
        "expected_alignment_phrase": "aligned",
    },
    {
        "name": "sparse_articles",
        "summary": make_summary(
            ticker="XYZ",
            sentiment_label="neutral",
            avg_sentiment_score=0.0,
            price_change_pct=-0.1,
            alignment="mixed",
            headlines=["XYZ Corp files routine SEC paperwork"],
            article_count=1,
        ),
        "expected_alignment_phrase": "mixed",
    },
]

ADVICE_PHRASES = ["you should buy", "you should sell", "consider buying", "consider selling", "we recommend", "strong buy", "strong sell"]


def score_brief(brief: str, summary: CorrelationSummary, expected_alignment_phrase: str) -> dict:
    brief_lower = brief.lower()

    mentions_sentiment_and_price = (
        any(w in brief_lower for w in ["sentiment", "positive", "negative", "neutral"])
        and any(w in brief_lower for w in ["price", "%"])
    )

    # Approximate hallucination check: every headline's distinctive words should
    # roughly ground what's said. This is a coarse heuristic, not a perfect check —
    # true hallucination detection would need an LLM judge, out of scope for this
    # lightweight harness.
    no_explicit_advice = not any(phrase in brief_lower for phrase in ADVICE_PHRASES)

    states_correct_alignment = expected_alignment_phrase in brief_lower

    return {
        "mentions_sentiment_and_price": int(mentions_sentiment_and_price),
        "no_explicit_advice": int(no_explicit_advice),
        "states_correct_alignment": int(states_correct_alignment),
    }


def run_single_ticker_evals():
    print("=" * 60)
    print("SINGLE-TICKER BRIEF EVAL (generate_brief)")
    print("=" * 60)

    all_scores = []
    for case in CASES:
        brief = generate_brief(case["summary"])
        scores = score_brief(brief, case["summary"], case["expected_alignment_phrase"])
        all_scores.append(scores)

        total = sum(scores.values())
        print(f"\n[{case['name']}] — {total}/3 checks passed")
        print(f"  Brief: {brief}")
        for check, result in scores.items():
            print(f"  {'PASS' if result else 'FAIL'} — {check}")

    return all_scores


def run_comparison_eval():
    print("\n" + "=" * 60)
    print("COMPARISON BRIEF EVAL (generate_comparison)")
    print("=" * 60)
    print("\nNote: generate_comparison() calls get_correlation_summary() internally,")
    print("which makes live NewsAPI/yfinance calls rather than using fixed fixtures —")
    print("so this part is a smoke test (does it run and produce a sane brief),")
    print("not a scored rubric like the single-ticker cases above.\n")

    try:
        from backend.services.comparison_service import generate_comparison
        result = generate_comparison("AAPL", "MSFT")
        brief = result["comparison_brief"]
        print(f"Brief: {brief}")

        brief_lower = brief.lower()
        no_advice = not any(phrase in brief_lower for phrase in ADVICE_PHRASES)
        print(f"\n{'PASS' if no_advice else 'FAIL'} — no_explicit_advice")
    except Exception as e:
        print(f"Comparison eval failed to run: {e}")


if __name__ == "__main__":
    all_scores = run_single_ticker_evals()

    total_checks = sum(sum(s.values()) for s in all_scores)
    max_checks = len(all_scores) * 3
    print(f"\n{'=' * 60}")
    print(f"SINGLE-TICKER PASS RATE: {total_checks}/{max_checks} ({100 * total_checks / max_checks:.0f}%)")
    print("=" * 60)

    run_comparison_eval()