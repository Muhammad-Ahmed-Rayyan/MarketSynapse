"""
Watchlist CRUD. No auth — single implicit user for this phase, per the
Phase 2 plan (D1). Straightforward add/remove/list against one table.
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.database.db import SessionLocal
from backend.database.models import Watchlist


def add_ticker(ticker: str, db: Session = None) -> bool:
    """Returns True if added, False if it was already on the watchlist."""
    owns_session = db is None
    if owns_session:
        db = SessionLocal()
    try:
        existing = db.query(Watchlist).filter(Watchlist.ticker == ticker.upper()).first()
        if existing:
            return False
        db.add(Watchlist(ticker=ticker.upper()))
        db.commit()
        return True
    except IntegrityError:
        db.rollback()
        return False
    finally:
        if owns_session:
            db.close()


def remove_ticker(ticker: str, db: Session = None) -> bool:
    """Returns True if removed, False if it wasn't on the watchlist."""
    owns_session = db is None
    if owns_session:
        db = SessionLocal()
    try:
        existing = db.query(Watchlist).filter(Watchlist.ticker == ticker.upper()).first()
        if not existing:
            return False
        db.delete(existing)
        db.commit()
        return True
    finally:
        if owns_session:
            db.close()


def get_watchlist(db: Session = None) -> list[Watchlist]:
    """Returns saved tickers, most recently added first."""
    owns_session = db is None
    if owns_session:
        db = SessionLocal()
    try:
        return db.query(Watchlist).order_by(Watchlist.added_at.desc()).all()
    finally:
        if owns_session:
            db.close()


if __name__ == "__main__":
    # Smoke test: python -m backend.services.watchlist_service
    added = add_ticker("AAPL")
    print(f"Added AAPL: {added}")
    added_again = add_ticker("AAPL")
    print(f"Added AAPL again (should be False): {added_again}")

    watchlist = get_watchlist()
    print(f"Watchlist: {[w.ticker for w in watchlist]}")

    removed = remove_ticker("AAPL")
    print(f"Removed AAPL: {removed}")

    watchlist_after = get_watchlist()
    print(f"Watchlist after removal: {[w.ticker for w in watchlist_after]}")