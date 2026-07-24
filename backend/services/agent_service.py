"""
LangGraph agent that turns a CorrelationSummary into a written market brief.

Three nodes:
  1. extract_facts — pulls the handful of concrete numbers/headlines the brief needs
  2. write_brief — takes those facts and generates the actual narrative
  3. review_brief — Phase 2, Workstream B3: feeds the brief back to the LLM with a
     strict checklist (hallucination check + no-advice check). Rewrites only if a
     violation is found; otherwise returns the brief unchanged. This catches cases
     where write_brief's own constraints slip through despite the system prompt.
"""

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
    )

    # Only included when yfinance actually returns one — omitting the line
    # entirely (rather than saying "unknown") is what keeps write_brief's
    # system prompt from ever inventing an earnings date on tickers where
    # this data isn't available.
    if summary.price.next_earnings_date:
        facts += f"Next earnings date: {summary.price.next_earnings_date}\n"

    facts += "Top headlines:\n" + "\n".join(f"- {h}" for h in top_headlines)
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


def review_brief(state: AgentState) -> AgentState:
    """
    Self-correction step: re-checks write_brief's own output against the same
    two constraints it was told to follow, using the source facts as ground
    truth. Rewrites only on a genuine violation; otherwise passes through
    unchanged, so this doesn't degrade an already-compliant brief.

    Known limitation (measured via tests/test_review_brief.py): reliably
    catches explicit investment-advice language, but is less reliable at
    catching subtler hallucinated entities/events not present in the source
    facts. This appears to be a capability limit of the small, fast model
    used here (llama-3.1-8b-instant) rather than a prompt-wording issue — a
    more instructive prompt (forcing an explicit entity-listing step) was
    tested and made hallucination detection no more reliable while
    introducing a new soft-prediction violation in the rewrite. A larger
    model would likely handle this more consistently; noted here rather
    than solved, since chasing prompt tweaks further showed diminishing and
    inconsistent returns.
    """
    system = SystemMessage(content=(
        "You are a strict editor reviewing a financial market brief before publication. "
        "You will be given the SOURCE FACTS the brief was supposed to be based on, and "
        "the DRAFT BRIEF itself. Check the draft against exactly two rules:\n\n"
        "1. Does it mention any specific product, event, launch, number, or detail that "
        "is NOT present in the source facts? (Hallucination check)\n"
        "2. Does it give investment advice or a recommendation — any phrase like 'buy', "
        "'sell', 'you should', 'consider investing', or a price prediction? (Advice check)\n\n"
        "If the draft violates either rule, rewrite it to remove the violation while "
        "keeping everything else intact, and output ONLY the corrected brief text.\n"
        "If the draft violates neither rule, output the draft brief exactly as given, "
        "unchanged, with no commentary.\n"
        "Do not add any preamble, explanation, or notes — output only the final brief text."
    ))
    user = HumanMessage(content=(
        f"SOURCE FACTS:\n{state['facts']}\n\n"
        f"DRAFT BRIEF:\n{state['brief']}"
    ))

    response = llm.invoke([system, user])
    return {**state, "brief": response.content}

    user = HumanMessage(content=(
        f"SOURCE FACTS:\n{state['facts']}\n\n"
        f"DRAFT BRIEF:\n{state['brief']}"
    ))

    response = llm.invoke([system, user])
    return {**state, "brief": response.content}


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("extract_facts", extract_facts)
    graph.add_node("write_brief", write_brief)
    graph.add_node("review_brief", review_brief)
    graph.set_entry_point("extract_facts")
    graph.add_edge("extract_facts", "write_brief")
    graph.add_edge("write_brief", "review_brief")
    graph.add_edge("review_brief", END)
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