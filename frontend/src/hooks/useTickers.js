import { useState, useEffect } from "react";
import Papa from "papaparse";

export function useTickers() {
  const [tickers, setTickers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/tickers")
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

  return tickers;
}
