"""
LangGraph agent that compares two tickers' sentiment/price data and writes
a comparative brief. Mirrors agent_service.py's two-node pattern:

  1. fetch_both — runs get_correlation_summary() for each ticker (reuses
     the existing service directly, no duplicated fetch/sentiment logic)
  2. compare_briefs — takes both summaries' facts and writes a comparative
     narrative, using the same no-hallucination constraint as agent_service.py
"""
from typing import TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from langgraph.graph import StateGraph, END

from backend.config import settings
from backend.services.correlation_service import CorrelationSummary, get_correlation_summary

llm = ChatGroq(
    api_key=settings.groq_api_key,
    model="llama-3.1-8b-instant",
    temperature=0.3,
)


class ComparisonState(TypedDict):
    ticker_a: str
    ticker_b: str
    summary_a: CorrelationSummary
    summary_b: CorrelationSummary
    facts: str
    comparison_brief: str


def _summary_to_facts_block(summary: CorrelationSummary) -> str:
    """Same fact-extraction shape as agent_service.py's extract_facts,
    reused here per-ticker so both summaries feed the LLM identically."""
    top_headlines = [a.title for a in summary.articles[:3]]
    return (
        f"Ticker: {summary.ticker}\n"
        f"Price change: {summary.price_change_pct:+.2f}%\n"
        f"Current price: ${summary.price.current_price}\n"
        f"Average sentiment: {summary.sentiment_label} (score {summary.avg_sentiment_score:+.2f})\n"
        f"Sentiment/price alignment: {summary.alignment}\n"
        f"Top headlines:\n" + "\n".join(f"- {h}" for h in top_headlines)
    )


def fetch_both(state: ComparisonState) -> ComparisonState:
    summary_a = get_correlation_summary(state["ticker_a"])
    summary_b = get_correlation_summary(state["ticker_b"])

    facts = (
        f"=== {summary_a.ticker} ===\n{_summary_to_facts_block(summary_a)}\n\n"
        f"=== {summary_b.ticker} ===\n{_summary_to_facts_block(summary_b)}"
    )

    return {**state, "summary_a": summary_a, "summary_b": summary_b, "facts": facts}


def compare_briefs(state: ComparisonState) -> ComparisonState:
    system = SystemMessage(content=(
        "You are a financial analyst comparing two stocks' recent sentiment and "
        "price data. Write 3-4 sentences: how their sentiment compares, how their "
        "price movement compares, and whether one shows a notably different "
        "sentiment/price relationship than the other. "
        "Do not give investment advice, price predictions, or a recommendation "
        "to buy/sell/prefer one over the other. "
        "Do not mention any product, event, launch, or news detail that is not "
        "explicitly listed in the facts below — if a cause isn't in the data, "
        "describe the relationship as 'diverged' or 'mixed' rather than guessing why. "
        "Be direct and specific, but only using the given facts."
    ))
    user = HumanMessage(content=state["facts"])

    response = llm.invoke([system, user])
    return {**state, "comparison_brief": response.content}


def build_comparison_graph():
    graph = StateGraph(ComparisonState)
    graph.add_node("fetch_both", fetch_both)
    graph.add_node("compare_briefs", compare_briefs)
    graph.set_entry_point("fetch_both")
    graph.add_edge("fetch_both", "compare_briefs")
    graph.add_edge("compare_briefs", END)
    return graph.compile()


_comparison_agent = build_comparison_graph()


def generate_comparison(ticker_a: str, ticker_b: str) -> dict:
    """Returns both summaries plus the comparative brief — the router
    shapes this into the API response."""
    result = _comparison_agent.invoke({
        "ticker_a": ticker_a,
        "ticker_b": ticker_b,
        "summary_a": None,
        "summary_b": None,
        "facts": "",
        "comparison_brief": "",
    })
    return {
        "ticker_a": result["summary_a"],
        "ticker_b": result["summary_b"],
        "comparison_brief": result["comparison_brief"],
    }


if __name__ == "__main__":
    # Smoke test: python -m backend.services.comparison_service AAPL MSFT
    import sys
    a = sys.argv[1] if len(sys.argv) > 1 else "AAPL"
    b = sys.argv[2] if len(sys.argv) > 2 else "MSFT"

    result = generate_comparison(a, b)
    print(f"\n--- {a} vs {b} Comparison ---")
    print(f"{a}: sentiment={result['ticker_a'].sentiment_label} ({result['ticker_a'].avg_sentiment_score:+.2f}), "
          f"price={result['ticker_a'].price_change_pct:+.2f}%")
    print(f"{b}: sentiment={result['ticker_b'].sentiment_label} ({result['ticker_b'].avg_sentiment_score:+.2f}), "
          f"price={result['ticker_b'].price_change_pct:+.2f}%")
    print(f"\n{result['comparison_brief']}\n")