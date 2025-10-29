from textblob import TextBlob
import spacy
from transformers import pipeline

nlp = spacy.load("en_core_web_sm")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def analyze_text(text: str):
    """
    Perform sentiment analysis, keyword extraction, and summarization
    for a given article text.
    """
    # 1️⃣ Sentiment analysis (TextBlob for polarity)
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
        try:
            summary = summarizer(text[:1000], max_length=100, min_length=30, do_sample=False)[0]['summary_text']
        except Exception:
            summary = text[:200] + "..."

    return {
        "sentiment": sentiment,
        "score": round(polarity, 2),
        "keywords": keywords,
        "summary": summary
    }
