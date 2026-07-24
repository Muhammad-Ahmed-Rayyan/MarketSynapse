"""
MarketSynapse — FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.db import init_db
from backend.routers import news, stock, correlation, brief, report, history, compare, watchlist

app = FastAPI(
    title="MarketSynapse API",
    description="Financial news sentiment & market intelligence pipeline",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(news.router)
app.include_router(stock.router)
app.include_router(correlation.router)
app.include_router(brief.router)
app.include_router(report.router)
app.include_router(history.router)
app.include_router(compare.router)
app.include_router(watchlist.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"status": "ok", "service": "marketsynapse-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}