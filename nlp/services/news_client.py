import httpx
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any, Union
from ..core.config import settings


class NewsArticle(BaseModel):
    article_id: Optional[str]
    title: Optional[str]
    link: Optional[str]
    description: Optional[str]
    content: Optional[str]
    pubDate: Optional[str]
    image_url: Optional[str]
    source_id: Optional[str]
    source_name: Optional[str]
    keywords: Optional[Union[List[str], str, None]] = None
    creator: Optional[Union[List[str], str, None]] = None
    country: Optional[Union[List[str], str, None]] = None
    category: Optional[Union[List[str], str, None]] = None
    sentiment: Optional[Union[str, dict, None]] = None
    sentiment_stats: Optional[Union[dict, str, None]] = None

    model_config = ConfigDict(extra="ignore")  # ignore unexpected ai_* fields


class NewsResponse(BaseModel):
    status: str
    totalResults: int
    results: List[NewsArticle]


class NewsDataClient:
    BASE_URL = "https://newsdata.io/api/1/latest"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.news_api_key
        if not self.api_key:
            raise ValueError("NEWS_API_KEY missing from environment or settings.")

    async def fetch_latest(
        self,
        query: str,
        *,
        language: str = "en",
        prioritydomain: str = "top",
        page: Optional[int] = None,
    ) -> NewsResponse:
        params = {
            "apikey": self.api_key,
            "q": query,
            "language": language,
            "prioritydomain": prioritydomain,
        }
        if page:
            params["page"] = page

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
            except httpx.HTTPStatusError as err:
                print("🚨 HTTP error:", err)
                print("Response text:", response.text)
                raise
            except Exception as err:
                print("🚨 Connection error:", err)
                raise

            data = response.json()

        print("✅ API response keys:", list(data.keys()))
        results = data.get("results", [])
        if not results:
            print(f"⚠️ No results returned for query: {query}")
            print("🔍 Full API response:", data)
            return NewsResponse(
                status=data.get("status", "empty"), totalResults=0, results=[]
            )
        else:
            print("📰 First article sample:", results[0])

        try:
            articles = [NewsArticle(**a) for a in data.get("results", [])]
        except Exception as e:
            print("⚠️ Error parsing NewsArticle list:", e)
            print("🔍 First element:", data.get("results", [None])[0])
            articles = []

        return NewsResponse(
            status=data.get("status", "unknown"),
            totalResults=data.get("totalResults", 0),
            results=articles,
        )
