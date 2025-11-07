import { useState } from "react";
import Dropdown from "./Dropdown";

export default function SearchBar({
  symbol,
  filtered,
  onSearch,
  onInput,
  selectTicker,
}) {
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

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
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mb-10">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search or select a stock (e.g. AAPL, MSFT)"
          className="input input-bordered w-full text-base px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-primary transition"
          value={symbol}
          onChange={(e) => {
            onInput(e);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(symbol.length > 0)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={onSearch}
          className="btn btn-primary rounded-xl px-6 font-semibold shadow-md hover:scale-105 transition"
        >
          Analyze
        </button>
      </div>

      <Dropdown
        show={showDropdown}
        filtered={filtered}
        highlightIndex={highlightIndex}
        selectTicker={(sym) => {
          selectTicker(sym);
          setShowDropdown(false);
        }}
      />
    </div>
  );
}
