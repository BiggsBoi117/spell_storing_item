import { useEffect, useState } from "react";
import { searchSpellsByName } from "../api/api";

interface Props {
  onResults: (results: { index: string; name: string }[]) => void;
  onClear: () => void;
}

export function SpellNameSearch({ onResults, onClear }: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (query.trim().length < 2) {
      onClear();
      return;
    }

    const timeout = setTimeout(async () => {
      const results = await searchSpellsByName(query.trim());
      onResults(results);
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="spell-name-search">
      <input
        type="text"
        placeholder="Search by spell name..."
        value={query}
        onChange={(e) => setQuery((e.target.value || "").trim().toLowerCase())}
      />
      {query && (
        <button
          className="spell-name-search-clear"
          onClick={() => {
            setQuery("");
            onClear();
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
