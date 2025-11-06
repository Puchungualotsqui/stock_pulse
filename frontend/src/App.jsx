import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tickers, setTickers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    fetch("/tickers.csv")
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });
        setTickers(
          parsed.data
            .map((row) => ({
              symbol: row.Symbol,
              name: row.Name,
              sector: row.Sector,
            }))
            .filter((r) => r.symbol),
        );
      })
      .catch((err) => console.error("Failed to load tickers:", err));
  }, []);

  const handleSearch = async () => {
    if (!symbol.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    setShowDropdown(false);

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
      setShowDropdown(true);
      setHighlightIndex(-1);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
  };

  const selectTicker = useCallback(
    (sym) => {
      setSymbol(sym);
      setShowDropdown(false);
      setHighlightIndex(-1);
    },
    [setSymbol],
  );

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      selectTicker(filtered[highlightIndex].symbol);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold mb-10 text-primary-content">
        📈 StockPulse
      </h1>

      <div className="relative w-full max-w-2xl mb-10">
        {/* Search bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search or select a stock (e.g. AAPL, MSFT)"
            className="input input-bordered w-full text-base px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-primary transition"
            value={symbol}
            onChange={handleInput}
            onFocus={() => setShowDropdown(symbol.length > 0)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSearch}
            className="btn btn-primary rounded-xl px-6 font-semibold shadow-md hover:scale-105 transition"
          >
            Analyze
          </button>
        </div>

        {/* Dropdown menu */}
        {showDropdown && filtered.length > 0 && (
          <ul className="menu bg-base-100 border border-base-300 rounded-xl mt-2 shadow-xl absolute w-full max-h-72 overflow-y-auto z-50 animate-fadeIn">
            {filtered.map((t, i) => (
              <li
                key={i}
                className={`px-3 py-2 transition ${
                  i === highlightIndex ? "bg-primary text-primary-content" : ""
                }`}
              >
                <button
                  onClick={() => selectTicker(t.symbol)}
                  className="flex justify-between items-center w-full"
                >
                  <span className="font-semibold">{t.symbol}</span>
                  <span
                    className={`text-xs truncate w-48 text-right ${
                      i === highlightIndex
                        ? "text-primary-content/80"
                        : "text-gray-500"
                    }`}
                  >
                    {t.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && (
        <span className="loading loading-spinner loading-lg text-primary"></span>
      )}
      {error && <p className="text-error mt-4">{error}</p>}

      {data && (
        <div className="w-full max-w-2xl space-y-4 animate-fadeIn">
          {/* Avg sentiment summary card */}
          <div className="card shadow-lg border border-primary/40 bg-gradient-to-r from-primary/10 to-secondary/10 mb-6">
            <div className="card-body text-center">
              <h2 className="text-2xl font-bold text-primary">{data.symbol}</h2>
              <p className="text-lg text-base-content/70">Average Sentiment</p>
              <p
                className={`text-4xl font-bold ${
                  data.average_sentiment > 0.1
                    ? "text-success"
                    : data.average_sentiment < -0.1
                      ? "text-error"
                      : "text-warning"
                }`}
              >
                {data.average_sentiment}
              </p>
            </div>
          </div>

          {/* Individual articles */}
          <div className="divider font-semibold text-base-content/70">
            Related News
          </div>

          {data.articles.map((a, i) => (
            <div
              key={i}
              className="card bg-base-100 shadow-md hover:shadow-lg transition hover:scale-[1.01]"
            >
              <div className="card-body py-4 px-5">
                <h3 className="font-semibold text-base-content mb-1">
                  {a.title}
                </h3>
                <p
                  className={`font-medium ${
                    a.sentiment === "positive"
                      ? "text-success"
                      : a.sentiment === "negative"
                        ? "text-error"
                        : "text-warning"
                  }`}
                >
                  {a.sentiment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
