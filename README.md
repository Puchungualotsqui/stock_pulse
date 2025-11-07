# StockPulse

StockPulse is a university project that analyzes the sentiment of financial news related to publicly traded companies.
It combines a lightweight backend architecture (C# API + FastAPI NLP service) with a responsive React frontend.

---

## Overview

StockPulse provides real-time sentiment analysis of the latest news for a given stock ticker.
It leverages the [NewsData.io API](https://newsdata.io/) for fetching financial news and a local NLP service for sentiment classification.

Users can:
- Search for a stock by ticker symbol or company name.
- View recent related news headlines.
- See the aggregated sentiment (positive, negative, or neutral).
- Access full news articles via external links.

---

## Architecture
```
Frontend (React + Vite + Tailwind + DaisyUI)
│
▼
C# API (ASP.NET Core) ← loads ticker data & validates symbols
│
▼
Python FastAPI (NLP Service) ← fetches news, performs sentiment analysis
```

**Proxy setup**
Caddy or Vite’s proxy forwards `/api/*` requests to the backend services, enabling local development without CORS issues.

---

## Features

- Search by ticker symbol with autocomplete.
- Server-side validation of valid tickers.
- Sentiment analysis using NLP.
- Cached responses for performance.
- Responsive, minimalist UI with DaisyUI.
- Error handling for missing or unavailable news.

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, DaisyUI |
| Backend (API) | ASP.NET Core (.NET 8) |
| NLP Service | Python, FastAPI, httpx, Pydantic |
| Data Source | [NewsData.io](https://newsdata.io) |
| Deployment | Caddy, Docker-ready |
| Language | JavaScript / TypeScript, C#, Python |

---

## Directory Structure
```
StockPulse/
├── frontend/ # React + Vite client
│ ├── src/
│ │ ├── components/
│ │ ├── hooks/
│ │ └── App.jsx
│ └── vite.config.js
│
├── StockPulse.Api/ # C# backend
│ ├── Controllers/
│ ├── Data/tickers.csv
│ └── Program.cs
│
└── nlp/ # Python NLP microservice
├── routers/
├── services/
└── main.py

```
## Run Locally
```
git clone https://github.com/Puchungualotsqui/stock_pulse
cd StockPulse
./start_stockpulse.sh dev
```

then open http://localhost:5173/

## Enviroment Variables:
| Variable       | Description                                          |
| -------------- | ---------------------------------------------------- |
| `NEWS_API_KEY` | API key from NewsData.io                             |
| `PORT`         | Optional, overrides default port for the NLP service |


## Academic Notice

This project was created as part of a university data science course.
It is not intended for commercial or financial use.
Data and sentiment classifications are for educational demonstration only.

## License
Released under the MIT License. See LICENSE for details.