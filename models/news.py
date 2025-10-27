from pydantic import BaseModel
from typing import List, Optional

class Article(BaseModel):
    title: str
    source: str
    published: str
    sentiment: str
    summary: Optional[str]
    keywords: List[str]

class AnalysisResponse(BaseModel):
    symbol: str
    articles: List[Article]
    average_sentiment: float
