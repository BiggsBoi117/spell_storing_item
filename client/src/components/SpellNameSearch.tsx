import "../styles/SpellSearch.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export function SpellNameSearch({ value, onChange, onSearch }: Props) {
  return (
    <div className="spell-name-search">
      <input
        type="text"
        placeholder="Search by spell name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
      />
      {value && (
        <button
          className="spell-name-search-clear"
          onClick={() => onChange("")}
        >
          ✕
        </button>
      )}
    </div>
  );
}
