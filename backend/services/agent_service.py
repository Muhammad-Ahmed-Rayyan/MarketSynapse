'''
LangGraph agent that turns a CorrelationSummary into a written market brief.

Two nodes:
  1. extract_facts — pulls the handful of concrete numbers/headlines the brief needs, so the LLM isnt reasoning over the full raw article list
  2. write_brief — takes those facts and generates the actual narrative

Keeping these separate (rather than one big prompt) makes it easy to slot
in more nodes later (e.g. a fact-check step) without a rewrite.
'''

from typing import TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END

from backend.config import settings
from backend.services.correlation_service import CorrelationSummary

llm = ChatGroq(
    api_key=settings.groq_api_key,
    model="llama-3.1-8b-instant",
    temperature=0.3,  # low but not zero — brief should read naturally, not robotically
)


class AgentState(TypedDict):
    summary: CorrelationSummary
    facts: str
    brief: str


def extract_facts(state: AgentState) -> AgentState:
    summary = state["summary"]
    top_headlines = [a.title for a in summary.articles[:5]]

    facts = (
        f"Ticker: {summary.ticker}\n"
        f"Period: last {summary.period_days} days\n"
        f"Price change: {summary.price_change_pct:+.2f}%\n"
        f"Current price: ${summary.price.current_price}\n"
        f"Average sentiment: {summary.sentiment_label} (score {summary.avg_sentiment_score:+.2f})\n"
        f"Sentiment/price alignment: {summary.alignment}\n"
        f"Articles analyzed: {summary.article_count}\n"
        f"Top headlines:\n" + "\n".join(f"- {h}" for h in top_headlines)
    )
    return {**state, "facts": facts}


def write_brief(state: AgentState) -> AgentState:
    system = SystemMessage(content=(
        "You are a financial analyst writing a short, plain-English market brief. "
        "You are given sentiment and price data for a stock. Write 3-4 sentences: "
        "what happened, whether news sentiment matched price movement, and one "
        "cautious takeaway. "
        "Do not give investment advice or price predictions. "
        "Do not mention any product, event, launch, or news detail that is not "
        "explicitly listed in the facts below — if the cause of a price move isn't "
        "in the data, say sentiment/price were 'diverged' or 'mixed' rather than "
        "guessing why. Be direct and specific, but only using the given facts."
    ))
    user = HumanMessage(content=state["facts"])

    response = llm.invoke([system, user])
    return {**state, "brief": response.content}


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("extract_facts", extract_facts)
    graph.add_node("write_brief", write_brief)
    graph.set_entry_point("extract_facts")
    graph.add_edge("extract_facts", "write_brief")
    graph.add_edge("write_brief", END)
    return graph.compile()


_agent = build_graph()


def generate_brief(summary: CorrelationSummary) -> str:
    result = _agent.invoke({"summary": summary, "facts": "", "brief": ""})
    return result["brief"]


if __name__ == "__main__":
    # Smoke test: python -m backend.services.agent_service AAPL
    import sys
    from backend.services.correlation_service import get_correlation_summary

    ticker_arg = sys.argv[1] if len(sys.argv) > 1 else "AAPL"
    summary = get_correlation_summary(ticker_arg)
    brief = generate_brief(summary)
    print(f"\n--- {summary.ticker} Market Brief ---\n{brief}\n")