import { useState, useEffect } from "react";
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

  // 👇 Automatically show dropdown when there are filtered results
  useEffect(() => {
    if (filtered.length > 0) setShowDropdown(true);
    else setShowDropdown(false);
  }, [filtered]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (showDropdown && highlightIndex >= 0) {
        selectTicker(filtered[highlightIndex].symbol);
        setShowDropdown(false);
      } else {
        onSearch();
        setShowDropdown(false);
      }
    } else if (e.key === "ArrowDown" && filtered.length > 0) {
      e.preventDefault();
      setShowDropdown(true);
      setHighlightIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp" && filtered.length > 0) {
      e.preventDefault();
      setHighlightIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightIndex(-1);
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
            setHighlightIndex(-1);
          }}
          onFocus={() => {
            if (filtered.length > 0) setShowDropdown(true);
          }}
          onBlur={() => {
            // Delay closing to allow clicking an item
            setTimeout(() => setShowDropdown(false), 150);
          }}
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
