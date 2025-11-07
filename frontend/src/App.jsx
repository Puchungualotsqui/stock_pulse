import { useState, useCallback } from "react";
import { useTickers } from "./hooks/useTickers";
import SearchBar from "./components/SearchBar";
import SummaryCard from "./components/SummaryCard";
import ArticleList from "./components/ArticleList";
import Loader from "./components/Loader";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtered, setFiltered] = useState([]);

  const tickers = useTickers();

  const handleSearch = async () => {
    if (!symbol.trim()) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`http://localhost:8080/api/analyze/${symbol}`);

      if (!res.ok) {
        const errText = await res.text();
        let message = "Server error";
        try {
          const parsed = JSON.parse(errText);
          message = parsed.detail || message;
        } catch {}
        throw new Error(message);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);
    if (value.length >= 1) {
      const filteredList = tickers.filter(
        (t) =>
          t.symbol.startsWith(value) || t.name.toUpperCase().includes(value),
      );
      setFiltered(filteredList.slice(0, 5));
    } else {
      setFiltered([]);
    }
  };

  const selectTicker = useCallback((sym) => {
    setSymbol(sym);
    setFiltered([]);
  }, []);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold mb-10 text-primary-content">
        📈 StockPulse
      </h1>

      <SearchBar
        symbol={symbol}
        setSymbol={setSymbol}
        filtered={filtered}
        onSearch={handleSearch}
        onInput={handleInput}
        selectTicker={selectTicker}
      />

      {loading && <Loader />}

      {/* Error alert */}
      {error && (
        <div className="alert alert-error shadow-lg mt-6 max-w-xl flex flex-col items-center text-center">
          <span className="font-medium mb-2">⚠️ {error}</span>
          <button
            className="btn btn-sm btn-outline btn-error"
            onClick={handleSearch}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty-state placeholder */}
      {!loading && !error && !data && (
        <div className="flex flex-col items-center justify-center mt-12 text-center text-base-content/70">
          <p className="mb-3 text-lg">
            🔍 Enter a stock ticker to analyze recent news sentiment.
          </p>
          <p className="text-sm opacity-80">
            Example: <span className="font-semibold">AAPL</span>,{" "}
            <span className="font-semibold">MSFT</span>,{" "}
            <span className="font-semibold">TSLA</span>
          </p>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="w-full max-w-2xl space-y-4 animate-fadeIn">
          <SummaryCard
            symbol={data.symbol}
            sentiment={data.average_sentiment}
          />
          <ArticleList articles={data.articles} />
        </div>
      )}

      {/* ──────────────────────── */}
      {/* Footer */}
      <footer className="mt-16 text-center text-sm opacity-70 text-base-content/80 border-t border-base-300 pt-6 w-full max-w-2xl">
        <p className="mb-2">
          <span className="font-medium">StockPulse</span> is a{" "}
          <span className="font-semibold">university project</span> built for
          learning and demonstration purposes only.
        </p>
        <p>
          🔗{" "}
          <a
            href="https://github.com/Puchungualotsqui/stock_pulse/tree/main"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary"
          >
            View source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
