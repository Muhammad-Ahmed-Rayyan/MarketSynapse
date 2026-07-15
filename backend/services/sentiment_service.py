"""
FinBERT sentiment analysis.

Uses ProsusAI/finbert — a BERT model fine-tuned specifically on financial
text, so it reads "beats expectations" or "misses guidance" correctly
instead of treating them as neutral the way a general sentiment model would.

Model loads once at import time (singleton pattern) — loading it per
request would be far too slow.
"""
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

from backend.models.schemas import Article

MODEL_NAME = "ProsusAI/finbert"

print("Loading FinBERT model (first run downloads ~400MB, cached after)...")
_tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
_model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
_model.eval()  # inference mode, no gradient tracking needed

# FinBERT's label order — index position matches model output
LABELS = ["positive", "negative", "neutral"]


def analyze_sentiment(text: str) -> tuple[str, float]:
    """
    Returns (label, confidence_score) for a single piece of text.
    Truncates to 512 tokens (FinBERT's max) — article title + description
    is well under this, so no information loss in practice.
    """
    if not text or not text.strip():
        return "neutral", 0.0

    inputs = _tokenizer(
        text, return_tensors="pt", truncation=True, max_length=512
    )
    with torch.no_grad():
        outputs = _model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]

    top_idx = int(torch.argmax(probs))
    return LABELS[top_idx], round(float(probs[top_idx]), 4)


def analyze_articles(articles: list[Article]) -> list[Article]:
    """
    Attaches sentiment_label and sentiment_score to each article in place.
    Uses title + description together — headlines alone are often too
    short for FinBERT to have enough signal.
    """
    for article in articles:
        text = f"{article.title}. {article.description or ''}".strip()
        label, score = analyze_sentiment(text)
        article.sentiment_label = label
        article.sentiment_score = score
    return articles


if __name__ == "__main__":
    # Smoke test: python -m backend.services.sentiment_service
    samples = [
        "Apple beats earnings expectations, stock surges",
        "Tesla recalls thousands of vehicles over safety concerns",
        "Microsoft announces quarterly dividend, unchanged from last quarter",
    ]
    for s in samples:
        label, score = analyze_sentiment(s)
        print(f"[{label:8s} {score:.2f}]  {s}")