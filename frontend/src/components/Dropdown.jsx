export default function Dropdown({
  show,
  filtered,
  highlightIndex,
  selectTicker,
}) {
  if (!show || filtered.length === 0) return null;

  return (
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
  );
}
