# MarketSynapse

Real-time financial intelligence: live news → FinBERT sentiment → price correlation → LLM-generated market brief, with historical tracking, multi-ticker comparison, and a self-correcting brief pipeline.

> Educational/informational project only. Not financial advice.

## Status
✅ Phase 1 (core pipeline + React dashboard) complete.
✅ Phase 2 (historical tracking, smarter agent, tests, product features) complete.
🚧 Deployment (Railway + Vercel) not yet started — running locally.

## Quickstart

```bash
git clone <your-repo-url> marketsynapse
cd marketsynapse

python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Add your NEWS_API_KEY (https://newsapi.org) and GROQ_API_KEY (https://console.groq.com)

uvicorn backend.main:app --reload
# Visit http://localhost:8000/docs for interactive Swagger UI
```

In a separate terminal, for the frontend:

```bash
cd frontend
npm install
# Create frontend/.env with: VITE_API_URL=http://localhost:8000
npm run dev
```

Both servers must run simultaneously (backend on `:8000`, frontend dev server on `:5173`).

**Note on the venv:** if you're on a fresh clone and hit `ModuleNotFoundError` for something already in `requirements.txt`, double-check the venv is actually activated in your current terminal (`.venv\Scripts\activate` on Windows) — every new terminal session needs this run again, it doesn't persist automatically.

## Endpoints

| Endpoint | Description |
|---|---|
| `GET /news/{ticker}` | Recent news articles for a ticker, filtered for relevance |
| `GET /stock/{ticker}` | Price history, % change, and next earnings date (when available) |
| `GET /analyze/{ticker}` | Combined sentiment + price with an alignment verdict (aligned/diverged/mixed) |
| `GET /brief/{ticker}` | LLM-generated plain-English market brief (self-reviewed for hallucinations/advice) |
| `GET /report/{ticker}` | Unified endpoint — everything above in one response. Frontend uses this. |
| `GET /history/{ticker}` | Past sentiment/price snapshots for the trend chart |
| `GET /compare?tickers=AAPL,MSFT` | Comparative sentiment/price brief for two tickers |
| `GET/POST/DELETE /watchlist` | Saved ticker list (no auth — single implicit user) |
| `GET /health` | Health check |

Most endpoints accept an optional `days_back` query param (default 7).

## Project structure
marketsynapse/
├── backend/
│   ├── main.py                      # FastAPI app entry point
│   ├── config.py                    # Settings loaded from .env
│   ├── routers/
│   │   ├── news.py
│   │   ├── stock.py
│   │   ├── correlation.py
│   │   ├── brief.py
│   │   ├── report.py                # Unified endpoint — frontend uses this
│   │   ├── history.py                # Sentiment trend over time
│   │   ├── compare.py                # Multi-ticker comparison
│   │   └── watchlist.py              # Saved tickers CRUD
│   ├── services/
│   │   ├── news_service.py           # NewsAPI integration + relevance filtering
│   │   ├── sentiment_service.py      # FinBERT sentiment analysis
│   │   ├── stock_service.py          # yfinance price data + earnings date
│   │   ├── correlation_service.py    # Combines sentiment + price
│   │   ├── agent_service.py          # LangGraph agent -> market brief (3-node, self-reviewing)
│   │   ├── comparison_service.py     # LangGraph agent -> comparative brief
│   │   ├── history_service.py        # Sentiment history persistence
│   │   ├── watchlist_service.py      # Watchlist CRUD
│   │   └── cache_service.py          # In-memory TTL cache
│   ├── models/schemas.py
│   └── database/
│       ├── db.py                     # SQLAlchemy engine/session
│       └── models.py                 # SentimentHistory, Watchlist tables
├── frontend/                          # React + Vite + Tailwind v4
│   └── src/
│       ├── App.jsx                    # Single-ticker + Compare mode toggle
│       ├── hooks/useTheme.js          # Dark/light mode, persisted via localStorage
│       └── components/                # PricePanel, SignalReadout, CompareView,
│                                       # SentimentTrendChart, Watchlist, ExportControls, etc.
├── tests/
│   ├── test_news_service.py           # _is_relevant(), _build_query()
│   ├── test_correlation_service.py    # _overall_sentiment(), _determine_alignment()
│   ├── test_stock_service.py          # fetch_price_summary() math, mocked yfinance
│   ├── test_review_brief.py           # Manual eval — self-correction node limitations
│   └── eval_brief.py                  # Scored rubric harness for both brief types
├── .github/workflows/tests.yml        # CI (not yet pushed/active)
├── requirements.txt
└── .env.example
## What's built

**Core pipeline:** live news sentiment (FinBERT) × price movement (yfinance) × LLM-generated plain-English brief (LangGraph + Groq), unified into one `/report/{ticker}` call.

**Historical tracking:** every fresh (non-cached) analysis is persisted to SQLite, powering a sentiment-over-time trend chart per ticker.

**Multi-ticker comparison:** a second LangGraph agent fetches two tickers in parallel and writes a comparative brief, under the same anti-hallucination constraints as the single-ticker brief.

**Self-correcting brief pipeline:** a third graph node reviews each generated brief against two rules (no hallucinated details, no investment advice) before it's returned. **Measured limitation, documented rather than hidden:** this reliably catches explicit advice language but is less reliable at catching subtler hallucinated entities with the small/fast model used here (`llama-3.1-8b-instant`) — see `tests/test_review_brief.py` for the eval that surfaced this.

**Earnings-awareness:** next earnings date (when available from yfinance) is included in the brief's source facts, and the brief will only ever mention it if it's actually present — never invented.

**Watchlist:** save/remove tickers, click to reload their report.

**Export:** copy the brief to clipboard, or print/save-as-PDF with a dedicated print stylesheet.

**Dark/light theme:** toggle, defaults to system preference, persisted in `localStorage`.

**Automated tests:** 27 unit tests over the core decision logic (relevance filtering, sentiment aggregation, alignment rules, price math, error handling), plus a lightweight scored eval harness for both brief types.

## Known limitations

- NewsAPI free tier: 100 requests/day, articles limited to the past month.
- yfinance is an unofficial Yahoo Finance scraper — occasional transient failures are expected, not bugs. If you see a "possibly delisted" error on a real ticker, it's very likely transient; retry, or check `yfinance` is updated to a recent version (`pip install --upgrade yfinance`).
- FinBERT can misclassify routine/neutral financial language as negative.
- The self-correction review node (see above) is measured to reliably catch explicit investment-advice language but is less reliable at catching subtler hallucinated details — a known limitation of using a small/fast LLM for nuanced fact-checking, not a bug to silently patch.
- The eval harness's rubric checks (e.g. "states correct alignment") use substring matching, not semantic verification — a 100% pass rate reflects the heuristic, not a guarantee of perfect brief accuracy.
- In-memory correlation cache (5 min TTL) and recent-search history are both non-persistent — reset on server/page restart. This is intentional, not an oversight.
- No authentication — watchlist and history assume a single implicit user. Fine for local/demo use; would need auth before any multi-user deployment.
- SQLite is used for persistence; fine until deployment resumes, at which point an ephemeral filesystem (e.g. some Railway configurations) may need a persisted volume or external DB.

## What's left

- Deployment: backend → Railway, frontend → Vercel; lock down CORS to the real frontend domain once both are live.
- CI workflow exists (`.github/workflows/tests.yml`) but hasn't been pushed/activated yet — runs the full pytest suite on push once enabled.