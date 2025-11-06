import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tickers, setTickers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch("/tickers.csv")
      .then((response) => response.text())
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
      const res = await fetch(`/api/analyze/${symbol}`);
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
      setFiltered(filteredList.slice(0, 10)); // limit to 10
      setShowDropdown(true);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
  };

  const selectTicker = (sym) => {
    setSymbol(sym);
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">📈 StockPulse</h1>

      <div className="relative w-72 mb-8">
        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter or select stock"
            className="input input-bordered w-full"
            value={symbol}
            onChange={handleInput}
            onFocus={() => setShowDropdown(symbol.length > 0)}
          />
          <button onClick={handleSearch} className="btn btn-primary">
            Analyze
          </button>
        </div>

        {/* Beautiful dropdown */}
        {showDropdown && filtered.length > 0 && (
          <ul className="menu menu-sm bg-base-100 border border-base-300 rounded-box mt-1 shadow-lg absolute w-full max-h-64 overflow-y-auto z-50">
            {filtered.map((t, i) => (
              <li key={i}>
                <button
                  onClick={() => selectTicker(t.symbol)}
                  className="flex justify-between items-center"
                >
                  <span className="font-semibold">{t.symbol}</span>
                  <span className="text-xs text-gray-500 truncate w-40 text-right">
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
      {error && <p className="text-error">{error}</p>}

      {data && (
        <div className="w-full max-w-xl">
          <div className="card bg-base-100 shadow-md mb-4">
            <div className="card-body">
              <h2 className="card-title">
                {data.symbol} — Avg Sentiment:{" "}
                <span
                  className={
                    data.average_sentiment > 0.1
                      ? "text-success"
                      : data.average_sentiment < -0.1
                        ? "text-error"
                        : "text-warning"
                  }
                >
                  {data.average_sentiment}
                </span>
              </h2>
            </div>
          </div>

          {data.articles.map((a, i) => (
            <div key={i} className="card bg-base-100 shadow-sm mb-2">
              <div className="card-body py-3">
                <h3 className="font-semibold">{a.title}</h3>
                <p
                  className={
                    a.sentiment === "positive"
                      ? "text-success"
                      : a.sentiment === "negative"
                        ? "text-error"
                        : "text-warning"
                  }
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
