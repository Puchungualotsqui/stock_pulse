from textblob import TextBlob
import spacy

nlp = spacy.load("en_core_web_sm")

def analyze_text(text: str):
    blob = TextBlob(text)
    sentiment_score = blob.sentiment.polarity
    sentiment_label = (
        "positive" if sentiment_score > 0.1 else
        "negative" if sentiment_score < -0.1 else
        "neutral"
    )
    doc = nlp(text)
    keywords = [chunk.text for chunk in doc.noun_chunks][:5]
    summary = text[:200] + "..." if len(text) > 200 else text
    return {
        "sentiment": sentiment_label,
        "score": sentiment_score,
        "keywords": keywords,
        "summary": summary,
    }
