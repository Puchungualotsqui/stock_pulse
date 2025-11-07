from ..services.news_client import NewsDataClient
from ..core import config

BASE_URL = "https://newsdata.io/api/1/latest?apikey=" + config.settings.news_api_key + "&q=nepal"

async def fetch_news(symbol: str):
    """
    Fetches latest news articles for a given stock/company symbol.
    Delegates to NewsDataClient which automatically appends API key and parameters.
    """
    client = NewsDataClient()
    response = await client.fetch_latest(query=symbol, prioritydomain="top")
    return response.results
