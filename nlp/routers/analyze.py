from fastapi import APIRouter, Query, HTTPException
from ..services.news_client import NewsDataClient
from ..services.nlp_service import analyze_text
from ..models.news import AnalysisResponse
from ..core.cache import cache

router = APIRouter()


@router.get(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Analyze financial news sentiment",
)
async def analyze_stock(
    company: str = Query(
        ..., description="Company name (e.g., Apple Inc., Tesla, Amazon)"
    ),
):
    company = company.strip()
    cached = cache.get(company)
    if cached:
        print(f"⚡ Returning cached result for {company}")
        return cached

    try:
        client = NewsDataClient()
        response = await client.fetch_latest(query=company, prioritydomain="top")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")

    if not response or not getattr(response, "results", None):
        raise HTTPException(status_code=404, detail=f"No articles found for '{company}'")

    processed_articles = []
    total_score = 0.0
    count = 0

    for article in response.results[:20]:
        text = article.description or article.content or article.title or ""
        if not text.strip():
            continue

        try:
            nlp_result = analyze_text(text)
        except Exception as e:
            print(f"⚠️ NLP analysis failed for '{article.title}': {e}")
            continue

        processed_articles.append(
            {
                "title": article.title or "Untitled",
                "sentiment": nlp_result["sentiment"],
                "url": article.link or "",
            }
        )

        total_score += nlp_result["score"]
        count += 1

    avg_sentiment = round(total_score / count, 2) if count else 0.0
    result = AnalysisResponse(
        symbol=company, average_sentiment=avg_sentiment, articles=processed_articles
    )

    cache.set(company, result)
    return result
