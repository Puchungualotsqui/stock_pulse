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
      if (!res.ok) throw new Error("Server error");
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
      {error && <p className="text-error mt-4">{error}</p>}

      {data && (
        <div className="w-full max-w-2xl space-y-4 animate-fadeIn">
          <SummaryCard
            symbol={data.symbol}
            sentiment={data.average_sentiment}
          />
          <ArticleList articles={data.articles} />
        </div>
      )}
    </div>
  );
}
