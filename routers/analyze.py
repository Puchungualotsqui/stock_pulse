from fastapi import APIRouter, Query, HTTPException
from typing import List
from ..services.news_client import NewsDataClient
from ..services.nlp_service import analyze_text
from ..models.news import Article, AnalysisResponse

router = APIRouter()


@router.get("/analyze", response_model=AnalysisResponse, summary="Analyze financial news sentiment")
async def analyze_stock(symbol: str = Query(..., description="Stock symbol or company name (e.g., AAPL, TSLA, AMZN)")):
    """
    Fetch the latest financial news articles for the given stock/company symbol,
    run NLP analysis (sentiment, keywords, summary) on each article,
    and return structured sentiment metrics with aggregated results.
    """
    # Step 1: Fetch data from NewsData.io
    try:
        client = NewsDataClient()
        response = await client.fetch_latest(query=symbol, prioritydomain="top")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")

    # Step 2: Handle empty results
    if not response.results:
        raise HTTPException(status_code=404, detail=f"No articles found for '{symbol}'")

    # Step 3: Process the articles
    processed_articles: List[Article] = []
    total_score = 0.0
    count = 0

    for article in response.results[:5]:  # limit to top 5 for performance
        text = article.content or article.description or article.title or ""
        if not text.strip():
            continue

        try:
            nlp_result = analyze_text(text)
        except Exception as e:
            print(f"⚠️ NLP analysis failed for article '{article.title}': {e}")
            continue

        processed_articles.append(
            Article(
                title=article.title or "Untitled",
                source=article.source_name or "Unknown",
                published=article.pubDate or "Unknown",
                sentiment=nlp_result["sentiment"],
                summary=nlp_result["summary"],
                keywords=nlp_result["keywords"],
            )
        )

        total_score += nlp_result["score"]
        count += 1

    # Step 4: Compute average sentiment
    avg_sentiment = round(total_score / count, 2) if count else 0.0

    # Step 5: Return structured response
    return AnalysisResponse(
        symbol=symbol.upper(),
        articles=processed_articles,
        average_sentiment=avg_sentiment,
    )
