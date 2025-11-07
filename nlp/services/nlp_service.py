from textblob import TextBlob
import spacy
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer


# Load spaCy once (small model)
nlp = spacy.load("en_core_web_sm")


def simple_summary(text: str, sentences_count: int = 3) -> str:
    """
    Lightweight extractive summarizer using Latent Semantic Analysis (Sumy).
    Works well on short and medium-length texts.
    """
    try:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        sentences = summarizer(parser.document, sentences_count)
        summary = " ".join(str(sentence) for sentence in sentences)
        return summary.strip()
    except Exception:
        # fallback in case of parsing errors
        return text[:300] + "..."


def analyze_text(text: str):
    """
    Perform sentiment analysis, keyword extraction, and summarization
    for a given article text.
    Uses TextBlob + spaCy + Sumy (lightweight, no transformers).
    """
    # 1️⃣ Sentiment analysis
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    sentiment = (
        "positive" if polarity > 0.1 else
        "negative" if polarity < -0.1 else
        "neutral"
    )

    # 2️⃣ Keyword extraction (noun chunks)
    doc = nlp(text)
    keywords = [chunk.text.lower() for chunk in doc.noun_chunks if len(chunk.text) > 2]
    keywords = list(set(keywords))[:10]

    # 3️⃣ Summarization
    summary = text
    if len(text.split()) > 50:
        summary = simple_summary(text, sentences_count=3)

    return {
        "sentiment": sentiment,
        "score": round(polarity, 2),
        "keywords": keywords,
        "summary": summary
    }
