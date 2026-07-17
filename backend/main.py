"""
MarketSynapse — FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import news, stock, correlation

app = FastAPI(
    title="MarketSynapse API",
    description="Financial news sentiment & market intelligence pipeline",
    version="0.1.0",
)

# Wide open for local dev; tighten to the deployed frontend origin before shipping.
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


@app.get("/")
def root():
    return {"status": "ok", "service": "marketsynapse-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}