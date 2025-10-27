from fastapi import APIRouter, Query, HTTPException
from typing import List
from ..services.news_client import NewsDataClient, NewsArticle
from ..services.nlp_service import analyze_text
from ..models.news import Article, AnalysisResponse


router = APIRouter()

@router.get("/analyze", response_model=AnalysisResponse)
async def analyze_stock(symbol: str = Query(..., description="Stock symbol or company name")):
    """
    Fetch latest news articles related to a stock/company,
    run NLP analysis (sentiment, keywords, summary),
    and return structured results.
    """
    try:
        client = NewsDataClient()
        response = await client.fetch_latest(query=symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")

    if not response.results:
        raise HTTPException(status_code=404, detail=f"No articles found for '{symbol}'")


    processed_articles: List[Article] = []
    total_score = 0.0
    count = 0

    for article in response.results[:5]:  # limit to top 5 for performance
        text = article.content or article.description or article.title or ""
        nlp_result = analyze_text(text)

        processed_articles.append(Article(
            title=article.title or "Untitled",
            source=article.source_name or "Unknown",
            published=article.pubDate or "Unknown",
            sentiment=nlp_result["sentiment"],
            summary=nlp_result["summary"],
            keywords=nlp_result["keywords"],
        ))
        total_score += nlp_result["score"]
        count += 1

    avg_sentiment = total_score / count if count else 0.0

    return AnalysisResponse(
        symbol=symbol,
        articles=processed_articles,
        average_sentiment=avg_sentiment
    )