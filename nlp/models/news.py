from pydantic import BaseModel


class ArticleSummary(BaseModel):
    title: str
    sentiment: str
    url: str


class AnalysisResponse(BaseModel):
    symbol: str
    average_sentiment: float
    articles: list[ArticleSummary]
